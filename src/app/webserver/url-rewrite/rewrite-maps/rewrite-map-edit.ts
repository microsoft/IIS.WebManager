import { Component, Input, Output, EventEmitter } from '@angular/core';

import { UrlRewriteService } from '../service/url-rewrite.service';
import { RewriteMap, RewriteMapping } from '../url-rewrite';

@Component({
    selector: 'rewrite-map-edit',
    template: `
        <div *ngIf="map">
            <fieldset>
                <label>Name</label>
                <input type="text" required class="form-control name" [(ngModel)]="map.name" />
            </fieldset>
            <fieldset>
                <label>Default Value</label>
                <input type="text" class="form-control name" [(ngModel)]="map.default_value" />
            </fieldset>
            <fieldset>
                <switch label="Ignore Case" [(model)]="map.ignore_case">{{map.ignore_case ? "Yes" : "No"}}</switch>
            </fieldset>
            
            <button (click)="add()" class="create"><span>Add Mapping</span></button>
            <div class="container-fluid">
                <div class="row hidden-xs border-active grid-list-header">
                    <label class="col-xs-6 col-sm-4">Name</label>
                    <label class="col-xs-6 col-sm-4">Value</label>
                </div>
            </div>

            <ul class="grid-list container-fluid">
                <li *ngIf="_newMapping">
                    <rewrite-mapping-edit [mapping]="_newMapping" (save)="saveNew($event)" (cancel)="discardNew()"></rewrite-mapping-edit>
                </li>
                <li *ngFor="let mapping of map.mappings">
                    <rewrite-mapping [mapping]="mapping" (delete)="onDelete(i)"></rewrite-mapping>
                </li>
            </ul>

            <p class="pull-right">
                <button [disabled]="!isValid()" (click)="onOk()" class="ok">OK</button>
                <button (click)="onDiscard()" class="cancel">Cancel</button>
            </p>
        </div>
    `,
    styles: [`
        p {
            margin: 20px 0;
        }

        .create {
            margin-top: 30px;
        }
    `]
})
export class RewriteMapEditComponent {
    @Input() public map: RewriteMap;

    @Output() cancel: EventEmitter<any> = new EventEmitter<any>();
    @Output() save: EventEmitter<any> = new EventEmitter<any>();

    private _newMapping: RewriteMapping;

    constructor(private _svc: UrlRewriteService) {
    }

    private isValid(): boolean {
        return !!this.map.name &&
            !this.map.mappings.find(map => !map.name || !map.value);
    }

    private add() {
        let mapping = new RewriteMapping();
        mapping.name = "New mapping";

        let i = 1;
        while (this.map.mappings.find(m => m.name.toLocaleLowerCase() == mapping.name.toLocaleLowerCase())) {
            mapping.name = "New Mapping " + (i++);
        }

        this._newMapping = mapping;
    }

    private onDelete(index: number) {
        this.map.mappings.splice(index, 1);
    }

    private onDiscard() {
        this.cancel.emit();
    }

    private onOk() {
        this.save.emit(this.map);
    }

    private saveNew(mapping: RewriteMapping) {
        this.map.mappings.push(mapping);
        this._newMapping = null;
    }

    private discardNew() {
        this._newMapping = null;
    }
}