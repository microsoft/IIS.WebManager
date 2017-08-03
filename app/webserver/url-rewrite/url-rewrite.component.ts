import { Component, OnInit } from '@angular/core';

import { Status } from '../../common/status';
import { NotificationService } from '../../notification/notification.service';
import { UrlRewriteService } from './service/url-rewrite.service';

@Component({
    template: `
        <loading *ngIf="_service.status == 'unknown' && !_service.error"></loading>
        <error [error]="_service.error"></error>
        <switch class="install" *ngIf="_service.webserverScope && _service.status != 'unknown'" #s
                [auto]="false"
                [model]="_service.status == 'started' || _service.status == 'starting'" 
                [disabled]="_service.status == 'starting' || _service.status == 'stopping'"
                (modelChanged)="install(!s.model)">
                    <span *ngIf="!isPending()">{{s.model ? "On" : "Off"}}</span>
                    <span *ngIf="isPending()" class="loading"></span>
        </switch>
        <span *ngIf="_service.status == 'stopped' && !_service.webserverScope">URL Rewrite is not installed. Install it <a [routerLink]="['/webserver/url-rewrite']">here</a></span>
        <div *ngIf="_service.status == 'started'">
            <tabs>
                <tab [name]="'Inbound Rules'">
                    <inbound-rules></inbound-rules>
                </tab>
                <tab [name]="'Outbound Rules'">
                    <outbound-rules></outbound-rules>
                </tab>
                <tab [name]="'Server Variables'">
                    <server-variables></server-variables>
                </tab>
                <tab [name]="'Rewrite Maps'">
                    <rewrite-maps></rewrite-maps>
                </tab>
                <tab [name]="'Providers'">
                    <providers></providers>
                </tab>
            </tabs>
        </div>
    `,
    styles: [`
        .install {
            margin-bottom: 45px;
        }
    `]
})
export class UrlRewriteComponent implements OnInit {
    public id: string;

    constructor(private _service: UrlRewriteService,
        private _notificationService: NotificationService) {
    }

    public ngOnInit() {
        this._service.initialize(this.id);
    }

    private isPending(): boolean {
        return this._service.status == Status.Starting
            || this._service.status == Status.Stopping;
    }

    public install(val: boolean) {
        if (val) {
            return this._service.install();
        }
        else {
            this._notificationService.confirm("Uninstall URL Rewrite", 'This will uninstall "URL Rewrite" for the entire web server.')
                .then(confirmed => {
                    if (confirmed) {
                        this._service.uninstall();
                    }
                });
        }
    }
}
