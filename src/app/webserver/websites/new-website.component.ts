import { Component, ViewChild, Output, EventEmitter, Inject } from '@angular/core';
import { Subject } from 'rxjs'
import { Selector } from '../../common/selector';
import { ApiFile } from '../../files/file';
import { WebSite, Binding } from './site';
import { WebSitesService } from './websites.service';
import { AppPoolListComponent } from '../app-pools/app-pool-list.component';
import { AppPoolsService } from '../app-pools/app-pools.service';
import { ApplicationPool } from '../app-pools/app-pool';


@Component({
    selector: 'new-website',
    template: `
        <tabs>
            <tab [name]="'Settings'">
                <fieldset>
                    <label>Name</label>
                    <input autofocus type="text" class="form-control name" [ngModel]="site.name" (ngModelChange)="onNameChange($event)" required />
                </fieldset>
                <fieldset class="path">
                    <label>Physical Path</label>
                    <input type="text" class="form-control left-with-button" [(ngModel)]="site.physical_path" required />
                    <button [class.background-active]="fileSelector.isOpen()" title="Select Folder" class="left select" (click)="fileSelector.toggle()"></button>
                    <server-file-selector #fileSelector [types]="['directory']" [defaultPath]="site.physical_path" (selected)="onSelectPath($event)"></server-file-selector>
                </fieldset>
            </tab>
            <tab [name]="'Bindings'">
                <binding-list #bindingList [(model)]="site.bindings"></binding-list>
            </tab>
            <tab [name]="'Application Pool'">
                <fieldset>
                    <switch label="Create Own Application Pool" class="block" [(model)]="_createAppPool" (modelChange)="onNewAppPool($event)">{{_createAppPool ? "Yes" : "No"}}</switch>
                </fieldset>
                <div class="app-pool" *ngIf="!_createAppPool">
                    <button [class.background-active]="poolSelect.opened" (click)="selectAppPool()">{{!site.application_pool ? "Choose Application Pool" : "Change Application Pool" }} <i class="fa fa-caret-down"></i></button>
                    <selector #poolSelect class="container-fluid create">
                        <app-pools #appPools [listingOnly]="true" [lazy]="true" (itemSelected)="onAppPoolSelected($event)"></app-pools>
                    </selector>
                    <fieldset>
                        <app-pool-details *ngIf="site.application_pool" [model]="site.application_pool"></app-pool-details>
                    </fieldset>
                </div>
            </tab>
        </tabs>
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

        p {
            margin: 10px 0;
        }

        .app-pool > button {
            margin-top: 10px;
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
            setTimeout(() => this.selectAppPool(), 10);
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
            protocol: "http",
            require_sni: false,
            isNew: true
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
