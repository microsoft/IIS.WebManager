import { Component, Input, Output, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { DiffUtil } from '../../utils/diff';
import { WindowsAuthentication } from './authentication'
import { AuthenticationService } from './authentication.service';

@Component({
    selector: 'win-auth',
    template: `
        <error [error]="_service.windowsError" [notInstalled]="true"></error>
        <override-mode class="pull-right" *ngIf="_model" [scope]="_model.scope" [metadata]="_model.metadata" (revert)="onRevert()" (modelChanged)="onModelChanged()"></override-mode>
        <div *ngIf="_model">
            <fieldset>
                <switch class="block" [disabled]="_locked" [(model)]="_model.enabled" (modelChanged)="onModelChanged()">{{_model.enabled ? "On" : "Off"}}</switch>
            </fieldset>
            <div class="clear" *ngIf="_model.enabled || !_model.scope">
                <fieldset>
                    <label>Use Kernel Mode</label>
                    <switch class="block" [disabled]="_locked" [(model)]="_model.use_kernel_mode" (modelChanged)="onModelChanged()">{{_model.use_kernel_mode ? "On" : "Off"}}</switch>
                </fieldset>
                <ul>
                    <li *ngFor="let provider of _model.providers; let i = index;">
                        <checkbox2 [disabled]="_locked" [(model)]="provider.enabled" (modelChanged)="onModelChanged()">{{provider.name}}</checkbox2>
                    </li>
                </ul>
            </div>
        </div>
    `,
    styles: [`
        fieldset:first-of-type {
            padding-top: 0;
        }
    `]
})
export class WindowsAuthenticationComponent implements OnDestroy {
    private _model: WindowsAuthentication;
    private _locked: boolean;
    private _original: WindowsAuthentication;
    private _subscriptions: Array<Subscription> = [];

    constructor(private _service: AuthenticationService) {
        this._subscriptions.push(this._service.windowsAuth.subscribe(auth => {
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

    private setFeature(feature: WindowsAuthentication) {
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
}
