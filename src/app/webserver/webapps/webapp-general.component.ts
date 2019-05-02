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
        <tabs>
            <tab [name]="'Settings'">
                <fieldset>
                    <label>Path</label>
                    <input class="form-control path" type="text" [(ngModel)]="model.path" (modelChanged)="onModelChanged()" required throttle />
                </fieldset>
                <fieldset class="path">
                    <label>Physical Path</label>
                    <input type="text" class="form-control left-with-button" [(ngModel)]="model.physical_path" (modelChanged)="onModelChanged()" required />
                    <button [class.background-active]="fileSelector.isOpen()" title="Select Folder" class="select" (click)="fileSelector.toggle()"></button>
                    <server-file-selector #fileSelector [types]="['directory']" [defaultPath]="model.physical_path" (selected)="onSelectPath($event)"></server-file-selector>
                </fieldset>

                <fieldset class="inline-block">
                    <switch label="Custom Protocols" class="block" [(model)]="custom_protocols" (modelChange)="useCustomProtocols($event)">{{custom_protocols ? "On" : "Off"}}</switch>
                </fieldset>
                <fieldset class="inline-block" *ngIf="custom_protocols">
                    <label>Protocols</label>
                    <input class="form-control" type="text" [(ngModel)]="model.enabled_protocols" (modelChanged)="onModelChanged()" required throttle />
                </fieldset>
            </tab>
            <tab [name]="'Application Pool'">
                <button [class.background-active]="poolSelect.opened" (click)="selectAppPool()">Change Application Pool <i class="fa fa-caret-down"></i></button>
                <selector #poolSelect class="container-fluid create">
                    <app-pools #appPools [listingOnly]="true" [lazy]="true" (itemSelected)="onAppPoolSelected($event)"></app-pools>
                </selector>
                <app-pool-details [model]="model.application_pool"></app-pool-details>
            </tab>
        </tabs>
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
