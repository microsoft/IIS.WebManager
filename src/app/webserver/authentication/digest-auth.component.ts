import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DiffUtil } from '../../utils/diff';
import { Status } from '../../common/status';
import { DigestAuthentication } from './authentication'
import { AuthenticationService } from './authentication.service';
import { NotificationService } from '../../notification/notification.service';

@Component({
    selector: 'digest-auth',
    template: `
        <div *ngIf="!_model && !_error"><i aria-hidden="true" class="sme-icon sme-icon-refresh sme-spin"></i><span>loading...</span></div>
        <switch label="Enable"
                *ngIf="service.webserverScope && service.digestStatus != 'unknown'"
                class="install" #s
                [auto]="false"
                [model]="service.digestStatus == 'started' || service.digestStatus == 'starting'"
                [disabled]="service.digestStatus == 'starting' || service.digestStatus == 'stopping'"
                (modelChanged)="install(!s.model)">
                    <span *ngIf="!isPending()">{{s.model ? "On" : "Off"}}</span>
                    <span *ngIf="isPending()" class="loading"></span>
        </switch>
        <span *ngIf="service.digestStatus == 'stopped' && !service.webserverScope">Digest Authentication is off. <a [routerLink]="['/webserver/authentication']">Click here to turn this feature on.</a></span>
        <override-mode class="pull-right" *ngIf="_model" [scope]="_model.scope" [metadata]="_model.metadata" (revert)="onRevert()" (modelChanged)="onModelChanged()"></override-mode>
        <div *ngIf="_model">
            <fieldset>
                <switch [label]="_model.scope ? 'Enable' : 'Web Site Default'" class="block" [disabled]="_locked" [(model)]="_model.enabled" (modelChanged)="onModelChanged()">{{_model.enabled ? "On" : "Off"}}</switch>
            </fieldset>
            <fieldset class="clear" *ngIf="_model.enabled || !_model.scope">
                <label>Realm</label>
                <input class="form-control path" type="text" [disabled]="_locked" [(ngModel)]="_model.realm" throttle (modelChanged)="onModelChanged()" />
            </fieldset>
        </div>
    `
})
export class DigestAuthenticationComponent implements OnDestroy, OnInit {
    private _model: DigestAuthentication;
    private _error: any;
    private _locked: boolean;
    private _original: DigestAuthentication;
    private _subscriptions: Array<Subscription> = [];

    constructor(
        private _service: AuthenticationService,
        private _notificationService: NotificationService,
    ) {
    }

    public ngOnInit() {
        this._subscriptions.push(this._service.digestAuth.subscribe(
            auth => this.setFeature(auth),
            e => {
                this._error = e;
                this._notificationService.apiError(e);
            },
        ));
    }

    public ngOnDestroy() {
        this._subscriptions.forEach(sub => sub.unsubscribe());
    }

    get service() {
        return this._service;
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

    private setFeature(feature: DigestAuthentication) {
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
        return this._service.digestStatus == Status.Starting
            || this._service.digestStatus == Status.Stopping;
    }

    private install(val) {
        if (val) {
            this._service.installDigest(true);
        }
        else {
            this._notificationService.confirm("Turn Off Digest Authentication", 'This will turn off "Digest Authentication" for the entire web server.')
                .then(confirmed => {
                    if (confirmed) {
                        this._service.installDigest(false);
                    }
                });
        }
    }
}
