import { Component, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { OrderBy, SortPipe } from '../common/sort.pipe';
import { Constants } from '../connect/constants';
import { Selector } from '../common/selector';
import { ConnectService } from '../connect/connect.service';
import { ApiConnection } from '../connect/api-connection';

@Component({
    selector: 'server-list',
    template: `
        <div>
            <button title="New Server" class="create" [attr.disabled]="!!_newServer || null" (click)="onNewServer()"><i aria-hidden="true" class="fa fa-plus color-active"></i><span>Add Server</span></button>
        </div>
        <br/>
        <div class="container-fluid hidden-xs">
            <div class="border-active grid-list-header row">
                <label class="col-xs-4" [ngClass]="_orderBy.css('displayName')" (click)="sort('displayName')">Display Name</label>
                <label class="col-sm-6" [ngClass]="_orderBy.css('url')" (click)="sort('url')">Server Url</label>
            </div>
        </div>
        <ul class="container-fluid grid-list" *ngIf="_servers">
            <li *ngIf="_newServer" tabindex="-1">
                <server [model]="_newServer" (leave)="onLeaveNewServer()"></server>
            </li>
            <li class="hover-editing" tabindex="-1" *ngIf="_active && !_orderBy.Field">
                <server [model]="_active"></server>
            </li>
            <li class="hover-editing" tabindex="-1" *ngFor="let server of _view">
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
    `]
})
export class ServerListComponent implements OnDestroy {
    private _servers: Array<ApiConnection> = [];
    private _view: Array<ApiConnection> = [];
    private _active: ApiConnection;
    private _orderBy: OrderBy = new OrderBy();
    private _sortPipe: SortPipe = new SortPipe();
    private _subscriptions: Array<Subscription> = [];
    private _newServer: ApiConnection;
    @ViewChild(Selector) private _selector: Selector;

    constructor(private _svc: ConnectService) {

        this._subscriptions.push(this._svc.active.subscribe(active => {
            this._active = active;
            this.doSort();
        }));

        this._subscriptions.push(this._svc.connections.subscribe(connections => {
            this._servers = connections;
            this.doSort();
        }));
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

    private sort(field: string) {
        this._orderBy.sort(field);
        this.doSort();
    }

    private doSort() {
        this._view = this._servers;
        this._sortPipe.transform(this._view, this._orderBy.Field, this._orderBy.Asc, null, true);

        if (!this._orderBy.Field) {
            this._view = this._view.filter(c => c != this._active);
        }
    }
}
