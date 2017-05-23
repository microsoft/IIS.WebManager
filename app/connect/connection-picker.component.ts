import {Component, OnDestroy, ElementRef} from '@angular/core';
import {RouterLink, Router} from '@angular/router';
import {Subscription}   from 'rxjs/Subscription';

import {ConnectService} from './connect.service';
import {ApiConnection} from './api-connection';
import {ComponentUtil} from '../utils/component';


@Component({
    selector: 'connection-picker',
    template: `
        <div id="connectRoot" class="hover-primary2" [class.background-primary2]="_focused">
            <div id="connectBtn" class="v-center" (click)="onClick()">
                <span>{{currentName()}}</span>
            </div>
            <div id="connectMenu" class="background-normal" [hidden]="!_focused">
                <div class="border-active">
                    <div class="head border-active" [class.no-border]="_connections.length == 0">
                        <span class="color-active">
                            Connect To:
                        </span>
                        <div id="headAction">
                            <a [routerLink]="['/connect']" class="bttn bordered" title="New Connection" (click)="create()">
                                <i class="fa fa-plus color-active"></i>
                            </a>                    
                        </div>
                    </div>
                    <ul>
                        <li class="color-normal hover-editing" *ngFor="let conn of _connections;" [class.background-selected]="_active && _active.id() == conn.id()">
                            <div class="actions">
                                <button class="no-border" title="Edit" (click)="onEdit(conn)"><i class="fa fa-pencil color-active"></i></button>
                                <button class="no-border" title="Delete" (click)="onDelete(conn)"><i class="fa fa-trash-o red"></i></button>
                            </div>
                            <div class="left" (click)="connect(conn)">
                                <span>{{getDisplayName(conn)}}</span>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    `,
    styles: [`
        #connectRoot {
            display: inline-block;
            position:relative;
            vertical-align:bottom;
            margin:0;
            padding:0;
            outline:none;
            padding: 0 10px;
        }

        #connectBtn {
            height:55px;
            cursor:pointer;
            max-width:300px;
        }

        #connectBtn > span:after {
            font-family: FontAwesome;
            content: "\\f078";
            padding-left: 8px;
        }

        #connectMenu {
            position:absolute;
            top:55px;
            left: 0px;
            max-height:500px;
            z-index:3;
            cursor: default;
        }

        #connectMenu > div {
            width:100%;
            border-style: solid;
            border-width: 0 2px 2px 2px;
            width:345px;
            overflow:hidden;
            max-width: 80vw;
        }

        .head {
            position: relative;
            font-size:20px;
            padding: 15px 5px;
            border-bottom-style: solid;
            border-bottom-width: 2px;
        }

        #headAction {
            position: absolute;
            height:100%;
            display: inline-block;
            top:7px;
            right:5px;
        }

        .bttn {
            margin-top: 1px;
            padding: 4px 8px;
        }

        #connectLink {
            display: inline-block;
        }

        ul {
            margin-bottom: 0px;
            max-height: 500px;
            overflow-y: auto;
            overflow-x: hidden;
        }

        li {
            height: 50px;
            width: 100%;
            overflow: hidden;
        }

        li > div {
            white-space: nowrap;
        }

        li .left {
            overflow: hidden;
            text-overflow: ellipsis;
            cursor: pointer;
            height: 100%;
            padding: 5px;
        }

        li .actions {
            float: right;
            padding-top: 9px;
            padding-right: 5px;
        }

        li span {
            display: inline-block;
            height: 100%;
            line-height: 36px;
        }

        li:last-of-type {
            margin-bottom: 0px;
        }

        .no-border {
            border-width: 0;
        }

        .v-center {
            vertical-align: middle;
            height: 55px;
            display: table-cell;
        }
    `],
    host: {
        '(document:click)': 'dClick($event)',
    }
})
export class ConnectionPickerComponent implements OnDestroy {
    private _focused = false;
    private _doubleClick = false;

    private _connections: Array<ApiConnection>;
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

    onClick() {
        if (this._doubleClick) {
            this.reset();
        }
        else {
            this._focused = true;
            this._doubleClick = true;
        }
        return true;
    }

    dClick(evt) {
        if (!this._focused) {
            return;
        }

        var inside = ComponentUtil.isClickInsideComponent(evt, this._eref);

        if (!inside) {
            this.reset();
        }
    }

    create() {
        this._service.edit(new ApiConnection(""));
        this.blur();
    }

    blur() {
        this.reset();
    }

    reset() {
        this._focused = false;
        this._doubleClick = false;
    }

    connect(conn: ApiConnection) {
        if (conn.accessToken) {
            this._service.connect(conn);
        }
        else {
            this._service.edit(conn);
        }

        this.blur();
    }

    onEdit(conn: ApiConnection) {
        this._service.edit(conn);
        this.blur();
    }

    onDelete(conn: ApiConnection) {
        if (!confirm("Are you sure you want to delete the connection?")) {
            return;
        }

        this._service.delete(conn);
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
