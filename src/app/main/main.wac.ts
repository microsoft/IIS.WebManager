// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import './polyfills.ts';
import { environment } from 'environments/environment';
import { AppModule } from './app.module';
import { CoreEnvironment } from '@microsoft/windows-admin-center-sdk/core';
import { enableProdMode, ApplicationRef } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { PowerShellScripts } from '../generated/powershell-scripts';
import { enableDebugTools } from '@angular/platform-browser';

function bootstrapModule() {
    var moduleTask = platformBrowserDynamic().bootstrapModule(AppModule);
    if (!environment.Production) {
        moduleTask.then(moduleRef => {
            const applicationRef = moduleRef.injector.get(ApplicationRef);
            const componentRef = applicationRef.components[0];
            // allows to run `ng.profiler.timeChangeDetection();`
            enableDebugTools(componentRef);
        }).catch(err => console.error(err));
    }
}

if (environment.Production) {
    enableProdMode();
}

// initialize SME module environment with localization settings.
CoreEnvironment.initialize(
    {
        name: "microsoft.iis",
        powerShellModuleName: PowerShellScripts.module,
        isProduction: environment.production,
        shellOrigin: '*'
    },
    {
        resourcesPath: 'assets/strings',
    },
    {
        disableStyleInjection: true,
    })
    .then(bootstrapModule);
