
import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {DiffUtil} from '../../utils/diff';

import {Provider} from './request-tracing';
import {RequestTracingService} from './request-tracing.service';


@Component({
    selector: 'provider-list',
    template: `
        <div *ngIf="_providers">
            <button class="create" (click)="create()" [class.inactive]="_editing"><i class="fa fa-plus color-active"></i><span>Create Provider</span></button>
            <div class="container-fluid">
                <div class="hidden-xs border-active grid-list-header row" [hidden]="_providers.length < 1">
                    <label [ngClass]="css('name')" (click)="sort('name')">Name</label>
                </div>
                <div class="grid-list">
                    <provider *ngIf="_newProvider" [model]="_newProvider" (close)="close()"></provider>
                    <provider *ngFor="let p of _providers | orderby: _orderBy: _orderByAsc;" 
                                [model]="p" 
                                [readonly]="_editing && p != _editing" 
                                (edit)="edit(p)" (close)="close()">
                    </provider>
                    <br /><br />
                </div>
            </div>
        </div>
    `
})
export class ProvidersComponent implements OnInit {
    private _editing: Provider;
    private _orderBy: string;
    private _orderByAsc: boolean;
    private _providers: Array<Provider>;

    private _newProvider: Provider;

    constructor(private _service: RequestTracingService) {
    }

    ngOnInit() {
        this._service.providers.then(providers => {
            this._providers = providers;
        });
    }

    private create() {
        let provider = new Provider();
        provider.name = "";
        provider.guid = "";
        provider.areas = [];

        this._newProvider = provider;
        this._editing = this._newProvider;
    }

    private edit(p: Provider) {
        this._editing = p;
    }

    private close() {
        this._newProvider = null;
        this._editing = null;
    }


    private sort(field: string) {
        this._orderByAsc = (field == this._orderBy) ? !this._orderByAsc : true;
        this._orderBy = field;
    }

    private css(field: string): any {
        if (this._orderBy == field) {
            return {
                "orderby": true,
                "desc": !this._orderByAsc
            };
        }

        return {};
    }
}
