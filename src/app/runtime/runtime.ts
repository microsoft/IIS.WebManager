
import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import { ConnectService } from '../connect/connect.service'
import { ApiConnection } from '../connect/api-connection'

export interface Runtime {
    InitContext(): void
    DestroyContext(): void
    ConnectToIISHost(): Promise<ApiConnection>
}

@Injectable()
export class StandardRuntime implements Runtime {
    constructor(private connectService: ConnectService) {
    }

    public InitContext() {}

    public DestroyContext() {}

    public ConnectToIISHost(): Promise<ApiConnection> {
        return new Promise(
            (_, reject) => {
                this.connectService.gotoConnect(false).then(success => {
                    reject(`authentication required, redirect successful: ${success}`)
                })
            })
    }
}
