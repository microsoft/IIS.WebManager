
import { Component, OnInit, Input, Inject } from '@angular/core';
import { WebApp } from './webapp'
import { WebAppsService } from './webapps.service';
import { WebSite } from '../websites/site';
import { ApplicationPool } from '../app-pools/app-pool';

@Component({
    template: `
<p *ngIf="!_webapps">Loading...</p>
<webapp-list *ngIf="_webapps" [model]="_webapps" [appPool]="appPool" [website]="website"></webapp-list>
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

    constructor(
        @Inject("WebAppsService") private _service: WebAppsService,
    ) {}

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
}
