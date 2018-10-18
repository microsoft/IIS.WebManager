import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { WebServerComponent } from './webserver.component'
import { AppPoolsModule } from './app-pools/app-pools.module'
import { WebSitesModule } from './websites/websites.module'
import { WebAppsModule } from './webapps/webapps.module'
import { VdirsModule } from './vdirs/vdirs.module'

export function LoadAppPoolsModule() {
    return import('./app-pools/app-pools.module').then(m => m.AppPoolsModule)
}

export function LoadWebSitesModule() {
    return import('./websites/websites.module').then(m => m.WebSitesModule)
}

export function LoadWebAppsModule() {
    return import('./webapps/webapps.module').then(m => m.WebAppsModule)
}

export function LoadVDirsModule() {
    return import('./vdirs/vdirs.module').then(m => m.VdirsModule)
}

const appRoutes: Routes = [
    { path: 'app-pools', loadChildren: LoadAppPoolsModule },
    { path: 'websites', loadChildren: LoadWebSitesModule },
    { path: 'webapps', loadChildren: LoadWebAppsModule },
    { path: 'vdirs', loadChildren: LoadVDirsModule },
    { path: '', component: WebServerComponent },
    { path: ':section', component: WebServerComponent }
]

@NgModule({
    imports: [
        RouterModule.forChild(appRoutes)
    ]
})
export class WebServerRoutingModule {}
