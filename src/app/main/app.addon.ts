import { Provider } from "@angular/core";
import { HttpModule } from "@angular/http";
import { HttpImpl } from "common/http-impl";
import { StandardRuntime } from "runtime/runtime";
import { HomeComponent } from "./home.component";
import { Routes } from "@angular/router";

export const ModulesAddon: any[] = [
    HttpModule
]

export const ProvidersAddon: Provider[] = [
    { provide: "Http", useClass: HttpImpl },
    { provide: "Runtime", useClass: StandardRuntime },
]

export const RoutesAddon: Routes = [{ path: '', component: HomeComponent }]
