import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Status } from '../../common/status';
import { NotificationService } from '../../notification/notification.service';
import { DiffUtil } from '../../utils/diff';
import { AuthorizationService } from './authorization.service';
import { Authorization } from './authorization'

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
        <span *ngIf="service.status == 'stopped' && !service.webserverScope">Authorization is off. <a [routerLink]="['/webserver/authorization']">Click here to turn this feature on.</a></span>
        <override-mode class="pull-right"
            *ngIf="_authorization"
            [scope]="_authorization.scope"
            [metadata]="_authorization.metadata"
            (revert)="onRevert()"
            (modelChanged)="onModelChanged()"></override-mode>
        <div *ngIf="_authorization">
            <auth-rules></auth-rules>
        </div>
    `,
    styles: [`
.install {
    margin-bottom: 40px;
}
    `]
})
export class AuthorizationComponent implements OnInit, OnDestroy {
    id: string;
    private _authorization: Authorization;
    private _locked: boolean;
    private _original: Authorization;
    private _subscriptions: Array<Subscription> = [];

    constructor(private _service: AuthorizationService,
                private _notificationService: NotificationService) {
    }

    public ngOnInit() {
        this._subscriptions.push(
            this._service.authorization.subscribe(
                settings => {
                    if (settings) {
                        this.setFeature(settings);
                    }
                },
                e => {
                    this._notificationService.apiError(e);
                },
        ));
        this.activate();
    }

    public activate() {
        if (!this._authorization) {
            this._service.initialize(this.id);
        }
    }

    public ngOnDestroy(): void {
        this._subscriptions.forEach(sub => sub.unsubscribe());
    }

    get service() {
        return this._service;
    }

    onModelChanged() {
        let changes = DiffUtil.diff(this._original, this._authorization);
        if (Object.keys(changes).length > 0) {
            this._service.save(changes);
        }
    }

    onRevert() {
        this._service.revert();
    }

    private setFeature(feature: Authorization) {
        this._authorization = feature;

        if (feature) {
            this._original = JSON.parse(JSON.stringify(feature));
            this._locked = this._authorization.metadata.is_locked ? true : null;
        }
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
            this._notificationService.confirm("Turn Off Authorization", 'This will turn off "Authorization" for the entire web server.')
                .then(result => {
                    if (result) {
                        this._service.uninstall();
                    }
                });
        }
    }
}
