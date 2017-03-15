import {Component, OnDestroy} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {Subscription}   from 'rxjs/Subscription';

import {CheckBoxComponent} from '../common/checkbox.component';
import {ConnectService} from './connect.service';
import {ApiConnection} from './api-connection';


@Component({
    template: `
    <div class="center">
        <div *ngIf='!_connecting'>
            <h1>Connect</h1>
            <fieldset>
                <label>Display Name</label>
                <input type="text" class="form-control" [(ngModel)]="_conn.displayName"/>
            </fieldset>
            <fieldset>
                <label>Server URL</label>
                <input type="text" placeholder="e.g. localhost or example.com" class="form-control" [ngModel]="_conn.url" (ngModelChange)="setUrl($event)" required throttle/>
            </fieldset>
            <fieldset>
                <label class="emph">Access Token</label>
                <input type="text" autocomplete="off" 
                        class="form-control"
                        [ngModel]="''"
                        (ngModelChange)="setAccessToken($event)"
                        [attr.placeholder]="!_conn.accessToken ? null : '******************************'" 
                        [attr.required]="!_conn.accessToken || null"/>
            </fieldset>
            <a class="tokenLink" [attr.disabled]="!tokenLink() ? true : null" (click)="gotoAccessToken($event)" [attr.href]="tokenLink()">Get Access Token</a>
        
            <fieldset>
                <checkbox2 [(model)]="_conn.persist"><b>Keep me connected from now on</b></checkbox2>
                <small *ngIf='_conn.persist'>
                    Your Access Token and Connection will be stored locally.
                    <b>Use only if your device is private and trusted!</b>
                </small>
             </fieldset>
            <fieldset>
                <button class="active pull-right" [attr.disabled]="!isValid() || null" (click)="connect()">Connect</button>
                <button class="pull-right" [attr.disabled]="!isValid() || null" (click)="save()">Save</button>
            </fieldset>
        </div>

        <div class="in-progress" *ngIf='_connecting'>
            <h1>Connecting</h1>
            to <a [attr.href]="_conn.url">{{connName()}}</a>
            <p><i class="fa fa-spinner fa-pulse fa-3x"></i></p>
            <button class="bordered" (click)="cancel()">Cancel</button>
        </div>
    </div>
    <div class="get hidden-xs" *ngIf='!_connecting'>
        <a class="bttn bordered" [routerLink]="['/get']"><small>Get Microsoft IIS Administration</small></a>
    </div>
    `,
    styles: [`
        h1 {
            display: block;
            margin-bottom: 40px;
        }

        fieldset {
            margin-top: 10px;
        }

        input,
        button {
            height: 40px;
        }

        .tokenLink {
            float:right;
            margin-top: -12px;
        }

        checkbox2 {
            display: block;
        }

        button {
            margin-left: 5px;
            margin-top: 20px;
            width: 100px;
        }

        checkbox2 + small {
            padding-left: 25px;
            display: block;
        }

        .in-progress {
            text-align: center;
        }
        
        .in-progress > p {
            margin-top: 40px;
            margin-bottom: 40px;
        }

        .get {
            text-align: right;
            margin-top: 30px;
        }
    `]
})
export class ConnectionComponent implements OnDestroy {
    private _conn: ApiConnection = new ApiConnection("");
    private _original: ApiConnection;
    private _connecting: boolean;
    private _subs: Array<Subscription> = [];

    constructor(private _service: ConnectService, private _router: Router) {
        this._subs.push(this._service.editting.subscribe(c => {
            if (c) {
                this._conn = c;
                this._original = ApiConnection.clone(this._conn);
                this._connecting = false;
            }
        }));

        this._subs.push(this._service.connecting.subscribe(c => {
            if (c) {
                this._conn = c;
                this._original = ApiConnection.clone(this._conn);
            }

            this._connecting = (c != null);
        }));
    }

    ngOnDestroy() {
        this._subs.forEach(s => s.unsubscribe());

        // Stop if still connecting
        if (this._connecting) {
            this._service.cancel();
        }

        //
        // Restore
        if (this._original) {
            for (var k in this._original) this._conn[k] = this._original[k];
        }
    }

    save() {
        this._service.save(this._conn);

        this._service.active.subscribe(c => {
            if (!c) {
                this._service.connect(this._conn);
            }
        }).unsubscribe();

        this._conn = new ApiConnection("");
        this._original = null;

        this._router.navigate(["/"]);
    }

    connect() {
        this._service.connect(this._conn).then(conn => {
            this._service.save(this._conn);
        });
    }

    cancel() {
        this._service.cancel();
        this._service.edit(this._conn);
    }

    private gotoAccessToken(evt) {
        evt.preventDefault();
        window.open(this.tokenLink());
    }

    private tokenLink() {
        if (this._conn.url) {
            return this._conn.url + "/security/tokens";
        }

        return null;
    }

    private setAccessToken(value: string) {
        this._conn.accessToken = value;
    }

    private setUrl(url: string) {
        this._conn.url = "";

        setTimeout(_ => {
            this._conn.url = url;
        });
    }

    private isValid(): boolean {
        return !!this._conn.url && !!this._conn.accessToken;
    }

    private connName(): string {
        return this._conn.displayName || this._conn.hostname();
    }
}