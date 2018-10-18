import {DateTime} from '../common/primitives'
import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import {
    AppContextService,
    NavigationService,
    WarningBadgeComponent
} from '@microsoft/windows-admin-center-sdk/angular'
import { Runtime } from './runtime'
import { PowershellService } from './wac/powershell-service'
import { ConnectService, AdminApiUnreachableError } from '../connect/connect.service'
import { ApiConnection } from '../connect/api-connection'
import { readFileSync } from 'fs'
import { Observable } from 'rxjs/Observable'
import { PowerShellScripts } from '../../generated/powershell-scripts'
import fs = require('fs')
import 'rxjs/add/operator/take'

class ApiKey {
    public id: string
    public access_token: string
    public expires_on: DateTime
    public value: string
}

@Injectable()
export class WACRuntime implements Runtime {
    private _tokenCache: ApiKey
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
        this.appContext.ngDestroy()
    }

    public ConnectToIISHost(): Promise<any> {
        // TODO: check for installation
        // TODO: edit cors setting on client admin api
        return this.GetApiKey().then(apiKey => {
            var connection = new ApiConnection(this.appContext.activeConnection.nodeName)
            if (apiKey.access_token) {
                connection.accessToken = apiKey.access_token
            } else {
                connection.accessToken = apiKey.value
            }
            this.connectService.connect(connection)
            .catch(e => {
                if (e === AdminApiUnreachableError.Instance) {
                    this.router.navigate(['/install-admin-api'])
                }
                throw e
            })
            .then(conn => {
                this.connectService.save(conn)
            })
        })
    }

    private GetApiKey(): Promise<ApiKey> {
        // NOTE: appContextService.gateway.gatewayUrl can be provided to the powershell script to differentiate
        // which gateway the edits are coming from. This is omitted for now
        return this.powershellService.run(PowerShellScripts.token_utils).then(results => {
            console.log(`received token from admin api`)
            return this._tokenCache = <ApiKey> JSON.parse(results[0])
        })
    }
}
