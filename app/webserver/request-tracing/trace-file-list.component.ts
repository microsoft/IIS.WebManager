import { Component, OnInit, OnDestroy, Output, Input, EventEmitter, Inject, Injectable, ViewChild, ElementRef, ContentChildren, QueryList } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { OrderBy, SortPipe } from '../../common/sort.pipe';
import { Range } from '../../common/virtual-list.component';

import { FilesService } from '../../files/files.service';

import { TraceLog } from './request-tracing';
import { RequestTracingService } from './request-tracing.service';


@Component({
    selector: 'trace-files',
    template: `
        <toolbar
            [refresh]="true"
            [delete]="_selected.length > 0"
            (onRefresh)="onRefresh()"
            (onDelete)="onDelete()"></toolbar>
        <div tabindex="-1" class="wrapper"
                        [selectable]="_traces"
                        [selected]="_selected"
                        (keyup.delete)="onDelete()">
            <input class="out" type="text"/>
            <div #header class="container-fluid">
                <div class="hidden-xs border-active grid-list-header row">
                    <label class="col-xs-8 col-sm-3 col-lg-2" [ngClass]="_orderBy.css('file_info.name')" (click)="sort('file_info.name')">Name</label>
                    <label class="col-sm-4 col-lg-3 hidden-xs" [ngClass]="_orderBy.css('url')" (click)="sort('url')">Url</label>
                    <label class="col-md-1 visible-lg text-right" [ngClass]="_orderBy.css('method')" (click)="sort('method')">Method</label>
                    <label class="col-md-1 visible-lg visible-md text-right" [ngClass]="_orderBy.css('status_code')" (click)="sort('status_code')">Status</label>
                    <label class="col-md-1 visible-lg visible-md text-right" [ngClass]="_orderBy.css('time_taken')" (click)="sort('time_taken')">Duration</label>
                    <label class="col-sm-3 col-md-2 hidden-xs" [ngClass]="_orderBy.css('date')" (click)="sort('date')">Date</label>
                </div>
            </div>
            <div *ngIf="_error && _error.message">
                <warning [warning]="_error.message"></warning>
            </div>
            <virtual-list class="container-fluid grid-list"
                        *ngIf="!!_traces"
                        [count]="_traces.length"
                        (rangeChange)="onRangeChange($event)">
                <li class="hover-editing" 
                    tabindex="-1" 
                    *ngFor="let child of _view">
                    <trace-file [model]="child"></trace-file>
                </li>
            </virtual-list>
        </div>
    `,
    styles: [`
        .container-fluid,
        .row {
            margin: 0;
            padding: 0;
        }

        navigation {
            margin-bottom: 10px;
        }

        .wrapper {
            min-height: 50vh;
        }

        .out {
            position: absolute; 
            left: -1000px;
        }

        .drag-info {
            position: absolute;
            transform: translateX(-500px);
            padding: 0 5px;
            font-size: 120%;
        }
    `]
})
export class TraceFileListComponent implements OnInit, OnDestroy {
    private _error: any;
    private _orderBy: OrderBy = new OrderBy();
    private _sortPipe: SortPipe = new SortPipe();
    private _subscriptions: Array<Subscription> = [];

    private _range: Range = new Range(0, 0);
    private _traces: Array<TraceLog>;
    private _view: Array<TraceLog> = [];
    private _selected: Array<TraceLog> = [];

    constructor(private _service: RequestTracingService) {
        this._subscriptions.push(this._service.traces.subscribe(t => {
            this._traces = t;
            this.doSort();
        }));
        this._subscriptions.push(this._service.traceError.subscribe(e => {
            this._error = e;
        }));
    }

    public ngOnInit() {
        this._orderBy.sortDesc('date');
        this.onRefresh();
    }

    public ngOnDestroy() {
        for (let sub of this._subscriptions) {
            sub.unsubscribe();
        }
    }

    private onRefresh() {
        this._traces = [];
        this._service.loadTraces();
    }

    private onDelete() {
        let msg = this._selected.length == 1 ? "Are you sure you want to delete '" + this._selected[0].file_info.name + "'?" :
            "Are you sure you want to delete " + this._selected.length + " items?";

        if (confirm(msg)) {
            this._service.delete(this._selected);
        }
    }

    private sort(field: string) {
        this._orderBy.sort(field, false);
        this.doSort();
    }

    private doSort() {
        this._traces = this._sortPipe.transform(this._traces, this._orderBy.Field, this._orderBy.Asc);
        this.onRangeChange(this._range);
    }

    private onRangeChange(range: Range) {
        this._view.splice(0);

        let end = range.start + range.length < this._traces.length ? range.start + range.length : this._traces.length;

        for (let i = range.start; i < end; i++) {
            this._view.push(this._traces[i]);
        }

        this._range = range;
    }
}