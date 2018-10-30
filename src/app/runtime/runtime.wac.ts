import {DateTime} from '../common/primitives'
import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import {
    AppContextService,
    NavigationService
} from '@microsoft/windows-admin-center-sdk/angular'
import { Runtime } from './runtime'
import { PowershellService } from './wac/services/powershell-service'
import { ConnectService } from '../connect/connect.service'
import { ApiConnection } from '../connect/api-connection'
import { PowerShellScripts } from '../../generated/powershell-scripts'
import 'rxjs/add/operator/take'
import { ApiErrorType } from 'error/api-error';
import { AdminAPIInstallService } from './wac/services/admin-api-install-service';
import { SETTINGS } from 'main/settings';

class ApiKey {
    public id: string
    public access_token: string
    public expires_on: DateTime
    public value: string
}

@Injectable()
export class WACRuntime implements Runtime {
    private _tokenId: string

    constructor(
        private router: Router,
        private appContext: AppContextService,
        private navigationService: NavigationService,
        private connectService: ConnectService,
        private powershellService: PowershellService,
        private installer: AdminAPIInstallService,
    ) {
    }

    public InitContext() {
        this.appContext.ngInit({ navigationService: this.navigationService })
    }

    public DestroyContext() {
        if (this._tokenId) {
            console.log(`removing token ${this._tokenId}`)
            this.powershellService.run(PowerShellScripts.token_utils, { command: 'delete', tokenId: this._tokenId }).then(_ => {
                this.appContext.ngDestroy()
            })
        } else {
            this.appContext.ngDestroy()
        }
    }

    public async ConnectToIISHost(): Promise<ApiConnection> {
        await this.appContext.servicesReady.toPromise()
        await this.installer.ensurePermission(SETTINGS["iis_admin_api_service_name"])
        var apiKey = await this.GetApiKey()
        var connection = new ApiConnection(this.appContext.activeConnection.nodeName)
        if (apiKey.access_token) {
            connection.accessToken = apiKey.access_token
        } else {
            connection.accessToken = apiKey.value
        }
        this._tokenId = apiKey.id
        console.log(`received token ID from admin api: ${apiKey.id}`)
        var conn = await this.connectService.connect(connection)
        this.connectService.save(conn)
        return conn
    }

    private async GetApiKey(): Promise<ApiKey> {
        var cmdParams: any = { command: 'ensure' }
        if (this._tokenId) {
            console.log(`existing token ID ${this._tokenId} will be refreshed`)
            cmdParams.tokenId = this._tokenId
        }
        try {
            var output = await this.powershellService.run(PowerShellScripts.token_utils, cmdParams)
        } catch (e) {
            if (e.status === 400 && e.response.exception === 'Unable to connect to the remote server') {
                throw ApiErrorType.Unreachable
            } else {
                throw e
            }
        }
        return <ApiKey> JSON.parse(output[0])
    }
}
