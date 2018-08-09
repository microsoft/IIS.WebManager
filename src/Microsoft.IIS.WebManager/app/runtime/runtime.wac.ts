import { Runtime } from './runtime'
import { AppContextService, NavigationService } from '@microsoft/windows-admin-center-sdk/angular'
import { Injectable } from '@angular/core'

@Injectable()
export class WACRuntime implements Runtime {

    constructor(
        private appContext: AppContextService,
        private navigationService: NavigationService) {
    }

    public InitContext(){
        this.appContext.ngInit({ navigationService: this.navigationService })
    }

    public DestroyContext(){
        this.appContext.ngDestroy()
    }
}
