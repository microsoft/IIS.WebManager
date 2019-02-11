
import { Injectable } from '@angular/core'
import { ConnectService } from '../connect/connect.service'
import { ApiConnection } from '../connect/api-connection'
import { Observable } from 'rxjs/Observable'
import { ActivatedRoute } from '@angular/router';

export function IsWebServerScope(route: ActivatedRoute) {
    return route.snapshot.parent && route.snapshot.parent.url[0].path.toLocaleLowerCase() == 'webserver'
}

export interface Runtime {
    InitContext(): void
    DestroyContext(): void
    ConnectToIISHost(): Observable<ApiConnection>
    StartIISAdministration(): Observable<any>
}

@Injectable()
export class StandardRuntime implements Runtime {
    constructor(
        private connectService: ConnectService,
    ){}

    public InitContext() {}
    public DestroyContext() {}

    public ConnectToIISHost(): Observable<ApiConnection> {
        return Observable.create(observer => {
            this.connectService.gotoConnect(false).then(_ => {
                observer.complete()
            })
        })
    }

    public StartIISAdministration(): Observable<any> {
        throw 'Restarting Microsoft IIS Administration API is not supported, please manually restart the service'
    }
}
