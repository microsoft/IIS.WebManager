
import "./polyfills";
import { IsProduction } from "environments/environment";
import { AppModule } from "./app.module";
import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

if (IsProduction) {
    enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule);
