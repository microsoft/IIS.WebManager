import { Component, Inject, ViewChild, ElementRef } from "@angular/core"
import { AppContextService } from "@microsoft/windows-admin-center-sdk/angular"
import { SETTINGS } from "main/settings"
import { Router } from "@angular/router"
import { WACRuntime } from "runtime/runtime.wac";

const urlValidationRegex = new RegExp('^((http[s]?|ftp):\\/)?\\/?([^:\\/\\s]+)((\\/\\w+)*\\/)([\\w\\-\\.]+[^#?\\s]+)(.*)?(#[\\w\\-]+)?$', "i")
const windowsPathValidationRegex = new RegExp('^(?:[a-z]:|\\\\\\\\[a-z0-9_.$●-]+(\\\\[a-z]\\$)?)\\\\(?:[^\\\\/:*?"<>|\\r\\n]+\\\\)*[^\\\\/:*?"<>|\\r\\n]*$', "i")

@Component({
    template: `
    <div class="center">
        <div *ngIf='!_inProgress' style="min-width:650px">
            <h3>IIS Administration API is required to manage IIS server:</h3>
            <p #apiPrompt>
                <label>IIS Administration API installation location</label>
                <input class="form-control" type="text" [(ngModel)]="_adminAPILocation"/>
            </p>
            <p #dotnetPrompt>
                <label>.NET Core Runtime install location (Optional)</label>
                <input class="form-control" type="text" placeholder="IIS Administration API installer will fetch required .NET Core Runtime online" [(ngModel)]="_dotnetCoreLocation" />
            </p>
            <div *ngIf='userInputError'>
                <p class="color-error">
                    {{userInputError}}
                </p>
            </div>
            <p>
                <button class="bttn background-active" (click)="install()">Install on {{_targetHost}}</button>
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

    .bttn.background-active:focus {
        color: #000000;
        border-style: dotted;
        border-width: 1px;
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
    private _adminAPILocation: string
    private _dotnetCoreLocation: string
    @ViewChild('apiPrompt') apiPrompt: ElementRef
    @ViewChild('dotnetPrompt') dotnetPrompt: ElementRef
    userInputError: string

    constructor(
        private router: Router,
        private appContext: AppContextService,
        @Inject("Runtime") private runtime: WACRuntime,
    ) {
        this._adminAPILocation = SETTINGS.api_download_url
        this._targetHost = this.appContext.activeConnection.nodeName
    }

    clearWarnings(event: Event) {
        (<HTMLElement> event.target).classList.remove('background-warning')
    }

    private verifyLocation(fieldName: string, location: string, allowEmpty: boolean): string {
        if (location) {
            if (!urlValidationRegex.test(location) && !windowsPathValidationRegex.test(location)) {
                return `Invalid ${fieldName}: ${location}`
            }
        } else {
            if (!allowEmpty) {
                return `${fieldName} cannot be empty`
            }
        }

        // NOTE: This code is injected here to prevent user using shared drive because it would be considered double hop with WinRM and wouldn't work
        // This needs to be revisited when Windows Admin Center completed their work on CredSSP
        if (location && location.startsWith(`\\\\`)) {
            return `Currently installation from shared drive is not supported, the issue is being tracked on https://github.com/Microsoft/IIS.WebManager/issues/239`
        }
    }

    private verifyLocationPrompt(prompt: ElementRef, allowEmpty: boolean): boolean {
        let fieldName = prompt.nativeElement.querySelector('label').textContent
        let textBox = prompt.nativeElement.querySelector('input')
        textBox.classList.remove('background-warning')
        this.userInputError = this.verifyLocation(fieldName, textBox.value, allowEmpty)
        let valid = this.userInputError == null
        if (!valid) {
            textBox.classList.add('background-warning')
            textBox.focus()
        }
        return valid
    }

    public install() {
        if (this.verifyLocationPrompt(this.apiPrompt, false)
            && this.verifyLocationPrompt(this.dotnetPrompt, true)) {
            this._inProgress = true
            let args: any = {
                command: 'install',
                adminAPILocation: this._adminAPILocation,
            }
            if (this._dotnetCoreLocation) {
                args.dotnetCoreLocation = this._dotnetCoreLocation
            }
            var sub = this.runtime.PrepareIISHost(args).subscribe(_ => {}, e => {
                let reason = 'unknown'
                if (e.response && e.response.exception) {
                    reason = e.response.exception
                }
                this.userInputError = `Installation failed. Error: ${reason}`
                this._inProgress = false
            }, () => {
                this.router.navigate(['/'])
                sub.unsubscribe()
            })
        }
    }
}
