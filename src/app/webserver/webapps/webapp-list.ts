import { Component, Input, Output, EventEmitter, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { WebApp } from './webapp'
import { WebAppsService } from './webapps.service';
import { WebSitesService } from '../websites/websites.service';

@Component({
    selector: 'webapp-item',
    template: `
    <div class='row grid-item'>
        <div>
            <div class='col-xs-8 col-sm-4'>
                <div class='name'>
                    <a class="color-normal hover-color-active" [routerLink]="['/webserver/webapps', model.id]">{{model.path}}</a>
                    <div>
                        <div *ngIf="field('app-pool')">
                            <small class='physical-path'>{{model.physical_path}}</small>
                        </div>
                        <div *ngIf="field('site')">
                            <small class='physical-path hidden-xs'>{{model.physical_path}}</small>
                            <small class='visible-xs'>{{model.website.name}}</small>
                        </div>
                    </div>
                </div>
            </div>
            <div class='col-sm-2 hidden-xs valign' *ngIf="field('app-pool')">
                <div *ngIf='model.application_pool'>
                    <span class="block">{{model.application_pool.name}}<span class="status" *ngIf="model.application_pool.status != 'started'">  ({{model.application_pool.status}})</span></span>
                </div>
            </div>
            <div class='col-sm-2 hidden-xs valign' *ngIf="field('site')">
                <div *ngIf='model.website'>
                    <span class="block">{{model.website.name}}<span class="status" *ngIf="model.website.status != 'started'">  ({{model.website.status}})</span></span>
                </div>
            </div>
            <div class='hidden-xs col-sm-4 valign overflow-visible'>
                <navigator [model]="model.website.bindings" [path]="model.path" [right]="true"></navigator>
            </div>
        <div>
        <div class="list-actions">
            <a *ngIf="action('browse')" title="Browse" class="list-action-button bttn link" href={{url}} title={{url}} target="_blank"></a>
            <button [attr.disabled]="!action('edit') || null" title="Edit" class="list-action-button edit" (click)="onEdit($event)"></button>
            <button [attr.disabled]="!action('delete') || null" title="Delete" class="list-action-button delete" (click)="onDelete($event)"></button>
        </div>
    </div>
    `,
    styles: [`
        .name i {   
            display: block;
            float: left;
            font-size: 18px;
            padding-right: 10px;
            padding-top: 3px;
        }

        .name i.visible-xs {
            font-size: 26px;
            margin-top: 3px;
        }

        .name {
            font-size: 16px;
            max-width: 100%;
        }

        .name small {
            font-size: 12px;
        }

        .name .physical-path {
            text-transform: lowercase;
        }

        .grid-item {
            margin: 0;
        }

        .actions {
            padding-top: 4px;
        }

        a {
            background: transparent;
            display: inline;
        }

        .v-align {
            padding-top: 6px;
        }
    `]
})
export class WebAppItem {
    @Input() model: WebApp;
    @Input() actions: string = "";
    @Input() fields: string = "";
    private _url: string;

    constructor(private _router: Router,
        @Inject("WebAppsService") private _service: WebAppsService,
        @Inject("WebSitesService") private _siteService: WebSitesService) {
    }

    get url() {
        if (!this.model.website || this.model.website.bindings.length == 0) {
            return "";
        }

        if (!this._url) {
            this._url = this._siteService.getUrl(this.model.website.bindings[0]) + this.model.path;
        }

        return this._url;
    }

    onDelete(e: Event) {
        e.preventDefault();
        if (confirm("Are you sure you want to delete '" + this.model.location + "'?")) {
            this._service.delete(this.model);
        }
    }

    onEdit(e: Event) {
        e.stopPropagation();
        this._router.navigate(['webserver', 'webapps', this.model.id]);
    }

    action(action: string): boolean {
        return this.actions.indexOf(action) >= 0;
    }

    field(f: string): boolean {
        return this.fields.indexOf(f) >= 0;
    }
}


@Component({
    selector: 'webapp-list',
    template: `
        <div class="container-fluid">
            <div class="hidden-xs border-active grid-list-header row" [hidden]="model.length == 0">
                <label class="col-xs-8 col-sm-4" [ngClass]="css('path')" (click)="sort('path')"
                    tabindex="0" aria-label="Path Header" role="button" (keyup.enter)="sort('path')" (keyup.space)="sort('path')">Path</label>
                <label class="col-sm-2" *ngIf="field('app-pool')" [ngClass]="css('application_pool.name')" (click)="sort('application_pool.name')"
                    tabindex="0" aria-label="Application Pool Header" role="button" (keyup.enter)="sort('application_pool.name')" (keyup.space)="sort('application_pool.name')">Application Pool</label>
                <label class="col-sm-2" *ngIf="field('site')" [ngClass]="css('website.name')" (click)="sort('website.name')"
                    tabindex="0" aria-label="Web Site Header" role="button" (keyup.enter)="sort('website.name')" (keyup.space)="sort('website.name')">Web Site</label>
            </div>
            
            <ul class="grid-list">
                <li *ngFor="let app of model | orderby: _orderBy: _orderByAsc" class="border-color hover-editing" (click)="onItemClicked($event, app)">
                    <webapp-item [model]="app" [actions]="actions" (dblclick)="onDblClick($event, app)" [fields]="fields"></webapp-item>
                </li>
            </ul>
        </div>
    `,
    styles: [`
        .container-fluid,
        .row {
            margin: 0;
            padding: 0;
        }
    `]
})
export class WebAppList {
    @Input() model: Array<WebApp>;
    @Input() fields: string = "path,site,app-pool";
    @Input() actions: string = "edit,browse,delete";
    @Output() itemSelected: EventEmitter<any> = new EventEmitter();

    private _orderBy: string;
    private _orderByAsc: boolean;

    constructor(private _router: Router) {
        this.sort("path");
    }

    private onItemClicked(e: Event, app: WebApp) {
        if (e.defaultPrevented) {
            return;
        }

        if (this.itemSelected.observers.length > 0) {
            this.itemSelected.emit(app);
        }
    }

    private onDblClick(e: Event, app: WebApp) {
        if (e.defaultPrevented) {
            return;
        }

        this._router.navigate(['webserver', 'webapps', app.id]);
    }

    private field(f: string): boolean {
        return this.fields.indexOf(f) >= 0;
    }

    private sort(field: string) {
        this._orderByAsc = (field == this._orderBy) ? !this._orderByAsc : true;
        this._orderBy = field;
    }

    private css(field: string): any {
        if (this._orderBy == field) {
            return {
                "orderby": true,
                "desc": !this._orderByAsc
            };
        }

        return {};
    }
}
