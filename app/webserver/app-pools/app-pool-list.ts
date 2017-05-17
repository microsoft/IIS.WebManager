import { Component, Input, Output, Inject, EventEmitter, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { Selector } from '../../common/selector';
import { Status } from '../../common/status';
import { OrderBy } from '../../common/sort.pipe';

import { NotificationService } from '../../notification/notification.service';
import { AppPoolsService } from './app-pools.service';
import { ApplicationPool, ProcessModelIdentityType } from './app-pool';


@Component({
    selector: 'app-pool-item',
    template: `
    <div *ngIf="model" class="grid-item row border-color">
        <div class='col-xs-7 col-sm-4 col-md-3 v-align big'>
            <a class="color-normal hover-color-active" [routerLink]="['/webserver/app-pools', model.id]">{{model.name}}</a>
        </div>
        <div class='col-xs-3 col-md-2 v-align'>
            <span class='status' [ngClass]="model.status">{{model.status}}</span>
        </div>
        <div class='col-md-2 hidden-xs hidden-sm v-align capitalize'>
            <span>{{model.pipeline_mode}}</span>
        </div>
        <div class='col-sm-2 hidden-xs v-align'>
            <span>{{runtimeVer()}}</span>
        </div>
        <div class="col-lg-2 visible-lg v-align">
            {{identity()}}
        </div>
        <div class="actions">
            <div class="selector-wrapper">
                <button title="More" (click)="openSelector($event)" (dblclick)="prevent($event)" [class.background-active]="(_selector && _selector.opened) || false">
                    <i class="fa fa-ellipsis-h"></i>
                </button>
                <selector [right]="true">
                    <ul>
                        <li><button class="refresh" title="Recycle" *ngIf="allow('recycle')" title="Recycle"  [attr.disabled]="!started() || null" (click)="onRecycle($event)">Recycle</button></li>
                        <li><button class="start" title="Start" *ngIf="allow('start')" [attr.disabled]="model.status != 'stopped' ? true : null" (click)="onStart($event)">Start</button></li>
                        <li><button class="stop" *ngIf="allow('stop')" title="Stop" [attr.disabled]="!started() || null" (click)="onStop($event)">Stop</button></li>
                        <li><button class="delete" *ngIf="allow('delete')" title="Delete" (click)="onDelete($event)">Delete</button></li>
                    </ul>
                </selector>
            </div>
        </div>
    </div>
    `,
    styles: [`
        .big {
            font-size: 16px;
        }

        .big a {
            display: inline;
            background: transparent;
        }

        span {
            overflow: hidden;
            white-space:nowrap;
        }

        .row {
            margin: 0;
        }

        [class*="col-"] {
            padding-left: 0;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }

        .actions ul {
            margin-bottom: 0;
        }

        .selector-wrapper {
            position: relative;
        }

        .v-align {
            padding-top: 6px;
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
    `]
})
export class AppPoolItem {
    @Input() model: ApplicationPool;
    @Input() actions: string = "";
    @ViewChild(Selector) private _selector: Selector;

    constructor(private _router: Router,
                @Inject("AppPoolsService") private _service: AppPoolsService,
                private _notificationService: NotificationService) {
    }

    onDelete(e: Event) {
        e.stopPropagation();
        this._selector.close();

        this._notificationService.confirm("Delete Application Pool", "Are you sure you want to delete Application Pool '" + this.model.name + "'")
            .then(confirmed => confirmed && this._service.delete(this.model));
    }

    onStart(e: Event) {
        e.stopPropagation();
        this._selector.close();
        this._service.start(this.model);
    }

    onStop(e: Event) {
        e.stopPropagation();
        this._selector.close();
        this._service.stop(this.model);
    }

    onRecycle(e: Event) {
        e.stopPropagation();
        this._selector.close();
        this._service.recycle(this.model);
    }

    identity(): string {
        if (!this.model.identity) {
            return "";
        }

        switch (this.model.identity.identity_type) {
            case ProcessModelIdentityType.LocalSystem:
                return "Local System";
            case ProcessModelIdentityType.LocalService:
                return "Local Service";
            case ProcessModelIdentityType.NetworkService:
                return "Network Service";
            case ProcessModelIdentityType.ApplicationPoolIdentity:
                return "AppPool Identity";
            case ProcessModelIdentityType.SpecificUser:
                return this.model.identity.username;
            default:
        }

        return "n/a";
    }

    runtimeVer() {
        switch (this.model.managed_runtime_version) {
            case "v2.0":
                return ".NET 3.5";
            case "v4.0":
                return ".NET 4.x";
            case "":
                return "None";
            default:
                return this.model.managed_runtime_version;
        }
    }

    allow(action: string): boolean {
        return this.actions.indexOf(action) >= 0;
    }

    started(): boolean {
        return this.model.status == 'started';
    }

    private openSelector(e: Event) {
        e.preventDefault();
        this._selector.toggle();
    }

    private prevent(e: Event) {
        e.preventDefault();
    }
}



@Component({
    selector: 'app-pool-list',
    template: `
        <div class="container-fluid">
            <div class="hidden-xs border-active grid-list-header row" [hidden]="model.length == 0">
                <label class="col-xs-7 col-sm-4 col-md-3" [ngClass]="_orderBy.css('name')" (click)="_orderBy.sort('name')">Name</label>
                <label class="col-xs-3 col-md-2" [ngClass]="_orderBy.css('status')" (click)="_orderBy.sort('status')">Status</label>
                <label class="col-md-2 hidden-sm" [ngClass]="_orderBy.css('pipeline_mode')" (click)="_orderBy.sort('pipeline_mode')">Pipeline</label>
                <label class="col-md-2" [ngClass]="_orderBy.css('managed_runtime_version')" (click)="_orderBy.sort('managed_runtime_version')">.NET Framework</label>
                <label class="col-lg-2 visible-lg">Identity</label>
            </div>
            
            <ul class="grid-list">
                <li *ngFor="let p of model | orderby: _orderBy.Field: _orderBy.Asc" (click)="onItemSelected($event, p);" (dblclick)="onDblClick($event, p)" class="hover-editing">
                    <app-pool-item [model]="p" [actions]="actions"></app-pool-item>
                </li>
            </ul>
        </div>
    `,
    styles: [`
        [class*="col-"] {
            padding-left: 0;
        }

        .container-fluid,
        .row {
            margin: 0;
            padding: 0;
        }
    `]
})
export class AppPoolList {
    @Input() model: Array<ApplicationPool>;
    @Input() actions: string = "recycle,start,stop,delete";
    @Output() itemSelected: EventEmitter<any> = new EventEmitter();

    private _orderBy: OrderBy = new OrderBy();

    constructor(@Inject("AppPoolsService") private _service: AppPoolsService,
                private _router: Router) {
    }

    private onItemSelected(e: Event, pool: ApplicationPool) {
        if (e.defaultPrevented) {
            return;
        }

        this.itemSelected.next(pool);
    }

    private onDblClick(e: Event, pool: ApplicationPool) {
        if (e.defaultPrevented) {
            return;
        }

        this._router.navigate(['webserver', 'app-pools', pool.id]);
    }
}
