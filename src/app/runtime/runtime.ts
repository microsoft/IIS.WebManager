
import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import { ConnectService } from '../connect/connect.service'
import { ApiConnection } from '../connect/api-connection'
import { Observable } from 'rxjs';

export interface Runtime {
    InitContext(): void
    DestroyContext(): void
    ConnectToIISHost(): Observable<ApiConnection>
}

@Injectable()
export class StandardRuntime implements Runtime {
    constructor(private connectService: ConnectService) {
    }

    public InitContext() {}

    public DestroyContext() {}

    public ConnectToIISHost(): Observable<ApiConnection> {
        // TODO: test
        return Observable.create(() => this.connectService.gotoConnect(false))
    }
}
