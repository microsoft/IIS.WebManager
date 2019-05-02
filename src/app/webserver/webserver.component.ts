import { Component, Inject, OnInit, AfterViewInit, ViewChild, forwardRef, Input } from '@angular/core';
import { OptionsService } from '../main/options.service';
import { HttpClient } from '../common/http-client';
import { WebServer } from './webserver';
import { WebServerService } from './webserver.service';
import { WebSitesModuleName, CertificatesModuleName, FileSystemModuleName, AppPoolsModuleName, WebServerModuleName, WebServerModuleIcon } from '../main/settings';
import { CertificatesServiceURL } from 'certificates/certificates.service';
import { UnexpectedServerStatusError } from 'error/api-error';
import { NotificationService } from 'notification/notification.service';
import { Runtime } from 'runtime/runtime';
import { TitlesService } from 'header/titles.service';
import { BreadcrumbsRoot, Breadcrumb } from 'header/breadcrumb';
import { LoggerFactory, Logger, LogLevel } from 'diagnostics/logger';
import { GlobalModuleReference, HomeCategory, FeatureVTabsComponent } from 'common/feature-vtabs.component';
import { Subscription } from 'rxjs';
import { Item } from 'common/vtabs.component';

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
        @Inject('WebServerService') private _service: WebServerService,
        @Inject('Runtime') private _runtime: Runtime,
        private _notifications: NotificationService,
    ){}

    ngOnInit() {
        this.server.then(ws => {
            this.webServer = ws;
        });
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

@Component({
    selector: "webserver-view",
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
    [promoteToContext]="promoteToContext">
    <webserver-header [model]="webServer" class="vtab-header" [class.sidebar-nav-content]="_options.active"></webserver-header>
    <webserver-general class="general-tab" [model]="webServer"></webserver-general>
</feature-vtabs>
`,
})
export class WebServerViewComponent implements AfterViewInit {
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
        FileSystemModuleName,
    ]
    tabsSubscription: Subscription;
    webserverCrumbs: Breadcrumb[] = BreadcrumbsRoot;
    websitesCrumbs = BreadcrumbsRoot.concat(<Breadcrumb>{ label: WebSitesModuleName });
    appPoolsCrumbs = BreadcrumbsRoot.concat(<Breadcrumb>{ label: AppPoolsModuleName });
    private static webSitesPath = Item.Join(HomeCategory, WebSitesModuleName);
    private static appPoolsPath = Item.Join(HomeCategory, AppPoolsModuleName);

    @Input() webServer: WebServer;
    @ViewChild(forwardRef(() => FeatureVTabsComponent)) vtab: FeatureVTabsComponent;

    constructor(
        private _titles: TitlesService,
        private _http: HttpClient,
        private _options: OptionsService,
        private factory: LoggerFactory,
    ) {
        this.logger = factory.Create(this);
    }

    ngAfterViewInit() {
        this.tabsSubscription = this.vtab.vtabs.onSelectItem.subscribe(
            selectedPath => {
                if (selectedPath == WebServerViewComponent.webSitesPath) {
                    this._titles.load(this.websitesCrumbs);
                } else if (selectedPath == WebServerViewComponent.appPoolsPath) {
                    this._titles.load(this.appPoolsCrumbs);
                } else {
                    this._titles.load(this.webserverCrumbs);
                }
            },
            e => {
                this.logger.log(LogLevel.WARN, `Error retrieving tab updates ${e}`);
            },
            () => {
                this.logger.log(LogLevel.INFO, `VTabs completed updating selected tabs`);
            }
        );
    }

    ngOnDestroy() {
        if (this.tabsSubscription) {
            this.tabsSubscription.unsubscribe();
        }
    }
}
