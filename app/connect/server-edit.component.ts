import { Component, OnDestroy, ViewChild, ElementRef, Input } from '@angular/core';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs/Subscription';

import { ConnectService } from './connect.service';
import { ApiConnection } from './api-connection';

@Component({
    selector: 'server-edit',
    template: `
        <div>
            <fieldset>
                <label class="inline-block">Server Url</label>
                <input type="text" placeholder="ex. contoso.com" class="form-control block" #urlField [ngModel]="model.url" (ngModelChange)="setUrl($event)" required throttle/>
            </fieldset>
            <fieldset>
                <label>Display Name</label>
                <input type="text" class="form-control block" [(ngModel)]="model.displayName"/>
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
    `,
    styles: [`
    `]
})
export class ServerEditComponent implements OnDestroy {
    @Input()
    public model: ApiConnection;
    private _subs: Array<Subscription> = [];


    constructor(private _svc: ConnectService) { }

    public ngOnDestroy() {
        this._subs.forEach(s => s.unsubscribe());
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

    private onSave() {
        this._svc.save(this.model);
    }

    private get isValid(): boolean {
        return !!this.model.url && !!this.model.accessToken;
    }
}
