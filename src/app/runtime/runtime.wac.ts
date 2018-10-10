import { Injector, Injectable } from '@angular/core'
import { Router } from '@angular/router'
import {
    AppContextService,
    NavigationService
} from '@microsoft/windows-admin-center-sdk/angular'
import { Runtime } from './runtime'
import { PowershellService } from './wac/powershell-service'
import { ConnectService, AdminApiUnreachableError } from '../connect/connect.service'
import { ApiConnection } from '../connect/api-connection'

import 'rxjs/add/operator/take'

@Injectable()
export class WACRuntime implements Runtime {
    constructor(
        private router: Router,
        private appContext: AppContextService,
        private navigationService: NavigationService,
        private connectService: ConnectService
    ) {
    }

    public InitContext() {
        this.appContext.ngInit({ navigationService: this.navigationService })
    }

    public DestroyContext() {
        this.appContext.ngDestroy()
    }

    public ConnectToIISHost() {
        // TODO: check for installation
        // TODO: edit cors
        this.appContext.servicesReady.take(1).subscribe(evt => {
            var connection = new ApiConnection(this.appContext.activeConnection.nodeName)
            connection.accessToken = '<change me>'
            this.connectService.connect(connection)
                .catch(e => {
                    if (e === AdminApiUnreachableError.Instance) {
                        this.router.navigate(['/install-admin-api'])
                    } else {
                        throw e
                    }
                })
                .then(conn => {
                    this.connectService.save(connection)
                })
        })
    }
}
