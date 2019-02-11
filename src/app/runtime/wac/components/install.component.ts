import { Component, Inject, ViewChild, ElementRef } from "@angular/core"
import { AppContextService } from "@microsoft/windows-admin-center-sdk/angular"
import { SETTINGS } from "main/settings"
import { Router } from "@angular/router"
import { WACRuntime } from "runtime/runtime.wac";

const urlValidationRegex = new RegExp('^((http[s]?|ftp):\\/)?\\/?([^:\\/\\s]+)((\\/\\w+)*\\/)([\\w\\-\\.]+[^#?\\s]+)(.*)?(#[\\w\\-]+)?$', "i")
const windowsPathValidationRegex = new RegExp('^(?:[a-z]:|\\\\\\\\[a-z0-9_.$●-]+(\\\\[a-z]\\$)?)\\\\(?:[^\\\\/:*?"<>|\\r\\n]+\\\\)*[^\\\\/:*?"<>|\\r\\n]*$', "i")

@Component({
    template: `
    <div class="padded sme-focus-zone">
        <div *ngIf='!inProgress' style="min-width:700px">
            <h3>Internet Information Service (IIS)</h3>
            <span>To manage an IIS Server, you need to install the Microsoft IIS Administration API on IIS host</span>

            <ul class="form">
                <li><input type="radio" [(ngModel)]="useDefault" [value]="true" [checked]="useDefault">Install from Microsoft (internet connection required)</li>
                <li>
                    <input type="radio" [(ngModel)]="useDefault" [value]="false" [checked]="!useDefault">Install from specific location
                    <ul *ngIf="!useDefault">
                        <li>
                            <ul>
                                <li #apiPrompt>
                                    <label>API Installer location</label>
                                    <input class="form-control" type="text" [(ngModel)]="adminAPILocation"/>
                                </li>
                                <li #dotnetPrompt>
                                    <label>.NET Core Runtime installer location</label>
                                    <input class="form-control" type="text" [(ngModel)]="dotnetCoreLocation" />
                                </li>
                            </ul>
                        </li>
                    </ul>
                </li>
            </ul>


            <div *ngIf='userInputError'>
                <p class="color-error">
                    {{userInputError}}
                </p>
            </div>
            <p>
                <button class="bttn background-active" (click)="install()">Install on {{targetHost}}</button>
            </p>
        </div>
        <div *ngIf='inProgress'>
            <h1>Installing...</h1>
            <p><i class="fa fa-spinner fa-pulse fa-3x"></i></p>
            <p><small class='block color-active'>{{status}}</small></p>
        </div>
    </div>
`,
    styles: [`
    .padded {
        text-align: left;
        padding-left: 100px;
        padding-top: 100px;
    }

    h3 {
        font-weight: bold;
    }

    h1 {
        margin-bottom: 50px;
        font-size: 300%;
    }

    .form {
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

    ul {
        padding-top: 10px;
        padding-left: 10px;
    }

    li {
        padding-left: 10px;
        padding-bottom: 10px;
    }

    .form-control {
        width: 100ch;
    }
`],
})
export class InstallComponent {
    useDefault: boolean = true;
    inProgress: boolean;
    targetHost: string;
    adminAPILocation: string;
    dotnetCoreLocation: string;
    userInputError: string;

    @ViewChild('apiPrompt') apiPrompt: ElementRef;
    @ViewChild('dotnetPrompt') dotnetPrompt: ElementRef;
    constructor(
        private router: Router,
        private appContext: AppContextService,
        @Inject("Runtime") private runtime: WACRuntime,
    ) {
        this.targetHost = this.appContext.activeConnection.nodeName;
    }

    clearWarnings(event: Event) {
        (<HTMLElement> event.target).classList.remove('background-warning');
    }

    onSelectionChanged(event) {
        console.log(event)
    }

    private verifyLocation(fieldName: string, location: string, allowEmpty: boolean): string {
        if (location) {
            if (!urlValidationRegex.test(location) && !windowsPathValidationRegex.test(location)) {
                return `Invalid ${fieldName}: ${location}`;
            }
        } else {
            if (!allowEmpty) {
                return `${fieldName} cannot be empty`;
            }
        }

        // NOTE: This code is injected here to prevent user using shared drive because it would be considered double hop with WinRM and wouldn't work
        // This needs to be revisited when Windows Admin Center completed their work on CredSSP
        if (location && location.startsWith(`\\\\`)) {
            return `Currently installation from shared drive is not supported, the issue is being tracked on https://github.com/Microsoft/IIS.WebManager/issues/239`
        }
    }

    private verifyLocationPrompt(prompt: ElementRef): boolean {
        let fieldName = prompt.nativeElement.querySelector('label').textContent;
        let textBox = prompt.nativeElement.querySelector('input');
        textBox.classList.remove('background-warning');
        this.userInputError = this.verifyLocation(fieldName, textBox.value, false);
        let valid = this.userInputError == null;
        if (!valid) {
            textBox.classList.add('background-warning');
            textBox.focus();
        }
        return valid;
    }

    public install() {
        var args: any = {
            command: 'install',
        };

        if (this.useDefault) {
            args.adminAPILocation = SETTINGS.api_download_url
        } else {
            if (this.verifyLocationPrompt(this.apiPrompt) && this.verifyLocationPrompt(this.dotnetPrompt)) {
                args.adminAPILocation = this.adminAPILocation;
                args.dotnetCoreLocation = this.dotnetCoreLocation;
            }
        }
        
        this.inProgress = true;
        var sub = this.runtime.PrepareIISHost(args).subscribe(_ => {}, e => {
            let reason = 'unknown';
            if (e.response && e.response.exception) {
                reason = e.response.exception;
            }
            this.userInputError = `Installation failed. Error: ${reason}`;
            this.inProgress = false;
        }, () => {
            this.router.navigate(['/']);
            sub.unsubscribe();
        });
    }
}
