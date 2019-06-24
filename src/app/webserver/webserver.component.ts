import { Component, Inject, OnInit, OnDestroy, Input, AfterViewInit, ViewChild, forwardRef } from '@angular/core';
import { HttpClient } from '../common/http-client';
import { WebServer } from './webserver';
import { WebServerService } from './webserver.service';
import { WebSitesModuleName, CertificatesModuleName, FileSystemModuleName, AppPoolsModuleName, WebServerModuleName, WebServerModuleIcon } from '../main/settings';
import { CertificatesServiceURL } from 'certificates/certificates.service';
import { UnexpectedServerStatusError } from 'error/api-error';
import { NotificationService } from 'notification/notification.service';
import { Runtime } from 'runtime/runtime';
import { LoggerFactory, Logger, LogLevel } from 'diagnostics/logger';
import { GlobalModuleReference, HomeCategory, BreadcrumbsResolver, FeatureContext, FeatureVTabsComponent } from 'common/feature-vtabs.component';
import { Subscription } from 'rxjs';
import { Breadcrumb, BreadcrumbsRoot } from 'header/breadcrumb';
import { Item } from 'common/vtabs.component';
import { Status } from 'common/status';

export class WebServerCrumbsResolver implements BreadcrumbsResolver {
    resolve(_: FeatureContext): Breadcrumb[] {
        return BreadcrumbsRoot;
    }
}

@Component({
    template: `
        <div *ngIf="notInstalled" class="not-installed">
            <p>
                Web Server (IIS) is not installed on the machine
                <br/>
                <a href="https://docs.microsoft.com/en-us/iis/install/installing-iis-85/installing-iis-85-on-windows-server-2012-r2" >Learn more</a>
            </p>
        </div>
        <loading *ngIf="!webServer && !failure"></loading>
        <span *ngIf="failure" class="color-error">{{failure}}</span>
        <webserver-view *ngIf="webServer" [webServer]="webServer"></webserver-view>
    `,
    styles: [ `
.not-installed {
    text-align: center;
    margin-top: 50px;
}
`],
})
export class WebServerComponent implements OnInit {
    webServer: WebServer;
    failure: string;

    constructor(
        private notifications: NotificationService,
        @Inject('Runtime') private runtime: Runtime,
        @Inject('WebServerService') private service: WebServerService,
    ){}

    ngOnInit() {
        this.server.then(ws => {
            this.webServer = ws;
        });
    }

    get notInstalled() {
        return this.service.installStatus == Status.Stopped;
    }

    get server(): Promise<WebServer> {
        return new Promise<WebServer>((resolve, reject) => {
            this.service.server.catch(e => {
                if (e instanceof UnexpectedServerStatusError) {
                    this.notifications.confirm(
                        `Start Microsoft IIS Administration API`,
                        `Microsoft IIS Administration API is currently ${e.Status}. Do you want to start the service?`).then(confirmed => {
                        if (confirmed) {
                            this.runtime.StartIISAdministration().subscribe(
                                _ => {
                                    this.service.server.catch(ex => {
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
                    reject(this.failure = `Unknown error has occurred when trying to initialize Web Server Module: ${JSON.stringify(e)}`)
                }
                throw e
            }).then(ws => {
                resolve(ws)
            })
        })
    }
}

const subComponentList: string[] = [
    Item.Join(HomeCategory, WebSitesModuleName),
    Item.Join(HomeCategory, AppPoolsModuleName),
]

@Component({
    selector: 'webserver-view',
    template: `
<feature-vtabs
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
})
export class WebServerViewComponent implements OnDestroy, AfterViewInit {
    @Input() webServer: WebServer;

    logger: Logger;
    staticModules: GlobalModuleReference[] = [
        <GlobalModuleReference> {
            name: CertificatesModuleName,
            initialize: this.httpClient.head(CertificatesServiceURL, null, false)
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
    breadcrumbsResolver: BreadcrumbsResolver = new WebServerCrumbsResolver();
    subscriptions: Subscription[] = [];
    @ViewChild(forwardRef(() => FeatureVTabsComponent)) features: FeatureVTabsComponent;

    constructor(
        private httpClient: HttpClient,
        factory: LoggerFactory,
    ){
        this.logger = factory.Create(this);
    }

    ngOnDestroy() {
        for (let sub of this.subscriptions) {
            sub.unsubscribe();
        }
    }

    ngAfterViewInit(){
        this.subscriptions.push(
            this.features.vtabs.onSelectItem.subscribe(
                v => this.features.vtabs.showCategory(
                    WebServerModuleName,
                    !subComponentList.includes(v.fullName),
                ),
            ))
    }
}
