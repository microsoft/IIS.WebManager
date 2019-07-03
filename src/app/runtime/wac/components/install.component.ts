
import { Component, Inject, ViewChild, ElementRef, OnInit } from "@angular/core";
import { AppContextService, FileTransferService } from "@microsoft/windows-admin-center-sdk/angular";
import { SETTINGS } from "main/settings";
import { Router, ActivatedRoute } from "@angular/router";
import { WACRuntime } from "runtime/runtime.wac";
import { Logger, LoggerFactory, LogLevel } from "diagnostics/logger";
import { Observable, of, forkJoin, Observer } from "rxjs";
import { map, mergeMap } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { PowershellService } from "runtime/wac/services/powershell-service";

const urlValidationRegex = new RegExp('^((http[s]?|ftp):\\/)?\\/?([^:\\/\\s]+)((\\/\\w+)*\\/)([\\w\\-\\.]+[^#?\\s]+)(.*)?(#[\\w\\-]+)?$', "i");
const windowsPathValidationRegex = new RegExp('^(?:[a-z]:|\\\\\\\\[a-z0-9_.$●-]+(\\\\[a-z]\\$)?)\\\\(?:[^\\\\/:*?"<>|\\r\\n]+\\\\)*[^\\\\/:*?"<>|\\r\\n]*$', "i");

const IISAdminAPI = 0;
const DotNetCore = 1;
const AspNetCore = 2;

enum InputType {
    Default = 0,
    Text = 1,
    Selection = 2,
}

enum LocationType {
    Url = 1,
    Local,
    UNC,
}

class PrerequisiteInfo {
    public userInput: string;
    public locationType: LocationType;
    public installStatus: string;
    public file: Observable<File>;
    constructor(public displayName: string, public downloadAs: string) {}
}

// TODO: verify of  allow nulls are allowed for runtime text box
@Component({
    template: `
<div class="padded sme-focus-zone">
    <div *ngIf='!installStatus' style="min-width:700px">
        <h3>Internet Information Service (IIS)</h3>
        <span>{{details}}</span>
        <ul class="form">
            <li><input type="radio" [(ngModel)]="inputType" [value]="${InputType.Default}" [checked]="inputType == ${InputType.Default}" />Install from Microsoft</li>
            <li><input type="radio" [(ngModel)]="inputType" [value]="${InputType.Text}" [checked]="inputType == ${InputType.Text}" />Install from specific location</li>
            <li><input type="radio" [(ngModel)]="inputType" [value]="${InputType.Selection}" [checked]="inputType == ${InputType.Selection}" />Select file and upload to {{targetHost}}</li>
            <ul *ngIf="inputType != ${InputType.Default}">
                <li>
                    <ul>
                        <li #IISAdminAPIPrompt>
                            <label>{{prerequisites[${IISAdminAPI}].displayName}} Installer location</label>
                            <input *ngIf="inputType == ${InputType.Text}" class="form-control" type="text" [(ngModel)]="adminAPILocation"/>
                            <input *ngIf="inputType == ${InputType.Selection}" type="file" (change)="onFileSelected($event, ${IISAdminAPI})" />
                        </li>
                        <li #DotNetCorePrompt>
                            <label>{{prerequisites[${DotNetCore}].displayName}} installer location, required version: ${SETTINGS.DotnetFrameworkVersion}</label>
                            <input *ngIf="inputType == ${InputType.Text}" class="form-control" type="text" [(ngModel)]="dotnetCoreLocation" />
                            <input *ngIf="inputType == ${InputType.Selection}" type="file" (change)="onFileSelected($event, ${DotNetCore})" />
                        </li>
                        <li #AspNetCorePrompt>
                            <label>{{prerequisites[${AspNetCore}].displayName}} installer location, required version: ${SETTINGS.AspnetSharedFrameworkVersion}</label>
                            <input *ngIf="inputType == ${InputType.Text}" class="form-control" type="text" [(ngModel)]="aspnetCoreLocation" />
                            <input *ngIf="inputType == ${InputType.Selection}" type="file" (change)="onFileSelected($event, ${AspNetCore})" />
                        </li>
                        <div *ngIf="proxyAllowedInTextMode && inputType == ${InputType.Text}">
                            <input class="toggle-input" type="checkbox"  [(ngModel)]="proxy" />
                            <label>Upload installer files to {{targetHost}}</label>
                        </div>
                    </ul>
                </li>
            </ul>
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
    <div *ngIf='installStatus'>
        <h1>{{installStatus}}</h1>
        <ul>
            <li *ngFor="let prereq of prerequisites">
                <span *ngIf="prereq.installStatus">{{prereq.installStatus}}</span>
            </li>
        </ul>
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

label {
    font-weight: bold;
    margin: 0.3em;
}`],
})
export class InstallComponent implements OnInit {
    prerequisites: PrerequisiteInfo[] = [
        <PrerequisiteInfo>{ displayName: "Microsoft IIS Administration API", downloadAs: "IISAdminSetup.exe" },
        <PrerequisiteInfo>{ displayName: ".NET Core Runtime", downloadAs: "dotnet-core-setup.exe" },
        <PrerequisiteInfo>{ displayName: "ASP.NET Core", downloadAs: "aspnet-core-setup.exe" },
    ]

    _inputType: InputType = InputType.Default;
    installStatus: string;
    targetHost: string;
    userInputError: string;
    details: string;
    logger: Logger;
    proxy: boolean;
    proxyAllowedInTextMode = false;   // TODO: unfinished feature

    testObservable: Observable<File>;

    @ViewChild('IISAdminAPIPrompt') apiPrompt: ElementRef;
    @ViewChild('DotNetCorePrompt') dotnetPrompt: ElementRef;
    @ViewChild('AspNetCorePrompt') aspnetPrompt: ElementRef;

    constructor(
        factory: LoggerFactory,
        private route: ActivatedRoute,
        private router: Router,
        private appContext: AppContextService,
        private fileSrv: FileTransferService,
        private http: HttpClient,
        @Inject("Powershell") private powershellSrv: PowershellService,
        @Inject("Runtime") private runtime: WACRuntime,
    ) {
        this.logger = factory.Create(this);
        this.targetHost = this.appContext.activeConnection.nodeName;
    }

    onFileSelected(event, prereqId: number) {
        var file = event.target.files[0];
        var reader = new FileReader();
        var prereq = this.prerequisites[prereqId];
        prereq.locationType = LocationType.Local;
        prereq.file = Observable.create(o => {
            reader.readAsArrayBuffer(file);
            reader.onabort = evt => o.error(`Aborted loading ${prereq.displayName}`);
            reader.onerror = evt => o.error(`Error loading ${prereq.displayName}`);
            // reader.onloadstart = e => null;
            // reader.onprogress = e => null;
            // reader.onload = e => null;
            reader.onloadend = evt => {
                o.next(new File([reader.result], prereq.downloadAs));
                o.complete();
            };
        });
    }

    set inputType(value: InputType) {
        if (value != InputType.Selection) {
            for (let p of this.prerequisites) {
                p.file = null;
            }
        }
        this._inputType = value;
    }

    get inputType(): InputType {
        return this._inputType;
    }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            this.details = params['details'];
        });
    }

    clearWarnings(event: Event) {
        (<HTMLElement> event.target).classList.remove('background-warning');
    }

    private verifyLocation(info: PrerequisiteInfo, fieldName: string, location: string, allowEmpty: boolean): string {
        info.locationType = null;
        if (!location) {
            if (allowEmpty) {
                return null;
            } else {
                return `${fieldName} cannot be empty`;
            }
        }

        var locationType: LocationType | null = null;
        if (urlValidationRegex.test(location)) {
            locationType = LocationType.Url;
        }
        if (windowsPathValidationRegex.test(location)) {
            if (location.startsWith(`\\\\`)) {
                locationType = LocationType.UNC;
            } else {
                locationType = LocationType.Local;
            }
        }

        if (locationType == null) {
            return `Invalid ${fieldName}: ${location}`;
        }

        // NOTE: This code is injected here to prevent user using shared drive because it would be considered double hop with WinRM and wouldn't work
        // This needs to be revisited when Windows Admin Center completed their work on CredSSP
        if (!this.proxy && locationType == LocationType.UNC) {
            return `Currently installation from shared drive is not supported, the issue is being tracked on https://github.com/Microsoft/IIS.WebManager/issues/239`;
        }
        info.locationType = locationType;
    }

    private verifyLocationPrompt(prompt: ElementRef, prereqId: number): boolean {
        let fieldName = prompt.nativeElement.querySelector('label').textContent;
        let textBox = prompt.nativeElement.querySelector('input');
        textBox.classList.remove('background-warning');
        var info = this.prerequisites[prereqId];
        var input = textBox.value;
        info.userInput = null;
        this.userInputError = this.verifyLocation(info, fieldName, input, false);
        let valid = this.userInputError == null;
        if (!valid) {
            textBox.classList.add('background-warning');
            textBox.focus();
        }
        info.userInput = input;
        return valid;
    }

    private EnsureFile(prereqId: number): Observable<string>
    {
        let prereq = this.prerequisites[prereqId];
        let getFile: Observable<File>;
        // let uploadOptions: FileUploadOptions = null;
        // let cancelToken: CancellationToken = null;
        let filename = prereq.downloadAs;
        let uploadDest = this.powershellSrv.getEnv("TMP").pipe(map(temp => `${temp}\\${filename}`));

        if (this.inputType == InputType.Selection) {
            this.logger.log(LogLevel.DEBUG, `Static file selected for ${prereq.displayName}`);
            getFile = prereq.file;
        } else if (this.inputType == InputType.Text) {
            var location = prereq.userInput;
            var locationType = prereq.locationType;
            if (!location) {
                return of(null);
            }

            if (!this.proxy) {
                return of(location);
            }
            if (locationType == LocationType.Url) {
                this.logger.log(LogLevel.DEBUG, `URL selected for ${prereq.displayName}`);
                prereq.installStatus = `Downloading ${prereq.displayName} locally...`;
                getFile = this.http.get(location, {
                    responseType: 'blob',
                    withCredentials: true,
                }).pipe(map(buffer => {
                    prereq.installStatus = `Downloaded ${prereq.displayName} locally...`;
                    return new File([buffer], filename);
                }));
            } else {
                throw `Unsupported: ${location} is a file and cannot be selected`;
            }
        } else {
            throw `Unsupported input type ${this.inputType}`
        }

        var targetFileName: string;
        return forkJoin(
            uploadDest,
            getFile,
        ).pipe(
            mergeMap(([uploadDest, file], _) => {
                targetFileName = uploadDest;
                prereq.installStatus = `Uploading ${prereq.displayName} to ${this.targetHost}, file will be saved in ${uploadDest}...`;
                this.logger.log(LogLevel.DEBUG, prereq.installStatus);
                return this.fileSrv.upload(this.targetHost, uploadDest, file);
            }),
            map(result => {
                if (result.completed) {
                    this.logger.log(LogLevel.INFO, prereq.installStatus = `Uploaded ${prereq.displayName} to ${this.targetHost}, file is saved in ${targetFileName}...`);
                    return targetFileName;
                }
                throw `Uploading ${targetFileName} failed`;
            }),
        )
    }

    private EnsureFiles(args: any): Observable<any> {
        this.clearPrereqStatus();
        this.installStatus = "Preparing for install...";
        // sequential upload implementation
        return Observable.create((o: Observer<any>) =>
            this.EnsureFile(IISAdminAPI).toPromise().then(adminAPILocation => {
                if (adminAPILocation) {
                    args.adminAPILocation = adminAPILocation;
                }
                this.EnsureFile(DotNetCore).toPromise().then(dotnetCoreLocation => {
                    if (dotnetCoreLocation) {
                        args.dotnetCoreLocation = dotnetCoreLocation;
                    }
                    this.EnsureFile(AspNetCore).toPromise().then(aspnetCoreLocation => {
                        if (aspnetCoreLocation) {
                            args.aspnetCoreLocation = aspnetCoreLocation;
                        }
                        o.next(args);
                        o.complete();
                    }).catch(e => o.error(e));
                }).catch(e => o.error(e));
            }).catch(e => o.error(e))
        );
        // parallel upload implementation
        // return forkJoin(
        //     this.EnsureFile(IISAdminAPI),
        //     this.EnsureFile(DotNetCore),
        //     this.EnsureFile(AspNetCore),
        // ).pipe(
        //     map(([adminAPILocation, dotnetCoreLocation, aspnetCoreLocation]) => {
        //         this.clearPrereqStatus();
        //         if (adminAPILocation) {
        //             args.adminAPILocation = adminAPILocation;
        //         }
        //         if (dotnetCoreLocation) {
        //             args.dotnetCoreLocation = dotnetCoreLocation;
        //         }
        // if (aspnetCoreLocation) {
        //     args.aspnetCoreLocation = aspnetCoreLocation;
        // }
        //         return args;
        //     })
        // );
    }

    private clearPrereqStatus() {
        for (let prereq of this.prerequisites) {
            prereq.installStatus = null;
        }
    }

    public install() {
        var args: any = {
            command: 'install',
        };
        var installArgs: Observable<any>;
        if (this.inputType == InputType.Default) {
            args.adminAPILocation = SETTINGS.APIDownloadUrl;
            installArgs = of(args);
        } else {
            if (this.inputType == InputType.Text) {
                if (!this.verifyLocationPrompt(this.apiPrompt, IISAdminAPI)) {
                    return;
                }
                if (!this.verifyLocationPrompt(this.dotnetPrompt, DotNetCore)) {
                    return;
                }
                if (!this.verifyLocationPrompt(this.aspnetPrompt, AspNetCore)) {
                    return;
                }
            }
            installArgs = this.EnsureFiles(args);
        }

        installArgs.pipe(
            mergeMap(args => {
                this.installStatus = `Installing components on ${this.targetHost}`;
                return this.runtime.PrepareIISHost(args);
            }),
        ).subscribe(_ => {}, e => {
            let reason = e;
            if (e.response && e.response.exception) {
                reason = e.response.exception;
            } else {
                this.logger.log(LogLevel.WARN, `Error during installation ${e}`);
            }
            this.userInputError = `Installation failed. Error: ${reason}`;
            this.installStatus = null;
            this.clearPrereqStatus();
        }, () => {
            this.router.navigate(['/']);
        });
    }
}
