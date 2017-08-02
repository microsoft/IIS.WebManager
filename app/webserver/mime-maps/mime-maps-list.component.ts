import { Component, OnInit, OnChanges, OnDestroy, SimpleChange, Input, Output, EventEmitter, ViewChildren, QueryList, ElementRef } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { DiffUtil } from '../../utils/diff';
import { ComponentUtil } from '../../utils/component';
import { MimeMap } from '../static-content/static-content';
import { StaticContentService } from '../static-content/static-content.service';

@Component({
    selector: 'mime-map',
    template: `        
        <div *ngIf="model" class="grid-item row" [class.background-editing]="_editing">

            <div class="actions">
                <button *ngIf="!_editing" class="no-border" [class.inactive]="!_editable" title="Edit" (click)="onEdit()">
                    <i class="fa fa-pencil color-active"></i>
                </button>
                <button *ngIf="_editing" class="no-border" [disabled]="!isValid(model)" title="Ok" (click)="onSave()">
                    <i class="fa fa-check color-active"></i>
                </button>
                <button *ngIf="_editing" class="no-border" title="Cancel" (click)="onDiscard()">
                    <i class="fa fa-times red"></i>
                </button>
                <button class="no-border" *ngIf="model.id" title="Delete" [class.inactive]="!_editable" (click)="onDelete()">
                    <i class="fa fa-trash-o red"></i>
                </button>
            </div>

            <fieldset class="col-xs-8 col-sm-3 col-md-4">
                <label class="visible-xs">File Extension</label>
                <label class="hidden-xs" *ngIf="_editing">File Extension</label>
                <input *ngIf="_editing" class="form-control" type="text" [(ngModel)]="model.file_extension" throttle required />
                <span *ngIf="!_editing">{{model.file_extension}}</span>
                <div *ngIf="!_editing">
                    <br class="visible-xs" />
                </div>
            </fieldset>

            <fieldset class="col-xs-12 col-sm-5 col-md-4">
                <label class="visible-xs">Mime Type</label>
                <label class="hidden-xs" *ngIf="_editing">Mime Type</label>
                <input *ngIf="_editing" class="form-control" type="text" [(ngModel)]="model.mime_type" throttle required />
                <span *ngIf="!_editing">{{model.mime_type}}</span>
            </fieldset>

        </div>
    `,
    styles: [`
        .grid-item:not(.background-editing) fieldset {
            padding-top: 5px;
            padding-bottom: 0;
        }
    `]
})
export class MimeMapListItem implements OnInit, OnChanges {
    @Input() model: MimeMap;

    @Output() enter: EventEmitter<any> = new EventEmitter();
    @Output() leave: EventEmitter<any> = new EventEmitter();

    private _original: MimeMap;
    private _editing: boolean;
    private _editable: boolean = true;

    constructor(private _eRef: ElementRef, private _service: StaticContentService) {
    }

    public ngOnInit() {
        this._original = JSON.parse(JSON.stringify(this.model));

        if (this.model && !this.model.id) {
            this._editing = true;
            this.scheduleScroll();
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
        if (confirm("Are you sure you want to delete this mime map?\nFile Extension: " + this.model.file_extension)) {
            this._service.deleteMap(this.model);
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
                this._service.updateMap(this.model, changes)
                    .then(() => this.setModel(this.model));
            }
        }
        else {
            this._service.addMap(this.model);
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
        return (this.model
            && !!this.model.file_extension
            && !!this.model.mime_type);
    }

    private scheduleScroll() {
        setTimeout(() => {
            ComponentUtil.scrollTo(this._eRef);
        });
    }

    private setModel(model: MimeMap) {
        this.model = model;
        this._original = JSON.parse(JSON.stringify(this.model));
    }
}


@Component({
    selector: 'mime-maps',
    template: `
        <div *ngIf="mimeMaps">
            <button class="create" (click)="onAdd()" [class.inactive]="_editing"><i class="fa fa-plus color-active"></i><span>Add</span></button>

            <div class="container-fluid" [hidden]="!mimeMaps || mimeMaps.length < 1">
                <div class="row hidden-xs border-active grid-list-header">
                    <label class="col-xs-6 col-sm-3 col-md-4">File Extension</label>
                    <label class="col-xs-6 col-sm-5 col-md-4">Mime Type</label>
                </div>
            </div>

            <ul class="grid-list container-fluid">
                <li *ngIf="_newMap">
                    <mime-map [model]="_newMap" (leave)="onLeaveNew()"></mime-map>
                </li>
                <li *ngFor="let m of mimeMaps; let i = index;">
                    <mime-map [model]="m" (enter)="onEnter()" (leave)="onLeave()"></mime-map>
                </li>
            </ul>
        </div>  
    `
})
export class MimeMapsListComponent implements OnInit, OnDestroy {
    @Input() mimeMaps: Array<MimeMap>;

    private _newMap: MimeMap;
    private _editing: boolean;
    private _subscriptions: Array<Subscription> = [];
    @ViewChildren(MimeMapListItem) private _mimeMapComponents: QueryList<MimeMapListItem>;

    constructor(private _service: StaticContentService) {
    }

    public ngOnInit() {
        this._subscriptions.push(this._service.mimeMaps.subscribe(mimeMaps => this.mimeMaps = mimeMaps));
    }

    public ngOnDestroy() {
        this._subscriptions.forEach(sub => sub.unsubscribe());
    }

    private onAdd() {
        if (this._newMap) {
            return;
        }

        this.setEditable(false);

        let mm = new MimeMap();
        mm.file_extension = "";
        mm.mime_type = "";
        this._newMap = mm;
    }

    private setEditable(val: boolean) {
        this._editing = !val;
        this._mimeMapComponents.toArray().forEach((map) => {
            map.setEditable(val);
        });
    }

    private onEnter() {
        this.setEditable(false);
    }

    private onLeave() {
        this.setEditable(true);
    }

    private onLeaveNew() {
        this._newMap = null;
        this.setEditable(true);
    }
}
