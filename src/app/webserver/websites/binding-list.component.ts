import { Component, Input, Output, EventEmitter, ViewChildren, QueryList, OnInit, OnChanges, SimpleChange, Optional, Inject } from '@angular/core';
import { NgModel } from '@angular/forms';
import { WebServerService } from '../webserver.service';
import { DateTime, DateTimeUnit } from '../../common/primitives';
import { Certificate } from '../../certificates/certificate';
import { CertificatesService } from '../../certificates/certificates.service';
import { Binding } from './site';
import { first } from 'rxjs/operators'

@Component({
    selector: 'binding-item',
    template: `
        <div class="row grid-item" [class.background-editing]="edit">
            <div class='valign' *ngIf="!edit">
                <div class="col-xs-8 col-md-1">
                    <label class="visible-xs visible-sm">Protocol</label>
                    <span class="inline-block">{{model.protocol}}</span>
                </div>
                <div class="col-xs-8 col-md-3" *ngIf="isHttp()">
                    <label class="visible-xs visible-sm">Host Name</label>
                    <span class="inline-block">{{hostname()}}</span>
                </div>
                <div class="col-xs-12 col-md-3" *ngIf="isHttp()">
                    <label class="visible-xs visible-sm">IP Address</label>
                    <span class="inline-block">{{ipAddress()}}</span>
                </div>
                <div class="col-xs-12 col-md-1" *ngIf="isHttp()">
                    <label class="visible-xs visible-sm">Port</label>
                    <span class="inline-block">{{model.port}}</span>
                </div>
               
                <div class="cert">
                    <div class="col-xs-12 col-md-3" *ngIf="model.is_https || model.protocol == 'https'">
                        <label class="visible-xs visible-sm">HTTPS</label>
                        <span *ngIf="model.certificate" [class.expired]="isCertExpired()">
                            <span class="name" [title]="certName()">{{certName()}}</span>
                        </span>
                    </div>
                </div>
            </div>
            
            <div class="col-lg-10 col-md-10 col-sm-10 overflow-visible" *ngIf="edit">
                <fieldset class="col-xs-8 col-md-4" *ngIf="isHttp()">
                    <label>Host Name</label>
                    <input autofocus class="form-control" type="text" [(ngModel)]="model.hostname"/>
                </fieldset>
                <fieldset class="col-xs-12 col-sm-10 col-md-4" *ngIf="isHttp()">
                    <label>IP Address</label>
                    <input class="form-control" type="text" [(ngModel)]="model.ip_address" required />
                </fieldset>
                <fieldset class="col-xs-12 col-sm-2" *ngIf="isHttp()">
                    <label>Port</label>
                    <input class="form-control" type="number" max="65535" min="1" [(ngModel)]="model.port" required />
                </fieldset>

                <div class="col-xs-12 overflow-visible" *ngIf="isHttp()">
                    <fieldset class="inline-block">
                        <switch label="HTTPS" class="block" (modelChange)="model.is_https=$event" [model]="model.is_https" (modelChanged)=onHttps()>{{model.is_https ? "On" : "Off"}}</switch>
                    </fieldset>
                    <fieldset class="inline-block cert bottom" *ngIf="model.is_https">
                        <button (click)="selectCert()" class="exchange background-normal select-cert" [class.background-active]="!!_certSelect.first && _certSelect.first.opened">
                            {{!model.certificate ? 'Select Certificate' : name()}}
                        </button>
                    </fieldset>
                    <fieldset class="inline-block bottom" *ngIf="model.is_https && _supportsSni">
                        <checkbox2 [(model)]="model.require_sni">Require SNI</checkbox2>
                    </fieldset>
                    <div class="selector" *ngIf="model.is_https">
                        <selector #certSelect [hidden]="!certSelect || !certSelect.isOpen()" (hide)="onCertSelected()" class="container-fluid">
                            <button (click)="certSelect.close()" class="close-button" title="Close"><i class="sme-icon sme-icon-clear" aria-hidden="true"></i></button>
                            <certificates-list #list (itemSelected)="onCertSelected($event)"></certificates-list>
                        </selector>
                    </div>
                    <fieldset class="certificate" *ngIf="model.is_https && model.certificate">
                        <certificate-details [model]="model.certificate"></certificate-details>
                    </fieldset>
                </div>
                <div class="col-xs-8">
                    <fieldset class="inline-block">
                        <switch label="Custom Protocol" class="block" [model]="!isHttp()" (modelChange)="onCustomProtocol($event)">{{isHttp() ? "Off" : "On"}}</switch>
                    </fieldset>
                    <fieldset class="inline-block protocol" *ngIf="!isHttp()">
                        <label>Protocol</label>
                        <input class="form-control" type="text" [(ngModel)]="model.protocol"/>
                    </fieldset>
                    <fieldset class="inline-block protocol" *ngIf="!isHttp()">
                        <label>Binding Information</label>
                        <input class="form-control" type="text" [(ngModel)]="model.binding_information"/>
                    </fieldset>
                </div>
            </div>

            <div>
                <div class="actions">
                    <button title="Edit" [disabled]="!allowed('edit')" class='no-editing' (click)="onEdit()">
                        <i aria-hidden="true" class="sme-icon sme-icon-edit color-active"></i>
                    </button>
                    <button title="Save" [disabled]="!isValid()" class="editing" (click)="onSave()">
                        <i aria-hidden="true" class="sme-icon sme-icon-accept color-active"></i>
                    </button>
                    <button title="Cancel" class="editing" (click)="onCancel()">
                        <i aria-hidden="true" class="sme-icon sme-icon-clear red"></i>
                    </button>
                    <button title="Delete" *ngIf="!model.isNew" [disabled]="!allowed('delete')" (click)="onDelete()">
                        <i aria-hidden="true" class="sme-icon sme-icon-delete red"></i>
                    </button>
                </div>
            </div>
        </div>

        
    `,
    styles: [`
        .grid-item > div {
            padding-left: 0px;
        }

        .sme-icon-lock {
            padding-right: 5px;
            font-size: 16px;
        }

        .selector {
            display: flex;
            margin-top: -12px;
        }

        .cert .name {
            display: block;
        }

        .cert .name:before {
            font-family: "Server-MDL2";
            content: "\\f023";
            padding-right: 5px;
        }

        .cert .expired .name:before {
            content: "\\f09c";
        }

        .hostname {
            max-width: 400px;
            width: 100%;
        }

        .ip {
            max-width: 640px;
            width: 100%;
        }

        .ip-address {
            max-width: 400px;
            width: 100%;
        }

        .protocol {
            max-width: 150px;
            margin-right: 0px;
        }

        .cert span.inline-block {
            vertical-align: text-bottom;
        }

        .bottom {
            vertical-align: bottom;
        }

        .bottom checkbox2 {
            vertical-align: super;
        }

        label.visible-xs.visible-sm:not(:first-child) {
            color: green;
        }

        fieldset.certificate {
            overflow: visible;
        }

        .select-cert {
            max-width: 275px;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
        }

        .select-cert span {
            max-width: 240px;
            overflow: hidden;
            display: inline-block;
            vertical-align: middle;
        }
    `]
})
export class BindingItem implements OnInit, OnChanges {
    @Input() model: Binding;
    @Input() allow: string;
    @Input() edit: boolean;

    @Output() modelChange: EventEmitter<any> = new EventEmitter();
    @Output() delete: EventEmitter<any> = new EventEmitter();
    @Output() editing: EventEmitter<any> = new EventEmitter();
    @Output() cancel: EventEmitter<any> = new EventEmitter();

    @ViewChildren('certSelect') _certSelect: QueryList<any>;
    @ViewChildren(NgModel) validators: QueryList<NgModel>;

    private _original: Binding;
    private _supportsSni: boolean;

    constructor(@Optional() private _service: CertificatesService,
                @Inject("WebServerService") private _webServerService: WebServerService) {
    }

    ngOnInit() {
        this.setOriginal();
        this.getFullCert();
        this._webServerService.server
            .then(server => {
                if (server.supports_sni) {
                    this._supportsSni = true;
                }
            });
    }

    ngOnChanges(changes: { [key: string]: SimpleChange; }): any {
        if (changes["model"]) {
            this.setOriginal();
        }
    }

    private ipAddress() {
        if (this.isHttp()) {
            return this.model.ip_address == '*' ? 'Any' : this.model.ip_address;
        }
        return "";
    }

    private hostname() {
        if (this.isHttp()) {
            return this.model.hostname == '' ? 'Any' : this.model.hostname;
        }
        return "";
    }

    private isHttp(): boolean {
        return this.model.protocol.indexOf("http") === 0;
    }

    selectCert() {
        this._certSelect.first.toggle();
    }

    private onCertSelected(cert: Certificate) {
        if (cert) {
            this._certSelect.first.close();

            if (cert.store && cert.store.name == 'IIS Central Certificate Store') {
                this.model.require_sni = true;
                this.model.hostname = cert.alias.replace(/\.pfx$/g, '');
            }

            this.model.certificate = cert;
        }
        else {
            if (!this.model.certificate) {
                this.model.is_https = false;
            }
        }
    }

    private onHttps() {
        if (this.model.is_https) {
            if (this.model.port === 80) {
                this.model.port = 443;
            }
            this.model.protocol = "https";

            if (!this.model.certificate) {
                this._certSelect.changes.pipe(first()).subscribe(c => {
                    this._certSelect.first.open();
                })
            }
        }
        else {
            this.model.protocol = "http";

            if (this.model.port === 443) {
                this.model.port = 80;
            }
        }
    }

    private onCustomProtocol(val: boolean) {
        if (val) {
            this.model.protocol = "";
        }
        else {
            this.model.protocol = "http";
        }
    }

    private onModelChanged() {
        if (!this.isValid()) {
            return;
        }

        this.setOriginal();
        this.modelChange.emit(this.model);
    }

    onCancel() {
        this.discardChanges();
        this.cancel.emit(this.model);
    }

    onDelete() {
        if (confirm("Are you sure you want to delete this binding?\nProtocol: " + this.model.protocol + "\nPort: " + this.model.port)) {
            this.edit = false;
            this.delete.emit(this.model);
        }
    }

    onEdit() {
        this.edit = true;
        this.editing.emit(this.model);
    }

    onSave() {
        if (!this.isValid()) {
            return;
        }
        if (this.isHttp()) {
            this.model.binding_information = null;
        }

        this.edit = false;
        (<any>this.model).isNew = false;
        this.onModelChanged();
    }

    private isValid() {
        let b = this.model;
        if (!b.protocol) {
            return false;
        }
        let valid = true;

        if (b.protocol.indexOf("http") == 0) {
            valid = b.ip_address && !!b.port;
            if (b.protocol == "https") {
                valid = valid && !!b.certificate;
            }
        }
        else {
            valid = !!b.binding_information;
        }

        return valid;
    }

    private setOriginal() {
        this._original = JSON.parse(JSON.stringify(this.model)); // Deep Clone
    }

    private discardChanges() {
        let keys = Object.keys(this._original);
        for (var key of keys) {
            this.model[key] = JSON.parse(JSON.stringify(this._original[key]));
        }
    }

    private allowed(action: string): boolean {
        return this.allow.indexOf(action) >= 0;
    }

    private isCertExpired(): boolean {
        return this.model.certificate && this.model.certificate.valid_to && (DateTime.UtcNow > new Date(this.model.certificate.valid_to));
    }

    certName(): string {
        if (!this.model.certificate) {
            return "";
        }

        let note = "";
        let validTo = new Date(this.model.certificate.valid_to);
        let days2Exp = DateTime.diff(DateTime.UtcNow, validTo, DateTimeUnit.Days);

        if (days2Exp < 0) {
            note = " (Expired)";
        }
        else if (days2Exp < 30) {
            note = " (Will Expire: " + validTo.toDateString() + ")";
        }

        let cert = <any>this.model.certificate;
        let name = cert.name || cert.alias || cert.subject || cert.thumbprint;

        return name + note;
    }

    private name() {
        return Certificate.displayName(this.model.certificate);
    }

    private getFullCert() {
        if (!this.model.certificate || !this._service) {
            return;
        }

        this._service.get(this.model.certificate.id)
            .then(cert => {
                this.model.certificate = cert;
                this.setOriginal();
            })
    }
}



@Component({
    selector: 'binding-list',
    styles: [`
    `],
    template: `
        <button class="create" [disabled]="_editing >= 0 && _editing < model.length" (click)="add()">
            <i aria-hidden="true" class="sme-icon sme-icon-add color-active"></i> Add
        </button>
        <div class="container-fluid" [hidden]="!model || model.length < 1">
            <div class="row hidden-xs hidden-sm border-active grid-list-header">
                <label class="col-md-1">Protocol</label>
                <label class="col-md-3">Host Name</label>
                <label class="col-md-3">IP Address</label>
                <label class="col-md-2">Port</label>
            </div>
            <ul class="grid-list">
                <li *ngFor="let b of model; let i = index;">
                    <binding-item #item [(model)]="model[i]" [edit]="edit(i)" (delete)="delete(i)" (editing)="onEdit(i)" (modelChange)="onSave(i)" (cancel)="onCancel(i)" [allow]="allow(i)"></binding-item>
                </li>
            </ul>
        </div>
    `
})
export class BindingList {
    @Input() model: Array<Binding>;
    @Output() modelChange: any = new EventEmitter();

    @ViewChildren("item") _items: QueryList<BindingItem>;

    private _original: Array<Binding>;
    private _editing: number = -1;

    ngOnInit() {
        this.reset();
    }

    public isEditing(): boolean {
        return this._editing != -1;
    }

    onModelChanged() {
        this.model = this.model.filter(b => {
            return this.isBindingValid(b);
        });

        this.modelChange.emit(this.model);
        this.reset();
    }

    add() {
        let b = new Binding();
        b.ip_address = "*";
        b.port = 80;
        b.hostname = "";
        b.is_https = false;
        b.protocol = "http";
        (<any>b).isNew = true;

        this.model.unshift(b);

        // Watch for binding to be added
        let len = this._items.length;
        let interval = setInterval(_ => {
            if (this._items.length > len) {
                this._items.first.onEdit();
                clearInterval(interval);
            }
        }, 1);
    }

    delete(index) {
        this.model.splice(index, 1);
        this._editing = -1;

        this.onModelChanged();
    }

    private onEdit(i: number) {
        this._editing = i;
    }

    private onCancel(i: number) {
        if (this.model.length > this._original.length) {
            this.model.splice(i, 1);
        }

        this._editing = -1;
    }

    private onSave(index: number) {
        this._editing = -1;
        this.onModelChanged();
    }

    private allow(i: number): string {
        let actions: string = "save,cancel,";

        if (this.model.length > 1 && (i == this._editing || this._editing < 0)) {
            actions += "delete,";
        }

        if (this._editing < 0 || i == this._editing || this._editing >= this.model.length) {
            actions += "edit";
        }

        return actions;
    }

    private isBindingValid(b: Binding): boolean {
        if (!b.protocol) {
            return false;
        }

        let valid = true;

        if (b.protocol.indexOf("http") == 0) {
            valid = b.ip_address && !!b.port;
            if (b.protocol == "https") {
                valid = valid && !!b.certificate;
            }
        }
        else {
            valid = !!b.binding_information;
        }

        return valid;
    }

    private reset() {
        this._original = JSON.parse(JSON.stringify(this.model)); // Deep Clone
        this._editing = -1;
    }

    edit(i: number) {
        return this._editing == i;
    }
}
