/// <reference path="../../../node_modules/@angular/core/src/core.d.ts" />

import { Component, Input, Output, OnInit } from '@angular/core';
import { Int32 } from '../../common/primitives';
import { DiffUtil } from '../../utils/diff';

import { RequestTracingRule, EventSeverity } from './request-tracing';
import { RequestTracingService } from './request-tracing.service';


@Component({
    selector: 'rule-list',
    template: `
        <div *ngIf="_rules">
            <button class="create" (click)="create()" [class.inactive]="_editing"><i class="fa fa-plus color-active"></i><span>Create Rule</span></button>
            <div class="container-fluid">
                <div class="hidden-xs border-active grid-list-header row" *ngIf="_rules.length > 0">
                    <label class="col-xs-12 col-sm-4 col-md-3" [ngClass]="css('path')" (click)="sort('path')">Path</label>
                    <label class="hidden-xs col-sm-3 col-md-3 col-lg-2">Status Code</label>
                    <label class="hidden-xs hidden-sm col-md-3 col-lg-2" [ngClass]="css('min_request_execution_time')" (click)="sort('min_request_execution_time')">Request Time (s)</label>
                    <label class="hidden-xs hidden-sm hidden-md col-lg-2" [ngClass]="css('event_severity')" (click)="sort('event_severity')">Event Severity</label>
                </div>
                <div class="grid-list">
                    <rule *ngIf="_newRule" [model]="_newRule" (close)="close()"></rule>
                    <rule *ngFor="let rule of _rules | orderby: _orderBy: _orderByAsc" 
                                 [model]="rule" 
                                 [readonly]="_editing && rule != _editing"
                                 (edit)="edit(rule)" (close)="close()" >
                    </rule>
                </div>
            </div>
        </div>
    `
})
export class RulesComponent implements OnInit {
    private _editing: RequestTracingRule;
    private _orderBy: string;
    private _orderByAsc: boolean;
    private _rules: Array<RequestTracingRule>;

    private _newRule: RequestTracingRule;

    constructor(private _service: RequestTracingService) {
    }


    ngOnInit() {
        this._service.rules.then(rules => {
            this._rules = rules;
        });
    }

    private create() {
        let rule = new RequestTracingRule();
        rule.status_codes = ["100-999"];
        rule.event_severity = EventSeverity.Ignore;
        rule.min_request_execution_time = Int32.Max;
        rule.traces = [];
        rule.path = "";

        this._newRule = rule;
        this._editing = this._newRule;
    }

    private edit(r: RequestTracingRule) {
        this._editing = r;
    }

    private close() {
        this._newRule = null;
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