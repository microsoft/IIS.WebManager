import {Component, Input, Output, EventEmitter, OnInit, ViewChildren, QueryList} from '@angular/core';

import {LocalModule, GlobalModule} from './modules'
import {ModuleComponent} from './module.component'

@Component({
    selector: 'module-list',
    template: `
        <button class="create" (click)="create()" [class.inactive]="_creating">
            <i title="New Module" class="fa fa-plus color-active"></i><span>Add</span>
        </button>

        <div class="container-fluid">
            <div class="row hidden-xs border-active grid-list-header">
                <label class="col-xs-12 col-sm-3">Name</label>
                <label class="col-sm-5 col-md-5 col-lg-6">Image/Type</label>
                <label class="col-xs-12 col-sm-2">Status</label>
            </div>
        </div>

        <div class="grid-list container-fluid">

            <new-module *ngIf="_creating" (cancel)="onCancelNew()" [isServerSetting]="isServerSetting" (saveNative)="onSaveNative($event)" (saveManaged)="onSaveManaged($event)"></new-module>

            <module *ngFor="let mModule of managedModules; let i = index;" [module]="mModule" (delete)="removeManaged(i)" [enabled]="true" [actions]="'delete'">
            </module>

            <module *ngFor="let nModule of enabledNativeModules; let i = index;" [module]="nModule"
                                                                                        [enabled]="true"
                                                                                        [actions]="_nativeActions"
                                                                                        (enabledChanged)="disableNative(i)"
                                                                                        (delete)="removeEnabled(i)"
                                                                                        (edit)="onEdit()"
                                                                                        (leave)="onLeave()">
            </module>

            <module *ngFor="let nModule of disabledNativeModules; let i = index;" [module]="nModule"
                                                                                         [enabled]="false"
                                                                                         [actions]="_nativeActions"
                                                                                         (enabledChanged)="enableNative(i)"
                                                                                         (delete)="removeDisabled(i)"
                                                                                         (edit)="onEdit()"
                                                                                         (leave)="onLeave()">
            </module>
        </div>
    `
})
export class ModuleListComponent implements OnInit {

    @Input() enabledNativeModules: Array<GlobalModule>;
    @Input() disabledNativeModules: Array<GlobalModule>;
    @Input() managedModules: Array<LocalModule>;
    @Input() isServerSetting: boolean;
    @Input() locked: boolean;

    @Output() removeM: EventEmitter<any> = new EventEmitter();
    @Output() removeE: EventEmitter<any> = new EventEmitter();
    @Output() removeD: EventEmitter<any> = new EventEmitter();
    @Output() enable: EventEmitter<any> = new EventEmitter();
    @Output() disable: EventEmitter<any> = new EventEmitter();
    @Output() saveManaged: EventEmitter<any> = new EventEmitter();
    @Output() saveNative: EventEmitter<any> = new EventEmitter();

    @ViewChildren(ModuleComponent)
    moduleComponents: QueryList<ModuleComponent>;
    
    private _creating: boolean;
    private _nativeActions = "edit";

    ngOnInit() {
        if (this.isServerSetting) {
            this._nativeActions += ",delete";
        }
    }

    removeManaged(index) {
        this.removeM.emit(index);
    }

    removeEnabled(index) {
        this.removeE.emit(index);
    }

    removeDisabled(index) {
        this.removeD.emit(index);
    }

    enableNative(index) {
        this.enable.emit(index);
    }

    disableNative(index) {
        this.disable.emit(index);
    }

    create() {
        this._creating = true;
        this.setEditable(false);
    }

    private onEdit() {
        this.setEditable(false);
    }

    private onLeave() {
        this.setEditable(true);
    }

    private onCancelNew() {
        this._creating = false;
        this.setEditable(true);
    }

    private onSaveManaged(module) {
        this.saveManaged.emit(module);
        this._creating = false;
        this.setEditable(true);
    }

    private onSaveNative(module) {
        this.saveNative.emit(module);
        this._creating = false;
        this.setEditable(true);
    }

    private setEditable(val) {
        let comps = this.moduleComponents.toArray()

        for (var comp of comps) {
            comp.setEditable(val);
        }
    }
}

