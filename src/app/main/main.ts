
import './polyfills'

import { environment } from '../environments/environment'
import { AppModule } from './app.module'
import { WACAppModule } from './app.wac.module'
import { CoreEnvironment } from '@microsoft/windows-admin-center-sdk/core'
import { enableProdMode } from '@angular/core'
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'

if (environment.Production) {
    enableProdMode();
}

if (environment.WAC) {
    // initialize SME module environment with localization settings.
    CoreEnvironment.initialize(
        {
            name: 'microsoft.wac-iis',
            isProduction: environment.Production,
            shellOrigin: '*'
        },
        {
            resourcesPath: 'assets/strings'
        })
        .then(() => platformBrowserDynamic().bootstrapModule(WACAppModule));
} else {
    platformBrowserDynamic().bootstrapModule(AppModule);
}
