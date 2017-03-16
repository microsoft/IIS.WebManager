
import {Component, OnInit, Input, Output, EventEmitter, Inject} from '@angular/core';
import {Router} from '@angular/router';

import {WebApp} from './webapp'
import {WebAppsService} from './webapps.service';


@Component({
    selector: 'webapp-item',
    template: `
    <div class='row grid-item'>
        <div>
            <div class='col-xs-8 col-sm-4'>
                <div class='name'>
                    <span>{{model.path}}</span>
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
            <div class='col-xs-4 col-xs-push-1 valign'>
                <navigator [model]="model.website.bindings" [path]="model.path" [right]="true"></navigator>
            </div>
        <div>
        <div class="actions">
            <button *ngIf="action('edit')" title="Edit" (click)="onEdit($event)">
                <i class="fa fa-pencil color-active"></i>
            </button>
            <button class="hidden-xs" *ngIf="action('delete')" title="Delete" (click)="onDelete($event)">
                <i class="fa fa-trash-o red"></i>
            </button>
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

        .name:first-child {
            display: block;
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

        [class*="col-"] {
            padding-left: 0;
        }

        .actions {
            padding-top: 4px;
        }
    `]
})
export class WebAppItem {
    @Input() model: WebApp;
    @Input() actions: string = "";
    @Input() fields: string = "";


    constructor(private _router: Router,
                @Inject("WebAppsService") private _service: WebAppsService) {
    }

    private onEdit(e: Event) {
        e.stopPropagation();
        this._router.navigate(['/WebServer/WebApps/WebApp', { id: this.model.id }]);
    }

    private onDelete(e: Event) {
        e.preventDefault();

        if (confirm("Are you sure you want to delete '" + this.model.location + "'?")) {
            this._service.delete(this.model);
        }
    }

    private action(action: string): boolean {
        return this.actions.indexOf(action) >= 0;
    }

    private field(f: string): boolean {
        return this.fields.indexOf(f) >= 0;
    }
}



@Component({
    selector: 'webapp-list',
    template: `
        <div class="container-fluid">
            <div class="hidden-xs border-active grid-list-header row" [hidden]="model.length == 0">
                <label class="col-xs-8 col-sm-4" [ngClass]="css('path')" (click)="sort('path')">Path</label>
                <label class="col-sm-2" *ngIf="field('app-pool')" [ngClass]="css('application_pool.name')" (click)="sort('application_pool.name')">Application Pool</label>
                <label class="col-sm-2" *ngIf="field('site')" [ngClass]="css('website.name')" (click)="sort('website.name')">Web Site</label>
            </div>
            
            <ul class="grid-list">
                <li *ngFor="let app of model | orderby: _orderBy: _orderByAsc" class="border-color hover-editing" (click)="onItemClicked($event, app)">
                    <webapp-item [model]="app" [actions]="actions" [fields]="fields"></webapp-item>
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
export class WebAppList {
    @Input() model: Array<WebApp>;
    @Input() fields: string = "path,site,app-pool";
    @Input() actions: string = "browse,delete";
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
        else {
            this._router.navigate(['webserver', 'webapps', app.id]);
        }
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
