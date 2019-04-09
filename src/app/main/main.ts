// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import './polyfills.ts';
import { IsProduction } from 'environments/environment';
import { AppModule } from './app.module';
import { enableProdMode, ApplicationRef } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableDebugTools } from '@angular/platform-browser';
import { preload } from './bootstrap';

function loadApp() {
    const loadAppTask = platformBrowserDynamic().bootstrapModule(AppModule)
    if (!IsProduction) {
        loadAppTask.then(moduleRef => {
            const applicationRef = moduleRef.injector.get(ApplicationRef);
            const componentRef = applicationRef.components[0];
            // allows to run `ng.profiler.timeChangeDetection();`
            enableDebugTools(componentRef);
        }).catch(err => console.error(err));
    }
}

if (IsProduction) {
    enableProdMode();
}

preload().then(loadApp);
