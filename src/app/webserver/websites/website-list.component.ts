import { Component, OnInit, Input, Inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { WebSite } from './site';
import { WebSitesService } from './websites.service';
import { ApplicationPool } from '../app-pools/app-pool';
import { Perspective } from './website-list';

@Component({
    selector: 'website-list-component',
    template: `
        <loading *ngIf="!_sites && !lazy && !service.error"></loading>
        <div *ngIf="service.installStatus == 'stopped'" class="not-installed">
            <p>
                Web Server (IIS) is not installed on the machine
                <br/>
                <a href="https://docs.microsoft.com/en-us/iis/install/installing-iis-85/installing-iis-85-on-windows-server-2012-r2" >Learn more</a>
            </p>
        </div>
        <website-list *ngIf="_sites" [model]="_sites" [perspective]="perspective"></website-list>
    `,
    styles: [`
        br {
            margin-top: 30px;
        }

        .not-installed {
            text-align: center;
            margin-top: 50px;
        }
    `]
})
export class WebSiteListComponent implements OnInit {
    @Input() appPool: ApplicationPool;
    @Input() lazy: boolean;

    private _sites: Array<WebSite>;
    private _subs: Array<Subscription> = [];

    constructor(
        @Inject("WebSitesService") private service: WebSitesService,
    ) {}

    ngOnInit() {
        if (!this.lazy) {
            this.activate();
        }
    }

    get perspective(): Perspective {
        return this.appPool ? Perspective.AppPool : Perspective.WebServer;
    }

    ngOnDestroy() {
        this._subs.forEach(s => s.unsubscribe());
    }

    activate() {
        this.lazy = false;

        if (this._sites) {
            return;
        }

        // TODO: fix - If subscribe is called for every activate, how many subscribes are there?
        // Same for AppPoolList, WebAppList VDirList
        if (this.appPool) {
            this.service.getByAppPool(this.appPool).then(_ => {
                this._subs.push(this.service.webSites.subscribe(sites => {
                    this._sites = [];
                    sites.forEach(s => {
                        if (s.application_pool && s.application_pool.id == this.appPool.id) {
                            this._sites.push(s);
                        }
                    });
                }));
            });
        }
        else {
            this.service.getAll().then(_ => {
                this._subs.push(this.service.webSites.subscribe(sites => {
                    this._sites = [];
                    sites.forEach(s => this._sites.push(s));
                }));
            });
        }
    }
}
