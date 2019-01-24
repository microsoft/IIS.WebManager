import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { DiffUtil } from '../../utils/diff';
import { AnonymousAuthentication } from './authentication'
import { AuthenticationService } from './authentication.service';

@Component({
    selector: 'anon-auth',
    template: `
        <error [error]="service.anonymousError"></error>
        <div *ngIf="_model">
            <override-mode class="pull-right" [metadata]="_model.metadata" (revert)="onRevert()" (modelChanged)="onModelChanged()"></override-mode>
            <fieldset>
                <label *ngIf="!_model.scope">Web Site Default</label>
                <switch class="block" [disabled]="_locked" [(model)]="_model.enabled" (modelChanged)="onModelChanged()">{{_model.enabled ? "On" : "Off"}}</switch>
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
export class AnonymousAuthenticationComponent implements OnDestroy {
    private _model: AnonymousAuthentication;
    private _locked: boolean;
    private _original: AnonymousAuthentication;
    private _subscriptions: Array<Subscription> = [];

    constructor(private _service: AuthenticationService) {
        this._subscriptions.push(this._service.anonAuth.subscribe(auth => {
            this.setFeature(auth);
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
