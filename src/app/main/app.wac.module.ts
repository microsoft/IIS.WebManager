import { CommonModule } from '@angular/common'
import { NgModule, ErrorHandler } from '@angular/core'
import { Router } from '@angular/router'
import {
    CoreServiceModule,
    AppContextService,
    ResourceService,
    IdleModule,
    IdleComponent,
    AppErrorHandler
} from '@microsoft/windows-admin-center-sdk/angular'

import { WACRuntime } from '../runtime/runtime.wac'
import { BootstrapModule } from './bootstrap.module'
import { AppComponent } from './app.component'
import { PowershellService } from '../runtime/wac/services/powershell-service'
import { WebServerComponent } from 'webserver/webserver.component';
import { InstallComponent } from 'runtime/wac/components/install.component';
import { WebServerModule } from 'webserver/webserver.module';
import { WACModule } from 'runtime/wac/components/wac.module';
import { AdminAPIInstallService } from 'runtime/wac/services/admin-api-install-service';

@NgModule({
    imports: [
        CoreServiceModule,
        CommonModule,
        IdleModule,
        BootstrapModule,
        WebServerModule,
        WACModule
    ],
    bootstrap: [ AppComponent ],
    providers: [
        ResourceService,
        PowershellService,
        AdminAPIInstallService,
        { provide: ErrorHandler, useClass: AppErrorHandler },
        { provide: "Runtime", useClass: WACRuntime }
    ],
    entryComponents: [
        // IdleComponent,
        WebServerComponent
    ]
})
export class WACAppModule {
    constructor(
        private appContext: AppContextService,
        private router: Router) {
        this.appContext.initializeModule({})
        this.router.config.filter(r => r.path === '').map(r => {
            r.component = WebServerComponent
        })
        // this.router.config.unshift({ path: 'idle', component: IdleComponent })
        this.router.config.unshift({ path: 'wac', children: [
            { path: 'install', component: InstallComponent }
        ] })   // Note: loadChildren does not seem to work
        this.router.resetConfig(this.router.config)
    }
}
