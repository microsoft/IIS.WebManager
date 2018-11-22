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
import 'rxjs/add/operator/map'
import { Observable } from 'rxjs'

class ApiKey {
    public id: string
    public access_token: string
    public expires_on: DateTime
    public value: string
}

@Injectable()
export class WACInfo {
    constructor(
        private appContext: AppContextService,
    ){
    }

    public get NodeName(): Observable<string> {
        return this.appContext.servicesReady.map(_ =>
            this.appContext.activeConnection.nodeName
        ).publishReplay().refCount()
    }
}

@Injectable()
export class WACRuntime implements Runtime {
    private _tokenId: string
    private powershellService: PowershellService
    private _connecting: Observable<ApiConnection>

    constructor(
        private router: Router,
        private appContext: AppContextService,
        private navigationService: NavigationService,
        private connectService: ConnectService,
        private wac: WACInfo,
    ) {
        // somehow DI was unable to create a powershellService
        this.powershellService = new PowershellService(appContext, wac)
    }

    public InitContext() {
        this.appContext.ngInit({ navigationService: this.navigationService })
    }

    public DestroyContext() {
        if (this._tokenId) {
            console.log(`removing token ${this._tokenId}`)
            this.powershellService.run(PowerShellScripts.token_utils, { command: 'delete', tokenId: this._tokenId }).subscribe(_ => {
                this.appContext.ngDestroy()
            })
        } else {
            this.appContext.ngDestroy()
        }
    }

    public IsWebServerScope() {
        return true
    }

    public ConnectToIISHost(): Observable<ApiConnection> {
        if (!this._connecting) {
            this._connecting = Observable.forkJoin(
                    this.wac.NodeName,
                    this.GetApiKey(),
                ).map(([nodeName, apiKey], _) => {
                    var connection = new ApiConnection(nodeName)
                    if (apiKey.access_token) {
                        connection.accessToken = apiKey.access_token
                    } else {
                        connection.accessToken = apiKey.value
                    }
                    this._tokenId = apiKey.id
                    console.log(`received token ID from admin api: ${apiKey.id}`)
                    return connection
                })
                // .mergeMap(connection => {
                //     return this.connectService.connect(connection)
                // })
                .publishReplay(1).refCount()
        }
        this._connecting.subscribe(c => {
            this.connectService.setActive(c)
            this._connecting = null
        })
        return this._connecting
    }

    private GetApiKey(): Observable<ApiKey> {
        console.log(`Getting Api Key`)
        var cmdParams: any = { command: 'ensure' }
        if (this._tokenId) {
            console.log(`existing token ID ${this._tokenId} will be refreshed`)
            cmdParams.tokenId = this._tokenId
        }
        return this.powershellService.run<ApiKey>(PowerShellScripts.token_utils, cmdParams).catch((e, _) => {
            console.log(`error getting api key`)
            if (e.status === 400 && e.response.exception === 'Unable to connect to the remote server') {
                return Observable.throw(e).finally(() => {
                    this.router.navigate(['wac', 'install'], {
                        preserveFragment: false,
                        preserveQueryParams: false,
                        skipLocationChange: true,
                        replaceUrl: true,
                    })
                })
            }
            Observable.throw(e)
        })
    }
}
