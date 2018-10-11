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

@NgModule({
    imports: [
        CoreServiceModule,
        IdleModule,
        BootstrapModule
    ],
    bootstrap: [ AppComponent ],
    providers: [
        ResourceService,
        { provide: ErrorHandler, useClass: AppErrorHandler },
        { provide: "Runtime", useClass: WACRuntime }
    ]
})
export class WACAppModule {
    constructor(
        private appContext: AppContextService,
        private router: Router) {
        this.appContext.initializeModule({})
        this.router.config.push({ path: 'idle', component: IdleComponent })
    }
}
