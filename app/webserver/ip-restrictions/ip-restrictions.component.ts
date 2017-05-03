import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { DiffUtil } from '../../utils/diff';
import { Status } from '../../common/status';
import { IpRestrictionsService } from './ip-restrictions.service';
import { IpRestrictions, RestrictionRule } from './ip-restrictions';
import { NotificationService } from '../../notification/notification.service';

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
        <span *ngIf="_service.status == 'stopped' && !_service.webserverScope">IP Restrictions are off. Turn them on <a [routerLink]="['/webserver/ip-restrictions']">here</a></span>
        <override-mode class="pull-right" *ngIf="ipRestrictions" [scope]="ipRestrictions.scope" [metadata]="ipRestrictions.metadata" (revert)="onRevert()" (modelChanged)="onModelChanged()"></override-mode>
        <div *ngIf="ipRestrictions" [attr.disabled]="_locked || null">
            <fieldset>
                <label *ngIf="!ipRestrictions.scope">Web Site Default</label>
                <switch class="block" [(model)]="enabled" (modelChanged)="onEnabledChanged()">{{enabled ? "On" : "Off"}}</switch>
            </fieldset>
            <div *ngIf="enabled">
                <tabs>
                    <tab [name]="'General'">
                            <ip-addresses [model]="ipRestrictions" (modelChanged)="onModelChanged()"></ip-addresses>
                            <dynamic-restrictions [model]="ipRestrictions" (modelChange)="onModelChanged()"></dynamic-restrictions>
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

        .install {
            display: inline-block;
            margin-bottom: 15px;
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
    enabled: boolean;

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

    public ngOnDestroy() {
        this._subscriptions.forEach(sub => sub.unsubscribe());
    }

    onEnabledChanged() {
        if (!this.enabled) {
            this.ipRestrictions.enabled = false;
            if (!confirm("CAUTION: All rules will be deleted when IP Restrictions is turned off.")) {
                setTimeout(() => this.enabled = true, 1); // Restore
                this.ipRestrictions.enabled = true;
            }
            else {
                this.onModelChanged();
            }
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

            this.enabled = feature.enabled;
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
