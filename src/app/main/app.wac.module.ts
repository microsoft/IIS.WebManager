import { CommonModule } from '@angular/common'
import { NgModule, ErrorHandler } from '@angular/core'
import { Router } from '@angular/router'
import {
    CoreServiceModule,
    AppContextService,
    ResourceService,
    IdleModule,
    AppErrorHandler,
    IdleComponent
} from '@microsoft/windows-admin-center-sdk/angular'

import { WACRuntime } from '../runtime/runtime.wac'
import { BootstrapModule } from './bootstrap.module'
import { AppComponent } from './app.component'
import { PowershellService } from '../runtime/wac/services/powershell-service'
import { WebServerModule } from 'webserver/webserver.module'
import { WACModule } from 'runtime/wac/components/wac.module'
import { LocalHttpClient } from 'runtime/wac/services/local-http-client'

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
        { provide: ErrorHandler, useClass: AppErrorHandler },
        { provide: "Http", useClass: LocalHttpClient },
        { provide: "Runtime", useClass: WACRuntime },
    ],
})
export class WACAppModule {
    constructor(
        private appContext: AppContextService,
    ) {
        this.appContext.initializeModule({})
    }
}
