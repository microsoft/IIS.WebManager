import { CommonModule } from '@angular/common'
import { NgModule, ErrorHandler } from '@angular/core'
import {
    CoreServiceModule,
    AppContextService,
    ResourceService,
    IdleModule,
    AppErrorHandler,
} from '@microsoft/windows-admin-center-sdk/angular'

import { WACRuntime, WACInfo } from '../runtime/runtime.wac'
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
        { provide: ErrorHandler, useClass: AppErrorHandler },
        { provide: "Powershell", useClass: PowershellService },
        { provide: "WACInfo", useClass: WACInfo },
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
