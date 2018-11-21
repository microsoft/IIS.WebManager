import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { commonRoutes } from "./app-routing.module";
import { WebServerComponent } from "webserver/webserver.component";
import { InstallComponent } from "runtime/wac/components/install.component";
import { IdleComponent } from "@microsoft/windows-admin-center-sdk/angular";

const wacRoutes: Routes = [
    { path: '', component: WebServerComponent },
    { path: 'idle', component: IdleComponent },
    { path: 'wac', children: [
        { path: 'install', component: InstallComponent }
    ]}
]

const appRoutes = wacRoutes.concat(commonRoutes)

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
export class WACAppRoutingModule {}
