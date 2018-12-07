import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';

import {LocalModule, GlobalModule, ModuleType} from './modules';

@Component({
    selector: 'new-module',
    template: `
        <div class="grid-item background-editing row">
            <div class="col-lg-10 col-md-10 col-sm-8 col-xs-6 overflow-visible">
                <fieldset class="col-xs-8" *ngIf="isServerSetting">
                    <enum [(model)]="moduleType">
                        <field name="Managed" value="managed"></field>
                        <field name="Native" value="native"></field>
                    </enum>
                </fieldset>
                <div class="col-xs-12" *ngIf="isServerSetting"></div>
                <div class="col-xs-12" *ngIf="moduleType != 'native'">
                    <fieldset>
                        <label>Name</label>
                        <input autofocus class="form-control" type="text" [(ngModel)]="newManagedModule.name" throttle required />
                    </fieldset>
                    <fieldset>
                        <label>Type</label>
                        <input class="form-control" type="text" [(ngModel)]="newManagedModule.type" throttle required />
                    </fieldset>
                </div>
                <div class="col-xs-12" *ngIf="moduleType == 'native'">
                    <fieldset *ngIf="moduleType == 'native'">
                        <label>Name</label>
                        <input autofocus class="form-control" type="text" [(ngModel)]="newNativeModule.name" throttle required />
                    </fieldset>
                    <fieldset *ngIf="moduleType == 'native'">
                        <label>Image</label>
                        <input class="form-control" type="text" [(ngModel)]="newNativeModule.image" throttle required />
                    </fieldset>
                </div>
            </div>
            <div class="actions">
                <button class="no-border" [disabled]="!isValid()" (click)="onSave()">
                    <i class="fa fa-check color-active" title="Save"></i>
                </button>
                <button class="no-border" (click)="onCancel()">
                    <i class="fa fa-times red" title="Cancel"></i>
                </button>
            </div>            
        </div>
    `
})
export class NewModuleComponent implements OnInit {
    @Input() isServerSetting: boolean;

    @Output() cancel: EventEmitter<any> = new EventEmitter();
    @Output() saveManaged: EventEmitter<any> = new EventEmitter();
    @Output() saveNative: EventEmitter<any> = new EventEmitter();

    newManagedModule: LocalModule;
    newNativeModule: GlobalModule;
    moduleType: any = "managed";

    private _creating: boolean = false;

    ngOnInit() {
        this.reset();
    }

    create() {
        this._creating = true;
    }

    onCancel() {
        this.reset();
        this.cancel.emit(null);
    }

    onSave() {
        if (this.isValidNativeModule()) {
            this.saveNative.emit(this.newNativeModule);
            this.reset();
        }
        else if (this.isValidManagedModule()) {
            this.saveManaged.emit(this.newManagedModule);
            this.reset();
        }
    }

    private isValid() {
        return this.isValidManagedModule() || this.isValidNativeModule();
    }

    private isValidNativeModule(): boolean {
        return this.moduleType == "native"
            && this.isServerSetting
            && this.newNativeModule.name != ""
            && this.newNativeModule.image != "";
    }

    private isValidManagedModule(): boolean {
        return this.moduleType == "managed"
            && this.newManagedModule.name != ""
            && this.newManagedModule.type != "";
    }

    private reset() {
        this.newManagedModule = new LocalModule();
        this.newNativeModule = new GlobalModule();
        this.newManagedModule.name = "";
        this.newManagedModule.type = "";
        this.newNativeModule.name = "";
        this.newNativeModule.image = "";
        this._creating = false;
        this.moduleType = "managed";
    }
}

