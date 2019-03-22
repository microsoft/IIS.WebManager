
import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConnectService } from '../connect/connect.service';
import { ApiConnection } from '../connect/api-connection';
import { Observable } from 'rxjs';

export function IsWebServerScope(route: ActivatedRoute): boolean {
    return route.snapshot.parent && route.snapshot.parent.url[0].path.toLocaleLowerCase() === 'webserver';
}

export interface Runtime {
    OnModuleCreate(): void;
    OnAppInit(): void;
    DestroyContext(): void;
    ConnectToIISHost(): Observable<ApiConnection>;
    StartIISAdministration(): Observable<any>;
    HandleConnectError(err: any): any;
}

@Injectable()
export class StandardRuntime implements Runtime {
    constructor(
        private connectService: ConnectService,
    ){}
    public OnModuleCreate(): void {}
    public OnAppInit(): void {}
    public DestroyContext(): void {}

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
}
