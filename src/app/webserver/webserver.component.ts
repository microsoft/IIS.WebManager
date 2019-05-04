import { Component, Inject, OnInit } from '@angular/core';
import { HttpClient } from '../common/http-client';
import { WebServer } from './webserver';
import { WebServerService } from './webserver.service';
import { WebSitesModuleName, CertificatesModuleName, FileSystemModuleName, AppPoolsModuleName, WebServerModuleName, WebServerModuleIcon } from '../main/settings';
import { CertificatesServiceURL } from 'certificates/certificates.service';
import { UnexpectedServerStatusError } from 'error/api-error';
import { NotificationService } from 'notification/notification.service';
import { Runtime } from 'runtime/runtime';
import { LoggerFactory, Logger, LogLevel } from 'diagnostics/logger';
import { GlobalModuleReference, HomeCategory, BreadcrumbsResolver, FeatureContext } from 'common/feature-vtabs.component';
import { Subscription } from 'rxjs';
import { BreadcrumbsRoot, Breadcrumb } from 'header/breadcrumb';

export class WebServerBrumbsResolver implements BreadcrumbsResolver {
    constructor(
        private crumbs: Breadcrumb[],
    ) {}

    resolve(_: FeatureContext): Breadcrumb[] {
        return this.crumbs;
    }
}

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
        <feature-vtabs *ngIf="webServer"
            [model]="webServer"
            [resource]="'webserver'"
            [generalTabName]="'${WebServerModuleName}'"
            [generalTabIcon]="'${WebServerModuleIcon}'"
            [generalTabCategory]="'${HomeCategory}'"
            [default]="'${WebSitesModuleName}'"
            [subcategory]="'${WebServerModuleName}'"
            [includeModules]="staticModules"
            [promoteToContext]="promoteToContext"
            [breadcrumbsResolver]="breadcrumbsResolver">
            <webserver-general class="general-tab" [model]="webServer"></webserver-general>
        </feature-vtabs>
    `,
    styles: [ `
.not-installed {
    text-align: center;
    margin-top: 50px;
}
`],
})
export class WebServerComponent implements OnInit {
    logger: Logger;
    staticModules: GlobalModuleReference[] = [
        <GlobalModuleReference> {
            name: CertificatesModuleName,
            initialize: this._http.head(CertificatesServiceURL, null, false)
                        .then(_ => true)
                        .catch(e => {
                            this.logger.log(LogLevel.ERROR, `Error pinging ${CertificatesServiceURL}, ${CertificatesModuleName} tab will be disabled:\n${e}`);
                            return false;
                        })},
        <GlobalModuleReference> {
            name: FileSystemModuleName,
        },
    ];
    promoteToContext: string[] = [
        WebServerModuleName,
        AppPoolsModuleName,
        WebSitesModuleName,
    ]
    breadcrumbsResolver: BreadcrumbsResolver = new WebServerBrumbsResolver(BreadcrumbsRoot);
    tabsSubscription: Subscription;
    webServer: WebServer;
    failure: string;

    constructor(
        private _http: HttpClient,
        private _notifications: NotificationService,
        @Inject('WebServerService') private _service: WebServerService,
        @Inject('Runtime') private _runtime: Runtime,
        private factory: LoggerFactory,
    ){
        this.logger = factory.Create(this);
    }

    ngOnInit() {
        this.server.then(ws => {
            this.webServer = ws;
        });
    }

    ngOnDestroy() {
        if (this.tabsSubscription) {
            this.tabsSubscription.unsubscribe();
        }
    }

    get service() {
        return this._service;
    }

    get server(): Promise<WebServer> {
        var outer = this;
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
