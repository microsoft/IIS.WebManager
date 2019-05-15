import { Component, Input, Inject, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { WebApp } from './webapp'
import { WebAppsService } from './webapps.service';
import { WebSitesService } from '../websites/websites.service';
import { ListOperationDef, ListOperationContext } from 'common/list';
import { NotificationService } from 'notification/notification.service';
import { resolveWebAppRoute, resolveAppPoolRoute, resolveWebsiteRoute } from 'webserver/webserver-routing.module';
import { ApplicationPool } from 'webserver/app-pools/app-pool';
import { WebSite } from 'webserver/websites/site';

enum WebAppOp {
    browse, edit, delete,
}

const WebAppOperations: ListOperationDef<WebAppOp>[] = [
    new ListOperationDef<WebAppOp>(WebAppOp.browse, "Browse", "browse"),
    new ListOperationDef<WebAppOp>(WebAppOp.edit, "Edit", "edit"),
    new ListOperationDef<WebAppOp>(WebAppOp.delete, "Delete", "delete"),
]

enum WebAppFields {
    path = 1, site = 2, appPool = 4,
}

@Component({
    selector: 'webapp-item',
    template: `
<div class="row grid-item"
    [class.selected-for-edit]="selected"
    (click)="onItemSelected($event)"
    (keydown.space)="onItemSelected($event)"
    (dblclick)="onEnter($event)"
    (keydown.enter)="onEnter($event)">
    <div>
        <div class='col-xs-8 col-sm-4'>
            <div class='name'>
                <div tabindex="0" class="color-normal hover-color-active">{{model.path}}</div>
                <div>
                    <small class='physical-path' [class.hidden-xs]="field(${WebAppFields.site})">{{model.physical_path}}</small>
                    <div *ngIf="field(${WebAppFields.site})">
                        <small class='visible-xs'>{{model.website.name}}</small>
                    </div>
                </div>
            </div>
        </div>
        <ng-container *ngFor="let parent of parents">
            <div class="col-sm-2 hidden-xs valign">
                <a tabindex="0" [routerLink]="parent.route" (keydown.enter)="$event.stopPropagation()">
                    <span [ngClass]="parent.status">{{parent.name}}
                        <span *ngIf="parent.status != 'started'">({{parent.status}})</span>
                    </span>
                </a>
            </div>
        </ng-container>
        <div class='hidden-xs col-sm-4 valign overflow-visible'>
            <navigator [model]="model.website.bindings" [path]="model.path" [right]="true"></navigator>
        </div>
    <div>
</div>
    `,
    styles: [`
.name i {
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
}

.name small {
    font-size: 12px;
}

.grid-item {
    margin: 0;
}

.v-align {
    padding-top: 6px;
}
    `]
})
export class WebAppItem extends ListOperationContext<WebAppOp> implements OnInit {
    @Input() model: WebApp;
    @Input() fields: WebAppFields;
    private appUrl: string;
    private parents = [];

    constructor(
        private router: Router,
        private notifications: NotificationService,
        @Inject("WebAppsService") private apps: WebAppsService,
        @Inject("WebSitesService") private sites: WebSitesService) {
        super();
    }

    @HostListener('keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        // Disable AccessibilityManager's keyboardEvent handler due to this issue:
        // https://github.com/microsoft/IIS.WebManager/issues/360
        // Capture enter key
        if (event.keyCode === 13) {
            event.stopPropagation();
        }
    }

    ngOnInit(): void {
        let siteUrl = this.sites.getDefaultUrl(this.model.website);
        if (siteUrl) {
            this.appUrl = new URL(this.model.path, siteUrl).href;
        }
        if (this.field(WebAppFields.site)) {
            this.parents.push(
                { ...this.model.website, route: resolveWebsiteRoute(this.model.website.id) },
            );
        }
        if (this.field(WebAppFields.appPool)) {
            this.parents.push(
                { ...this.model.application_pool, route: resolveAppPoolRoute(this.model.application_pool.id) },
            );
        }
    }

    get appPoolRoute() {
        return [resolveAppPoolRoute(this.model.application_pool.id)];
    }

    getTitle(op: ListOperationDef<WebAppOp>): string {
        if (op.id == WebAppOp.browse) {
            return this.appUrl || `${super.getTitle(op)} (unavailable)`;
        }
        return super.getTitle(op);
    }

    isDisabled(op: ListOperationDef<WebAppOp>) {
        if (op.id == WebAppOp.browse && !this.appUrl) {
            return true;
        }
        return null;
    }

    execute(op: ListOperationDef<WebAppOp>): Promise<any> {
        switch (op.id) {
            case WebAppOp.browse:
                return Promise.resolve(window.open(this.appUrl, '_blank'));

            case WebAppOp.edit:
                return this.router.navigate([resolveWebAppRoute(this.model.id)]);

            case WebAppOp.delete:
                return this.notifications.confirmAsync(
                    "Delete Web App",
                    `Are you sure you want to delete "${this.model.path}"?`,
                    () => this.apps.delete(this.model),
                );
        }
    }

    edit() {
        return this.router.navigate([resolveWebAppRoute(this.model.id)]);
    }


    field(f: WebAppFields) {
        return this.fields & f;
    }
}

@Component({
    selector: 'webapp-list',
    template: `
<list-operations-bar *ngIf="!canAdd" [operations]="operations" [context]="selected"></list-operations-bar>
<list-operations-bar *ngIf="canAdd" [operations]="operations" [context]="selected">
    <selector #newWebApp
        class="container-fluid list-operation-addon-view">
        <new-webapp *ngIf="newWebApp.opened"
                    [website]="website"
                    (created)="newWebApp.close()"
                    (cancel)="newWebApp.close()">
        </new-webapp>
    </selector>
    <button
        class="list-operation-addon-left add list-action-button"
        [class.background-active]="newWebApp.opened"
        (click)="newWebApp.toggle()">
        Create
    </button>
</list-operations-bar>
<div class="container-fluid">
    <div class="hidden-xs border-active grid-list-header row" [hidden]="model.length == 0">
        <label class="col-xs-8 col-sm-4" [ngClass]="css('path')" (click)="sort('path')"
            tabindex="0" aria-label="Path Header" role="button" (keyup.enter)="sort('path')" (keyup.space)="sort('path')">Path</label>
        <label class="col-sm-2" *ngIf="field(${WebAppFields.appPool})" [ngClass]="css('application_pool.name')" (click)="sort('application_pool.name')"
            tabindex="0" aria-label="Application Pool Header" role="button" (keyup.enter)="sort('application_pool.name')" (keyup.space)="sort('application_pool.name')">Application Pool</label>
        <label class="col-sm-2" *ngIf="field(${WebAppFields.site})" [ngClass]="css('website.name')" (click)="sort('website.name')"
            tabindex="0" aria-label="Web Site Header" role="button" (keyup.enter)="sort('website.name')" (keyup.space)="sort('website.name')">Web Site</label>
    </div>
    <ul class="grid-list">
        <li *ngFor="let app of model | orderby: _orderBy: _orderByAsc" class="border-color hover-editing">
            <webapp-item [model]="app" [fields]="fields" (onSelected)="onItemSelected($event)"></webapp-item>
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
export class WebAppList implements OnInit {
    @Input() appPool: ApplicationPool;
    @Input() website: WebSite;
    @Input() model: Array<WebApp>;

    fields: WebAppFields;
    private _orderBy: string;
    private _orderByAsc: boolean;
    private _selected: WebAppItem;

    constructor() {
        this.sort("path");
    }

    get canAdd() {
        return this.website;
    }

    ngOnInit(): void {
        this.fields = WebAppFields.path;
        if (!this.website) {
            this.fields |= WebAppFields.site;
        }
        if (!this.appPool) {
            this.fields |= WebAppFields.appPool;
        }
    }

    get operations() {
        return WebAppOperations;
    }

    get selected() {
        return this._selected;
    }

    onItemSelected(item: WebAppItem) {
        if (this._selected) {
            this._selected.selected = false;
        }
        this._selected = item;
    }

    field(f: WebAppFields) {
        return this.fields & f;
    }

    sort(field: string) {
        this._orderByAsc = (field == this._orderBy) ? !this._orderByAsc : true;
        this._orderBy = field;
    }

    css(field: string): any {
        if (this._orderBy == field) {
            return {
                "orderby": true,
                "desc": !this._orderByAsc
            };
        }
        return {};
    }
}
