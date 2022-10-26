import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DiffUtil } from '../../utils/diff';
import { AnonymousAuthentication } from './authentication'
import { AuthenticationService } from './authentication.service';
import { NotificationService } from 'notification/notification.service';

@Component({
    selector: 'anon-auth',
    template: `
        <div *ngIf="!_model && !_error" class="processing-large"><i aria-hidden="true" class="sme-icon sme-icon-refresh sme-spin"></i><span>loading...</span></div>
        <div *ngIf="_model">
            <override-mode class="pull-right" [metadata]="_model.metadata" (revert)="onRevert()" (modelChanged)="onModelChanged()"></override-mode>
            <i aria-hidden="true" class="sme-icon sme-icon-refresh sme-spin">Loading...</i>
            <fieldset>
                <switch [label]="_model.scope ? 'Enable': 'Web Site Default'" class="block" [disabled]="_locked" [(model)]="_model.enabled" (modelChanged)="onModelChanged()">{{_model.enabled ? "On" : "Off"}}</switch>
            </fieldset>
            <div class="clear" *ngIf="_model.enabled || !_model.scope">
                <fieldset>
                    <label>User</label>
                    <input class="form-control path" type="text" [disabled]="_locked" [(ngModel)]="_model.user" throttle (modelChanged)="onModelChanged()" />
                </fieldset>
                <fieldset>
                    <label>Password</label>
                    <input class="form-control path" type="text" [disabled]="_locked" [(ngModel)]="_model.password" throttle (modelChanged)="onModelChanged()" />
                </fieldset>
            </div>
        </div>
    `
})
export class AnonymousAuthenticationComponent implements OnInit, OnDestroy {
    private _model: AnonymousAuthentication;
    private _error: any;
    private _locked: boolean;
    private _original: AnonymousAuthentication;
    private _subscriptions: Array<Subscription> = [];

    constructor(
        private _service: AuthenticationService,
        private _notificationService: NotificationService,
    ) {
    }

    public ngOnInit() {
        this._subscriptions.push(this._service.anonAuth.subscribe(
            auth => this.setFeature(auth),
            e => {
                this._error = e;
                this._notificationService.apiError(e);
            }));
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

    private setFeature(feature: AnonymousAuthentication) {
        if (feature) {
            (<any>feature).password = "";
            this._locked = feature.metadata.is_locked ? true : null;
        }

        this._model = feature;
        this._original = JSON.parse(JSON.stringify(feature));
    }

    private resetModel() {
        for (var k in this._original) {
            this._model[k] = JSON.parse(JSON.stringify(this._original[k] || null));
        }
        (<any>this._model).password = "";
    }
}
