
import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import { ConnectService } from '../connect/connect.service'

export interface Runtime {
    InitContext(): void
    DestroyContext(): void
    ConnectToIISHost(): void
}

@Injectable()
export class StandardRuntime implements Runtime {
    constructor(private connectService: ConnectService) {
    }

    public InitContext() {}

    public DestroyContext() {}

    public ConnectToIISHost() {
        this.connectService.gotoConnect(false)
    }
}
