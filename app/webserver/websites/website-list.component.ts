/// <reference path="../../../node_modules/@angular/core/src/core.d.ts" />

import {Component, OnInit, Input, Output, EventEmitter, Inject} from '@angular/core';
import {Subscription}   from 'rxjs/Subscription';

import {Status} from '../../common/status';

import {WebSite} from './site';
import {WebSitesService} from './websites.service';

import {ApplicationPool} from '../app-pools/app-pool';


@Component({
    template: `
        <loading *ngIf="!_sites && !lazy"></loading>
        <div *ngIf="!appPool">
            <button [class.background-active]="newWebSite.opened" (click)="newWebSite.toggle()">Create Web Site <i class="fa fa-caret-down"></i></button>
            <selector #newWebSite class="container-fluid">
                <new-website (created)="newWebSite.close()" (cancel)="newWebSite.close()"></new-website>
            </selector>
        </div>
        <br/>
        <website-list *ngIf="_sites" [model]="_sites" [fields]="fields()"></website-list>
    `,
    styles: [`
        br {
            margin-top: 30px;
        }
    `]
})
export class WebSiteListComponent implements OnInit {
    @Input() appPool: ApplicationPool;
    @Input() lazy: boolean;

    private _sites: Array<WebSite>;
    private _subs: Array<Subscription> = [];


    constructor(@Inject("WebSitesService") private _service: WebSitesService) {
    }

    ngOnInit() {
        if (!this.lazy) {
            this.activate();
        }
    }

    ngOnDestroy() {
        this._subs.forEach(s => s.unsubscribe());
    }

    activate() {
        this.lazy = false;

        if (this._sites) {
            return;
        }

        if (this.appPool) {
            this._service.getByAppPool(this.appPool).then(_ => {
                this._subs.push(this._service.webSites.subscribe(sites => {
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
            this._service.getAll().then(_ => {
                this._subs.push(this._service.webSites.subscribe(sites => {
                    this._sites = [];
                    sites.forEach(s => this._sites.push(s));
                }));
            });
        }
    }

    fields(): string {
        if (this.appPool) {
            return "name,path,status";
        }

        return "name,path,status,app-pool";
    }
}