import { Component, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { Constants } from './constants';
import { ConnectionType } from './connection-type';
import { ConnectService } from './connect.service';
import { ApiConnection } from './api-connection';

@Component({
    template: `
    <div class="get hidden-xs" *ngIf='!_connecting'>
        <a class="bttn bordered" [routerLink]="['/get']"><small>Get Microsoft IIS Administration</small></a>
    </div>
    <div class="center">
        <div *ngIf='!_connecting'>
            <h1 [class.advanced]="_connectionType == 'advanced'">Connect</h1>
            <p *ngIf="_connectionType == 'simple'">to Local Server</p>
            <fieldset *ngIf="_connectionType == 'advanced'">
                <label class="inline-block">Server Url</label>
                <tooltip>
                        The URL of the server to connect to. The default port for the Microsoft IIS Administration API is 55539.
                </tooltip>
                <input type="text" placeholder="ex. contoso.com" class="form-control" #urlField [ngModel]="_conn.url" (ngModelChange)="setUrl($event)" required throttle/>
            </fieldset>
            <fieldset *ngIf="_connectionType == 'advanced'">
                <label>Display Name</label>
                <input type="text" class="form-control" [(ngModel)]="_conn.displayName"/>
            </fieldset>
            <fieldset>
                <label class="inline-block">Access Token</label>
                <tooltip>
                    An access token is an auto generated value that is used to connect to the Microsoft IIS Administration API. Only Administrators can create these tokens. <a class="link" title="More Information" href="https://docs.microsoft.com/en-us/IIS-Administration/management-portal/connecting#acquiring-an-access-token"></a>
                </tooltip>
                <input type="text" autocomplete="off" #tokenField
                    class="form-control"
                    [ngModel]="''"
                    (ngModelChange)="setAccessToken($event)"
                    [attr.placeholder]="!_conn.accessToken ? null : '******************************'" 
                    [attr.required]="!_conn.accessToken || null"/>
            </fieldset>
            <p class="tokenLink">Don't have an access token? <a [attr.disabled]="!tokenLink() ? true : null" (click)="gotoAccessToken($event)" [attr.href]="tokenLink()">Get access token</a></p>
            <fieldset class="rememberMe">
                <checkbox2 [(model)]="_conn.persist"><b>Keep me connected from now on</b></checkbox2>
                <tooltip>
                    Your Access Token and Connection will be stored locally.<br/>
                    Use only if your device is trusted!
                </tooltip>
            </fieldset>
            <fieldset>
                <button class="active right" (click)="connect()">Connect</button>
            </fieldset>

            <div class="advanced" *ngIf="_connectionType == 'simple'">
                <button (click)="onAdvanced()">Remote Server or Manual Setup<i class="fa fa-arrow-right"></i></button>
            </div>
            <div class="simple" *ngIf="_connectionType == 'advanced' && !_disableSimple">
                <button (click)="onSimple()">Local Server Setup<i class="fa fa-arrow-right"></i></button>
            </div>
        </div>

        <div class="in-progress" *ngIf='_connecting'>
            <h1>Connecting</h1>
            to <a [attr.href]="_conn.url">{{connName()}}</a>
            <p><i class="fa fa-spinner fa-pulse fa-3x"></i></p>
            <button class="bordered" (click)="cancel()">Cancel</button>
        </div>
    </div>
    `,
    styles: [`
        h1.advanced,
        h1 + p {
            margin-bottom: 40px;
        }

        h1 + p {
            display: block;
            margin-left: 5px;
        }

        button {
            margin-left: 5px;
            margin-top: 20px;
            width: 100px;
        }

        input,
        button {
            height: 40px;
        }

        fieldset {
            margin-top: 10px;
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

        enum {
            display: block;
            position: fixed;
            top: 70px;
            left: 15px;
        }

        .advanced {
            margin-top: 35px;
        }

        .advanced button,
        .simple button {
            height: 30px;
            margin-top: 0;
            width: 46px;
            vertical-align: middle;
            padding: 0;
            font-size: 12px;
            width: auto;
            border: none;
            padding-left: 8px;
            padding-right: 8px;
        }
        
        .advanced i,
        .simple i {
            margin-left: 5px;
        }

        .tokenLink {
            float:right;
            margin-top: -12px;
        }

        tooltip {
            margin-left: 5px;
        }

        .rememberMe {
            margin-top: 35px;
        }
    `]
})
export class ConnectComponent implements OnDestroy {
    private _connecting: boolean;
    private _conn: ApiConnection = this.localConnection;
    private _advancedState: ApiConnection = new ApiConnection("");
    private _original: ApiConnection;
    private _subs: Array<Subscription> = [];
    private _connectionType = ConnectionType.Simple;
    private _disableSimple: boolean;
    @ViewChild('urlField') private _urlField: ElementRef;
    @ViewChild('tokenField') private _tokenField: ElementRef;

    constructor(private _service: ConnectService, private _router: Router) {
        this._subs.push(this._service.editting.subscribe(c => {
            if (c) {
                this.initializeConnection(c);
            }
        }));

        this._subs.push(this._service.connecting.subscribe(c => {
            if (c) {
                this.initializeConnection(c);
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

    private get localConnection(): ApiConnection {
        let c = new ApiConnection(Constants.localUrl);
        c.displayName = Constants.localDisplayName;
        return c;
    }

    private save() {
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

    private connect() {
        if (!this._conn.url && this._urlField) {
            this._urlField.nativeElement.focus();
        }
        if (!this._conn.accessToken) {
            this._tokenField.nativeElement.focus();
        }
        if (!this.isValid) {
            return;
        }

        this._service.connect(this._conn).subscribe(conn => {
            this._service.save(this._conn);
        });
    }

    private cancel() {
        this._service.cancel();
        this._service.edit(this._conn);
    }

    private tokenLink() {
        if (this._conn.url) {
            return this._conn.url + "/security/tokens";
        }

        return null;
    }

    private connName(): string {
        return this._conn.displayName || this._conn.hostname();
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

    private gotoAccessToken(evt) {
        evt.preventDefault();
        window.open(this.tokenLink());
    }

    private onAdvanced() {
        this._connectionType = ConnectionType.Advanced;

        if (this._advancedState.url || this._advancedState.displayName) {
            this._conn.url = this._advancedState.url;
            this._conn.displayName = this._advancedState.displayName;
            this._conn.accessToken = this._advancedState.accessToken;
        }
    }

    private onSimple() {
        this._connectionType = ConnectionType.Simple;

        this._advancedState.url = this._conn.url;
        this._advancedState.displayName = this._conn.displayName;
        this._advancedState.accessToken = this._conn.accessToken;

        this._conn.url = Constants.localUrl;
        this._conn.displayName = Constants.localDisplayName;
    }

    private initializeConnection(connection: ApiConnection) {
        this._conn = connection;
        this._original = ApiConnection.clone(this._conn);
        this._advancedState = new ApiConnection("");
        this._connecting = false;

        if (!connection.url) {
            this._disableSimple = false;
            this.onSimple();
        }
        else {
            this._disableSimple = true;
            this.onAdvanced();
        }
    }

    private get isValid(): boolean {
        return !!this._conn.url && !!this._conn.accessToken;
    }
}
