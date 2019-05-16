import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { WebServerComponent } from './webserver.component'
import { WebServerRoute } from 'main/settings';

const AppPoolsRoute = 'app-pools';
const WebSitesRoute = 'websites';
const WebAppsRoute = 'webapps';
const WebServerAppPoolsRoute = `/${WebServerRoute}/${AppPoolsRoute}`;
const WebServerWebSitesRoute = `/${WebServerRoute}/${WebSitesRoute}`;
const WebServerWebAppsRoute = `/${WebServerRoute}/${WebAppsRoute}`;

const appRoutes: Routes = [
    { path: AppPoolsRoute, loadChildren: './app-pools/app-pools.module#AppPoolsModule' },
    { path: WebSitesRoute, loadChildren: './websites/websites.module#WebSitesModule' },
    { path: WebAppsRoute, loadChildren: './webapps/webapps.module#WebAppsModule' },
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


export function resolveWebsiteRoute(id: string) {
    return `${WebServerWebSitesRoute}/${id}`;
}

export function resolveAppPoolRoute(id: string) {
    return `${WebServerAppPoolsRoute}/${id}`;
}

export function resolveWebAppRoute(id: string) {
    return `${WebServerWebAppsRoute}/${id}`;
}
