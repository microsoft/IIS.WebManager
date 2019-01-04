import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Features
import { HomeComponent } from '../main/home.component';

import { NotFound } from '../common/notfound.component';
import { ConnectComponent } from '../connect/connect.component';
import { GetComponent } from './get.component';
import { SettingsModule } from '../settings/settings.module'
import { WebServerModule } from '../webserver/webserver.module'
import { WACModule } from "runtime/wac/components/wac.module";
import { environment } from '../environments/environment'
import { WACIdleComponent } from 'runtime/wac/components/wac-idle.component';
import { InstallComponent } from 'runtime/wac/components/install.component';

// These are the basic routes that are required in order to load an extension and make service calls.
const commonRoutes: Routes = [
    { path: 'get', component: GetComponent },
    { path: 'connect', component: ConnectComponent },
    { path: 'settings', loadChildren: LoadSettingsModule  },
    { path: 'webserver', loadChildren: LoadWebServerModule  },
    { path: ':section', component: HomeComponent },
    // Not Found
    { path: '**', component: NotFound }
];

let appRoutes: Routes

function LoadSettingsModule() {
    return import('../settings/settings.module').then(m => m.SettingsModule)
}

function LoadWebServerModule() {
    return import('../webserver/webserver.module').then(m => m.WebServerModule)
}

function LoadWACModule() {
    return import('../runtime/wac/components/wac.module').then(m => m.WACModule)
}

if (environment.WAC) {
    const wacRoutes = (<Routes>[
        { path: '', redirectTo: '/webserver', pathMatch: 'full' },
        { path: 'idle', component: WACIdleComponent },
        { path: 'install', component: InstallComponent },
        { path: 'wac', loadChildren: LoadWACModule },
    ]).concat(commonRoutes)
    appRoutes = wacRoutes.concat(commonRoutes)
} else {
    const websiteRoutes: Routes = [{ path: '', component: HomeComponent }]
    appRoutes = websiteRoutes.concat(commonRoutes)
}

@NgModule({
    imports: [
        RouterModule.forRoot(
            appRoutes,
            {
                enableTracing: false,
                initialNavigation: true,
            })
    ],
    exports: [
        RouterModule
    ]
})
export class AppRoutingModule {}
