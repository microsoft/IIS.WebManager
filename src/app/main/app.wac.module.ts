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
import { PowershellService } from '../runtime/wac/powershell-service'

@NgModule({
    imports: [
        CoreServiceModule,
        CommonModule,
        IdleModule,
        BootstrapModule
    ],
    bootstrap: [ AppComponent ],
    providers: [
        ResourceService,
        PowershellService,
        { provide: ErrorHandler, useClass: AppErrorHandler },
        { provide: "Runtime", useClass: WACRuntime }
    ]
})
export class WACAppModule {
    constructor(
        private appContext: AppContextService,
        private router: Router) {
        this.appContext.initializeModule({})
        this.router.config.filter(r => r.path === '').map(r => {
            r.component = null
            r.redirectTo = '/webserver'
        })
        this.router.config.push({ path: 'idle', component: IdleComponent })
    }
}
