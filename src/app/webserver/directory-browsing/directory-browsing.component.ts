import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { DiffUtil } from '../../utils/diff';
import { Status } from '../../common/status';
import { DirectoryBrowsingService } from './directory-browsing.service';
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
        <span *ngIf= "service.status == 'stopped' && !service.webserverScope">Directory Browsing is off. <a [routerLink]="['/webserver/directory-browsing']">Click here to turn this feature on.</a></span>
        <override-mode class="pull-right" *ngIf="feature" [scope]="feature.scope" [metadata]="feature.metadata" (revert)="onRevert()" (modelChanged)="onModelChanged()"></override-mode>
        <div *ngIf="feature">
            <fieldset>
                <switch [label]="feature.scope ? 'Enable' : 'Web Site Default'" class="block" [disabled]="_locked" [(model)]="feature.enabled" (modelChanged)="onModelChanged()">{{feature.enabled ? "On" : "Off"}}</switch>
            </fieldset>
            <div [hidden]="!feature.enabled && feature.scope">
                <fieldset>
                    <label>Directory Attributes</label>
                    <ul class="allowed-attributes">
                        <li class="checkbox">
                            <checkbox2 [disabled]="_locked" [(model)]="feature.allowed_attributes.date" (modelChanged)="onModelChanged()">Date</checkbox2>
                        </li>
                        <li class="checkbox">
                            <checkbox2 [disabled]="_locked" [(model)]="feature.allowed_attributes.time" (modelChanged)="onModelChanged()">Time</checkbox2>
                        </li>
                        <li class="checkbox">
                            <checkbox2 [disabled]="_locked" [(model)]="feature.allowed_attributes.size" (modelChanged)="onModelChanged()">Size</checkbox2>
                        </li>
                        <li class="checkbox">
                            <checkbox2 [disabled]="_locked" [(model)]="feature.allowed_attributes.extension" (modelChanged)="onModelChanged()">Extension</checkbox2>
                        </li>
                        <li class="checkbox">
                            <checkbox2 [disabled]="_locked" [(model)]="feature.allowed_attributes.long_date" (modelChanged)="onModelChanged()">Long Date</checkbox2>
                        </li>
                    </ul>
                </fieldset>
            </div>
        </div>
    `,
    styles: [`
        .allowed-attributes li {
            padding:10px;
            padding-left: 0px;
            position:relative;
        }
    `]
})
export class DirectoryBrowsingComponent implements OnInit, OnDestroy {
    id: string;
    feature: any;

    private _locked: boolean;
    private _original: any;
    private _error: any;
    private _subscriptions: Array<Subscription> = [];

    constructor(private _service: DirectoryBrowsingService,
                private _notificationService: NotificationService) {
    }

    public ngOnInit() {
        this._subscriptions.push(this._service.directoryBrowsing.subscribe(
            feature => {
                this.setFeature(feature);
            },
            e => {
                this._notificationService.apiError(e);
            },
        ));
        this.activate();
    }

    public activate() {
        if (!this.feature) {
            this._service.init(this.id);
        }
    }

    public ngOnDestroy() {
        this._subscriptions.forEach(sub => sub.unsubscribe());
    }

    get service() {
        return this._service;
    }

    private onModelChanged() {
        var changes = DiffUtil.diff(this._original, this.feature);
        if (Object.keys(changes).length > 0) {
            this._service.update(changes);
        }
    }

    private onRevert() {
        this._service.revert();
    }

    private setFeature(feature) {
        if (feature) {
            this._locked = feature.metadata.is_locked ? true : null;
        }

        this.feature = feature;
        this._original = JSON.parse(JSON.stringify(feature));
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
            this._notificationService.confirm("Turn Off Directory Browsing", 'This will turn off "Directory Browsing" for the entire web server.')
                .then(confirmed => {
                    if (confirmed) {
                        this._service.uninstall();
                    }
                });
        }
    }
}
