
import { Component, Input, Output, EventEmitter, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { NgModel } from '@angular/forms';

import { Selector } from '../../common/selector';
import { ApiFile } from '../../files/file';
import { WebApp } from './webapp'
import { AppPoolItem } from '../app-pools/app-pool-list';
import { AppPoolListComponent } from '../app-pools/app-pool-list.component';


@Component({
    selector: 'webapp-general',
    template: `
        <fieldset>
            <label>Path</label>
            <input class="form-control path" type="text" [(ngModel)]="model.path" (modelChanged)="onModelChanged()" required throttle />
        </fieldset>
        <fieldset class="path">
            <label>Physical Path</label>
            <button [class.background-active]="fileSelector.isOpen()" title="Select Folder" class="right select" (click)="fileSelector.toggle()"></button>
            <div class="fill">
                <input type="text" class="form-control" [(ngModel)]="model.physical_path" required />
            </div>
            <server-file-selector #fileSelector [types]="['directory']" (selected)="onSelectPath($event)"></server-file-selector>
        </fieldset>

        <fieldset class="inline-block">
            <label>Custom Protocols</label>
            <switch class="block" [(model)]="custom_protocols" (modelChange)="useCustomProtocols($event)">{{custom_protocols ? "On" : "Off"}}</switch>
        </fieldset>
        <fieldset class="inline-block" *ngIf="custom_protocols">
            <label>Protocols</label>
            <input class="form-control" type="text" [(ngModel)]="model.enabled_protocols" (modelChanged)="onModelChanged()" required throttle />
        </fieldset>

        <section>
            <div class="collapse-heading" data-toggle="collapse" data-target="#applicationPool">
                <h2>Application Pool</h2>
            </div>
            <div id="applicationPool" class="collapse in">
                <fieldset class="app-pool">
                    <app-pool-item [model]="model.application_pool" [actions]="'view,recycle,start,stop'"></app-pool-item>
                </fieldset>
                <button [class.background-active]="poolSelect.opened" (click)="selectAppPool()">Select <i class="fa fa-caret-down"></i></button>
                <selector #poolSelect class="container-fluid">
                    <app-pools #appPools [actions]="'view'" [lazy]="true" (itemSelected)="onAppPoolSelected($event)"></app-pools>
                </selector>
            </div>
        </section>
    `
})
export class WebAppGeneralComponent {
    @Input() model: WebApp;

    @Output()
    modelChanged: EventEmitter<any> = new EventEmitter();

    @ViewChild('poolSelect') poolSelect: Selector;
    @ViewChild('appPools') appPools: AppPoolListComponent;
    @ViewChildren(NgModel) validators: QueryList<NgModel>;

    custom_protocols: boolean;

    ngOnInit() {
        this.custom_protocols = !(this.model.enabled_protocols.toLowerCase() == "http" || this.model.enabled_protocols.toLowerCase() == "https");
    }

    onModelChanged() {
        if (this.isValid()) {
            this.modelChanged.emit(this.model);
        }
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

        this.onModelChanged();
    }

    useCustomProtocols(value: boolean) {
        if (!value) {
            this.model.enabled_protocols = "http";
            this.onModelChanged();
        }
    }

    private isValid() {

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

    private onSelectPath(event: Array<ApiFile>) {
        if (event.length == 1) {
            this.model.physical_path = event[0].physical_path;
            this.onModelChanged();
        }
    }
}
