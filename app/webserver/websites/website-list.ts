/// <reference path="../../../node_modules/@angular/core/src/core.d.ts" />

import {Component, OnInit, Input, Output, EventEmitter, Inject} from '@angular/core';
import {Router} from '@angular/router';

import {WebSite} from './site';
import {WebSitesService} from './websites.service';
import {OrderBy} from '../../common/sort.pipe';


@Component({
    selector: 'website-item',
    template: `
    <div *ngIf="model" class="row grid-item border-color">
        <div class='col-xs-8 col-sm-4 col-md-3 col-lg-3'>
            <div class='name' [class.https]="hasHttps()" [class.started]="started()">
                <span>{{model.name}}</span>
                <small class='physical-path hidden-xs' *ngIf="field('path')">{{model.physical_path}}</small>
                <small class='status visible-xs' *ngIf="field('status')">{{model.status}}</small>
            </div>
        </div>
        <div class='col-xs-3 col-sm-2 col-md-1 hidden-xs valign' *ngIf="field('status')">
            <span class='status' [ngClass]="model.status">{{model.status}}</span>
        </div>
        <div class='col-lg-2 visible-lg valign'  *ngIf="field('app-pool')">
            <div *ngIf="model.application_pool">
                <a [routerLink]="['/webserver', 'app-pools', model.application_pool.id]">
                    <span class="block" [ngClass]="model.application_pool.status">{{model.application_pool.name}}
                        <span class="status" *ngIf="model.application_pool.status != 'started'">  ({{model.application_pool.status}})</span>
                    </span>
                </a>
            </div>
        </div>
        <div class='col-xs-4 col-xs-push-1 col-sm-3 col-md-3 valign' *ngIf="allow('browse')">
            <navigator [model]="model.bindings" [right]="true"></navigator>
        </div>
        <div class="actions">
            <button class="hidden-xs" *ngIf="allow('start')" title="Start" [attr.disabled]="model.status != 'stopped' || null" (click)="onStart($event)">
                <i class="fa fa-play green"></i>
            </button>
            <button class="hidden-xs" *ngIf="allow('stop')" title="Stop" [attr.disabled]="!started() || null" (click)="onStop($event)">
                <i class="fa fa-stop red"></i>
            </button>
            <button class="hidden-xs" *ngIf="allow('delete')" title="Delete" (click)="onDelete($event)">
                <i class="fa fa-trash-o red"></i>
            </button>
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
        }

        .name > span:first-of-type {
            display: block;
        }

        .name.https .status:after {
            font-family: FontAwesome;
            content: "\\f023";
            padding-left: 5px;
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
    `]
})
export class WebSiteItem {
    @Input() model: WebSite;
    @Input() actions: string = "";
    @Input() fields: string = "name,path,status,app-pool";

    @Output() start: EventEmitter<any> = new EventEmitter<any>();
    @Output() stop: EventEmitter<any> = new EventEmitter<any>();
    @Output() delete: EventEmitter<any> = new EventEmitter<any>();

    constructor(@Inject("WebSitesService") private _service: WebSitesService) {
    }
        
    private onDelete(e: Event) {
        e.preventDefault();

        if (confirm("Are you sure you want to delete '" + this.model.name + "'?")) {
            this._service.delete(this.model);
        }
    }

    private onStart(e: Event) {
        e.preventDefault();
        this._service.start(this.model);
    }

    private onStop(e: Event) {
        e.preventDefault();
        this._service.stop(this.model);
    }

    private onBrowse(e: Event) {
        e.preventDefault();
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
}



@Component({
    selector: 'website-list',
    template: `
        <div class="container-fluid">
            <div class="hidden-xs border-active grid-list-header row" [hidden]="model.length == 0">
                <label class="col-xs-8 col-sm-4 col-md-3 col-lg-3" [ngClass]="_orderBy.css('name')" (click)="_orderBy.sort('name')">Name</label>
                <label class="col-xs-3 col-md-1 col-lg-1" [ngClass]="_orderBy.css('status')" (click)="_orderBy.sort('status')">Status</label>
                <label class="col-lg-2 visible-lg" *ngIf="hasField('app-pool')" [ngClass]="_orderBy.css('application_pool.name')" (click)="_orderBy.sort('application_pool.name')">Application Pool</label>
            </div>
            <ul class="grid-list">
                <li *ngFor="let s of model | orderby: _orderBy.Field: _orderBy.Asc" (click)="onItemClicked($event, s)" class="hover-editing">
                    <website-item [model]="s" [actions]="actions" [fields]="fields"></website-item>
                </li>
            </ul>
        </div>
    `,
    styles: [`
        li:hover {
            cursor: pointer;
        }

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
    @Input() actions: string = "browse,start,stop,delete";
    @Output() itemSelected: EventEmitter<any> = new EventEmitter();

    private _orderBy: OrderBy = new OrderBy();

    constructor(private _router: Router) {
    }

    private onItemClicked(e: Event, site: WebSite) {
        if (e.defaultPrevented) {
            return;
        }

        if (this.itemSelected.observers.length > 0) {
            this.itemSelected.emit(site);
        }
        else {
            this._router.navigate(['webserver', 'websites', site.id]);
        }
    }

    private hasField(field: string): boolean {
        return this.fields.indexOf(field) >= 0;
    }
}