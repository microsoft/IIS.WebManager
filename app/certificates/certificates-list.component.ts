import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { Certificate } from './certificate';
import { DateTime } from '../common/primitives';
import { Range } from '../common/virtual-list.component';
import { CertificatesService } from './certificates.service';

@Component({
    selector: 'certificates-list',
    template: `
        <loading *ngIf="!_items"></loading>
        <div class="toolbar">
            <button class="refresh" title="Refresh" (click)="refresh()"></button>
            <div class="clear"></div>
        </div>
        <div *ngIf="_items" class="col-xs-8 col-sm-4 col-md-2 actions filter hidden-xs">
            <input type="search" class="form-control" [class.border-active]="_filter" [(ngModel)]="_filter" (ngModelChange)="filter($event)" [throttle]="300" />
        </div>
        <div *ngIf="_items" class="container-fluid">
            <div class="border-active grid-list-header row hidden-xs" [hidden]="_items.length == 0">
                <label class="col-xs-12 col-sm-6 col-md-4 col-lg-3">Name</label>
                <label class="col-xs-3 col-md-4 col-lg-3 hidden-xs hidden-sm">Issued By</label>
                <label class="col-lg-3 col-md-1 hidden-xs hidden-sm">Store</label>
                <label class="col-lg-1 hidden-xs hidden-sm hidden-md">Valid To</label>
            </div>
        </div>
        <virtual-list class="container-fluid grid-list"
                        *ngIf="_items"
                        [count]="_items.length"
                        (rangeChange)="onRangeChange($event)">
            <li class="hover-editing"
                            *ngFor="let cert of _view"
                            (click)="selectCert(cert, $event)">
                <certificate [model]="cert"></certificate>
            </li>
        </virtual-list>
    `,
    styles: [`
        .grid-item:hover {
            cursor: pointer;
        }

        li > div {
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .grid-item small {
            font-size: 11px;
            padding-left: 22px;
            font-weight: normal;
            display: block;
            line-height: 10px;
            margin-top: -5px;
        }

        .name {
            font-size: 16px;
        }

        .name:before {
            font-family: FontAwesome;
            content: "\\f023";
            padding-left: 5px;
            padding-right: 5px;
            font-size: 16px;
        }

        .container-fluid,
        .row {
            margin: 0;
            padding: 0;
        }

        .toolbar button span {
            font-size: 85%;
        }

        .toolbar button {
            border: none;
            float: right;
        }
    `]
})
export class CertificatesListComponent implements OnInit, OnDestroy {
    private _filter = "";
    private certs: Array<Certificate>;
    private _view: Array<Certificate> = [];
    private _items: Array<Certificate>;
    private _range: Range = new Range(0, 0);
    private _subscriptions: Array<Subscription> = [];

    @Output() itemSelected: EventEmitter<any> = new EventEmitter();

    @Input()
    lazy: boolean;

    constructor(private _service: CertificatesService) {
    }

    ngOnInit() {
        if (!this.lazy) {
            this.activate();
        }
    }

    public ngOnDestroy() {
        this._subscriptions.forEach(s => s.unsubscribe());
    }

    activate() {
        this._service.certificates.subscribe(certs => {
            this.certs = certs;
            this.filter(this._filter);
        });
        this.refresh();
    }

    selectCert(cert, evt: Event) {
        if (evt.defaultPrevented) {
            return;
        }

        this.itemSelected.emit(cert);
    }

    private onRangeChange(range: Range) {
        Range.fillView(this._view, this._items, range);
        this._range = range;
    }

    private filter(filter: string) {
        if (!filter) {
            this._items = this.certs;
            return;
        }

        filter = ("*" + this._filter + "*").replace("**", "*").replace("?", "");
        let rule = new RegExp("^" + filter.split("*").join(".*") + "$", "i");
        this._items = this.certs.filter(c => rule.test(Certificate.displayName(c)));

        this.onRangeChange(this._range);
    }

    private refresh() {
        this._service.load();
    }
}
