import { Component, ViewChild, Output, EventEmitter, Inject } from '@angular/core';
import { Subject } from 'rxjs/Subject'

import { Selector } from '../../common/selector';
import { FileSelectorComponent } from '../../files/file-selector.component';

import { ApiFile } from '../../files/file';
import { WebSite, Binding } from './site';
import { WebSitesService } from './websites.service';
import { AppPoolListComponent } from '../app-pools/app-pool-list.component';
import { AppPoolsService } from '../app-pools/app-pools.service';
import { ApplicationPool } from '../app-pools/app-pool';


@Component({
    selector: 'new-website',
    template: `
        <fieldset>
            <label>Name</label>
            <input type="text" class="form-control name" [ngModel]="site.name" (ngModelChange)="onNameChange($event)" required />
        </fieldset>
        <fieldset class="path">
            <label>Physical Path</label>
            <button [class.background-active]="fileSelector.isOpen()" title="Select Folder" class="right select" (click)="fileSelector.toggle()"></button>
            <div class="fill">
                <input type="text" class="form-control" [(ngModel)]="site.physical_path" required />
            </div>
            <server-file-selector #fileSelector [types]="['directory']" (selected)="onSelectPath($event)"></server-file-selector>
        </fieldset>

        <section>
            <div class="collapse-heading" data-toggle="collapse" data-target="#bindings">
                <h2>Bindings</h2>
            </div>
            <div id="bindings" class="collapse in">
                <binding-list #bindingList [(model)]="site.bindings"></binding-list>
            </div>
        </section>

        <section>
            <div class="collapse-heading collapsed" data-toggle="collapse" data-target="#applicationPool">
                <h2>Application Pool</h2>
            </div>
            <div id="applicationPool" class="collapse">
                <fieldset>
                    <label>Create Own Application Pool</label>
                    <switch class="block" [(model)]="_createAppPool" (modelChange)="onNewAppPool($event)">{{_createAppPool ? "Yes" : "No"}}</switch>
                </fieldset>
                <div *ngIf="!_createAppPool">
                    <fieldset>
                        <app-pool-item [model]="site.application_pool" [actions]="'view,recycle,start,stop'"></app-pool-item>
                    </fieldset>
                    <button [class.background-active]="poolSelect.opened" (click)="selectAppPool()">Select <i class="fa fa-caret-down"></i></button>
                    <selector #poolSelect class="container-fluid">
                        <app-pools #appPools [actions]="'view'" [lazy]="true" (itemSelected)="onAppPoolSelected($event)"></app-pools>
                    </selector>
                </div>
            </div>
        </section>

        <p class="pull-right">
            <button (click)="onSave()" [disabled]="!IsValid() || bindingList.isEditing()">
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
export class NewWebSiteComponent {
    site: WebSite;
    private _createAppPool: boolean = true;

    private _nameChange: Subject<string> = new Subject<string>();

    @Output() created: EventEmitter<any> = new EventEmitter();
    @Output() cancel: EventEmitter<any> = new EventEmitter();

    @ViewChild('poolSelect') poolSelect: Selector;
    @ViewChild('appPools') appPools: AppPoolListComponent;


    constructor(@Inject("WebSitesService") private _service: WebSitesService,
        @Inject("AppPoolsService") private _appPoolService: AppPoolsService) {
        this.reset();
        //
        // Check for existing app pool by name
        this._nameChange.subscribe(name => {
            this._appPoolService.getAll()
                .then(pools => {
                    pools.forEach(pool => {
                        if (pool.name.toUpperCase() === name.toUpperCase()) {
                            this.site.application_pool = pool;
                            this._createAppPool = false;
                            if (this.poolSelect) {
                                this.poolSelect.close();
                            }
                        }
                    });
                });
        });
    }

    onSave() {
        if (this._createAppPool) {
            //
            // Create AppPool
            let appPool = new ApplicationPool();
            appPool.name = this.site.name;

            this._appPoolService.create(appPool).then(p => {
                //
                // Create Site
                this.site.application_pool = p;

                this._service.create(this.site)
                    .then((s) => {
                        this.reset();
                        this.created.emit(s);
                    }).catch(e => {
                        // We created an application pool but could not create the site.
                        // The AppPool should be deleted.
                        this._appPoolService.delete(p);
                        throw e;
                    });
            });
        }
        else {
            this._service.create(this.site)
                .then((s) => {
                    this.reset();
                    this.created.emit(s);
                });
        }
    }

    onCancel() {
        this.reset();
        this.cancel.emit(null);
    }

    private onNewAppPool(value: boolean) {
        if (!value) {
            this.site.application_pool = null;
        }
    }

    private IsValid(): boolean {
        return !(!this.site.name || !this.site.physical_path || this.site.bindings.length == 0);
    }

    private reset() {
        let site = new WebSite();

        site = new WebSite();
        site.name = "";
        site.physical_path = "";
        site.bindings = new Array<Binding>();

        let binding: Binding = {
            hostname: "",
            port: 80,
            ip_address: "*",
            is_https: false,
            certificate: null,
            binding_information: null,
            protocol: "http"
        };

        site.bindings.unshift(binding);

        this.site = site;
        this._createAppPool = true;
    }

    private onNameChange(val: string) {
        this.site.name = val;
        this._nameChange.next(val);
    }

    selectAppPool() {
        this.poolSelect.toggle();

        if (this.poolSelect.opened) {
            this.appPools.activate();
        }
    }

    onAppPoolSelected(pool) {
        this.poolSelect.close();

        if (this.site.application_pool && this.site.application_pool.id == pool.id) {
            return;
        }

        this.site.application_pool = pool;
    }

    private onSelectPath(event: Array<ApiFile>) {
        if (event.length == 1) {
            this.site.physical_path = event[0].physical_path;
        }
    }
}