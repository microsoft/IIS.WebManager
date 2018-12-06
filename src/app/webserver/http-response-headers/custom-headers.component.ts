
import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {HttpResponseHeaders, CustomHeader} from './http-response-headers';

@Component({
    selector: 'custom-headers',
    template: `
        <button class="create" (click)="create()" [disabled]="locked" [class.inactive]="_editing != -1"><i class="fa fa-plus color-active"></i><span>Add</span></button>
        <div class="container-fluid">
            <div class="row hidden-xs border-active grid-list-header" [hidden]="headers.length == 0">
                <label class="col-sm-4 col-lg-5">Name</label>
                <label class="col-sm-6 col-lg-5">Value</label>
            </div>
        </div>
        <ul class="grid-list container-fluid">
            <li *ngFor="let header of headers; let i = index;">
                <div class="row grid-item" [class.background-editing]="_editing == i">
                    <fieldset class="col-xs-8 col-sm-4 col-lg-5 overflow-visible">
                        <label class="visible-xs">Name</label>
                        <label *ngIf="_editing == i" class="hidden-xs">Name</label>
                        <span *ngIf="_editing != i">{{header.name}}</span>
                        <input autofocus *ngIf="_editing == i" class="form-control" type="text" [disabled]="locked" [(ngModel)]="header.name" throttle required />
                        <div *ngIf="_editing !== i">
                            <br class="visible-xs" />
                        </div>
                    </fieldset>
                    <fieldset class="col-xs-12 col-sm-5 col-lg-5">
                        <label class="visible-xs">Value</label>
                        <label *ngIf="_editing == i" class="hidden-xs">Value</label>
                        <span *ngIf="_editing != i">{{header.value}}</span>
                        <input *ngIf="_editing == i" class="form-control" type="text" [disabled]="locked" [(ngModel)]="header.value" throttle required />
                    </fieldset>
                    <div class="actions">
                        <button class="no-border" title="Ok" [disabled]="locked || !isValid(header) || null" *ngIf="_editing == i" (click)="onFinishEditing(i)">
                            <i class="fa fa-check color-active"></i>
                        </button>
                        <button class="no-border" title="Cancel" *ngIf="_editing == i" (click)="discard()">
                            <i class="fa fa-times red"></i>
                        </button>
                        <button class="no-border" title="Edit" [class.inactive]="_editing != -1" *ngIf="_editing != i" (click)="edit(i)">
                            <i class="fa fa-pencil color-active"></i>
                        </button>
                        <button class="no-border" *ngIf="header.id" title="Delete" [disabled]="locked || _editing == i" [class.inactive]="_editing !== -1 && _editing !== i" (click)="onDelete(i)">
                            <i class="fa fa-trash-o red"></i>
                        </button>
                    </div>
                </div>
            </li>
        </ul>
    `,
    styles: [`
        .grid-item:not(.background-editing) fieldset {
            padding-top: 5px;
            padding-bottom: 0;
        }
    `]
})
export class CustomHeadersComponent implements OnInit {

    @Input() model: HttpResponseHeaders;
    @Input() headers: Array<CustomHeader>;
    @Input() originalHeaders: Array<CustomHeader>;
    @Input() locked: boolean;

    @Output() add: any = new EventEmitter();
    @Output() delete: any = new EventEmitter();
    @Output() save: any = new EventEmitter();

    private _editing: number;

    ngOnInit() {
        this._editing = -1;
    }

    create() {
        if (this.headers.length > 0 && !(this.headers[0].id))
            return;

        this.discard();

        var newHeader = new CustomHeader();

        newHeader.name = "";
        newHeader.value = "";
        newHeader.http_response_headers = this.model;

        this.headers.unshift(newHeader);
        this.originalHeaders.unshift(newHeader);
        this._editing = 0;

    }

    edit(index) {
        if (this.discard()) {
            this._editing = index;
        }
        else {
            this._editing = index - 1;
        }
    }

    discard(): boolean {
        if (this._editing != -1) {
            if (this.headers[this._editing].id) {
                this.setHeader(this._editing, this.originalHeaders[this._editing]);
                this._editing = -1;
                return true;
            }
            else {
                this.onDelete(this._editing);
                return false;
            }
        }
        return true;
    }

    onFinishEditing(index) {
        if (this.headers[index].name && this.headers[index].value) {
            if (this.headers[index] && this.headers[index].id) {
                this.save.emit(index);
                this._editing = -1;
            }
            else {
                this.add.emit(index);
                this._editing = -1;
            }
        }
        else {
            return;
        }

    }

    onDelete(index) {
        if (this.headers[index].id)
            this.delete.emit(this.headers[index]);

        this.headers.splice(index, 1);
        this.originalHeaders.splice(index, 1);

        if (this._editing == index) {
            this._editing = -1;
        }
        else if (this._editing > index) {
            this._editing -= 1;
        }
    }

    private setHeader(index, header) {
        this.headers[index] = header;
        this.originalHeaders[index] = JSON.parse(JSON.stringify(header));
    }

    private isValid(header: CustomHeader) {
        return header.name && header.value;
    }
}
