import { Component, OnInit, OnDestroy, Output, Input, Inject, ViewChild, ElementRef } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { Constants } from './constants';
import { Selector } from '../common/selector';
import { ConnectService } from './connect.service';
import { ApiConnection } from './api-connection';

@Component({
    selector: 'server-list',
    template: `
        <div>
            <button class="New Server" [attr.disabled]="!!_newServer || null" (click)="onNewServer()"><i class="fa fa-plus color-active"></i><span>Add Server</span></button>
        </div>
        <br/>
        <div class="container-fluid hidden-xs">
            <div class="border-active grid-list-header row">
                <label class="col-xs-4">Display Name</label>
                <label class="col-xs-4">Server Url</label>
            </div>
        </div>
        <ul class="container-fluid grid-list" *ngIf="_servers">
            <li *ngIf="_newServer" tabindex="-1">
                <server [model]="_newServer" (leave)="onLeaveNewServer()"></server>
            </li>
            <li class="hover-editing" tabindex="-1" *ngFor="let server of _servers">
                <server [model]="server"></server>
            </li>
        </ul>
    `,
    styles: [`
        .container-fluid,
        .row {
            margin: 0;
            padding: 0;
        }

        div:first-of-type {
            margin-top: 30px;
        }
    `]
})
export class ServerListComponent implements OnInit, OnDestroy {
    private _servers: Array<ApiConnection> = [];
    private _subscriptions: Array<Subscription> = [];
    @ViewChild(Selector) private _selector: Selector;
    private _newServer: ApiConnection;

    constructor(private _svc: ConnectService) {
        this._subscriptions.push(this._svc.connections.subscribe(connections => {
            this._servers = connections;
        }));
    }

    public ngOnInit() {
    }

    public ngOnDestroy() {
        this._subscriptions.forEach(sub => sub.unsubscribe());
    }

    private onNewServer() {
        let con = new ApiConnection(Constants.localUrl);
        con.displayName = Constants.localDisplayName;
        con.persist = true;
        this._newServer = con;
    }

    private onLeaveNewServer() {
        this._newServer = null;
    }
}
