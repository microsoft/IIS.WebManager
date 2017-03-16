import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';

import {LocalModule, GlobalModule} from './modules';

@Component({
    selector: "module",
    styles: [`
        .nowrap,
        .supporting {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .actions {
            right: 0;
            top: 2px;
        }
        
        .grid-item fieldset {
            padding-top: 5px;
            padding-bottom: 0;
        }

        .fa-circle {
            margin-right: 2px;
        }

        .visible-xs-inline-block {
            margin-left: 15px;
        }
    `],
    template: `
        <div *ngIf="module" class="row grid-item" [class.background-editing]="_isEditing">

            <div class="actions" [ngClass]="actionClasses()">
                <button class="no-border" title="Ok" *ngIf="_isEditing" (click)="onFinishEditing()">
                    <i class="fa fa-check blue"></i>
                </button>
                <button class="no-border" title="Cancel" *ngIf="_isEditing" (click)="onDiscardChanges()">
                    <i class="fa fa-times red"></i>
                </button>
                <button class="no-border" title="Edit" [disabled]="!_editable" *ngIf="!_isEditing && allow('edit')" (click)="onEdit()">
                    <i class="fa fa-pencil blue"></i>
                </button>
                <button class="no-border" title="Delete" [disabled]="!_editable" *ngIf="allow('delete')" (click)="onDelete()">
                    <i class="fa fa-trash-o red"></i>
                </button>
            </div>

            <fieldset class="col-xs-8 col-sm-3">
                <label class="hidden-xs editing">Name</label>
                <div [class.stopped]="!enabled" class="nowrap">
                    <i class="fa fa-circle green" *ngIf="enabled"></i>
                    <i class="fa fa-circle-o stopped" *ngIf="!enabled"></i>
                    {{module.name}}
                </div>
            </fieldset>
            <fieldset class="nowrap col-xs-8 col-sm-4 col-md-4 col-lg-5">
                <label *ngIf="_isEditing" class="hidden-xs block">{{module.type ? "Type" : "Image"}}</label>
                <span class="visible-xs-inline-block"></span>
                <span [class.stopped]="!enabled" class="always visible-xs-inline supporting">{{displayImage_Type}}</span>
                <span [class.stopped]="!enabled" class="always hidden-xs">{{displayImage_Type}}</span>
                <div>
                    <br *ngIf="_isEditing" class="visible-xs"/>
                </div>
            </fieldset>
            <fieldset class="col-xs-8 col-sm-3 col-md-3 col-lg-2">
                <label class="editing"><span class="visible-xs-inline-block"></span>Status</label>
                <div [hidden]="!_isEditing">
                    <span class="visible-xs-inline-block"></span>
                    <switch [(model)]="enabled">{{enabled ? 'Enabled' : 'Disabled'}}</switch>
                </div>
                <span *ngIf="!_isEditing" class="visible-xs-inline-block"></span>
                <span *ngIf="!_isEditing" [class.stopped]="!enabled" [class.green]="enabled">{{enabled ? 'Enabled' : 'Disabled'}}</span>
            </fieldset>

        </div>
    `
})
export class ModuleComponent implements OnInit {

    @Input() module: LocalModule;
    @Input() enabled: boolean;
    @Input() actions: string;

    @Output() edit: EventEmitter<any> = new EventEmitter();
    @Output() delete: EventEmitter<any> = new EventEmitter();
    @Output() leave: EventEmitter<any> = new EventEmitter();
    @Output() enabledChanged: EventEmitter<any> = new EventEmitter();

    private _isEditing: boolean;
    private _editable: boolean = true;
    private _originalEnabled: boolean;

    private displayImage_Type: string;

    ngOnInit() {
        this._originalEnabled = this.enabled;

        if (this.module && this.module.type) {
            this.displayImage_Type = this.module.type;
        }
        else if (this.module && (<any>this.module).image) {
            this.displayImage_Type = (<any>this.module).image;
        }
    }

    public setEditable(val) {
        this._editable = val;
    }

    private onEdit() {
        this._isEditing = true;
        this.edit.emit(null);
    }

    private onDiscardChanges() {
        this._isEditing = false;
        this.enabled = this._originalEnabled;
        this.leave.emit(null);
    }

    private onFinishEditing() {
        this._isEditing = false;

        if (this.enabled != this._originalEnabled) {
            this.enabledChanged.emit(null);
            this._originalEnabled = this.enabled;
        }

        this.leave.emit(null);
    }

    private onDelete() {
        if (confirm("Are you sure you want to delete " + this.module.name + "?")) {
            this.delete.emit(null);
        }
    }

    private allow(action: string): boolean {
        return this.actions && this.actions.indexOf(action) >= 0;
    }

    private actionClasses() {
        return {
            "background-normal": !this._isEditing,
            "background-editing": this._isEditing
        }
    }
}

