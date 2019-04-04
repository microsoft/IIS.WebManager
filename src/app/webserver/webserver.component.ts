import { Component, Inject } from '@angular/core';
import { ModuleUtil } from '../utils/module';
import { OptionsService } from '../main/options.service';
import { HttpClient } from '../common/http-client';
import { WebServer } from './webserver';
import { WebServerService } from './webserver.service';
import { ComponentReference, FilesComponentName } from '../main/settings';
import { environment } from '../environments/environment'
import { CertificatesServiceURL } from 'certificates/certificates.service';
import { UnexpectedServerStatusError } from 'error/api-error';
import { NotificationService } from 'notification/notification.service';
import { Runtime } from 'runtime/runtime';
import { BreadcrumbsService } from 'header/breadcrumbs.service';
import { BreadcrumbsRoot, WebServerCrumb } from 'header/breadcrumb';

const sidebarStyles = `
:host >>> .sidebar > vtabs .vtabs > .items {
    top: ` + (environment.WAC ? 0 : 35) + `px;
}

:host >>> .sidebar > vtabs .vtabs > .content {
    top: 96px;
}

.not-installed {
    text-align: center;
    margin-top: 50px;
}
`

@Component({
    template: `
        <div *ngIf="service.installStatus == 'stopped'" class="not-installed">
            <p>
                Web Server (IIS) is not installed on the machine
                <br/>
                <a href="https://docs.microsoft.com/en-us/iis/install/installing-iis-85/installing-iis-85-on-windows-server-2012-r2" >Learn more</a>
            </p>
        </div>
        <loading *ngIf="!webServer && !failure"></loading>
        <span *ngIf="failure" class="color-error">{{failure}}</span>
        <div *ngIf="webServer">
            <webserver-header [model]="webServer" class="crumb-content" [class.sidebar-nav-content]="_options.active"></webserver-header>
            <div class="sidebar crumb" [class.nav]="_options.active">
                <vtabs *ngIf="webServer" [markLocation]="true" (activate)="_options.refresh()" [defaultTab]="'Web Sites'">
                    <item [name]="'Web Server'" [ico]="'fa fa-wrench'">
                        <webserver-general [model]="webServer"></webserver-general>
                    </item>
                    <item *ngFor="let module of modules" [name]="module.name" [ico]="module.ico">
                        <dynamic [name]="module.component_name" [module]="module" [data]="module.data"></dynamic>
                    </item>
                </vtabs>
            </div>
        </div>
    `,
    styles: [ sidebarStyles ]
})
export class WebServerComponent {
    webServer: WebServer;
    modules: Array<any> = [];
    failure: string;

    constructor(
        @Inject('WebServerService') private _service: WebServerService,
        @Inject('Runtime') private _runtime: Runtime,
        private _crumbs: BreadcrumbsService,
        private _http: HttpClient,
        private _options: OptionsService,
        private _notifications: NotificationService,
    ) {}

    ngOnInit() {
        this.server.then(ws => {
            this.webServer = ws;
            ModuleUtil.initModules(this.modules, this.webServer, "webserver");
            ModuleUtil.addModule(this.modules, "Certificates");

            // Insert files global module after application pools
            let index = this.modules.findIndex(m => m.name.toLocaleLowerCase() == "application pools") + 1;
            this.modules.splice(index, 0, new ComponentReference("Files", "fa fa-files-o", FilesComponentName, "files", "/api/files/{id}"));
            this._http.head(CertificatesServiceURL, null, false)
                .catch(_ => {
                    this.modules = this.modules.filter(m => m.name.toLocaleLowerCase() !== 'certificates')
                });
            this._crumbs.load(BreadcrumbsRoot.concat(WebServerCrumb));
        });
    }

    get service() {
        return this._service;
    }

    get server(): Promise<WebServer> {
        return new Promise<WebServer>((resolve, reject) => {
            this._service.server.catch(e => {
                if (e instanceof UnexpectedServerStatusError) {
                    this._notifications.confirm(
                        `Start Microsoft IIS Administration API`,
                        `Microsoft IIS Administration API is currently ${e.Status}. Do you want to start the service?`).then(confirmed => {
                        if (confirmed) {
                            this._runtime.StartIISAdministration().subscribe(
                                _ => {
                                    this._service.server.catch(ex => {
                                        reject(this.failure = `Unable to start Microsoft IIS Administration API Service, error ${ex}`)
                                        throw ex
                                    }).then(s => {
                                        resolve(s)
                                    })
                                },
                                _ => {
                                    reject(this.failure = `Unable to start Microsoft IIS Administration API Service, error: ${e}`)
                                },
                            )
                        } else {
                            reject(this.failure = `Web Server Module cannot be initialized. Current Microsoft IIS Administration API Service status: ${e.Status}`)
                        }
                    })
                } else {
                    reject(this.failure = `Unknown error has occurred when trying to initialize Web Server Module: ${e}`)
                }
                throw e
            }).then(ws => {
                resolve(ws)
            })
        })
    }
}
