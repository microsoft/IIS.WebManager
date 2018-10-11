import {Component, OnDestroy, ElementRef} from '@angular/core';
import {RouterLink, Router} from '@angular/router';
import {Subscription}   from 'rxjs/Subscription';

import {ConnectService} from './connect.service';
import {ApiConnection} from './api-connection';
import {ComponentUtil} from '../utils/component';


@Component({
    selector: 'connection-picker',
    template: `
        <a title="Manage Servers" class="background-active hover-primary2 nav-height" [routerLink]="[_connections.length > 0 ? '/settings/servers' : '/connect']">{{currentName()}}</a>
    `,
    styles: [`
        a {
            max-width:300px;
            vertical-align: middle;
            display: table-cell;
            padding: 0 10px;
        }
    `]
})
export class ConnectionPickerComponent implements OnDestroy {
    private _connections: Array<ApiConnection>;
    private _focused = false;
    private _doubleClick = false;
    private _active: ApiConnection;
    private _subs: Array<Subscription> = [];

    constructor(private _eref: ElementRef,
                private _service: ConnectService,
                private _router: Router) { 

        this._subs.push(this._service.connections.subscribe(conns => {
            this._connections = conns;
        }));

        this._subs.push(this._service.active.subscribe(c => {
            this._active = c;
        }));
    }

    ngOnDestroy() {
        this._subs.forEach(s => s.unsubscribe());
    }

    private currentName(): string {
        if (!this._active) {
            return "Not Connected";
        }

        return this.getDisplayName(this._active);
    }

    private getDisplayName(con: ApiConnection): string {
        return con.displayName || con.hostname();
    }
}
