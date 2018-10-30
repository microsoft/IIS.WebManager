import { Injectable } from "@angular/core";
import { AppContextService } from "@microsoft/windows-admin-center-sdk/angular";
import { PowershellService } from "./powershell-service"
import { PowerShellScripts } from "../../../../generated/powershell-scripts"
import { Router } from "@angular/router"
var os = require('os')

@Injectable()
export class AdminAPIInstallService {
    constructor(
        private router: Router,
        private appContext: AppContextService,
        private powershell: PowershellService,
    ) {}

    public async ensurePermission(service: string): Promise<any> {
        try {
            return await this.powershell.run(
                PowerShellScripts.ensure_permission, {
                    origin: this.appContext.gateway.gatewayUrl,
                    requestHost: os.hostname(),
                    serviceName: service, })
        } catch (e) {
            console.log(JSON.stringify(e))
            console.log(JSON.stringify(e.response))
            if (e.status === 400 && e.response.exception === `${service} is not installed`) {
                console.log(`navigate to iis admin api install page`)
                this.router.navigate(['wac', 'install'])
            } else {
                throw e
            }
        }
    }

    public install(fromUrl: string): Promise<any> {
        return this.powershell.run(
            PowerShellScripts.install_admin_api,
            { download: fromUrl })
    }
}
