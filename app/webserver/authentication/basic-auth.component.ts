import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { DiffUtil } from '../../utils/diff';
import { Status } from '../../common/status';
import { BasicAuthentication } from './authentication'
import { AuthenticationService } from './authentication.service';
import { NotificationService } from '../../notification/notification.service';

@Component({
    selector: 'basic-auth',
    template: `
        <error [error]="_service.basicError"></error>
        <switch class="install" *ngIf="_service.webserverScope && _service.basicStatus != 'unknown'" #s
                [auto]="false"
                [model]="_service.basicStatus == 'started' || _service.basicStatus == 'starting'" 
                [disabled]="_service.basicStatus == 'starting' || _service.basicStatus == 'stopping'"
                (modelChanged)="install(!s.model)">
                    <span *ngIf="!isPending()">{{s.model ? "On" : "Off"}}</span>
                    <span *ngIf="isPending()" class="loading"></span>
        </switch>
        <span *ngIf="_service.basicStatus == 'stopped' && !_service.webserverScope">Basic Authentication is off. Turn it on <a [routerLink]="['/webserver/authentication']">here</a></span>
        <override-mode class="pull-right" *ngIf="_model" [scope]="_model.scope" [metadata]="_model.metadata" (revert)="onRevert()" (modelChanged)="onModelChanged()"></override-mode>
        <div *ngIf="_model">
            <fieldset>
                <label *ngIf="!_model.scope">Default Behavior</label>
                <switch class="block" [disabled]="_locked" [(model)]="_model.enabled" (modelChanged)="onModelChanged()">{{_model.enabled ? "On" : "Off"}}</switch>
            </fieldset>
            <div class="clear" *ngIf="_model.enabled">
                <fieldset>
                    <label>Default Logon Domain</label>
                    <input class="form-control path" type="text" [disabled]="_locked" [(ngModel)]="_model.default_logon_domain" throttle (modelChanged)="onModelChanged()" />
                </fieldset>
                <fieldset>
                    <label>Realm</label>
                    <input class="form-control path" type="text" [disabled]="_locked" [(ngModel)]="_model.realm" throttle (modelChanged)="onModelChanged()" />
                </fieldset>
            </div>
        </div>
    `,
    styles: [`
        .clear {
            clear: both;
        }

        .install {
            display: inline-block;
            margin-bottom: 15px;
        }
    `]
})
export class BasicAuthenticationComponent implements OnDestroy {
    private _model: BasicAuthentication;
    private _locked: boolean;
    private _original: BasicAuthentication;
    private _subscriptions: Array<Subscription> = [];

    constructor(private _service: AuthenticationService,
                private _notificationService: NotificationService) {
        this._subscriptions.push(this._service.basicAuth.subscribe(auth => {
            this.setFeature(auth);
        }));
    }

    public ngOnDestroy() {
        this._subscriptions.forEach(sub => sub.unsubscribe());
    }

    private onModelChanged() {
        if (this._model.metadata.is_locked) {
            this.resetModel();
        }

        var changes = DiffUtil.diff(this._original, this._model);

        if (Object.keys(changes).length > 0) {
            this._service.update(this._model, changes);
        }
    }

    private onRevert() {
        this._service.revert(this._model);
    }

    private setFeature(feature: BasicAuthentication) {
        if (feature) {
            this._locked = feature.metadata.is_locked ? true : null;
        }

        this._model = feature;
        this._original = JSON.parse(JSON.stringify(feature));
    }

    private resetModel() {
        for (var k in this._original) {
            this._model[k] = JSON.parse(JSON.stringify(this._original[k] || null));
        }
    }

    private isPending(): boolean {
        return this._service.basicStatus == Status.Starting
            || this._service.basicStatus == Status.Stopping;
    }

    private install(val) {
        if (val) {
            this._service.installBasic(true);
        }
        else {
            this._notificationService.confirm("Turn Off Basic Authentication", 'This will turn off "Basic Authentication" for the entire web server.')
                .then(confirmed => {
                    if (confirmed) {
                        this._service.installBasic(false);
                    }
                });
        }
    }
}
