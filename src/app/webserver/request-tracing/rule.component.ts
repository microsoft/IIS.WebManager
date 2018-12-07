
import { Component, Input, Output, EventEmitter, ElementRef, OnInit } from '@angular/core';
import { Int32 } from '../../common/primitives';
import { DiffUtil } from '../../utils/diff';
import { ComponentUtil } from '../../utils/component';

import { RequestTracingRule, Provider, Trace, Verbosity } from './request-tracing';
import { RequestTracingService } from './request-tracing.service';


@Component({
    selector: 'rule',
    template: `
        <div *ngIf="model" class="grid-item row" [class.background-editing]="_isEditing">
            <div [class]="_isEditing ? 'col-lg-10 col-md-10 col-sm-10 overflow-visible' : ''">
                <fieldset class="col-xs-8 col-sm-4 col-md-3" *ngIf="!_isEditing">
                    <span>{{model.path}}</span>
                </fieldset>
                <fieldset class="col-xs-9" *ngIf="_isEditing">
                    <label>Path</label>
                    <input autofocus autosize placeholder="Example: *.aspx" class="form-control" type="text" [(ngModel)]="model.path" throttle required />
                </fieldset>
                <fieldset class="hidden-xs col-sm-3 col-md-3 col-lg-2" *ngIf="!_isEditing">
                    <span>{{model.status_codes.join(", ")}}</span>
                </fieldset>
                <fieldset class="hidden-xs hidden-sm col-md-3 col-lg-2" *ngIf="!_isEditing">
                    <span *ngIf="hasMinReqExecutionTime()">{{model.min_request_execution_time}}</span>
                </fieldset>
                <fieldset class="hidden-xs hidden-sm hidden-md col-lg-2" *ngIf="!_isEditing">
                    <span *ngIf="model.event_severity != 'ignore'">{{friendlyEventSeverity(model.event_severity)}}</span>
                </fieldset>
                <div *ngIf="_isEditing" id="statusCodes" class="col-xs-12">
                    <fieldset class="inline-block has-list">
                        <label>Status Code(s)</label>
                    </fieldset>
                    <button class="pull-right background-normal" *ngIf="!!(!(statusCodes && statusCodes.list) && model.status_codes.length > 0 || statusCodes.list && statusCodes.list.length> 0)" (click)="statusCodes.add()" ><i class="fa fa-plus color-active" ></i><span>Add</span></button>
                    <fieldset>
                        <string-list #statusCodes="stringList" [(model)]="model.status_codes"></string-list>
                        <button class="background-normal" *ngIf="statusCodes.list.length == 0" (click)="statusCodes.add()"><i class="fa fa-plus color-active"></i><span>Add</span></button>
                    </fieldset>
                </div>
                <fieldset *ngIf="_isEditing" class="col-xs-12">
                    <fieldset class="inline-block"> 
                        <label class="block">Min Request Time</label>
                        <switch [model]="hasMinReqExecutionTime()" (modelChange)="enableRequestTime($event)">{{hasMinReqExecutionTime() ? "On" : "Off"}}</switch>
                    </fieldset>
                    <fieldset class="inline-block" *ngIf="hasMinReqExecutionTime()">
                        <label class="block">Length <span class="units">(s)</span></label>
                        <input class="form-control" type="number" [(ngModel)]="model.min_request_execution_time" throttle />
                    </fieldset>
                </fieldset>
                <fieldset *ngIf="_isEditing" class="col-xs-12">
                    <label>Event Severity</label>
                    <enum [(model)]="model.event_severity">
                        <field name="Any" value="ignore"></field>
                        <field name="Critical Error" value="criticalerror"></field>
                        <field name="Error" value="error"></field>
                        <field name="Warning" value="warning"></field>
                    </enum>
                </fieldset>
                <div *ngIf="_isEditing" class="col-xs-12 col-sm-12 col-md-7 col-lg-6">
                    <fieldset *ngFor="let p of _providers;">
                        <label>{{p.name}}</label>
                        <switch class="block" [model]="isProviderEnabled(p)" (modelChange)="enableProvider(p, $event)"></switch>
                        <div class="trace" *ngIf="isProviderEnabled(p)">
                            <trace [model]="getTrace(p)"></trace>
                        </div>
                    </fieldset>
                </div>
            </div>            
            <div class="actions">
                <button class="no-border no-editing" [class.inactive]="readonly" title="Edit" (click)="onEdit()">
                    <i class="fa fa-pencil color-active"></i>
                </button>
                <button class="no-border editing" title="Ok" (click)="onOk()" [disabled]="!isValid() || null">
                    <i class="fa fa-check color-active"></i>
                </button>
                <button class="no-border editing" title="Cancel" (click)="onCancel()">
                    <i class="fa fa-times red"></i>
                </button>
                <button class="no-border" *ngIf="model.id" title="Delete" [class.inactive]="readonly" (click)="onDelete()">
                    <i class="fa fa-trash-o red"></i>
                </button>
            </div>
        </div>
    `,
    styles: [`
        [autosize] {
            max-width: 100%;
            min-width: 215px;
        }

        .collapse {
            margin-bottom: 0;
        }

        fieldset.inline-block {
            padding-bottom: 0;
        }

        .grid-item:not(.background-editing) fieldset {
            padding-top: 5px;
            padding-bottom: 0;
        }

        fieldset fieldset.inline-block:nth-of-type(2) {
            margin: 0;
        }

        #statusCodes {
            max-width: 310px;
            margin-top:15px;
            margin-bottom:5px;
            clear: left;
        }

        .trace {
            clear:both;
            padding-top:10px;
        }
    `]
})
export class RuleComponent implements OnInit {
    @Input() model: RequestTracingRule;
    @Input() readonly: boolean;
    @Output() edit: any = new EventEmitter();
    @Output() close: any = new EventEmitter();

    private _isEditing: boolean;
    private _original: RequestTracingRule;
    private _providers: Array<Provider>;

    constructor(private _eRef: ElementRef, private _service: RequestTracingService) {
    }


    ngOnInit() {
        this._service.providers.then(providers => this._providers = providers);

        this.set(this.model);

        if (!this.model.id) {
            this.onEdit();
        }
    }


    private onEdit() {
        this._isEditing = true;

        this.edit.emit(null);
        this.scheduleScroll();
    }

    private onOk() {
        if (this.model.id) {
            //
            // Update
            var changes = DiffUtil.diff(this._original, this.model);

            if (Object.keys(changes).length > 0) {
                this._service.updateRule(this.model, changes).then(_ => {
                    this.set(this.model);
                    this.hide();
                })
            }
            else {
                this.hide();
            }
        }
        else {
            //
            // Create new
            this._service.createRule(this.model).then(_ => {
                this.set(this.model);
                this.hide();
            });
        }
    }

    private onCancel() {
        //
        // Revert changes
        let original = JSON.parse(JSON.stringify(this._original));

        for (var k in original) this.model[k] = original[k];

        this.hide();
    }

    private onDelete() {
        if (this.model.id) {
            this._service.deleteRule(this.model);
        }

        this.hide();
    }

    private set(rule: RequestTracingRule) {
        this._original = JSON.parse(JSON.stringify(rule));
    }

    private friendlyEventSeverity(eventSeverity: string) {
        switch (eventSeverity) {
            case "criticalerror":
                return "Critical Error";
            case "error":
                return "Error";
            case "warning":
                return "Warning";
            case "ignore":
                return "Ignore";
            default:
                return "";
        }
    }

    private hasMinReqExecutionTime(): boolean {
        return (this.model.min_request_execution_time < Int32.Max);
    }

    private enableRequestTime(value: boolean) {
        if (value) {
            this.model.min_request_execution_time = 60;
        }
        else {
            this.model.min_request_execution_time = Int32.Max;
        }
    }

    private getTrace(p: Provider): Trace {
        for (var t of this.model.traces) {
            if (t.provider.id == p.id) {
                return t;
            }
        }

        return null;
    }

    private isProviderEnabled(p: Provider): boolean {
        return !!this.getTrace(p);
    }

    private enableProvider(p: Provider, value: boolean) {
        if (value) {
            let trace = new Trace();
            trace.provider = p;
            trace.allowed_areas = RuleComponent.toObject(p.areas);
            trace.verbosity = Verbosity.Warning;

            this.model.traces.unshift(trace);
        }
        else {
            for (var i = 0; i < this.model.traces.length; ++i) {
                if (this.model.traces[i].provider.id == p.id) {
                    this.model.traces.splice(i, 1);
                    break;
                }
            }
        }
    }

    private static toObject(arr: Array<string>): any {
        var rv = {};

        for (var i in arr) {
            rv[arr[i]] = true;
        }

        return rv;
    }

    private scheduleScroll() {
        setTimeout(() => ComponentUtil.scrollTo(this._eRef));
    }

    private hide() {
        this._isEditing = false;
        this.close.emit(null);
    }

    private isValid() {
        return !!this.model.path;
    }
}
