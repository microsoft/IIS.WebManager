import { NgModule, Component, OnInit, OnChanges, Input, Output, EventEmitter, SimpleChange, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Module as AutoFocus } from './focus';
import { Module as Validators } from './validators';

@Component({
    selector: 'string-list',
    template: `        
        <fieldset *ngIf="useAddButton">
            <button (click)="onAdd()"><i class="fa fa-plus color-active"></i><span>Add</span></button>
        </fieldset>
        <div *ngIf='list.length > 0'>
            <ul class="grid-list container-fluid">
                <li *ngFor="let item of list; let i = index" class="row border-color grid-item" (dblclick)="onEdit(i)" [class.background-editing]="i === _editing">
                        <div class="col-xs-6 overflow-visible">
                            <div>
                                <span class="form-control" *ngIf="_editing != i">{{item.value}}</span>
                            </div>
                            <div *ngIf="_editing == i">
                                <input  #val='ngModel' autofocus [(ngModel)]="list[i].value" class="form-control" type="text" required [lateBindValidator]="validator" (keyup.enter)="save(i)" [attr.title]="!title ? null : title" />
                            </div>
                        </div>
                        <div class="actions">
                            <button [disabled]="shouldDisable(i)" *ngIf="_editing == i" title="Ok" (click)="save(i)">
                                <i class="fa fa-check color-active"></i>
                            </button>
                            <button *ngIf="_editing == i" title="Cancel" (click)="cancel(i)">
                                <i class="fa fa-times red"></i>
                            </button>
                            <button *ngIf="_editing != i" title="Edit" (click)="onEdit(i)">
                                <i class="fa fa-pencil color-active"></i>
                            </button>
                            <button title="Delete" (click)="delete(i)">
                                <i class="fa fa-trash-o red"></i>
                            </button>
                        </div>
                </li>
            </ul>
        </div>
    `,
    styles: [`
        span.form-control {
            background-color: inherit;
        }

        .col-xs-12 {
            padding: 0px;
            padding-left: 5px;
        }

        .col-xs-12 > div {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .actions {
            padding-left: 5px;
        }
    `],
    exportAs: 'stringList'
})
export class StringListComponent implements OnInit, OnChanges {
    @Input() model: Array<string>;
    @Input() validator: ((v: string) => any);
    @Input() sort: boolean;
    @Input() useAddButton: boolean;
    @Input() title: string;

    @Output() edit: EventEmitter<any> = new EventEmitter();
    @Output() modelChange: EventEmitter<any> = new EventEmitter();
    @Output() modelChanged: EventEmitter<any> = new EventEmitter();
    @ViewChild('val') private _editModel;

    list: Array<any>;

    private _editing: number = -1;

    ngOnInit() {
        this.reset();
    }

    ngOnChanges(changes: { [key: string]: SimpleChange; }): any {
        if (changes["model"]) {
            if (this.list && this.list.length == 0 || changes["model"].currentValue.length == 0) {
                this.reset();
            }
        }
    }

    onModelChanged() {
        this.model = this.list.filter((v, index) => { return this.indexOf(v) === index; })
            .map((o) => o.value);

        if (this.sort) {
            this.model = this.model.sort();
        }

        this.reset();
        this.modelChange.emit(this.model);
        this.modelChanged.emit(this.model);
    }

    public add() {
        this.onAdd();
    }

    private onAdd() {
        if (this._editing != -1) {
            this.save(this._editing);
        }

        if (this.list.length > this.model.length) {
            this.save(0);
        }

        this.list.splice(0, 0, { value: "" });
        this.onEdit(0);
    }

    private onEdit(i: number) {
        let l = this.list.length;

        if (this._editing != -1) {
            this.save(this._editing);
        }

        i = i - (l - this.list.length);

        this._editing = i;
        this.edit.emit(i);
    }

    private delete(i: number) {
        this.list.splice(i, 1);
        this._editing = -1;
        this.list = this.list.filter(elem => elem.value);
        this.onModelChanged();
    }

    private save(i: number) {
        let elem = this.list[i];

        if (!elem.value) {
            this.list.splice(i, 1);
        }

        this._editing = -1;
        this.onModelChanged();
    }

    private cancel(i: number) {
        if (this.list.length > this.model.length) {
            this.list.splice(i, 1);
        }
        else {
            this.list[i].value = this.model[i];
        }

        this._editing = -1;
    }

    private reset() {
        this.list = this.model.slice(0).map((v) => { return { value: v } }); // copy
        this._editing = -1;
    }

    private indexOf(o: any): number {
        for (var i = 0; i < this.list.length; i++) {
            if (this.list[i] == o || this.list[i].value == o.value) {
                return i;
            }
        }
        return -1;
    }

    private shouldDisable(index: number): boolean {
        return !this._editModel || !this._editModel.valid || this.validator && this.validator(this.list[index].value);
    }
}

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        Validators,
        AutoFocus
    ],
    exports: [
        StringListComponent
    ],
    declarations: [
        StringListComponent
    ]
})
export class Module { }
