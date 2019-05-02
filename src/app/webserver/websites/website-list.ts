import { Component, OnInit, Input, Output, EventEmitter, ViewChild, Inject, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { WebSite } from './site';
import { OrderBy, SortPipe } from 'common/sort.pipe';
import { Range } from 'common/virtual-list.component';
import { Status } from 'common/status';
import { resolveWebsiteRoute } from 'webserver/webserver-routing.module';
import { WebSitesService } from './websites.service';
import { NotificationService } from 'notification/notification.service';
import { ListOperationDef, ListOperationContext } from 'common/list';
import { LoggerFactory, Logger, LogLevel } from 'diagnostics/logger';

enum WebSiteOp {
    browse = 0, start, stop, edit, delete,
}

const WebSiteOperations: ListOperationDef<WebSiteOp>[] = [
    new ListOperationDef<WebSiteOp>(WebSiteOp.browse, "Browse", "browse"),
    new ListOperationDef<WebSiteOp>(WebSiteOp.start, "Start", "start"),
    new ListOperationDef<WebSiteOp>(WebSiteOp.stop, "Stop", "stop"),
    new ListOperationDef<WebSiteOp>(WebSiteOp.edit, "Edit", "edit"),
    new ListOperationDef<WebSiteOp>(WebSiteOp.delete, "Delete", "delete"),
]

const actionRestrictions: Map<WebSiteOp, Status> = new Map<WebSiteOp, Status>([
    [WebSiteOp.start, Status.Stopped],
    [WebSiteOp.stop, Status.Started],
]);

@Component({
    selector: 'website-item',
    template: `
<div class="row grid-item border-color"
    [class.selected-for-edit]="selected"
    (click)="onItemClicked($event)"
    (dblclick)="onDblClick($event)">
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
    <div class=' hidden-xs col-xs-4 col-xs-push-1 col-sm-3 col-md-3 valign overflow-visible'>
        <navigator [model]="model.bindings" [right]="true"></navigator>
    </div>
</div>
    `,
    styles: [`
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

        .actions {
            padding-top: 4px;
        }
    `]
})
export class WebSiteItem extends ListOperationContext<WebSiteOp> {
    @Input() model: WebSite;
    @Input() fields: Set<string>;
    @Output() onSelected: EventEmitter<WebSiteItem> = new EventEmitter();
    selected: boolean = false;
    urlCache: string;

    constructor(
        private router: Router,
        private notifications: NotificationService,
        @Inject("WebSitesService") private service: WebSitesService,
    ) {
        super();
    }

    @HostListener('keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if (event.keyCode === 13) {
            // Disable AccessibilityManager's keyboardEvent handler due to this issue:
            // https://github.com/microsoft/IIS.WebManager/issues/360
            event.stopPropagation();
        }
    }


    started() {
        return this.model.status == Status.Started;
    }

    field(f: string): boolean {
        return this.fields.has(f);
    }
    
    getTitle(op: ListOperationDef<WebSiteOp>): string {
        if (op.id == WebSiteOp.browse) {
            return this.url;
        }
        return super.getTitle(op);
    }

    get url() {
        return this.urlCache || (this.urlCache = this.service.getUrl(this.model.bindings[0]));
    }

    isDisabled(op: ListOperationDef<WebSiteOp>) {
        let restriction = actionRestrictions.get(op.id);
        if (restriction && this.model.status != restriction) {
            return true;
        }
        return null;
    }

    execute(op: ListOperationDef<WebSiteOp>): Promise<any> {
        switch (op.id) {
            case WebSiteOp.browse:
                return Promise.resolve(window.open(this.url, '_blank'));

            case WebSiteOp.start:
                return this.service.start(this.model);

            case WebSiteOp.stop:
                return this.notifications.confirmAsync(
                    "Stop Web Site",
                    `Are you sure you want to stop "${this.model.name}"?`,
                    () => this.service.stop(this.model),
                );

            case WebSiteOp.edit:
                return this.router.navigate([resolveWebsiteRoute(this.model.id)]);

            case WebSiteOp.delete:
                return this.notifications.confirmAsync(
                    "Delete Web Site",
                    `Are you sure you want to delete "${this.model.name}"?`,
                    () => this.service.delete(this.model),
                );
        }
    }

    hasHttps(): boolean {
        for (var i = 0; i < this.model.bindings.length; ++i) {
            if (this.model.bindings[i].is_https) {
                return true;
            }
        }
        return false;
    }

    onItemClicked(e: Event) {
        if (e.defaultPrevented) {
            return;
        }
        this.selected = true;
        if (this.onSelected.observers.length > 0) {
            this.onSelected.emit(this);
        }
    }

    onDblClick(e: Event) {
        if (e.defaultPrevented) {
            return;
        }
        this.router.navigate([resolveWebsiteRoute(this.model.id)]);
    }
}

export enum Perspective {
    WebServer = 1, AppPool,
}

const perspectives = new Map<Perspective, Set<string>>([
    [Perspective.AppPool, new Set<string>(["name", "path", "status"])],
    [Perspective.WebServer, new Set<string>(["name", "path", "status", "app-pool"])],
])

@Component({
    selector: 'website-list',
    template: `
<list-operations-bar *ngIf="!canAdd" [operations]="operations" [context]="selected"></list-operations-bar>
<list-operations-bar *ngIf="canAdd" [operations]="operations" [context]="selected">
    <selector
        class="container-fluid list-operation-addon-view"
        #newWebSite>
        <new-website
            *ngIf="newWebSite.opened"
            (created)="newWebSite.close()"
            (cancel)="newWebSite.close()">
        </new-website>
    </selector>
    <button
        class="list-operation-addon-left add list-action-button"
        [class.background-active]="newWebSite.opened"
        (click)="newWebSite.toggle()">
        Create
    </button>
</list-operations-bar>
<div class="container-fluid">
    <div class="hidden-xs border-active grid-list-header row" [hidden]="model.length == 0">
        <label class="col-xs-8 col-sm-4 col-md-3 col-lg-3" [ngClass]="_orderBy.css('name')" (click)="doSort('name')"
            tabindex="0" aria-label="Name Header" role="button" (keyup.enter)="doSort('name')" (keyup.space)="doSort('name')">Name</label>
        <label class="col-xs-3 col-md-1 col-lg-1" [ngClass]="_orderBy.css('status')" (click)="doSort('status')"
            tabindex="0" aria-label="Status Header" role="button" (keyup.space)="doSort('status')" (keyup.enter)="doSort('status')">Status</label>
        <label class="col-lg-2 visible-lg" *ngIf="hasField('app-pool')" [ngClass]="_orderBy.css('application_pool.name')" (click)="doSort('application_pool.name')"
            tabindex="0" aria-label="Application Pool Header" role="button" (keyup.enter)="doSort('application_pool.name')" (keyup.space)="doSort('application_pool.name')">Application Pool</label>
    </div>
    <virtual-list class="grid-list"
                *ngIf="model"
                [count]="model.length"
                (rangeChange)="onRangeChange($event)">
        <li class="hover-editing" tabindex="-1" *ngFor="let s of _view">
            <website-item [model]="s" [fields]="fields" (onSelected)="onItemSelected($event)"></website-item>
        </li>
    </virtual-list>
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
export class WebSiteList {
    @Input() model: Array<WebSite>;
    @Input() perspective: Perspective = Perspective.WebServer;

    private _selected: WebSiteItem;
    private _orderBy: OrderBy = new OrderBy();
    private _sortPipe: SortPipe = new SortPipe();
    private _range: Range = new Range(0, 0);
    private _view: Array<WebSite> = [];
    private _fields: Set<string>;

    constructor(
        @Inject("WebSitesService") private service: WebSitesService,
    ){}

    public ngOnInit() {
        this.onRangeChange(this._range);
        this._fields = perspectives.get(this.perspective)
    }

    get canAdd() {
        return this.perspective == Perspective.WebServer && this.service.installStatus != Status.Stopped;
    }

    get operations() {
        return WebSiteOperations;
    }

    get selected() {
        return this._selected;
    }

    get fields() {
        return this._fields;
    }

    onItemSelected(item: WebSiteItem) {
        if (this._selected) {
            this._selected.selected = false;
        }
        this._selected = item;
    }

    hasField(field: string): boolean {
        return this._fields.has(field);
    }

    onRangeChange(range: Range) {
        Range.fillView(this._view, this.model, range);
        this._range = range;
    }

    doSort(field: string) {
        this._orderBy.sort(field);
        this._sortPipe.transform(this.model, this._orderBy.Field, this._orderBy.Asc, null, true);
        this.onRangeChange(this._range);
    }
}
