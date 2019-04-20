import { Component, Inject, OnInit, AfterViewInit, ContentChild, ViewChild } from '@angular/core';
import { OptionsService } from '../main/options.service';
import { HttpClient } from '../common/http-client';
import { WebServer } from './webserver';
import { WebServerService } from './webserver.service';
import { WebSitesModuleName, CertificatesModuleName } from '../main/settings';
import { CertificatesServiceURL } from 'certificates/certificates.service';
import { UnexpectedServerStatusError } from 'error/api-error';
import { NotificationService } from 'notification/notification.service';
import { Runtime } from 'runtime/runtime';
import { BreadcrumbsService } from 'header/breadcrumbs.service';
import { BreadcrumbsRoot, WebServerCrumb } from 'header/breadcrumb';
import { LoggerFactory, Logger, LogLevel } from 'diagnostics/logger';
import { VTabsComponent } from 'common/vtabs.component';

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
            <feature-vtabs [model]="webServer" [resource]="'webserver'" [default]="defaultTab" [subcategory]="'Web Server'" [include]="['${CertificatesModuleName}']">
                <webserver-general class="general-tab" [model]="webServer"></webserver-general>
            </feature-vtabs>
        </div>
    `,
    styles: [ `
.not-installed {
    text-align: center;
    margin-top: 50px;
}
`],
})
export class WebServerComponent implements OnInit, AfterViewInit {
    logger: Logger;
    webServer: WebServer;
    failure: string;
    defaultTab: string = WebSitesModuleName;
    @ViewChild(VTabsComponent)
    tabs: VTabsComponent;

    constructor(
        @Inject('WebServerService') private _service: WebServerService,
        @Inject('Runtime') private _runtime: Runtime,
        private _crumbs: BreadcrumbsService,
        private _http: HttpClient,
        private _options: OptionsService,
        private _notifications: NotificationService,
        private factory: LoggerFactory,
    ) {
        this.logger = factory.Create(this);
    }

    ngOnInit() {
        this.server.then(ws => {
            this.webServer = ws;
            this._crumbs.load(BreadcrumbsRoot.concat(WebServerCrumb));
        });
    }
    
    ngAfterViewInit(): void {
        this._http.head(CertificatesServiceURL, null, false).then(_ => {
            throw "test!"
        }).catch(e => {
            debugger
            this.logger.log(LogLevel.WARN,
`Error pinging ${CertificatesServiceURL}:
${e}
Hiding ${CertificatesModuleName} tab`);
        })
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
