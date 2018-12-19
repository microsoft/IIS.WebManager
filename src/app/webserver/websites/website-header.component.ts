import { Component, Input, Inject, ViewChild } from '@angular/core';
import { RouterLink, Router } from '@angular/router';

import { NotificationService } from '../../notification/notification.service';
import { Selector } from '../../common/selector';
import { WebSitesService } from './websites.service';
import { WebSite } from './site';


@Component({
    selector: 'website-header',
    template: `
        <div class="feature-header" *ngIf="site">
            <div class="actions">
                <div class="selector-wrapper">
                    <button title="Actions" (click)="_selector.toggle()" [class.background-active]="(_selector && _selector.opened) || false"><i class="fa fa-caret-down"></i></button>
                    <selector [right]="true">
                        <ul>
                            <li><a class="bttn link" title="Browse" [attr.title]="url" [attr.href]="url" target="_blank">Browse</a></li>
                            <li><button class="start" title="Start" [attr.disabled]="site.status == 'started' ? true : null" (click)="onStart()">Start</button></li>
                            <li><button class="stop" title="Stop" [attr.disabled]="site.status == 'stopped' ? true : null" (click)="onStop()">Stop</button></li>
                            <li><button class="delete" title="Delete" (click)="onDelete()">Delete</button></li>
                        </ul>
                    </selector>
                </div>
            </div>
            
            <div class="feature-title sme-focus-zone">
                <h1 [ngClass]="site.status">{{site.name}}</h1>
                <span class="status" *ngIf="site.status == 'stopped'">{{site.status}}</span>
            </div>
        </div>
    `,
    styles: [`
        .selector-wrapper {
            position: relative;
        }

        .feature-title h1:before {
            content: "\\f0ac";
        }

        .status {
            display: block;
            text-align: right;
        }
    `]
})
export class WebSiteHeaderComponent {
    @Input() site: WebSite;
    @ViewChild(Selector) private _selector: Selector;

    constructor(@Inject("WebSitesService") private _service: WebSitesService,
        private _router: Router,
        private _notificationService: NotificationService) {
    }

    onStart() {
        this._service.start(this.site);
        this._selector.close();
    }

    onStop() {
        this._service.stop(this.site);
        this._selector.close();
    }

    onDelete() {
        this._notificationService.confirm("Delete Web Site", "Are you sure you would like to delete '" + this.site.name + "'?")
            .then(confirmed => {
                if (confirmed) {
                    this._service.delete(this.site)
                        .then(() => {
                            this._router.navigate(["/webserver/web-sites"]);
                        });
                }
                this._selector.close();
            });
    }

    private get url() {
        if (this.site.bindings.length == 0) {
            return "";
        }

        return this._service.getUrl(this.site.bindings[0]);
    }
}
