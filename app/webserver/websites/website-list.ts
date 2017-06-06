import { Component, OnInit, Input, Output, EventEmitter, ViewChild, Inject } from '@angular/core';
import { Router } from '@angular/router';

import { Selector } from '../../common/selector';
import { WebSite } from './site';
import { WebSitesService } from './websites.service';
import { OrderBy, SortPipe } from '../../common/sort.pipe';
import { Range } from '../../common/virtual-list.component';
import { NotificationService } from '../../notification/notification.service';

@Component({
    selector: 'website-item',
    template: `
    <div *ngIf="model" class="row grid-item border-color">
        <div class='col-xs-7 col-sm-4 col-md-3 col-lg-3'>
            <div class='name'>
                <a class="color-normal hover-color-active" [routerLink]="['/webserver/websites', model.id]">{{model.name}}</a>
                <small class='physical-path' *ngIf="field('path')">{{model.physical_path}}</small>
            </div>
        </div>
        <div class='col-xs-3 col-sm-2 col-md-1 valign' *ngIf="field('status')">
            <span class='status' [ngClass]="model.status">{{model.status}}</span>
            <span title="HTTPS is ON" class="visible-xs-inline https" *ngIf="hasHttps()"></span>
        </div>
        <div class='col-lg-2 visible-lg valign'  *ngIf="field('app-pool')">
            <div *ngIf="model.application_pool">
                <a [routerLink]="['/webserver', 'app-pools', model.application_pool.id]">
                    <span [ngClass]="model.application_pool.status">{{model.application_pool.name}}
                        <span class="status" *ngIf="model.application_pool.status != 'started'">  ({{model.application_pool.status}})</span>
                    </span>
                </a>
            </div>
        </div>
        <div class=' hidden-xs col-xs-4 col-xs-push-1 col-sm-3 col-md-3 valign overflow-visible' *ngIf="allow('browse')">
            <navigator [model]="model.bindings" [right]="true"></navigator>
        </div>
        <div class="actions">
            <div class="selector-wrapper">
                <button title="More" (click)="openSelector($event)" (dblclick)="prevent($event)" [class.background-active]="(_selector && _selector.opened) || false">
                    <i class="fa fa-ellipsis-h"></i>
                </button>
                <selector [right]="true">
                    <ul>
                        <li *ngIf="allow('edit')"><a class="bttn edit" [routerLink]="['/webserver/websites', model.id]">Edit</a></li>
                        <li *ngIf="allow('browse')"><a class="bttn link" href={{url}} title={{url}}>Browse</a></li>
                        <li *ngIf="allow('start')"><button class="start" [attr.disabled]="model.status != 'stopped' || null" (click)="onStart($event)">Start</button></li>
                        <li *ngIf="allow('stop')"><button class="stop" [attr.disabled]="!started() || null" (click)="onStop($event)">Stop</button></li>
                        <li *ngIf="allow('delete')"><button class="delete" (click)="onDelete($event)">Delete</button></li>
                    </ul>
                </selector>
            </div>
        </div>
    </div>
    `,
    styles: [`
        button {
            border: none;
            display: inline-flex;
        }

        .name {
            font-size: 16px;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
        }

        .https:after {
            font-family: FontAwesome;
            content: "\\f023";
            padding-left: 5px;
        }

        a {
            background: transparent;
            display: inline;
        }

        .status {
            text-transform: capitalize;
        }
        
        .name small {
            font-size: 12px;
        }

        .name .physical-path {
            text-transform: lowercase;
        }

        .row {
            margin: 0;
        }

        [class*="col-"] {
            padding-left: 0;
        }

        .actions {
            padding-top: 4px;
        }

        .selector-wrapper {
            position: relative;
        }

        selector {
            position:absolute;
            right:0;
            top: 32px;
        }

        selector button,
        selector .bttn {
            min-width: 125px;
            width: 100%;
        }
    `]
})
export class WebSiteItem {
    @Input() model: WebSite;
    @Input() actions: string = "";
    @Input() fields: string = "name,path,status,app-pool";

    @Output() start: EventEmitter<any> = new EventEmitter<any>();
    @Output() stop: EventEmitter<any> = new EventEmitter<any>();
    @Output() delete: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild(Selector) private _selector: Selector;
    private _url: string;

    constructor(@Inject("WebSitesService") private _service: WebSitesService,
                private _notificationService: NotificationService) {
    }

    private get url() {
        if (!this._url && this.model.bindings.length > 0) {
            this._url = this._service.getUrl(this.model.bindings[0]);
        }

        return this._url;
    }
        
    private onDelete(e: Event) {
        e.preventDefault();
        this._selector.close();

        this._notificationService.confirm("Delete Web Site", "Are you sure you want to delete '" + this.model.name + "'?")
            .then(confirmed => confirmed && this._service.delete(this.model));
    }

    private onStart(e: Event) {
        e.preventDefault();
        this._selector.close();
        this._service.start(this.model);
    }

    private onStop(e: Event) {
        e.preventDefault();
        this._selector.close();
        this._service.stop(this.model);
    }

    private allow(action: string): boolean {
        return this.actions.indexOf(action) >= 0;
    }

    private started() {
        return this.model.status == 'started';
    }

    private field(f: string): boolean {
        return this.fields.indexOf(f) >= 0;
    }

    private hasHttps(): boolean {
        for (var i = 0; i < this.model.bindings.length; ++i) {
            if (this.model.bindings[i].is_https) {
                return true;
            }
        }
        return false;
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
    selector: 'website-list',
    template: `
        <div class="container-fluid">
            <div class="hidden-xs border-active grid-list-header row" [hidden]="model.length == 0">
                <label class="col-xs-8 col-sm-4 col-md-3 col-lg-3" [ngClass]="_orderBy.css('name')" (click)="doSort('name')">Name</label>
                <label class="col-xs-3 col-md-1 col-lg-1" [ngClass]="_orderBy.css('status')" (click)="doSort('status')">Status</label>
                <label class="col-lg-2 visible-lg" *ngIf="hasField('app-pool')" [ngClass]="_orderBy.css('application_pool.name')" (click)="doSort('application_pool.name')">Application Pool</label>
            </div>
            <virtual-list class="grid-list"
                        *ngIf="model"
                        [count]="model.length"
                        (rangeChange)="onRangeChange($event)">
                <li class="hover-editing" tabindex="-1" *ngFor="let s of _view">
                    <website-item (click)="onItemClicked($event, s)" (dblclick)="onDblClick($event, s)" [model]="s" [actions]="actions" [fields]="fields"></website-item>
                </li>
            </virtual-list>
        </div>
    `,
    styles: [`
        .grid-list-header [class*="col-"] {
            padding-left: 0;
        }

        .container-fluid,
        .row {
            margin: 0;
            padding: 0;
        }
    `]
})
export class WebSiteList {
    @Input() model: Array<WebSite>;
    @Input() fields: string = "name,path,status,app-pool";
    @Input() actions: string = "edit,browse,start,stop,delete";
    @Output() itemSelected: EventEmitter<any> = new EventEmitter();

    private _orderBy: OrderBy = new OrderBy();
    private _sortPipe: SortPipe = new SortPipe();
    private _range: Range = new Range(0, 0);
    private _view: Array<WebSite> = [];

    constructor(private _router: Router) {
    }

    public ngOnInit() {
        this.onRangeChange(this._range);
    }

    private onItemClicked(e: Event, site: WebSite) {
        if (e.defaultPrevented) {
            return;
        }

        if (this.itemSelected.observers.length > 0) {
            this.itemSelected.emit(site);
        }
    }

    private onDblClick(e: Event, site: WebSite) {
        if (e.defaultPrevented) {
            return;
        }

        this._router.navigate(['webserver', 'websites', site.id]);
    }

    private hasField(field: string): boolean {
        return this.fields.indexOf(field) >= 0;
    }

    private onRangeChange(range: Range) {
        Range.fillView(this._view, this.model, range);
        this._range = range;
    }

    private doSort(field: string) {
        this._orderBy.sort(field);
        this._sortPipe.transform(this.model, this._orderBy.Field, this._orderBy.Asc, null, true);
        this.onRangeChange(this._range);
    }
}
