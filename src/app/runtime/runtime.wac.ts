import {DateTime} from '../common/primitives'
import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import {
    AppContextService,
    NavigationService
} from '@microsoft/windows-admin-center-sdk/angular'
import { Runtime } from './runtime'
import { PowershellService } from './wac/powershell-service'
import { ConnectService, AdminApiUnreachableError } from '../connect/connect.service'
import { ApiConnection } from '../connect/api-connection'
import { PowerShellScripts } from '../../generated/powershell-scripts'
import 'rxjs/add/operator/take'

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

    public ConnectToIISHost(): Promise<ApiConnection> {
        // TODO: check for installation
        // TODO: edit cors setting on client admin api
        return this.GetApiKey().then(apiKey => {
            var connection = new ApiConnection(this.appContext.activeConnection.nodeName)
            if (apiKey.access_token) {
                connection.accessToken = apiKey.access_token
            } else {
                connection.accessToken = apiKey.value
            }
            this._tokenId = apiKey.id
            console.log(`received token ID from admin api: ${apiKey.id}`)
            return this.connectService.connect(connection)
                .then(conn => {
                    this.connectService.save(conn)
                    return conn
                })
        })
    }

    private GetApiKey(): Promise<ApiKey> {
        var cmdParams: any = { command: 'ensure' }
        if (this._tokenId) {
            console.log(`existing token ID ${this._tokenId} will be refreshed`)
            cmdParams.tokenId = this._tokenId
        }
        return this.powershellService.run(PowerShellScripts.token_utils, cmdParams).then(results => {
            return <ApiKey> JSON.parse(results[0])
        })
    }
}
