import { DateTime } from '../common/primitives';
import { Injectable, Inject } from '@angular/core';
import { Router } from '@angular/router';
import {
    AppContextService,
    NavigationService,
    FileTransferService
} from '@microsoft/windows-admin-center-sdk/angular';
import { Runtime } from './runtime';
import { ApiErrorType, UnexpectedServerStatusError } from 'error/api-error';
import { PowershellService } from './wac/services/powershell-service';
import { ConnectService } from '../connect/connect.service';
import { ApiConnection } from '../connect/api-connection';
import { PowerShellScripts } from 'generated/powershell-scripts'
import { map, shareReplay, mergeMap, catchError, finalize } from 'rxjs/operators';
import { LoggerFactory, Logger, LogLevel } from 'diagnostics/logger';
import { SETTINGS } from 'main/settings';
import { throwError, Observable } from 'rxjs';
import { ApiFile } from 'files/file';
import { NotificationService } from 'notification/notification.service';
import { NotificationType } from 'notification/notification';

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
        return this.appContext.servicesReady.pipe(
            map(_ => this.appContext.activeConnection.nodeName),
            shareReplay(),
        );
    }
}

@Injectable()
export class WACRuntime implements Runtime {
    private _tokenId: string;
    private _apiHost: string;
    private _connecting: Observable<ApiConnection>;
    private _logger: Logger;

    constructor(
        loggerFactory: LoggerFactory,
        private router: Router,
        private appContext: AppContextService,
        private connectService: ConnectService,
        private navigationService: NavigationService,
        private fileService: FileTransferService,
        private notifications: NotificationService,
        @Inject("Powershell") private powershellService: PowershellService,
        @Inject("WACInfo") private wac: WACInfo,
    ){
        this._logger = loggerFactory.Create(this);
    }

    public OnModuleCreate(): void {
        this.appContext.initializeModule({});
    }

    public OnAppInit(): void {
        this.appContext.ngInit({ navigationService: this.navigationService });
    }

    public OnAppDestroy(): void {
        if (this._tokenId) {
            this.powershellService.run(PowerShellScripts.Get_Token.script, {
                command: 'delete',
                tokenId: this._tokenId,
                apiHost: this._apiHost,
            }).pipe(
                finalize(() => this.appContext.ngDestroy())
            ).subscribe();
        } else {
            this.appContext.ngDestroy();
        }
    }

    public ConnectToIISHost(): Observable<ApiConnection> {
        if (!this._connecting) {
            this._connecting = this.wac.NodeName.pipe(
                mergeMap(nodeName =>
                this.GetApiKey().pipe(map((apiKey, _) => {
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
                }))),
                shareReplay()
            )
        }
        return this._connecting
    }

    public PrepareIISHost(p: any): Observable<any> {
        p.appMinVersion = SETTINGS.APISetupVersion;
        return this.powershellService.run(PowerShellScripts.Initialize_AdminAPI.script, p).pipe(
            map((status: HostStatus) => {
                this._apiHost = status.apiHost;
                if (status.groupModified) {
                    this.powershellService.Reset();
                }
                return status;
            }),
        );
    }

    public StartIISAdministration(): Observable<any> {
        return this.powershellService.run(PowerShellScripts.Start_AdminAPI.script, {})
    }

    public Download(file: ApiFile) {
        if (!file.physical_path) {
            throw new Error(`file ${file.name} does not have a physical path`);
        }
        var fileName = file.physical_path.split(/[\\\/]/).pop();
        this.fileService.transferFile(
            this.appContext.activeConnection.nodeName,
            file.physical_path,
            fileName,
            {}
        ).subscribe(
            _ => {
                // To open the file in a window use this:
                //
                // var downloaded = new File([blob] , fileName);
                // var fileURL = URL.createObjectURL(downloaded);
                // window.open(fileURL, "_blank");
                // URL.revokeObjectURL(fileURL);
            },
            e => {
                this.notifications.warn(`Failed to download file ${file.physical_path}, error: ${e.message}`);
            }
        )
    }

    private GetApiKey(): Observable<ApiKey> {
        return this.PrepareIISHost({ command: 'ensure' }).pipe(
            catchError((e, _) => {
                let errString = e as string;
                if (errString) {
                    let errContent: any;
                    try {
                        errContent = JSON.parse(errString);
                    } catch (e) {
                        this._logger.log(LogLevel.INFO,
                            `Unable to parse error message ${e}, the error must be unexpected`);
                    }
                    if (errContent) {
                        if (errContent.Type === 'PREREQ_BELOW_MIN_VERSION') {
                            return throwError({
                                type: ApiErrorType.Unreachable,
                                details: `To manage IIS Server, you need to install ${errContent.App} version ${errContent.Required} or higher. Current version detected: ${errContent.Actual}`,
                            });
                        }
                        if (errContent.Type === 'ADMIN_API_SERVICE_NOT_FOUND') {
                            return throwError({
                                type: ApiErrorType.Unreachable,
                                details: `To manage an IIS Server, you need to install ${errContent.App} on IIS host`,
                            });
                        }
                        if (errContent.Type === 'ADMIN_API_SERVICE_NOT_RUNNING') {
                            return throwError(new UnexpectedServerStatusError(errContent.Status));
                        }
                    }
                }
                return throwError(e);
            }),
            mergeMap(_ => {
                var tokenUtilParams: any = {
                    command: 'ensure',
                    apiHost: this._apiHost,
                };
                if (this._tokenId) {
                    tokenUtilParams.tokenId = this._tokenId;
                }
                return this.powershellService.run<ApiKey>(PowerShellScripts.Get_Token.script, tokenUtilParams);
            })
        );
    }

    public HandleConnectError(err: any): any {
        if (err.type && err.type === ApiErrorType.Unreachable) {
            this._logger.log(LogLevel.INFO, "Navigating to install page...");
            this.router.navigate(['install'], { queryParams: {
                details: err.details,
            }});
            return null;
        }
        return err;
    }
}
