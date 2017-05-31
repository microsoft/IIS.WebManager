import { Component, OnInit, OnDestroy, Output, Input, Inject, ViewChild, ElementRef, EventEmitter } from '@angular/core';

import { Selector } from '../common/selector';
import { ApiConnection } from './api-connection';
import { ConnectService } from './connect.service';
import { NotificationService } from '../notification/notification.service';

@Component({
    selector: 'server',
    template: `
        <div *ngIf="model" class="grid-item row" [class.background-editing]="_editing" (dblclick)="onDblClick($event)">
            <div *ngIf="!_editing" class="actions">
                <div class="selector-wrapper">
                    <button title="More" (click)="openSelector($event)" (dblclick)="prevent($event)" [class.background-active]="(_selector && _selector.opened) || false">
                        <i class="fa fa-ellipsis-h"></i>
                    </button>
                    <selector [right]="true">
                        <ul>
                            <li><button class="edit" title="Edit" (click)="onEdit()">Edit</button></li>
                            <li><button class="go" title="Connect" (click)="onConnect()">Connect</button></li>
                            <li><button class="delete" title="Delete" (click)="onDelete()">Delete</button></li>
                        </ul>
                    </selector>
                </div>
            </div>
            <div class="actions" *ngIf="_editing">
                <button class="no-border ok" title="Ok" [disabled]="!isValid || null" (click)="onSave()"></button>
                <button class="no-border cancel" title="Cancel" (click)="onCancel()"></button>
            </div>
            <div *ngIf="!_editing">
                <div class="col-xs-4 v-align">
                    {{model.displayName}}
                </div>     
                <div class="col-xs-4 v-align">
                    {{model.url}}
                </div>
            </div>
            <div *ngIf="_editing" class="name">
                <fieldset>
                    <label>Display Name</label>
                    <input type="text" class="form-control block" [(ngModel)]="model.displayName"/>
                </fieldset>
                <fieldset>
                    <label class="inline-block">Server Url</label>
                    <input type="text" placeholder="ex. contoso.com" class="form-control block" #urlField [ngModel]="model.url" (ngModelChange)="setUrl($event)" required throttle/>
                </fieldset>
                <fieldset>
                    <label class="emph inline-block">Access Token</label>
                    <input type="text" autocomplete="off" #tokenField
                        class="form-control block"
                        [ngModel]="''"
                        (ngModelChange)="setAccessToken($event)"
                        [attr.placeholder]="!model.accessToken ? null : '******************************'" 
                        [attr.required]="!model.accessToken || null"/>
                    <a class="right" [attr.disabled]="!tokenLink() ? true : null" (click)="gotoAccessToken($event)" [attr.href]="tokenLink()">Get access token</a>
                </fieldset>
            </div>
        </div>
    `,
    styles: [`
        .row {
            margin: 0px;
        }

        .v-align {
            padding-top: 6px;
        }

        .selector-wrapper {
            position: relative;
        }

        selector {
            position:absolute;
            right:0;
            top: 32px;
        }

        selector button {
            min-width: 125px;
            width: 100%;
        }
        
        .name {
            padding: 0 15px;
        }
    `]
})
export class ServerListItem implements OnInit {
    @Input() public model: ApiConnection;
    @Output() public leave: EventEmitter<any> = new EventEmitter<any>();

    private _editing: boolean;
    private _original: ApiConnection;
    @ViewChild(Selector) private _selector: Selector;

    constructor(private _svc: ConnectService, private _notificationService: NotificationService) {
    }

    public ngOnInit() {
        if (!this.model.accessToken) {
            this.onEdit();
        }
    }

    private prevent(e: Event) {
        e.preventDefault();
    }

    private openSelector(e: Event) {
        this._selector.toggle();
    }

    private onEdit() {
        if (this._selector) {
            this._selector.close();
        }

        this._original = this.model;
        this.model = ApiConnection.clone(this.model);
        this._editing = true;
    }

    private onDblClick(e: Event) {
        if (e.defaultPrevented) {
            return;
        }

        if (!this._editing) {
            this.onEdit();
        }
    }

    private onConnect() {
        this._svc.connect(this.model);
    }

    private onDelete() {
        this._notificationService.confirm("Delete Server", "Are you sure you want to delete this server? Name: " + this.model.displayName)
            .then(result => result && this._svc.delete(this.model));
    }

    private onCancel() {
        this.discardChanges();
        this._editing = false;
        this.leave.next();
    }

    private onSave() {
        if (!this.model.displayName) {
            this.model.displayName = this.model.hostname();
        }

        this._svc.save(this.model);
        this._editing = false;
        this.leave.next();
    }

    private tokenLink() {
        if (this.model.url) {
            return this.model.url + "/security/tokens";
        }

        return null;
    }

    private connName(): string {
        return this.model.displayName || this.model.hostname();
    }

    private setAccessToken(value: string) {
        this.model.accessToken = value;
    }

    private setUrl(url: string) {
        this.model.url = "";
        setTimeout(_ => {
            this.model.url = url;
        });
    }

    private gotoAccessToken(evt) {
        evt.preventDefault();
        window.open(this.tokenLink());
    }

    private get isValid(): boolean {
        return !!this.model.url && !!this.model.accessToken;
    }

    private discardChanges() {
        this.model = this._original;
    }
}
