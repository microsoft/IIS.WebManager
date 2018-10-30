import { Component } from "@angular/core"
import { AppContextService } from "@microsoft/windows-admin-center-sdk/angular"
import { SETTINGS } from "main/settings"
import { AdminAPIInstallService } from "../services/admin-api-install-service";
import { Router } from "@angular/router";

@Component({
    template: `
    <div class="center">
        <div *ngIf='!_inProgress' style="min-width:650px">
            <h3>IIS Administration API is required to manage IIS server:</h3>
            <div class="validation-container">
                <p>
                    <label>IIS Administration API installation location</label>
                    <input class="form-control" type="text" [(ngModel)]="_adminApiLocation" />
                </p>
            </div>
            <p>
                <a class="bttn background-active" (click)="install()">Install on {{_targetHost}}</a>
            </p>
        </div>
        <div *ngIf='_inProgress'>
            <h1>Installing...</h1>
            <p><i class="fa fa-spinner fa-pulse fa-3x"></i></p>
            <p><small class='block color-active'>{{_status}}</small></p>
        </div>
    </div>
`,
    styles: [`
    .center {
        text-align: center;
    }

    h1 {
        margin-bottom: 50px;
        font-size: 300%;
    }

    button {
      width: 100px;  
    }

    p {
        padding-top: 20px;
        padding-bottom: 20px;
    }

    small {
        padding-top: 5px;
    }

    .bttn {
        padding-top: 8px;
        padding-bottom: 8px;
    }

    .collapse-heading {
        border: none;
    }

    h2 {
        font-size: 16px;
    }

    .skip {
        margin-top: 50px;
    }
`],
})
export class InstallComponent {
    private _inProgress: boolean
    private _targetHost: string
    private _adminApiLocation: string

    constructor(
        private router: Router,
        private appContext: AppContextService,
        private installer: AdminAPIInstallService,
    ) {
        this._adminApiLocation = SETTINGS.api_download_url
        this._targetHost = appContext.activeConnection.nodeName
    }

    public install() {
        this._inProgress = true
        this.installer.install(this._adminApiLocation).then(_ => {
            console.log("navigating back to home")
            this.router.navigate(["/"])
        })
    }
}
