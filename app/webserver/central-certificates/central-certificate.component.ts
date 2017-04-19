import { Component, OnInit, OnDestroy, ViewChildren, QueryList } from '@angular/core';
import { NgModel } from '@angular/forms';

import { Subscription } from 'rxjs/Subscription';

import { DiffUtil } from '../../utils/diff';
import { ApiFile } from '../../files/file';
import { CentralCertificateService } from './central-certificate.service';
import { CentralCertificateConfiguration } from './central-certificates';

@Component({
    template: `
        <fieldset>
            <switch [model]="_enabled" (modelChange)="onEnabled($event)"></switch>
        </fieldset>
        <div *ngIf="_configuration">
            <fieldset class="path">
                <label>Physical Path</label>
                <button title="Select Folder" [class.background-active]="fileSelector.isOpen()" class="right select" (click)="fileSelector.toggle()"></button>
                <div class="fill">
                    <input type="text" class="form-control" [(ngModel)]="_configuration.path" (modelChanged)="onModelChanged()" throttle required />
                </div>
                <server-file-selector #fileSelector (selected)="onSelectPath($event)" [types]="['directory']"></server-file-selector>
            </fieldset>
            <label class="block">Connection Credentials</label>
            <div class="in">
                <fieldset>
                    <label>Username</label>
                    <input type="text" class="form-control name" [(ngModel)]="_configuration.identity.username" required (modelChanged)="onModelChanged()" throttle />
                </fieldset>
                <fieldset>
                    <label>Password</label>
                    <input type="password" class="form-control name" #identityPassword [(ngModel)]="_identityPassword" [attr.required]="!_configuration.id ? true : null" (modelChanged)="clearIdentityPassword(f)" [attr.placeholder]="_configuration.id ? '*************' : null" throttle />
                </fieldset>
                <fieldset *ngIf="identityPassword.value">
                    <label>Confirm Password</label>
                    <input type="password" class="form-control name" ngModel (ngModelChange)="onConfirmIdentityPassword($event)" [validateEqual]="_identityPassword" throttle />
                </fieldset>
            </div>
            <fieldset>
                <label>Certificate Password</label>
                <input type="password" class="form-control name" #pvkPass [(ngModel)]="_privateKeyPassword" (modelChanged)="clearPkPassword()" [attr.required]="!_configuration.id ? true : null" throttle />
            </fieldset>
            <fieldset *ngIf="pvkPass.value">
                <label>Confirm Private Key Password</label>
                <input type="password" class="form-control name" ngModel (ngModelChange)="onConfirmPkPassword($event)" [validateEqual]="_privateKeyPassword" throttle />
            </fieldset>
        </div>
    `,
    styles: [`
        .in {
            padding-left: 30px;
            padding-top: 15px;
            padding-bottom: 15px;
        }
    `]
})
export class CentralCertificateComponent implements OnInit, OnDestroy {
    id: string;
    private _enabled: boolean;
    private _identityPassword: string = null;
    private _privateKeyPassword: string = null;
    private _subscriptions: Array<Subscription> = [];
    private _original: CentralCertificateConfiguration;
    private _configuration: CentralCertificateConfiguration;
    @ViewChildren(NgModel) private _validators: QueryList<NgModel>;

    constructor(private _service: CentralCertificateService) {
    }

    private get canEnable(): boolean {
        return !!this._configuration &&
            !!this._configuration.identity.username &&
            !!this._configuration.identity.password;
            //!!this._configuration.private_key_password
    }

    private get canUpdate(): boolean {
        let changes = DiffUtil.diff(this._original, this._configuration);

        return !changes.identity ||
            changes.identity.username && changes.identity.password;
    }

    public ngOnInit() {
        this._service.initialize(this.id);

        this._subscriptions.push(this._service.enabled.subscribe(enabled => {
            this._enabled = enabled;
        }));

        this._subscriptions.push(this._service.configuration.subscribe(config => {
            this.setFeature(config);
        }));
    }

    public ngOnDestroy() {
        this._subscriptions.forEach(sub => sub.unsubscribe());
    }

    private setFeature(config: CentralCertificateConfiguration) {
        if (config) {
            config.identity.password = null;
            config.private_key_password = null;
        }

        this._configuration = config;
        this._original = JSON.parse(JSON.stringify(config));
    }

    private onModelChanged() {
        if ((!this._configuration.id && !this.canEnable) || !this.canUpdate) {
            return;
        }

        var changes = DiffUtil.diff(this._original, this._configuration);

        if (Object.keys(changes).length > 0) {
            let action = this._configuration.id ? this._service.update(changes) : this._service.enable(changes);
        }
    }

    private clearIdentityPassword(f = null) {
        this._configuration.identity.password = null;
    }

    private onConfirmIdentityPassword(identityPassword: string) {
        if (identityPassword === this._identityPassword) {
            this._configuration.identity.password = identityPassword;
            this.onModelChanged();
        }
        else {
            this.clearIdentityPassword();
        }
    }

    private clearPkPassword() {
        this._configuration.private_key_password = null;
    }

    private onConfirmPkPassword(pkPassword: string) {
        if (pkPassword === this._privateKeyPassword) {
            this._configuration.private_key_password = pkPassword;
            this.onModelChanged();
        }
        else {
            this.clearPkPassword();
        }
    }

    private onEnabled(val: boolean) {
        if (!val) {
            this._service.disable();
        }
        else {
            this.setFeature(new CentralCertificateConfiguration());
        }
    }

    private onSelectPath(event: Array<ApiFile>) {
        if (event.length == 1) {
            this._configuration.path = event[0].physical_path;
            this.onModelChanged();
        }
    }
}
