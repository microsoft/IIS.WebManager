import { Component, Input, Output, EventEmitter, ViewChildren, QueryList, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';

import { Selector } from '../../common/selector';

import { ApiFile } from '../../files/file';
import { WebSite, Binding } from './site';
import { WebSitesService } from './websites.service';
import { BindingList } from './binding-list.component';

import { AppPoolListComponent } from '../app-pools/app-pool-list.component';
import { AppPoolsService } from '../app-pools/app-pools.service';


@Component({
    selector: 'website-general',
    template: `
        <tabs>
            <tab [name]="'Settings'">
                <fieldset>
                    <label>Name</label>
                    <input class="form-control name" type="text" [(ngModel)]="site.name" throttle (modelChanged)="onModelChanged()" required/>
                </fieldset>
                <fieldset class="path">
                    <label>Physical Path</label>
                    <button title="Select Folder" [class.background-active]="fileSelector.isOpen()" class="right select" (click)="fileSelector.toggle()"></button>
                    <div class="fill">
                        <input type="text" class="form-control" [(ngModel)]="site.physical_path" (modelChanged)="onModelChanged()" throttle required />
                    </div>
                    <server-file-selector #fileSelector [types]="['directory']" (selected)="onSelectPath($event)"></server-file-selector>
                </fieldset>
                <fieldset>
                    <label>Auto Start</label>
                    <switch class="block" [(model)]="site.server_auto_start" (modelChanged)="onModelChanged()">{{site.server_auto_start ? "On" : "Off"}}</switch>
                </fieldset>
                <fieldset class="inline-block">
                    <label>Custom Protocols</label>
                    <switch class="block" [(model)]="custom_protocols" (modelChange)="useCustomProtocols($event)">{{custom_protocols ? "On" : "Off"}}</switch>
                </fieldset>
                <fieldset class="inline-block" *ngIf="custom_protocols">
                    <label>Protocols</label>
                    <input class="form-control" type="text" [(ngModel)]="site.enabled_protocols" (modelChanged)="onModelChanged()" required throttle />
                </fieldset>
                <section>
                    <div class="collapse-heading" data-toggle="collapse" data-target="#applicationPool">
                        <h2>Application Pool</h2>
                    </div>
                    <div id="applicationPool" class="collapse in">
                        <fieldset *ngIf="site.application_pool" class="hover-editing pointer" [routerLink]="['/webserver', 'app-pools', site.application_pool.id]">
                            <app-pool-item [model]="site.application_pool" [actions]="'recycle,start,stop'"></app-pool-item>
                        </fieldset>
                        <button [class.background-active]="poolSelect.opened" (click)="selectAppPool()">Select <i class="fa fa-caret-down"></i></button>
                        <selector #poolSelect class="container-fluid">
                            <app-pools #appPools [actions]="'view'" [lazy]="true" (itemSelected)="onAppPoolSelected($event)"></app-pools>
                        </selector>
                    </div>
                </section>
            </tab>
            <tab [name]="'Bindings'">
                <binding-list *ngIf="site.bindings" [(model)]="site.bindings" (modelChange)="onModelChanged()"></binding-list>
            </tab>
            <tab [name]="'Limits'">
                <limits [model]="site.limits" (modelChanged)="onModelChanged()"></limits>
            </tab>
        </tabs>
    `
})
export class WebSiteGeneralComponent {
    @Input() site: WebSite;
    @Output() modelChanged: EventEmitter<any> = new EventEmitter();


    @ViewChild('poolSelect') poolSelect: Selector;
    @ViewChild('appPools') appPools: AppPoolListComponent;
    @ViewChildren(NgModel) validators: QueryList<NgModel>;

    custom_protocols: boolean;

    ngOnInit() {
        this.custom_protocols = !(this.site.enabled_protocols.toLowerCase() == "http" ||
                                  this.site.enabled_protocols.toLowerCase() == "https");
    }

    onModelChanged() {
        if (this.isValid()) {

            // Bubble up model changed event to parent
            this.modelChanged.emit(null);
        }
    }

    isValid() {

        // Check all validators provided by ngModel
        if (this.validators) {
            let vs = this.validators.toArray();
            for (var control of vs) {
                if (!control.valid) {
                    return false;
                }
            }
        }

        return true;
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

        this.onModelChanged();
    }

    useCustomProtocols(value: boolean) {
        if (!value) {
            this.site.enabled_protocols = "http";
            this.onModelChanged();
        }
    }

    private onSelectPath(event: Array<ApiFile>) {
        if (event.length == 1) {
            this.site.physical_path = event[0].physical_path;
            this.onModelChanged();
        }
    }
}
