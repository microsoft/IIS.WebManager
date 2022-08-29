import { HttpImpl } from "common/http-impl";
import { SiteRuntime } from "runtime/runtime";
import { HttpModule } from "@angular/http";
import { Provider } from "@angular/core";

export const ModulesAddon: any[] = [
    HttpModule,
];

export const ProvidersAddon: Provider[] = [
    { provide: "Http", useClass: HttpImpl },
    { provide: "Runtime", useClass: SiteRuntime },
];
