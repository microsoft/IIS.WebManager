import { Provider, ErrorHandler } from "@angular/core";
import { ResourceService, IdleModule, CoreServiceModule } from "@microsoft/windows-admin-center-sdk/angular";
import { LogsErrorHandler } from "diagnostics/logs-error-handler";
import { PowershellService } from "runtime/wac/services/powershell-service";
import { WACInfo, WACRuntime } from "runtime/runtime.wac";
import { LocalHttpClient } from "runtime/wac/services/local-http-client";
import { CommonModule } from "@angular/common";
import { WACModule } from "runtime/wac/components/wac.module";

export const ModulesAddon: any[] = [
    CommonModule,
    IdleModule,
    WACModule,
    CoreServiceModule,
];

export const ProvidersAddon: Provider[] = [
    ResourceService,
    { provide: ErrorHandler, useClass: LogsErrorHandler },
    { provide: "Powershell", useClass: PowershellService },
    { provide: "WACInfo", useClass: WACInfo },
    { provide: "Http", useClass: LocalHttpClient },
    { provide: "Runtime", useClass: WACRuntime },
];
