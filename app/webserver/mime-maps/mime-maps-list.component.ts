import {Component, OnInit, SimpleChange, Input, Output, EventEmitter, ViewChildren, QueryList, ElementRef} from '@angular/core';

import {ComponentUtil} from '../../utils/component';

import {MimeMap} from '../static-content/static-content';

@Component({
    selector: 'mime-map',
    styles: [`
        .grid-item:not(.background-editing) fieldset {
            padding-top: 5px;
            padding-bottom: 0;
        }
    `],
    template: `        
        <div *ngIf="mimeMap" class="grid-item row" [class.background-editing]="_editing">

            <div class="actions">
                <button class="no-border no-editing" [class.inactive]="!_editable" title="Edit" (click)="onEdit()">
                    <i class="fa fa-pencil color-active"></i>
                </button>
                <button class="no-border editing" [disabled]="!isValid(mimeMap)" title="Ok" (click)="finishChanges()">
                    <i class="fa fa-check color-active"></i>
                </button>
                <button class="no-border editing" title="Cancel" (click)="discardChanges()">
                    <i class="fa fa-times red"></i>
                </button>
                <button class="no-border" *ngIf="mimeMap.id" title="Delete" [class.inactive]="!_editable" (click)="onDelete()">
                    <i class="fa fa-trash-o red"></i>
                </button>
            </div>

            <fieldset class="col-xs-8 col-sm-3 col-md-4">
                <label class="visible-xs">File Extension</label>
                <label class="hidden-xs" [hidden]="!_editing">File Extension</label>
                <input class="form-control" type="text" [(ngModel)]="mimeMap.file_extension" throttle required />
                <span>{{mimeMap.file_extension}}</span>
                <div *ngIf="!_editing">
                    <br class="visible-xs" />
                </div>
            </fieldset>

            <fieldset class="col-xs-12 col-sm-5 col-md-4">
                <label class="visible-xs">Mime Type</label>
                <label class="hidden-xs" [hidden]="!_editing">Mime Type</label>
                <input class="form-control" type="text" [(ngModel)]="mimeMap.mime_type" throttle required />
                <span>{{mimeMap.mime_type}}</span>
            </fieldset>

        </div>
    `
})
export class MimeMapListItem {
    @Input() mimeMap: MimeMap;

    @Output()
    edit: EventEmitter<any> = new EventEmitter();
    @Output()
    delete: EventEmitter<any> = new EventEmitter();
    @Output()
    modelChanged: EventEmitter<any> = new EventEmitter();
    @Output()
    discard: EventEmitter<any> = new EventEmitter();

    private _original: MimeMap;
    private _editing: boolean;
    private _editable = true;

    constructor(private _eRef: ElementRef) {
    }

    ngOnInit() {
        this._original = JSON.parse(JSON.stringify(this.mimeMap));

        if (this.mimeMap && !this.mimeMap.id) {
            this._editing = true;
            this.scheduleScroll();
        }
    }

    ngOnChanges(changes: { [key: string]: SimpleChange; }): any {

        if (changes["mimeMap"]) {
            this._original = JSON.parse(JSON.stringify(changes["mimeMap"].currentValue));
        }
    }

    onEdit() {
        this.edit.emit(null);
        this._editing = true;
        this.scheduleScroll();
    }

    onDelete() {
        if (confirm("Are you sure you want to delete this mime map?\nFile Extension: " + this.mimeMap.file_extension)) {
            this.delete.emit(null);
        }
    }

    finishChanges() {

        if (!this.isValid()) {
            return;
        }

        this._original = JSON.parse(JSON.stringify(this.mimeMap));
        this.modelChanged.emit(null);
        this._editing = false;
    }

    discardChanges() {
        if (this._editing) {

            let keys = Object.keys(this._original);
            for (var key of keys) {
                this.mimeMap[key] = JSON.parse(JSON.stringify(this._original[key] || null));
            }

            this._editing = false;
            this.discard.emit(null);
        }
    }

    setEditable(val: boolean) {
        this._editable = val;
    }

    private isValid(): boolean {
        return (this.mimeMap
            && !!this.mimeMap.file_extension
            && !!this.mimeMap.mime_type);
    }

    private scheduleScroll() {
        setTimeout(() => {
            ComponentUtil.scrollTo(this._eRef);
        });
    }
}


@Component({
    selector: 'mime-maps',
    template: `
        <div *ngIf="mimeMaps">
            <button class="create" (click)="onAdd()" [class.inactive]="_inItem"><i class="fa fa-plus color-active"></i><span>Add</span></button>

            <div class="container-fluid" [hidden]="!mimeMaps || mimeMaps.length < 1">
                <div class="row hidden-xs border-active grid-list-header">
                    <label class="col-xs-6 col-sm-3 col-md-4">File Extension</label>
                    <label class="col-xs-6 col-sm-5 col-md-4">Mime Type</label>
                </div>
            </div>

            <div class="grid-list container-fluid">
                <mime-map *ngIf="_newMap" [mimeMap]="_newMap" (modelChanged)="onSaveNew()" (discard)="onDiscardNew()"></mime-map>
                <mime-map *ngFor="let m of mimeMaps; let i = index;" [mimeMap]="m" (modelChanged)="onSave(i)" (edit)="onEdit(i)" (discard)="onDiscard(i)" (delete)="onDelete(i)"></mime-map>
            </div>
        </div>  
    `
})
export class MimeMapsListComponent {
    @Input()
    mimeMaps: Array<MimeMap>;

    @Output()
    add: EventEmitter<any> = new EventEmitter();
    @Output()
    delete: EventEmitter<any> = new EventEmitter();
    @Output()
    modelChanged: EventEmitter<any> = new EventEmitter();
    @Output()
    discard: EventEmitter<any> = new EventEmitter();

    @ViewChildren(MimeMapListItem)
    mimeMapComponents: QueryList<MimeMapListItem>;

    private _newMap: MimeMap;
    private _inItem: boolean;

    onSave(index: number) {
        this.modelChanged.emit(index);
        this.leaveMimeMap();
    }

    onSaveNew() {
        this.mimeMaps.unshift(this._newMap);
        this.add.emit(0);
        this._newMap = null;
        this.leaveMimeMap();
    }

    onAdd() {
        let mm = new MimeMap();
        mm.file_extension = "";
        mm.mime_type = "";
        this._newMap = mm;

        this.enterMimeMap(-1);
    }

    onEdit(index: number) {
        this.enterMimeMap(index);
    }

    onDiscard(index: number) {
        this.discard.emit(index);
        this.leaveMimeMap();

        if (!this.mimeMaps[index].id) {
            this.delete.emit(index);
        }
    }

    onDiscardNew() {
        this.leaveMimeMap();
        this._newMap = null;
    }

    onDelete(index: number) {
        this.delete.emit(index);
    }

    private enterMimeMap(index: number) {
        let arr = this.mimeMapComponents.toArray();
        let uninitialized = -1;

        for (var i = 0; i < arr.length; i++) {
            if (i !== index) {
                if (arr[i].mimeMap.id) {
                    arr[i].discardChanges();
                    arr[i].setEditable(false);
                }
                else {
                    uninitialized = i;
                }
            }
        }

        if (uninitialized > -1) {
            this.mimeMaps.splice(uninitialized, 1);
        }

        this._inItem = true;
    }

    private leaveMimeMap() {
        let arr = this.mimeMapComponents.toArray();
        for (var rule of arr) {
            rule.setEditable(true);
        }

        this._inItem = false;
    }
}