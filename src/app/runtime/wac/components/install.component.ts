import { Component, Inject, ViewChild, ElementRef, OnInit } from "@angular/core";
import { AppContextService } from "@microsoft/windows-admin-center-sdk/angular";
import { SETTINGS } from "main/settings";
import { Router, ActivatedRoute } from "@angular/router";
import { WACRuntime } from "runtime/runtime.wac";

const urlValidationRegex = new RegExp('^((http[s]?|ftp):\\/)?\\/?([^:\\/\\s]+)((\\/\\w+)*\\/)([\\w\\-\\.]+[^#?\\s]+)(.*)?(#[\\w\\-]+)?$', "i");
const windowsPathValidationRegex = new RegExp('^(?:[a-z]:|\\\\\\\\[a-z0-9_.$●-]+(\\\\[a-z]\\$)?)\\\\(?:[^\\\\/:*?"<>|\\r\\n]+\\\\)*[^\\\\/:*?"<>|\\r\\n]*$', "i");

@Component({
    template: `
<div class="padded sme-focus-zone">
    <div *ngIf='!inProgress' style="min-width:700px">
        <h3>Internet Information Service (IIS)</h3>
        <span>{{details}}</span>
        <ul class="form">
            <li>
                <input name="installfrom" role="radio" aria-labeledby="radio_1" type="radio" [(ngModel)]="useDefault" [value]="true" [checked]="useDefault">
                    <span id="radio_1">Install from Microsoft (Internet connection required)</span>
            </li>
            <li>
                <input name="installfrom" role="radio" aria-labeledby="radio_2" type="radio" [(ngModel)]="useDefault" [value]="false" [checked]="!useDefault">
                    <span id="radio_2">Install from specific location</span>
                <ul *ngIf="!useDefault">
                    <li>
                        <ul>
                            <li #apiPrompt>
                                <label id="label_1">IIS Administration API Installer location (IISAdministrationSetup.exe can be found 
                                <a target='_blank' href='https://github.com/microsoft/IIS.Administration/releases'>here</a>)</label>
                                <input aria-labeledby="label_1" class="form-control" type="text" [(ngModel)]="adminAPILocation"/>
                            </li>
                            <li #dotnetPrompt style='display:none'>
                                <label id="label_2">(Optional*) .NET Core Runtime installer location, required version: ${SETTINGS.DotnetFrameworkVersion}</label>
                                <input aria-labeledby="label_2" class="form-control" type="text" [(ngModel)]="dotnetCoreLocation" />
                            </li>
                            <li #aspnetPrompt style='display:none'>
                                <label id="label_3">(Optional*) ASP.NET Core installer location, required version: ${SETTINGS.AspnetSharedFrameworkVersion}</label>
                                <input aria-labeledby="label_3" class="form-control" type="text" [(ngModel)]="aspnetCoreLocation" />
                            </li>
                            <p>*If prerequisites .NET Core Runtime and ASP.NET Core are not already installed on the server, we will attempt to acquire them from the Internet.</p>
                        </ul>
                    </li>
                </ul>
            </li>
        </ul>
        <div *ngFor='let e of userInputError'>
            <p class="color-error">
                {{e}}
            </p>
        </div>
        <p>
            <button class="bttn background-active" (click)="install()">Install on {{targetHost}}</button>
        </p>
    </div>
    <div *ngIf='inProgress'>
        <h1><i aria-hidden="true" class="sme-icon sme-icon-refresh sme-spin"></i></h1>
        <h1>Installing...</h1>
        <p class='block color-active'>{{status}}</p>
    </div>
</div>
`,
    styles: [`

    input[type='radio'] {
        all: revert;
    }

    a, a:link, a:focus, a:hover, a:active, a:visited {
        text-decoration: revert;
        color: revert;
    }
   
    .padded {
        text-align: left;
        padding-left: 100px;
        padding-top: 100px;
    }

    h3 {
        font-weight: bold;
    }

    h1 {
        font-size: 300%;
        padding: 0 10px 0 0;
        margin: 0;
        display: inline-block;
        vertical-align: middle;
    }

    .sme-spin:before, .sme-spin{
        margin: 0;
        padding: 0;
        display: inline-block;
        vertical-align: middle;
    }

    .block {
        display: block;
        padding-top: 40px;
        font-size: 130%;
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
        padding-bottom: 20px;
    }

    .form-control {
        width: 100ch;
    }
`],
})
export class InstallComponent implements OnInit {
    useDefault: boolean = true;
    inProgress: boolean;
    targetHost: string;
    adminAPILocation: string;
    dotnetCoreLocation: string;
    aspnetCoreLocation: string;
    userInputError: string[];
    details: string;
    private sharedDriveUsed = false;

    @ViewChild('apiPrompt') apiPrompt: ElementRef;
    @ViewChild('dotnetPrompt') dotnetPrompt: ElementRef;
    @ViewChild('aspnetPrompt') aspnetPrompt: ElementRef;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private appContext: AppContextService,
        @Inject("Runtime") private runtime: WACRuntime,
    ) {
        this.targetHost = this.appContext.activeConnection.nodeName;
    }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            this.details = params['details'];
        });
    }

    clearWarnings(event: Event) {
        (<HTMLElement> event.target).classList.remove('background-warning');
    }

    onSelectionChanged(event) {
        console.log(event);
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
        if (location && location.startsWith(`\\\\`)) {
            this.sharedDriveUsed = true;
        }
    }

    private verifyLocationPrompt(prompt: ElementRef, allowEmpty: boolean): boolean {
        let fieldName = prompt.nativeElement.querySelector('label').textContent;
        let textBox = prompt.nativeElement.querySelector('input');
        textBox.classList.remove('background-warning');
        const errorMsg = this.verifyLocation(fieldName, textBox.value.trim(), allowEmpty);
        const valid = errorMsg == null;
        this.userInputError.push(errorMsg);
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
            args.adminAPILocation = SETTINGS.APIDownloadUrl
        } else {
            this.userInputError = [];
            var valid = this.verifyLocationPrompt(this.apiPrompt, false);
            valid = this.verifyLocationPrompt(this.dotnetPrompt, true) && valid;
            valid = this.verifyLocationPrompt(this.aspnetPrompt, true) && valid;
            if (valid) {
                args.adminAPILocation = this.adminAPILocation.trim();
                if (this.dotnetCoreLocation) {
                    args.dotnetCoreLocation = this.dotnetCoreLocation.trim();
                }
                if (this.aspnetCoreLocation) {
                    args.aspnetCoreLocation = this.aspnetCoreLocation.trim();
                }
            } else {
                return;
            }
        }
        
        this.inProgress = true;
        const requireCredSSP = this.sharedDriveUsed;
        // NOTE: you don't technically need credSSP if current target is local
        this.runtime.PrepareIISHost(args, requireCredSSP).subscribe(_ => {}, e => {
            this.userInputError = [ `Installation failed. Error: ${e}` ];
            this.inProgress = false;
        }, () => {
            this.router.navigate(['/']);
        });
    }
}
