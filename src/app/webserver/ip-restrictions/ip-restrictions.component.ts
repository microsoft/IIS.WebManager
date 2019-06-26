import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { DiffUtil } from '../../utils/diff';
import { Status } from '../../common/status';
import { IpRestrictionsService } from './ip-restrictions.service';
import { IpRestrictions } from './ip-restrictions';
import { NotificationService } from '../../notification/notification.service';

@Component({
    template: `
        <loading *ngIf="service.status == 'unknown' && !service.error"></loading>
        <error [error]="service.error"></error>
        <switch label="Enable"
                *ngIf="service.webserverScope && service.status != 'unknown'"
                class="install" #s
                [auto]="false"
                [model]="service.status == 'started' || service.status == 'starting'"
                [disabled]="service.status == 'starting' || service.status == 'stopping'"
                (modelChanged)="install(!s.model)">
                    <span *ngIf="!isPending()">{{s.model ? "On" : "Off"}}</span>
                    <span *ngIf="isPending()" class="loading"></span>
        </switch>
        <span *ngIf="service.status == 'stopped' && !service.webserverScope">IP Restrictions are off. <a [routerLink]="['/webserver/ip-restrictions']">Click here to turn this feature on.</a></span>
        <override-mode class="pull-right" *ngIf="ipRestrictions" [scope]="ipRestrictions.scope" [metadata]="ipRestrictions.metadata" (revert)="onRevert()" (modelChanged)="onModelChanged()"></override-mode>
        <div *ngIf="ipRestrictions" [attr.disabled]="_locked || null">
            <fieldset>
                <switch [label]="ipRestrictions.scope ? 'Enable' : 'Web Site Default'" class="block" [(model)]="enabled" #s [auto]="false" (modelChanged)="onEnabledChanging(!s.model)">{{enabled ? "On" : "Off"}}</switch>
            </fieldset>
            <div *ngIf="enabled || !ipRestrictions.scope">
                <tabs>
                    <tab [name]="'General'">
                            <ip-addresses [model]="ipRestrictions" (modelChanged)="onModelChanged()"></ip-addresses>
                            <dynamic-restrictions *ngIf="ipRestrictions && ipRestrictions.deny_by_request_rate" [model]="ipRestrictions" (modelChange)="onModelChanged()"></dynamic-restrictions>
                    </tab>
                    <tab [name]="'IP/Domain Rules'">
                            <restriction-rules [ipRestrictions]="ipRestrictions" (modelChange)="onModelChanged()"></restriction-rules>
                    </tab>
                </tabs>
            </div>
        </div>
    `,
    styles: [`
        select.path{
            max-width: 400px;
            width: 100%;
        }

        tabs {
            margin-top: 10px;
            display: block;
        }

        fieldset:last-of-type {
            margin-bottom: 30px;
        }
    `]
})
export class IpRestrictionsComponent implements OnInit, OnDestroy {
    id: string;
    ipRestrictions: IpRestrictions;
    enabled: boolean = null;

    private _original: IpRestrictions;
    private _error: any;
    private _locked: boolean;
    private _subscriptions: Array<Subscription> = [];

    constructor(private _service: IpRestrictionsService,
                private _notificationService: NotificationService) {
    }

    ngOnInit() {
        this._subscriptions.push(this._service.ipRestrictions.subscribe(feature => this.setFeature(feature)));
        this._service.initialize(this.id);
    }

    get service() {
        return this._service;
    }

    public ngOnDestroy() {
        this._subscriptions.forEach(sub => sub.unsubscribe());
    }

    onEnabledChanging(val: boolean) {
        if (!val) {
            this._notificationService.confirm("Disable IP Restrictions", "CAUTION: All rules will be deleted when IP Restrictions is turned off.")
                .then(confirmed => {
                    if (confirmed) {
                        this.ipRestrictions.enabled = false;
                        this.enabled = false;
                        this.onModelChanged();
                    }
                    else {
                        setTimeout(() => this.enabled = true, 1); // Restore
                        this.ipRestrictions.enabled = true;
                    }
                })
        }
        else {
            this.enabled = true;
        }
    }

    onModelChanged() {
        let changes = DiffUtil.diff(this._original, this.ipRestrictions);
        if (Object.keys(changes).length > 0) {
            this._service.updateFeature(changes);
        }
    }

    onRevert() {
        this._service.revert();
    }

    private setFeature(feature) {
        if (feature) {
            this._locked = feature.metadata.is_locked ? true : null;

            if (feature.enabled == null) {
                feature.enabled = false;
            }

            if (this.enabled === null || feature.enabled) {
                this.enabled = feature.enabled;
            }
        }

        this.ipRestrictions = feature;
        this._original = JSON.parse(JSON.stringify(feature));
    }

    private resetFeature() {
        this.ipRestrictions.deny_action = "Forbidden";
        this.ipRestrictions.enable_proxy_mode = false;
        this.ipRestrictions.enable_reverse_dns = false;
        this.ipRestrictions.allow_unlisted = true;

        this.ipRestrictions.deny_by_concurrent_requests.enabled = false;
        this.ipRestrictions.deny_by_request_rate.enabled = false;
        this.ipRestrictions.logging_only_mode = false;

        this.onModelChanged();
    }

    private isPending(): boolean {
        return this._service.status == Status.Starting
            || this._service.status == Status.Stopping;
    }

    private install(val: boolean) {
        if (val) {
            return this._service.install();
        }
        else {
            this._notificationService.confirm("Turn Off IP Restrictions", 'This will turn off "IP Restrictions" for the entire web server.')
                .then(confirmed => {
                    if (confirmed) {
                        this._service.uninstall();
                    }
                });
        }
    }
}
