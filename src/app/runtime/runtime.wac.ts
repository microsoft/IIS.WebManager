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
import { ApiErrorType, UnexpectedServerStatusError } from 'error/api-error'
import { RpcOutboundCommands, rpcVersion, RpcSeekMode, RpcInitDataInternal } from '@microsoft/windows-admin-center-sdk/dist/core/rpc/rpc-base'
import { CoreEnvironment } from '@microsoft/windows-admin-center-sdk/dist/core/data/core-environment'

import 'rxjs/add/operator/take'
import 'rxjs/add/operator/map'
import 'rxjs/add/observable/throw'
import { LoggerFactory, Logger, LogLevel } from 'diagnostics/logger';

class ApiKey {
    public id: string
    public access_token: string
    public expires_on: DateTime
    public value: string
}

class HostStatus {
    public adminAPIInstalled: boolean
    public groupModified: boolean
    public apiHost: string
}

@Injectable()
export class WACInfo {
    constructor(private appContext: AppContextService){}
    public get NodeName(): Observable<string> {
        return this.appContext.servicesReady.map(_ =>
            this.appContext.activeConnection.nodeName
        ).shareReplay();
    };
}

@Injectable()
export class WACRuntime implements Runtime {
    private _tokenId: string;
    private _apiHost: string;
    private _connecting: Observable<ApiConnection>;
    private _logger: Logger;

    constructor(
        private router: Router,
        private appContext: AppContextService,
        private navigationService: NavigationService,
        private connectService: ConnectService,
        private loggerFactory: LoggerFactory,
        @Inject("Powershell") private powershellService: PowershellService,
        @Inject("WACInfo") private wac: WACInfo,
    ){
        this._logger = loggerFactory.Create(this);
    }

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
            this.powershellService.run(PowerShellScripts.token_utils, {
                command: 'delete',
                tokenId: this._tokenId,
                apiHost: this._apiHost,
            }).finally(() => this.appContext.ngDestroy()).subscribe()
        } else {
            this.appContext.ngDestroy()
        }
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
                    this.connectService.setActive(connection)
                    this._connecting = null
                    return connection
                })).shareReplay()
        }
        return this._connecting
    }

    public PrepareIISHost(p: any): Observable<any> {
        return this.powershellService.run(PowerShellScripts.admin_api_util, p).map((status: HostStatus) => {
            this._apiHost = status.apiHost
            if (status.groupModified) {
                this.powershellService.Reset()
            }
            return status
        })
    }

    public StartIISAdministration(): Observable<any> {
        return this.powershellService.run(PowerShellScripts.start_admin_api, {})
    }

    private GetApiKey(): Observable<ApiKey> {
        return this.PrepareIISHost({ command: 'ensure' }).catch((e, _) => {
            if (e.status === 400) {
                let error: any
                try {
                    error = JSON.parse(e.response.exception)
                } catch (e) {
                    this._logger.log(LogLevel.INFO, `Unable to parse error message ${e.response.exception}, the error must be unexpected`)
                }
                if (error) {
                    if (error.Type == 'PREREQ_BELOW_MIN_VERSION') {
                        this.router.navigate(['wac', 'install'], {
                            queryParams: {
                                details: `To manage IIS Server, you need to install ${error.App} version ${error.Required} or higher. Current version detected: ${error.Actual}`,
                            },
                        })
                        return Observable.throw(ApiErrorType.Unreachable)
                    }
                    if (error.Type == 'ADMIN_API_SERVICE_NOT_FOUND') {
                        this.router.navigate(['wac', 'install'], {
                            queryParams: {
                                details: `To manage an IIS Server, you need to install ${error.App} on IIS host`,
                            },
                        })
                        return Observable.throw(ApiErrorType.Unreachable)
                    }
                    if (error.Type == 'ADMIN_API_SERVICE_NOT_RUNNING') {
                        return Observable.throw(new UnexpectedServerStatusError(error.Status))
                    }
                }
            }
            return Observable.throw(e)
        }).mergeMap(_ => {
            var tokenUtilParams: any = {
                command: 'ensure',
                apiHost: this._apiHost,
            }
            if (this._tokenId) {
                tokenUtilParams.tokenId = this._tokenId
            }
            return this.powershellService.run<ApiKey>(PowerShellScripts.token_utils, tokenUtilParams)
        })
    }
}
