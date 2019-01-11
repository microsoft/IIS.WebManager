
import { Injectable } from '@angular/core'
import { ActivatedRoute, Route } from '@angular/router'
import { ConnectService } from '../connect/connect.service'
import { ApiConnection } from '../connect/api-connection'
import { Observable } from 'rxjs/Observable'

export interface Runtime {
    InitContext(): void
    DestroyContext(): void
    ConnectToIISHost(): Observable<ApiConnection>
    IsWebServerScope(): boolean
    RestartIISAdministration(): Observable<any>
}

@Injectable()
export class StandardRuntime implements Runtime {
    private _isWebServerScope = false

    constructor(
        private connectService: ConnectService,
        private route: ActivatedRoute,
    ) {
    }

    public InitContext() {
    }

    public DestroyContext() {}

    public ConnectToIISHost(): Observable<ApiConnection> {
        return Observable.create(observer => {
            this.connectService.gotoConnect(false).then(_ => {
                observer.complete()
            })
        })
    }

    public IsWebServerScope() {
        // parent would be null if route parent was unchanged
        if (this.route.snapshot.parent) {
            this._isWebServerScope = this.route.snapshot.parent.url[0].path.toLocaleLowerCase() == 'webserver';
        }
        return this._isWebServerScope
    }

    public RestartIISAdministration(): Observable<any> {
        throw 'Restarting IIS Administration API is not supported, please manually restart the service'
    }
}
