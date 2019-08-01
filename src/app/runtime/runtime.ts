
import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConnectService } from '../connect/connect.service';
import { ApiConnection } from '../connect/api-connection';
import { Observable } from 'rxjs';
import { FilesService } from 'files/files.service';
import { ApiFile } from 'files/file';

export function IsWebServerScope(route: ActivatedRoute): boolean {
    return route.snapshot.parent && route.snapshot.parent.url[0].path.toLocaleLowerCase() === 'webserver';
}

export interface Runtime {
    OnModuleCreate(): void;
    OnAppInit(): void;
    OnAppDestroy(): void;
    ConnectToIISHost(): Observable<ApiConnection>;
    StartIISAdministration(): Observable<any>;
    HandleConnectError(err: any): any;
    Download(file: ApiFile): void;
    RenderFrebLogs(file: ApiFile): void;
}

@Injectable()
export class SiteRuntime implements Runtime {
    constructor(
        private connectService: ConnectService,
        private fileService: FilesService,
    ){}
    public OnModuleCreate(): void {}
    public OnAppInit(): void {}
    public OnAppDestroy(): void {}

    public ConnectToIISHost(): Observable<ApiConnection> {
        return Observable.create(observer => {
            this.connectService.gotoConnect(false).then(_ => {
                observer.complete();
            });
        });
    }

    public StartIISAdministration(): Observable<any> {
        throw 'Restarting Microsoft IIS Administration API is not supported, please manually restart the service';
    }

    public HandleConnectError(err: any): any {
        return err;
    }

    public Download(file: ApiFile) {
        this.fileService.downloadInNewWindow(file);
    }

    public RenderFrebLogs(file: ApiFile) {
        let newWindow = window.open();
        this.fileService.generateDownloadLink(file, 5 * 60 * 1000)
            .then(location => {
                newWindow.location.href = location + "?inline";
            })
            .catch(_ => {
                newWindow.close();
            });
    }
}
