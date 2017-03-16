import {Component, Input, Output, OnInit, EventEmitter, QueryList, ViewChildren, OnChanges, SimpleChange, ElementRef} from '@angular/core';

import {FileExtension} from './request-filtering';
import {DiffUtil} from '../../utils/diff';
import {ComponentUtil} from '../../utils/component';

@Component({
    selector: 'file-extension',
    template: `
        <div *ngIf="fileExtension" class="grid-item row" [class.background-editing]="_editing">

            <div class="actions">
                <button class="no-border no-editing" [class.inactive]="!_editable" title="Edit" (click)="onEdit()">
                    <i class="fa fa-pencil color-active"></i>
                </button>
                <button class="no-border editing" [disabled]="!isValidFileExtension(fileExtension) || locked" title="Ok" (click)="finishChanges()">
                    <i class="fa fa-check color-active"></i>
                </button>
                <button class="no-border editing" title="Cancel" (click)="discardChanges()">
                    <i class="fa fa-times red"></i>
                </button>
                <button class="no-border" *ngIf="fileExtension.id" [disabled]="locked" title="Delete" [class.inactive]="!_editable" (click)="onDelete()">
                    <i class="fa fa-trash-o red"></i>
                </button>
            </div>

            <fieldset class="col-xs-8 col-sm-4">
                <label class="visible-xs">Extension</label>
                <label class="hidden-xs" [hidden]="!_editing">Extension</label>
                <i class="fa fa-circle green hidden-xs" *ngIf="fileExtension.allow && !_editing"></i>
                <i class="fa fa-ban red hidden-xs" *ngIf="!fileExtension.allow && !_editing"></i>
                <input class="form-control" type="text" [disabled]="locked" [(ngModel)]="fileExtension.extension" throttle required />
                <span>{{fileExtension.extension}}</span>
                <div *ngIf="!_editing">
                    <br class="visible-xs" />
                </div>
            </fieldset>

            <fieldset class="col-xs-12 col-sm-4">
                <label class="visible-xs">Allowed</label>
                <label class="hidden-xs" [hidden]="!_editing">Allowed</label>
                <span>{{fileExtension.allow ? "Allow" : "Deny"}}</span>
                <switch class="block" *ngIf="_editing" [disabled]="locked" [(model)]="fileExtension.allow">{{fileExtension.allow ? "Allow" : "Deny"}}</switch>
            </fieldset>

        </div>
    `,
    styles: [`
        .grid-item:not(.background-editing) fieldset {
            padding-top: 5px;
            padding-bottom: 0;
        }

        .fa-circle,
        .fa-ban {
            font-size: 20px;
            margin-right: 10px;
        }
    `]
})
export class FileExtensionComponent implements OnInit, OnChanges {
    @Input() fileExtension: FileExtension;
    @Input() locked: boolean;

    @Output() edit: EventEmitter<any> = new EventEmitter();
    @Output() delete: EventEmitter<any> = new EventEmitter();
    @Output() modelChanged: EventEmitter<any> = new EventEmitter();
    @Output() discard: EventEmitter<any> = new EventEmitter();
    
    private _original;
    private _editing;
    private _editable = true;

    constructor(private _eRef: ElementRef) {
    }

    ngOnInit() {
        this._original = JSON.parse(JSON.stringify(this.fileExtension));

        if (this.fileExtension) {

            if (!this.fileExtension.extension) {
                this._editing = true;
                this.scheduleScroll();
            }
        }
    }

    ngOnChanges(changes: { [key: string]: SimpleChange; }): any {

        if (changes["fileExtension"]) {
            this._original = JSON.parse(JSON.stringify(changes["fileExtension"].currentValue));
        }
    }

    onEdit() {
        this.edit.emit(null);
        this._editing = true;
        this.scheduleScroll();
    }

    onDelete() {
        this.delete.emit(null);
    }

    finishChanges() {

        if (!this.isValidFileExtension(this.fileExtension)) {
            return;
        }

        this._original = JSON.parse(JSON.stringify(this.fileExtension));
        this.modelChanged.emit(null);
        this._editing = false;
    }

    discardChanges() {
        if (this._editing) {

            let keys = Object.keys(this._original);
            for (var key of keys) {
                this.fileExtension[key] = JSON.parse(JSON.stringify(this._original[key]));
            }

            this._editing = false;
            this.discard.emit(null);
        }
    }

    setEditable(val: boolean) {
        this._editable = val;
    }

    isValidFileExtension(fileExtension: FileExtension): boolean {
        return !!fileExtension.extension;
    }

    scheduleScroll() {
        setTimeout(() => {
            ComponentUtil.scrollTo(this._eRef);
        });
    }
}

@Component({
    selector: 'file-extensions',
    template: `
        <div *ngIf="fileExtensions">
            <button class="create" (click)="onAdd()" [disabled]="locked" [class.inactive]="_inFileExtension"><i class="fa fa-plus color-active"></i><span>Add</span></button>

            <div class="container-fluid" [hidden]="!fileExtensions || fileExtensions.length < 1">
                <div class="row hidden-xs border-active grid-list-header">
                    <label class="col-xs-12 col-sm-4">Extension</label>
                    <label class="col-xs-12 col-sm-4">Action</label>
                </div>
            </div>

            <div class="grid-list container-fluid">
                <file-extension *ngFor="let fe of fileExtensions; let i = index;" [fileExtension]="fe" [locked]="locked" (modelChanged)="onSave(i)" (edit)="onEdit(i)" (discard)="onDiscard(i)" (delete)="onDelete(i)"></file-extension>
            </div>
        </div> 
    `
})
export class FileExtensionsComponent {
    @Input() fileExtensions: Array<FileExtension>;
    @Input() locked: boolean;

    @Output() delete: EventEmitter<any> = new EventEmitter();
    @Output() save: EventEmitter<any> = new EventEmitter();
    @Output() add: EventEmitter<any> = new EventEmitter();
    @Output() discard: EventEmitter<any> = new EventEmitter();

    @ViewChildren(FileExtensionComponent)
    fileExtensionComponents: QueryList<FileExtensionComponent>;

    private _inFileExtension: boolean;

    onSave(index: number) {
        let fileExtension = this.fileExtensions[index];

        if (fileExtension.id) {
            this.save.emit(index);
        }
        else {
            this.add.emit(index);
        }

        this.leaveFileExtension();
    }

    onAdd() {
        for (var fileExtension of this.fileExtensions) {
            if (!fileExtension.id) {
                
                return;
            }
        }

        let newFileExtension = new FileExtension();
        newFileExtension.extension = '';
        newFileExtension.allow = false;
        this.fileExtensions.unshift(newFileExtension);

        this.enterFileExtension(-1);
    }

    onEdit(index: number) {
        this.enterFileExtension(index);
    }

    onDiscard(index: number) {
        this.discard.emit(index);
        this.leaveFileExtension();

        if (!this.fileExtensions[index].id) {
            this.fileExtensions.splice(index, 1);
        }
    }

    onDelete(index: number) {
        this.delete.emit(index);
    }

    private enterFileExtension(index: number) {
        let arr = this.fileExtensionComponents.toArray();
        let uninitialized = -1;

        for (var i = 0; i < arr.length; i++) {
            if (i !== index) {
                if (arr[i].fileExtension.id) {
                    arr[i].discardChanges();
                    arr[i].setEditable(false);
                }
                else {
                    uninitialized = i;
                }
            }
        }

        if (uninitialized > -1) {
            this.fileExtensions.splice(uninitialized, 1);
        }

        this._inFileExtension = true;
    }

    private leaveFileExtension() {
        let arr = this.fileExtensionComponents.toArray();
        for (var fileExtension of arr) {
            fileExtension.setEditable(true);
        }

        this._inFileExtension = false;
    }
}
