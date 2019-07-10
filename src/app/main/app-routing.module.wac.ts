import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { GetComponent } from "./get.component";
import { ConnectComponent } from "connect/connect.component";
import { NotFound } from "common/notfound.component";
import { WACIdleComponent } from "runtime/wac/components/wac-idle.component";
import { InstallComponent } from "runtime/wac/components/install.component";

@NgModule({
  imports: [
    RouterModule.forRoot([
        // routes for WAC only
        { path: "idle", component: WACIdleComponent },
        { path: "install", component: InstallComponent },
        { path: "wac", loadChildren: "../runtime/wac/components/wac.module#WACModule" },

        // common routes
        { path: "get", component: GetComponent },
        { path: "connect", component: ConnectComponent },
        { path: "settings", loadChildren: "../settings/settings.module#SettingsModule" },
        { path: "webserver", loadChildren: "../webserver/webserver.module#WebServerModule" },
        { path: "**", component: NotFound },
    ],
        {
            enableTracing: false,
            initialNavigation: true,
        },
    )],
    exports: [RouterModule]
})
export class AppRoutingModule { }
