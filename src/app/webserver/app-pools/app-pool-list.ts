import { Component, Input, Output, Inject, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { OrderBy } from 'common/sort.pipe';
import { NotificationService } from 'notification/notification.service';
import { AppPoolsService } from './app-pools.service';
import { ApplicationPool, ProcessModelIdentityType } from './app-pool';
import { ListOperationDef, ListOperationContext } from 'common/list';
import { Status } from 'common/status';
import { resolveAppPoolRoute } from 'webserver/webserver-routing.module';

enum AppPoolOp {
    recycle, start, stop, edit, delete,
}

const appPoolOperations: ListOperationDef<AppPoolOp>[] = [
    new ListOperationDef<AppPoolOp>(AppPoolOp.recycle, "Recycle", "refresh"),
    new ListOperationDef<AppPoolOp>(AppPoolOp.start, "Start", "start"),
    new ListOperationDef<AppPoolOp>(AppPoolOp.stop, "Stop", "stop"),
    new ListOperationDef<AppPoolOp>(AppPoolOp.edit, "Edit", "edit"),
    new ListOperationDef<AppPoolOp>(AppPoolOp.delete, "Delete", "delete"),
];

const actionRestrictions: Map<AppPoolOp, Status> = new Map<AppPoolOp, Status>([
    [AppPoolOp.start, Status.Stopped],
    [AppPoolOp.recycle, Status.Started],
    [AppPoolOp.stop, Status.Started],
]);


@Component({
    selector: 'app-pool-item',
    template: `
<div class="grid-item row border-color"
    [class.selected-for-edit]="selected"
    (click)="onItemClicked($event)"
    (dblclick)="onDblClick($event)">
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
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }

        .v-align {
            padding-top: 6px;
        }
    `]
})
export class AppPoolItem extends ListOperationContext<AppPoolOp> {
    @Input() model: ApplicationPool;

    constructor(
        private router: Router,
        private notifications: NotificationService,
        @Inject("AppPoolsService") private service: AppPoolsService,
    ) {
        super();
    }

    isDisabled(op: ListOperationDef<AppPoolOp>) {
        let restriction = actionRestrictions.get(op.id);
        if (restriction && this.model.status != restriction) {
            return true;
        }
        return null;
    }

    execute(op: ListOperationDef<AppPoolOp>): Promise<any> {
        switch (op.id) {
            case AppPoolOp.edit:
                return this.router.navigate([resolveAppPoolRoute(this.model.id)]);

            case AppPoolOp.start:
                return this.service.start(this.model);

            case AppPoolOp.stop:
                return this.service.stop(this.model);

            case AppPoolOp.recycle:
                return this.service.recycle(this.model);

            case AppPoolOp.delete:
                return this.notifications.confirmAsync(
                    "Delete Application Pool",
                    `Are you sure you want to delete "${this.model.name}"`,
                    () => this.service.delete(this.model),
                );
        }
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

    edit() {
        return this.router.navigate([resolveAppPoolRoute(this.model.id)]);
    }
}

@Component({
    selector: 'app-pool-list',
    template: `
<list-operations-bar [operations]="operations" [context]="selected">
    <button
        class="list-operation-addon-left add list-action-button"
        [class.background-active]="newAppPool.opened"
        (click)="newAppPool.toggle()">
        Create
    </button>
    <selector #newAppPool
            class="container-fluid list-operation-addon-view">
        <new-app-pool *ngIf="newAppPool.opened"
            (created)="newAppPool.close()"
            (cancel)="newAppPool.close()">
        </new-app-pool>
    </selector>
</list-operations-bar>
<div class="container-fluid">
    <div class="hidden-xs border-active grid-list-header row" [hidden]="model.length == 0">
        <label class="col-xs-7 col-sm-4 col-md-3" [ngClass]="_orderBy.css('name')" (click)="_orderBy.sort('name')">Name</label>
        <label class="col-xs-3 col-md-2" [ngClass]="_orderBy.css('status')" (click)="_orderBy.sort('status')">Status</label>
        <label class="col-md-2 hidden-sm" [ngClass]="_orderBy.css('pipeline_mode')" (click)="_orderBy.sort('pipeline_mode')">Pipeline</label>
        <label class="col-md-2" [ngClass]="_orderBy.css('managed_runtime_version')" (click)="_orderBy.sort('managed_runtime_version')">.NET Framework</label>
        <label class="col-lg-2 visible-lg">Identity</label>
    </div>
    <ul class="grid-list">
        <li *ngFor="let p of model | orderby: _orderBy.Field: _orderBy.Asc"
            class="hover-editing">
            <app-pool-item [model]="p" (onSelected)="onItemSelected($event)"></app-pool-item>
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
export class AppPoolList {
    @Input() model: Array<ApplicationPool>;
    @Input() listingOnly: boolean = false;
    @Output() itemSelected: EventEmitter<any> = new EventEmitter();

    _orderBy: OrderBy = new OrderBy();
    private _selected: AppPoolItem;

    onItemSelected(item: AppPoolItem) {
        if (this._selected) {
            this._selected.selected = false;
        }
        this._selected = item;
        this.itemSelected.next(item.model);
    }

    get selected() {
        return this._selected;
    }

    get operations() {
        if (this.listingOnly) {
            return [];
        }
        return appPoolOperations;
    }
}
