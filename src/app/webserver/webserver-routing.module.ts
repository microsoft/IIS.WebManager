import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { WebServerComponent } from './webserver.component'

const appRoutes: Routes = [
    { path: 'app-pools', loadChildren: './app-pools/app-pools.module#AppPoolsModule' },
    { path: 'websites', loadChildren: './websites/websites.module#WebSitesModule' },
    { path: 'webapps', loadChildren: './webapps/webapps.module#WebAppsModule' },
    { path: 'vdirs', loadChildren: './vdirs/vdirs.module#VdirsModule' },
    { path: '', component: WebServerComponent },
    { path: ':section', component: WebServerComponent }
]

@NgModule({
    imports: [
        RouterModule.forChild(appRoutes)
    ]
})
export class WebServerRoutingModule {}
