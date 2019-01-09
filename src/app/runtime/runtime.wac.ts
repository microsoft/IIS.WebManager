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
import { Observable } from 'rxjs/Observable'
import { ApiErrorType } from 'error/api-error'
import { RpcOutboundCommands, rpcVersion, RpcInitData, RpcSeekMode, RpcInitDataInternal } from '@microsoft/windows-admin-center-sdk/dist/core/rpc/rpc-base'
import { CoreEnvironment } from '@microsoft/windows-admin-center-sdk/dist/core/data/core-environment'

import 'rxjs/add/operator/take'
import 'rxjs/add/operator/map'
import 'rxjs/add/observable/throw'

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
        let rpc = this.appContext.rpc
        // Implementation copied from rpc.register with difference noted in the comments
        rpc.rpcManager.rpcInbound.register(RpcOutboundCommands[RpcOutboundCommands.Init], (data: RpcInitDataInternal) => {
            // node context is used before passing request to handler.
            rpc.changeActiveState(true);
            const self = MsftSme.self();
            self.Init.sessionId = data.sessionId;
            self.Environment.modules = data.modules;

            if (!MsftSme.isNullOrUndefined(self.Resources.accessibilityMode) && !MsftSme.isNullOrUndefined(data.accessibilityMode)) {
                self.Resources.accessibilityMode = data.accessibilityMode;
                CoreEnvironment.accessibilityManager.changeAccessibilityMode(self.Resources.accessibilityMode);
            }

            // ensure that global environment settings persist across origins
            if (!MsftSme.isNullOrUndefined(data.consoleDebug) && MsftSme.consoleDebug() !== data.consoleDebug) {
                MsftSme.consoleDebug(data.consoleDebug);
            }

            if (!MsftSme.isNullOrUndefined(data.sideLoad)) {
                let sideLoadKeys = Object.keys(MsftSme.sideLoad() || {});
                let dataSideLoadKeys = Object.keys(data.sideLoad || {});

                if (sideLoadKeys.length !== dataSideLoadKeys.length || sideLoadKeys.some(key => !!data.sideLoad[key])) {
                    MsftSme.sideLoadReset();
                    dataSideLoadKeys.forEach(k => MsftSme.sideLoad(k));
                }
            }

            if (!MsftSme.isNullOrUndefined(data.experiments)) {
                let experiments = MsftSme.experiments();
                if (experiments.length !== data.experiments.length || experiments.some((v, i) => v !== data.experiments[i])) {
                    MsftSme.experiments(data.experiments);
                }
            }

            // Skipping loading css
            // CoreEnvironment.assetManager.loadAssets(data.theme, data.assets);
            const localeLoader = CoreEnvironment.moduleLoadLocale({ id: data.localeRegional || data.locale, neutral: data.locale });
            // let passingData = <RpcInitData>{
            //     locale: data.locale,
            //     localeRegional: data.localeRegional,
            //     sessionId: data.sessionId
            // };
            return localeLoader
                .then(() => rpc.seekShell(RpcSeekMode.Create))
                // Note that the handler callback simply set navigationService.active to true, which should already been the case
                // .then(() => handler(passingData))
                .then(() => { return { version: rpcVersion }; });
        })
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
