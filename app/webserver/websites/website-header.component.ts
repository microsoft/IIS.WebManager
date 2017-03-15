/// <reference path="../../../node_modules/@angular/core/src/core.d.ts" />

import {Component, Input, Inject} from '@angular/core';
import {RouterLink, Router} from '@angular/router';

import {WebSitesService} from './websites.service';
import {WebSite} from './site';


@Component({
    selector: 'website-header',
    styles: [`
        .navigator {
            float: left;
        }

        .feature-title:before {
            content: "\\f0ac";
        }
    `],
    template: `
        <div *ngIf="site">
            <div class="feature-header">
                <div class="subject">
                    <h1 class="feature-title" [ngClass]="site.status"><span>{{site.name}}</span></h1>
                    <span class="status hidden-xs" *ngIf="site.status == 'stopped'">({{site.status}})</span>
                </div>
            </div>
            <div>
                <div class="navigator">
                    <navigator [model]="site.bindings" [left]="true" [small]="true"></navigator>
                </div>
                <div>
                    <button class="no-border" title="Start" [attr.disabled]="site.status == 'started' ? true : null" (click)="onStart()">
                        <i class="fa fa-play green"></i><span class="hidden-xs">Start</span>
                    </button>
                    <button class="no-border" title="Stop" [attr.disabled]="site.status == 'stopped' ? true : null" (click)="onStop()">
                        <i class="fa fa-stop red"></i><span class="hidden-xs">Stop</span>
                    </button>
                    <button class="no-border" title="Delete" (click)="onDelete()">
                        <i class="fa fa-trash-o red large"></i><span class="hidden-xs">Delete</span>
                    </button>
                </div>
            </div>
        </div>
    `
})
export class WebSiteHeaderComponent {
    @Input() site: WebSite;

    constructor(@Inject("WebSitesService") private _service: WebSitesService,
                private _router: Router) {
    }

    onStart() {
        this._service.start(this.site);
    }

    onStop() {
        this._service.stop(this.site);
    }

    onDelete() {
        if (confirm("Are you sure you would like to delete '" + this.site.name + "'?")) {
            this._service.delete(this.site)
                .then(() => {
                    this._router.navigate(["/webserver/web-sites"]);
                });
        }
    }
}