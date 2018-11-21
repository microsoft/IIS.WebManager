import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { commonRoutes } from "./app-routing.module";
import { WACModule } from "runtime/wac/components/wac.module";
import { InstallComponent } from "runtime/wac/components/install.component";
import { WACIdleComponent } from "runtime/wac/components/wac-idle.component";

const wacRoutes: Routes = [
    { path: '', redirectTo: '/webserver', pathMatch: 'full' },
    { path: 'idle', component: WACIdleComponent },
    { path: 'install', component: InstallComponent },
    { path: 'wac', loadChildren: LoadWACModule },
]

export function LoadWACModule() {
    return import('../runtime/wac/components/wac.module').then(m => m.WACModule)
}

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
