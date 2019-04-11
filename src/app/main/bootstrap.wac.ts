import { CoreEnvironment } from "@microsoft/windows-admin-center-sdk/core";
import { PowerShellScripts } from "generated/powershell-scripts";
import { IsProduction } from "environments/environment";

export function preload(): Promise<void> {
    // initialize SME module environment with localization settings.
    return CoreEnvironment.initialize(
    {
        name: "microsoft.iis",
        powerShellModuleName: PowerShellScripts.module,
        isProduction: IsProduction,
        shellOrigin: '*',
    },
    {
        resourcesPath: 'assets/strings',
    },
    {
        disableStyleInjection: true,
    });
}
