
import {Component, OnInit, Input, Output, EventEmitter, Inject} from '@angular/core';

import {WebApp} from './webapp'
import {WebAppsService} from './webapps.service';
import {WebAppList} from './webapp-list';

import {WebSite} from '../websites/site';
import {WebSitesService} from '../websites/websites.service';
import {ApplicationPool} from '../app-pools/app-pool';



@Component({
    template: `
        <div *ngIf="website">
            <button [class.background-active]="newWebApp.opened" (click)="newWebApp.toggle()">Create Web Application <i class="fa fa-caret-down"></i></button>
            <selector #newWebApp class="container-fluid">
                <new-webapp *ngIf="newWebApp.opened" [website]="website" (created)="newWebApp.close()" (cancel)="newWebApp.close()"></new-webapp>
            </selector>
        </div>
        <br/>
        <p *ngIf="!_webapps">Loading...</p>
        <webapp-list *ngIf="_webapps" [model]="_webapps" [fields]="fields()"></webapp-list>
    `,
    styles: [`
        br {
            margin-top: 30px;
        }
    `]
})
export class WebAppListComponent implements OnInit {
    @Input() appPool: ApplicationPool;
    @Input() website: WebSite;
    @Input() lazy: boolean;

    private _webapps: Array<WebApp>;

    constructor(@Inject("WebAppsService") private _service: WebAppsService) {
    }

    ngOnInit() {
        if (!this.lazy) {
            this.activate();
        }
    }

    activate() {
        if (this._webapps) {
            return;
        }

        if (this.website) {
            //
            // Load by WebSite
            this._service.getBySite(this.website).then(_ => {
                this._service.webApps.subscribe(apps => {
                    this._webapps = [];
                    apps.forEach(a => {
                        if (a.website.id == this.website.id && a.path != '/') {
                            this._webapps.push(a);
                        }
                    });
                });
            });
        }
        else if (this.appPool) {
            //
            // Load by AppPool
            this._service.getByAppPool(this.appPool).then(_ => {
                this._service.webApps.subscribe(apps => {
                    this._webapps = [];
                    apps.forEach(a => {
                        if (a.application_pool && a.application_pool.id == this.appPool.id && a.path != '/') {
                            this._webapps.push(a);
                        }
                    });
                });
            });
        }
        else {
            this._webapps = [];
        }
    }

    private fields(): string {
        let fields: string = "path,site,app-pool";

        if (this.website) {
            fields = "path,app-pool";
        }
        else if (this.appPool) {
            fields = "path,site";
        }

        return fields;
    }
}
