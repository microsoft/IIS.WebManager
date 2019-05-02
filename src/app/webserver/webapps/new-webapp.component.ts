import { Component, ViewChild, Input, Output, EventEmitter, Inject } from '@angular/core';

import { Selector } from '../../common/selector';

import { WebApp } from './webapp';
import { WebAppsService } from './webapps.service';

import { ApiFile } from '../../files/file';
import { WebSite } from '../websites/site';
import { AppPoolListComponent } from '../app-pools/app-pool-list.component';
import { AppPoolsService } from '../app-pools/app-pools.service';
import { ApplicationPool } from '../app-pools/app-pool';


@Component({
    selector: 'new-webapp',
    template: `
        <tabs>
            <tab [name]="'Settings'">
                <fieldset>
                    <label>Path</label>
                    <input autofocus type="text" class="form-control path" [(ngModel)]="model.path" required />
                </fieldset>
                <fieldset class="path">
                    <label>Physical Path</label>
                    <input type="text" class="form-control left-with-button" [(ngModel)]="model.physical_path" required />
                    <button [class.background-active]="fileSelector.isOpen()" title="Select Folder" class="select" (click)="fileSelector.toggle()"></button>
                    <server-file-selector #fileSelector [types]="['directory']" [defaultPath]="model.physical_path" (selected)="onSelectPath($event)"></server-file-selector>
                </fieldset>
            </tab>
            <tab [name]="'Application Pool'">
                <fieldset>
                    <switch label="Use Custom Application Pool" class="block" [(model)]="_customPool" (modelChange)="onNewAppPool($event)">{{_customPool ? "Yes" : "No"}}</switch>
                </fieldset>
                <div class="app-pool" *ngIf="_customPool">
                    <button [class.background-active]="poolSelect.opened" (click)="selectAppPool()">{{!model.application_pool ? "Choose Application Pool" : "Change Application Pool" }} <i class="fa fa-caret-down"></i></button>
                    <selector #poolSelect class="container-fluid create">
                        <app-pools #appPools [listingOnly]="true" [lazy]="true" (itemSelected)="onAppPoolSelected($event)"></app-pools>
                    </selector>
                    <fieldset>
                        <app-pool-details *ngIf="model.application_pool" [model]="model.application_pool"></app-pool-details>
                    </fieldset>
                </div>
            </tab>
        </tabs>
        <p class="pull-right">
            <button (click)="onSave()" [disabled]="!IsValid()">
                <i title="Create" class="fa fa-check color-active"></i> Create
            </button>
            <button (click)="onCancel()">
                <i class="fa fa-times red"></i> Cancel
            </button>
        </p>
    `,
    styles: [`
        h2 {
            margin-top: 32px;
            margin-bottom: 18px;
        }

        ul {
            margin-bottom: 32px;
        }
    `]
})
export class NewWebAppComponent {
    @Input() website: WebSite;

    @Output() created: EventEmitter<any> = new EventEmitter();
    @Output() cancel: EventEmitter<any> = new EventEmitter();

    @ViewChild('poolSelect') poolSelect: Selector;
    @ViewChild('appPools') appPools: AppPoolListComponent;

    model: WebApp;
    private _customPool: boolean = false;

    constructor(@Inject("WebAppsService") private _service: WebAppsService) {
    }

    ngOnInit() {
        this.reset();
    }

    onSave() {
        this._service.create(this.model)
            .then(app => {
                this.reset();
                this.created.emit(app);
            });
    }

    onCancel() {
        this.reset();
        this.cancel.emit(null);
    }

    private onNewAppPool(value: boolean) {
        if (!value) {
            this.model.application_pool = this.website.application_pool;
        }
    }

    private IsValid(): boolean {
        return !(!this.model.path || !this.model.physical_path);
    }

    private reset() {
        let app = new WebApp();
        app.path = "";
        app.physical_path = "";
        app.website = this.website;
        app.application_pool = this.website.application_pool;

        this.model = app;
    }

    selectAppPool() {
        this.poolSelect.toggle();

        if (this.poolSelect.opened) {
            this.appPools.activate();
        }
    }

    onAppPoolSelected(pool) {
        this.poolSelect.close();

        if (this.model.application_pool && this.model.application_pool.id == pool.id) {
            return;
        }

        this.model.application_pool = pool;
    }

    private onSelectPath(event: Array<ApiFile>) {
        if (event.length == 1) {
            this.model.physical_path = event[0].physical_path;
        }
    }
}
