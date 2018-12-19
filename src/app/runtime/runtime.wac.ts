import { DateTime } from '../common/primitives'
import { Injectable, Inject } from '@angular/core'
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
import { Observable } from 'rxjs'
import { ApiErrorType } from 'error/api-error';

import 'rxjs/add/operator/take'
import 'rxjs/add/operator/map'

class ApiKey {
    public id: string
    public access_token: string
    public expires_on: DateTime
    public value: string
}

class HostStatus {
    public adminAPIInstalled: boolean
    public groupModified: boolean
}

@Injectable()
export class WACInfo {
    constructor(private appContext: AppContextService){}

    public get NodeName(): Observable<string> {
        return this.appContext.servicesReady.map(_ =>
            this.appContext.activeConnection.nodeName
        ).shareReplay()
    }
}

@Injectable()
export class WACRuntime implements Runtime {
    private _tokenId: string
    private _connecting: Observable<ApiConnection>

    constructor(
        private router: Router,
        private appContext: AppContextService,
        private navigationService: NavigationService,
        private connectService: ConnectService,
        @Inject("Powershell") private powershellService: PowershellService,
        @Inject("WACInfo") private wac: WACInfo,
    ){}

    public InitContext() {
        this.appContext.ngInit({ navigationService: this.navigationService })
    }

    public DestroyContext() {
        if (this._tokenId) {
            this.powershellService.run(PowerShellScripts.token_utils, { command: 'delete', tokenId: this._tokenId }).finally(() =>
                this.appContext.ngDestroy()
            ).subscribe()
        } else {
            this.appContext.ngDestroy()
        }
    }

    public IsWebServerScope() {
        return true
    }

    public ConnectToIISHost(): Observable<ApiConnection> {
        if (!this._connecting) {
            this._connecting = this.wac.NodeName.mergeMap(nodeName =>
                this.GetApiKey().map((apiKey, _) => {
                    var connection = new ApiConnection(nodeName)
                    if (apiKey.access_token) {
                        connection.accessToken = apiKey.access_token
                    } else {
                        connection.accessToken = apiKey.value
                    }
                    this._tokenId = apiKey.id
                    return connection
                })).shareReplay()
        }
        this._connecting.subscribe(c => {
            this.connectService.setActive(c)
            this._connecting = null
        })
        return this._connecting
    }

    public PrepareIISHost(p: any): Observable<any> {
        return this.powershellService.run(PowerShellScripts.admin_api_util, p).map((status: HostStatus) => {
            if (status.groupModified) {
                this.powershellService.Reset()
            }
            return status
        })
    }

    private GetApiKey(): Observable<ApiKey> {
        var cmdParams: any = { command: 'ensure' }
        if (this._tokenId) {
            cmdParams.tokenId = this._tokenId
        }
        return this.PrepareIISHost({ command: 'ensure-permission' }).catch((e, _) => {
            if (e.status === 400 && e.response.exception == "IIS Administration API is not installed") {
                return Observable.throw(ApiErrorType.Unreachable).finally(() => {
                    this.router.navigate(['wac', 'install'])
                })
            }
            return Observable.throw(e)
        }).mergeMap(_ => {
            return this.powershellService.run<ApiKey>(PowerShellScripts.token_utils, cmdParams)
        })
    }
}
