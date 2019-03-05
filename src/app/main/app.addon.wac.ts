import { Provider, ErrorHandler } from "@angular/core";
import { IdleModule,
    ResourceService,
    CoreServiceModule,
} from "@microsoft/windows-admin-center-sdk/angular";
import { CommonModule } from "@angular/common";
import { WACModule } from "runtime/wac/components/wac.module";
import { LogsErrorHandler } from "diagnostics/logs-error-handler";
import { PowershellService } from "runtime/wac/services/powershell-service";
import { WACInfo, WACRuntime } from "runtime/runtime.wac";
import { LocalHttpClient } from "runtime/wac/services/local-http-client";
import { Routes } from "@angular/router";
import { WACIdleComponent } from "runtime/wac/components/wac-idle.component";
import { InstallComponent } from "runtime/wac/components/install.component";

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

function LoadWACModule() {
    return import('../runtime/wac/components/wac.module').then(m => m.WACModule);
}

export const RoutesAddon: Routes = <Routes>[
    { path: '', redirectTo: '/webserver', pathMatch: 'full' },
    { path: 'idle', component: WACIdleComponent },
    { path: 'install', component: InstallComponent },
    { path: 'wac', loadChildren: LoadWACModule },
]
