import { Component, Input, Output, OnInit, OnDestroy, EventEmitter, QueryList, ViewChildren, OnChanges, SimpleChange, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { DiffUtil } from '../../utils/diff';
import { FileExtension } from './request-filtering';
import { ComponentUtil } from '../../utils/component';
import { RequestFilteringService } from './request-filtering.service';

@Component({
    selector: 'file-extension',
    template: `
        <div *ngIf="model" class="grid-item row" [class.background-editing]="_editing">

            <fieldset class="col-xs-8 col-sm-4">
                <label class="visible-xs">Extension</label>
                <label class="hidden-xs" [hidden]="!_editing">Extension</label>
                <i aria-hidden="true" class="sme-icon sme-icon-completedSolid green hidden-xs" *ngIf="model.allow && !_editing"></i>
                <i aria-hidden="true" class="sme-icon sme-icon-blocked red hidden-xs" *ngIf="!model.allow && !_editing"></i>
                <input autofocus class="form-control" *ngIf="_editing" type="text" [disabled]="locked" [(ngModel)]="model.extension" throttle required />
                <span *ngIf="!_editing">{{model.extension}}</span>
                <div *ngIf="!_editing">
                    <br class="visible-xs" />
                </div>
            </fieldset>

            <fieldset class="col-xs-12 col-sm-4">
                <label class="visible-xs">Allowed</label>
                <label class="hidden-xs" [hidden]="!_editing">Allowed</label>
                <span *ngIf="!_editing">{{model.allow ? "Allow" : "Deny"}}</span>
                <switch class="block" *ngIf="_editing" [disabled]="locked" [(model)]="model.allow">{{model.allow ? "Allow" : "Deny"}}</switch>
            </fieldset>

            <div class="actions">
                <button class="no-border" *ngIf="!_editing" [class.inactive]="!_editable" title="Edit" (click)="onEdit()">
                    <i aria-hidden="true" class="sme-icon sme-icon-edit color-active"></i>
                </button>
                <button class="no-border" *ngIf="_editing" [disabled]="!isValid() || locked" title="Ok" (click)="onSave()">
                    <i aria-hidden="true" class="sme-icon sme-icon-accept color-active"></i>
                </button>
                <button class="no-border" title="Cancel" *ngIf="_editing" (click)="onDiscard()">
                    <i aria-hidden="true" class="sme-icon sme-icon-clear red"></i>
                </button>
                <button class="no-border" *ngIf="model.id" [disabled]="locked" title="Delete" [class.inactive]="!_editable" (click)="onDelete()">
                    <i aria-hidden="true" class="sme-icon sme-icon-delete red"></i>
                </button>
            </div>

        </div>
    `,
    styles: [`
        .grid-item:not(.background-editing) fieldset {
            padding-top: 5px;
            padding-bottom: 0;
        }

        .sme-icon-completedSolid,
        .sme-icon-blocked {
            font-size: 20px;
            margin-right: 10px;
        }
    `]
})
export class FileExtensionComponent implements OnInit, OnChanges {
    @Input() model: FileExtension;
    @Input() locked: boolean;

    @Output() enter: EventEmitter<any> = new EventEmitter();
    @Output() leave: EventEmitter<any> = new EventEmitter();

    private _original: FileExtension;
    private _editing: boolean;
    private _editable: boolean = true;

    constructor(private _eRef: ElementRef, private _service: RequestFilteringService) {
    }

    public ngOnInit() {
        this._original = JSON.parse(JSON.stringify(this.model));

        if (this.model) {
            if (!this.model.extension) {
                this._editing = true;
                this.scheduleScroll();
            }
        }
    }

    public ngOnChanges(changes: { [key: string]: SimpleChange; }): any {
        if (changes["model"]) {
            this.setModel(changes["model"].currentValue);
        }
    }

    public setEditable(val: boolean) {
        this._editable = val;
    }

    private onEdit() {
        this.enter.emit(null);
        this._editing = true;
        this.scheduleScroll();
    }

    private onDelete() {
        if (confirm("Are you sure you want to delete this extension?\nExtension: " + this.model.extension)) {
            this._service.deleteFileExtension(this.model);
        }
    }

    private onSave() {
        if (!this.isValid()) {
            return;
        }

        this._editing = false;
        if (this.model.id) {
            let changes = DiffUtil.diff(this._original, this.model);
            if (Object.keys(changes).length > 0) {
                this._service.updateFileExtension(this.model, changes)
                    .then(() => this.setModel(this.model));
            }
        }
        else {
            this._service.addFileExtension(this.model);
        }
        this.leave.emit(null);
    }

    private onDiscard() {
        if (this._editing) {

            let keys = Object.keys(this._original);
            for (var key of keys) {
                this.model[key] = JSON.parse(JSON.stringify(this._original[key] || null));
            }

            this._editing = false;
            this.leave.emit(null);
        }
    }

    private isValid(): boolean {
        return !!this.model.extension;
    }

    private scheduleScroll() {
        setTimeout(() => {
            ComponentUtil.scrollTo(this._eRef);
        });
    }

    private setModel(model: FileExtension) {
        this.model = model;
        this._original = JSON.parse(JSON.stringify(this.model));
    }
}

@Component({
    selector: 'file-extensions',
    template: `
        <div *ngIf="extensions">
            <button class="create" (click)="onAdd()" [disabled]="locked" [class.inactive]="_editing"><i aria-hidden="true" class="sme-icon sme-icon-add color-active"></i><span>Add</span></button>

            <div class="container-fluid" [hidden]="!extensions || extensions.length < 1">
                <div class="row hidden-xs border-active grid-list-header">
                    <label class="col-xs-12 col-sm-4">Extension</label>
                    <label class="col-xs-12 col-sm-4">Action</label>
                </div>
            </div>

            <ul class="grid-list container-fluid">
                <li *ngIf="_newExtension">
                    <file-extension [model]="_newExtension" [locked]="locked" (leave)="onLeaveNew()"></file-extension>
                </li>
                <li *ngFor="let fe of extensions; let i = index;">
                    <file-extension [model]="fe" [locked]="locked" (enter)="onEnter()" (leave)="onLeave()"></file-extension>
                </li>
            </ul>
        </div>
    `
})
export class FileExtensionsComponent implements OnInit, OnDestroy {
    @Input() extensions: Array<FileExtension> = [];
    @Input() locked: boolean;

    @ViewChildren(FileExtensionComponent) extensionComponents: QueryList<FileExtensionComponent>;

    private _editing: boolean;
    private _newExtension: FileExtension;
    private _subscriptions: Array<Subscription> = [];

    constructor(private _service: RequestFilteringService) {
    }

    public ngOnInit() {
        this._subscriptions.push(this._service.fileExtensions.subscribe(extensions => this.extensions = extensions));
    }

    public ngOnDestroy() {
        this._subscriptions.forEach(sub => sub.unsubscribe());
    }

    private onAdd() {
        if (this._newExtension) {
            return;
        }

        this.setEditable(false);

        this._newExtension = new FileExtension();
        this._newExtension.extension = '';
        this._newExtension.allow = false;
    }

    private setEditable(val: boolean) {
        this._editing = !val;
        let extensions = this.extensionComponents.toArray();
        extensions.forEach((extension, i) => {
            extension.setEditable(val);
        });
    }

    private onEnter() {
        this.setEditable(false);
    }

    private onLeave() {
        this.setEditable(true);
    }

    private onLeaveNew() {
        this._newExtension = null;
        this.setEditable(true);
    }
}
