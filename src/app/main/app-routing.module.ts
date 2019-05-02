import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { GetComponent } from "./get.component";
import { ConnectComponent } from "connect/connect.component";
import { HomeComponent } from "./home.component";
import { NotFound } from "common/notfound.component";
import { WebServerRoute } from "./settings";

@NgModule({
  imports: [
    RouterModule.forRoot([
        // site only routes
        { path: "", component: HomeComponent },

        // common routes
        { path: "get", component: GetComponent },
        { path: "connect", component: ConnectComponent },
        { path: "settings", loadChildren: "../settings/settings.module#SettingsModule" },
        { path: WebServerRoute, loadChildren: "../webserver/webserver.module#WebServerModule" },
        { path: ":section", component: HomeComponent },
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
