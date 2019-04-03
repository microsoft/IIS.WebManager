// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import './polyfills.ts';
import { environment } from 'environments/environment';
import { AppModule } from './app.module';
import { CoreEnvironment } from '@microsoft/windows-admin-center-sdk/core';
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { PowerShellScripts } from '../generated/powershell-scripts';

if (environment.production) {
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
    .then(() => platformBrowserDynamic().bootstrapModule(AppModule));
