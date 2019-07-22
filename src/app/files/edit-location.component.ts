import { Component, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';

import { FilesService } from './files.service';
import { Location } from './location';

@Component({
    selector: 'edit-location',
    template: `
        <div class="sme-focus-zone">
            <fieldset class="name">
                <label>Alias</label>
                <input [(ngModel)]="model.alias" class="form-control" type="text" autofocus>
            </fieldset>
            <fieldset class="path">
                <label>Physical Path</label>
                <input [(ngModel)]="model.path" class="form-control" type="text">
            </fieldset>
            <fieldset>
                <label>Permissions</label>
                <div class="flags">
                    <checkbox2 [(model)]="_read">Read</checkbox2>
                    <checkbox2 [(model)]="_write">Write</checkbox2>
                </div>
            </fieldset>
            <p class="pull-right">
                <button class="ok" (click)="onOk()">{{model.id ? 'OK' : 'Create'}}</button>
                <button class="cancel" (click)="cancel.next()">Cancel</button>
            </p>
        </div>
    `
})
export class LocationEditComponent implements OnInit {

    private _read: boolean;
    private _write: boolean;

    @Input() public model: Location;

    @Output() public cancel: EventEmitter<any> = new EventEmitter<any>();
    @Output() public save: EventEmitter<any> = new EventEmitter<any>();

    constructor(@Inject("FilesService") private _svc: FilesService) {
    }

    public ngOnInit() {
        this._read = !!(this.model.claims && this.model.claims.find(c => c == "read"));
        this._write = !!(this.model.claims && this.model.claims.find(c => c == "write"));
    }

    private onOk() {

        if (this.model.alias) {

            this.model.claims = [];

            if (this._read) {
                this.model.claims.push("read");
            }

            if (this._write) {
                this.model.claims.push("write");
            }

            if (this.model.id) {
                this._svc.updateLocation(this.model, this.model);
            }

            this.save.next();
        }
    }
}
