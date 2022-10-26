import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DiffUtil } from '../../utils/diff';
import { Status } from '../../common/status';
import { WindowsAuthentication } from './authentication'
import { AuthenticationService } from './authentication.service';
import { NotificationService } from '../../notification/notification.service';

@Component({
    selector: 'win-auth',
    template: `
        <div *ngIf="!_model && !_error" class="processing-large"><i aria-hidden="true" class="sme-icon sme-icon-refresh sme-spin"></i><span>loading...</span></div>
        <switch label="Enable"
                *ngIf="service.webserverScope && service.windowsStatus != 'unknown'"
                class="install" #s
                [auto]="false"
                [model]="service.windowsStatus == 'started' || service.windowsStatus == 'starting'"
                [disabled]="service.windowsStatus == 'starting' || service.windowsStatus == 'stopping'"
                (modelChanged)="install(!s.model)">
                    <span *ngIf="!isPending()">{{s.model ? "On" : "Off"}}</span>
                    <span *ngIf="isPending()" class="loading"></span>
        </switch>
        <span *ngIf="service.windowsStatus == 'stopped' && !service.webserverScope">Windows Authentication is off. <a [routerLink]="['/webserver/authentication']">Click here to turn this feature on.</a></span>
        <override-mode class="pull-right" *ngIf="_model" [scope]="_model.scope" [metadata]="_model.metadata" (revert)="onRevert()" (modelChanged)="onModelChanged()"></override-mode>
        <div *ngIf="_model">
            <fieldset>
                <switch [label]="_model.scope ? 'Enable' : 'Web Site Default'" class="block" [disabled]="_locked" [(model)]="_model.enabled" (modelChanged)="onModelChanged()">{{_model.enabled ? "On" : "Off"}}</switch>
            </fieldset>
            <div class="clear" *ngIf="_model.enabled || !_model.scope">
                <fieldset>
                    <switch label="Use Kernel Mode" class="block" [disabled]="_locked" [(model)]="_model.use_kernel_mode" (modelChanged)="onModelChanged()">{{_model.use_kernel_mode ? "On" : "Off"}}</switch>
                </fieldset>
                <ul>
                    <li *ngFor="let provider of _model.providers; let i = index;">
                        <checkbox2 [disabled]="_locked" [(model)]="provider.enabled" (modelChanged)="onModelChanged()">{{provider.name}}</checkbox2>
                    </li>
                </ul>
            </div>
        </div>
    `
})
export class WindowsAuthenticationComponent implements OnDestroy, OnInit {
    private _model: WindowsAuthentication;
    private _error: any;
    private _locked: boolean;
    private _original: WindowsAuthentication;
    private _subscriptions: Array<Subscription> = [];

    constructor(
        private _service: AuthenticationService,
        private _notificationService: NotificationService) {
    }

    public ngOnInit() {
        this._subscriptions.push(this._service.windowsAuth.subscribe(
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

    private isPending(): boolean {
        return this._service.windowsStatus == Status.Starting
            || this._service.windowsStatus == Status.Stopping;
    }

    private install(val) {
        if (val) {
            this._service.installWindows(true);
        }
        else {
            this._notificationService.confirm("Turn Off Windows Authentication", 'This will turn off "Windows Authentication" for the entire web server.')
                .then(confirmed => {
                    if (confirmed) {
                        this._service.installWindows(false);
                    }
                });
        }
    }
}
