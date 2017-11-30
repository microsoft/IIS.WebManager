
import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';

import {Logging, LogFelds, CustomLogField, CustomLogFieldSourceType} from './logging'



@Component({
    selector: 'logfields',
    template: `
        <div class="row flags">
            <div class="col-lg-2 col-md-4">
                <checkbox2 [(model)]="model.date" (modelChanged)="onModelChanged()">Date</checkbox2>
                <checkbox2 [(model)]="model.time" (modelChanged)="onModelChanged()">Time</checkbox2>
                <checkbox2 [(model)]="model.time_taken" (modelChanged)="onModelChanged()">Execution Time</checkbox2>
            </div>
            <div class="col-lg-2 col-md-4">
                <checkbox2 [(model)]="model.method" (modelChanged)="onModelChanged()">HTTP Method</checkbox2>
                <checkbox2 [(model)]="model.http_status" (modelChanged)="onModelChanged()">HTTP Status</checkbox2>
                <checkbox2 [(model)]="model.http_sub_status" (modelChanged)="onModelChanged()">HTTP Substatus</checkbox2>
                <checkbox2 [(model)]="model.win_32_status" (modelChanged)="onModelChanged()">Win32 Status</checkbox2>
                <checkbox2 [(model)]="model.uri_stem" (modelChanged)="onModelChanged()">URI Stem</checkbox2>
                <checkbox2 [(model)]="model.uri_query" (modelChanged)="onModelChanged()">URI Query</checkbox2>
                <checkbox2 [(model)]="model.referer" (modelChanged)="onModelChanged()">Referer</checkbox2>
                <checkbox2 [(model)]="model.cookie" (modelChanged)="onModelChanged()">Cookies</checkbox2>
                <checkbox2 [(model)]="model.protocol_version" (modelChanged)="onModelChanged()">Protocol Version</checkbox2>
                <checkbox2 [(model)]="model.bytes_sent" (modelChanged)="onModelChanged()">Bytes Sent</checkbox2>
                <checkbox2 [(model)]="model.bytes_recv" (modelChanged)="onModelChanged()">Bytes Received</checkbox2>
            </div>
            <div class="col-lg-2 col-md-4">
                <checkbox2 [(model)]="model.client_ip" (modelChanged)="onModelChanged()">Client IP Address</checkbox2>
                <checkbox2 [(model)]="model.username" (modelChanged)="onModelChanged()">User Name</checkbox2>
                <checkbox2 [(model)]="model.user_agent" (modelChanged)="onModelChanged()">User Agent</checkbox2>
                <checkbox2 [(model)]="model.server_ip" (modelChanged)="onModelChanged()">Server IP Address</checkbox2>
                <checkbox2 [(model)]="model.server_port" (modelChanged)="onModelChanged()">Server Port</checkbox2>
                <checkbox2 [(model)]="model.host" (modelChanged)="onModelChanged()">Host Name</checkbox2>
                <checkbox2 [(model)]="model.site_name" (modelChanged)="onModelChanged()">Site Name</checkbox2>
                <checkbox2 [(model)]="model.computer_name" (modelChanged)="onModelChanged()">Server Name</checkbox2>
            </div>
        </div>
    `,
    styles: [`
    `]
})
export class LogFieldsComponent {
    @Input() model: LogFelds;
    @Output() modelChange: any = new EventEmitter();

    onModelChanged() {
        this.modelChange.emit(this.model);
    }
}




@Component({
    selector: 'customfields',
    template: `
    <button class="create" [class.inactive]="_editing != -1" (click)="add()"><i class="fa fa-plus color-active"></i>Add Custom Field</button>
    

    <div class="row hidden-xs border-active grid-list-header" [hidden]="fields.length == 0">
        <label class="col-sm-3 col-lg-2">Read From</label>
        <label class="col-sm-3 col-lg-4">Field Name</label>
        <label class="col-sm-6">Log As</label>
    </div>
    <ul class="grid-list">
        <li *ngFor="let field of fields; let i = index;" class="row border-color grid-item" [class.background-editing]="i === _editing">
            <div class="actions">
                <button class="no-border no-editing" title="Edit" [class.inactive]="_editing != -1" (click)="edit(i)" >
                    <i class="fa fa-pencil color-active"></i>
                </button>
                <button [disabled]="!isValidCustomField(field)" class="no-border editing" title="Ok" (click)="save(i)">
                    <i class="fa fa-check color-active"></i>
                </button>
                <button class="no-border editing" title="Cancel" (click)="discardChanges(i)">
                    <i class="fa fa-times red"></i>
                </button>
                <button class="no-border" title="Delete" *ngIf="!field.isNew" [class.inactive]="_editing !== -1 && _editing !== i" (click)="delete(i)">
                    <i class="fa fa-trash-o red"></i>
                </button>
            </div>
            <div class="col-xs-8 col-sm-3 col-lg-2">
                <fieldset>
                    <label class="visible-xs">Read From</label>
                    <label *ngIf="i === _editing" class="hidden-xs">Read From</label>
                    <span *ngIf="i !== _editing">{{sourceTypeName(field.source_type)}}</span>
                    <select *ngIf="i === _editing" [(ngModel)]="field.source_type" class="form-control">
                        <option value="request_header">Request Header</option>
                        <option value="response_header">Response Header</option>
                        <option value="server_variable">Server Variable</option>
                    </select>
                </fieldset>
                <div *ngIf="i !== _editing">
                    <br class="visible-xs" />
                </div>
            </div>
            <div class="col-xs-12 col-sm-3 col-lg-4">
                <fieldset>
                    <label class="visible-xs">Field Name</label>
                    <label *ngIf="i === _editing" class="hidden-xs">Field Name</label>
                    <span *ngIf="i !== _editing">{{field.source_name}}</span>
                    <input *ngIf="i === _editing" [(ngModel)]="field.source_name" throttle class="form-control" type="text" required/>
                </fieldset>
                <div *ngIf="i !== _editing">
                    <br class="visible-xs" />
                </div>
            </div>
            <div class="col-xs-12 col-sm-3 col-md-4">
                <fieldset>
                    <label class="visible-xs">Log As</label>
                    <label *ngIf="i === _editing" class="hidden-xs">Log As</label>
                    <span *ngIf="i !== _editing">{{field.field_name}}</span>
                    <input *ngIf="i === _editing" required [(ngModel)]="field.field_name" throttle class="form-control" type="text" required/>
                </fieldset>
                <div *ngIf="i !== _editing">
                    <br class="visible-xs" />
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
export class CustomFieldsComponent implements OnInit {
    @Input() model: Array<CustomLogField>;
    @Output() modelChange: any = new EventEmitter();

    fields: Array<CustomLogField>;
    originalFields: Array<CustomLogField>;
    _editing: number;

    ngOnInit() {
        this.reset();
    }

    onModelChanged() {
        this.fields = this.fields.filter((f) => {
            return this.isValidCustomField(f);
        });

        this.model = this.fields;
        this.modelChange.emit(this.model);

        this.reset();
    }

    onChanged(index: number) {

        let field = this.fields[index];

        var logAsSpecified = !!field.field_name;

        if (field.source_name && !logAsSpecified) {
            field.field_name = field.source_name;
        }

        if (this.isValidCustomField(field)) {
            this.onModelChanged();
        }
    }

    add() {

        if (this._editing >= 0) {
            this.discardChanges(this._editing);
        }

        let field = new CustomLogField();
        field.field_name = field.source_name = null;
        (<any>field).isNew = true;

        this.fields.splice(0, 0, field);

        this._editing = 0;
    }

    delete(index: number) {
        var field = this.fields[index];
        this.fields.splice(index, 1);
        this.originalFields.splice(index, 1);

        this._editing = -1;

        if (this.isValidCustomField(field)) {
            this.onModelChanged();
        }
    }

    edit(index: number) {
        let editField = this.fields[index];
        
        if (editField) {
            this.discardChanges(index);
        }

        this._editing = index;
    }

    save(index: number) {

        let field = this.fields[index];

        if (!this.isValidCustomField(field)) {
            return;
        }

        if (this.originalFields.length < this.fields.length) {
            // Add newly created field
            let copy = JSON.parse(JSON.stringify(field));
            this.originalFields.splice(copy, 0, field);
        }

        this._editing = -1;
        (<any>field).isNew = false;
        this.onModelChanged();
    }

    discardChanges(index: number) {
        
        if (this.originalFields.length < this.fields.length) {
            this.fields.splice(index, 1);
        }
        else {
            this.fields[index] = JSON.parse(JSON.stringify(this.originalFields[index]));
        }

        this._editing = -1;
    }

    sourceTypeName(sourceType: CustomLogFieldSourceType) {
        switch (sourceType) {
            case CustomLogFieldSourceType.RequestHeader:
                return "Request Header";
            case CustomLogFieldSourceType.ResponseHeader:
                return "Response Header";
            case CustomLogFieldSourceType.ServerVariable:
                return "Server Variable";
            default:
                return "Unknown";
        }
    }

    private reset() {
        this.fields = this.model.slice(0);
        this.originalFields = this.model.slice(0);
        this._editing = -1;
    }

    private isValidCustomField(field: CustomLogField): boolean {
        return !!field.source_type && !!field.source_name && !!field.field_name;
    }
}
