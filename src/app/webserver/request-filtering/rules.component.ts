import { Component, Input, Output, OnInit, OnDestroy, EventEmitter, ViewChildren, ViewChild, QueryList, OnChanges, SimpleChange, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { DiffUtil } from '../../utils/diff';
import { FilteringRule } from './request-filtering';
import { ComponentUtil } from '../../utils/component';
import { StringListComponent } from '../../common/string-list.component';
import { RequestFilteringService } from './request-filtering.service';

@Component({
    selector: 'rule',
    template: `
        <div *ngIf="model" class="grid-item row" [class.background-editing]="_editing">

            <fieldset class="col-xs-8 col-sm-3" *ngIf="!_editing">
                <label class="visible-xs">Name</label>
                <span>{{model.name}}</span>
                <div>
                    <br class="visible-xs" />
                </div>
            </fieldset>

            <fieldset class="col-xs-8 col-md-9 col-lg-10" *ngIf="_editing">
                <label class="block">Name</label>
                <input autofocus class="form-control" type="text" [disabled]="locked" [(ngModel)]="model.name" throttle required />
            </fieldset>

            <fieldset class="col-xs-8 col-sm-5 col-md-6" *ngIf="!_editing">
                <label class="visible-xs">Denied Values</label>
                <span>{{model.deny_strings.join(', ')}}</span>
            </fieldset>
    
            <div *ngIf="_editing" class="col-xs-12">
                <div class="row">
                    <div class="col-lg-4 col-md-5 col-xs-12">

                        <fieldset>
                            <switch label="Scan Url" class="block" [disabled]="locked" [(model)]="model.scan_url">{{model.scan_url ? "Yes" : "No"}}</switch>
                        </fieldset>
                        <fieldset>
                            <switch label="Scan Query String" class="block" [disabled]="locked" [(model)]="model.scan_query_string">{{model.scan_query_string ? "Yes" : "No"}}</switch>
                        </fieldset>

                        <fieldset [class.has-list]="_displayHeaders">
                            <label class="block">Scan Headers</label>
                            <div>
                                <switch [disabled]="locked" [(model)]="_displayHeaders">{{_displayHeaders ? "Yes" : "No"}}</switch>
                                <button class="background-normal pull-right" *ngIf="_displayHeaders" (click)="addHeader()"><i class="fa fa-plus color-active"></i><span>Add</span></button>
                            </div>
                        </fieldset>
                        <fieldset *ngIf="_displayHeaders">
                            <string-list #headers="stringList" [(model)]="model.headers"></string-list>
                        </fieldset>

                        <fieldset [class.has-list]="_displayFileExtensions">
                            <label class="block">Filter by File Extension</label>
                            <div>
                                <switch [disabled]="locked" [(model)]="_displayFileExtensions">{{_displayFileExtensions ? "Yes" : "No"}}</switch>
                                <button class="background-normal pull-right" *ngIf="_displayFileExtensions" (click)="addFileExtension()"><i class="fa fa-plus color-active"></i><span>Add</span></button>
                            </div>
                        </fieldset>
                        <fieldset *ngIf="_displayFileExtensions">
                            <string-list #fileExtensions="stringList" [(model)]="model.file_extensions"></string-list>
                        </fieldset>

                    </div>
                    <div class="col-lg-6 col-md-7 col-xs-12">
                        <fieldset class="inline-block has-list">
                            <label class="block">Denied Values</label>
                        </fieldset>
                        <button class="background-normal pull-right" *ngIf="denyStringsVisible()" (click)="addDenyString()"><i class="fa fa-plus color-active"></i><span>Add</span></button>
                        <fieldset>
                            <string-list #ds="stringList" [(model)]="model.deny_strings"></string-list>
                            <button class="add background-normal" *ngIf="ds.list.length == 0" (click)="addDenyString()"><i class="fa fa-plus color-active"></i><span>Add</span></button>
                        </fieldset>
                    </div>
                </div>

            </div>

            <div class="actions">
                <button class="no-border no-editing" [class.inactive]="!_editable" title="Edit" (click)="onEdit()">
                    <i class="fa fa-pencil color-active"></i>
                </button>
                <button class="no-border editing" [disabled]="!isValid() || locked" title="Ok" (click)="onSave()">
                    <i class="fa fa-check color-active"></i>
                </button>
                <button class="no-border editing" title="Cancel" (click)="onDiscard()">
                    <i class="fa fa-times red"></i>
                </button>
                <button class="no-border" *ngIf="model.id" [disabled]="locked" title="Delete" [class.inactive]="!_editable" (click)="onDelete()">
                    <i class="fa fa-trash-o red"></i>
                </button>
            </div>

        </div>
    `,
    styles: [`
        fieldset.has-list {
            padding-bottom: 0;
        }
        
        div.inline-block {
            float: right;
        }

        [class*="col-"] {
            white-space: nowrap;
        }
        
        .grid-item:not(.background-editing) fieldset {
            padding-top: 5px;
            padding-bottom: 0;
        }
    `],
})
export class RuleComponent implements OnInit, OnChanges {
    @Input() model: FilteringRule;
    @Input() locked: boolean;

    @Output() enter: EventEmitter<any> = new EventEmitter();
    @Output() leave: EventEmitter<any> = new EventEmitter();

    @ViewChild('headers') headers: StringListComponent;
    @ViewChild('fileExtensions') fileExtensions: StringListComponent;
    @ViewChild('ds') denyStrings: StringListComponent;

    private _displayHeaders: boolean;
    private _displayFileExtensions: boolean;
    private _original: FilteringRule;
    private _editing: boolean;
    private _editable: boolean = true;

    constructor(private _service: RequestFilteringService, private _eRef: ElementRef) {
    }

    ngOnInit() {
        this._original = JSON.parse(JSON.stringify(this.model));

        if (this.model) {
            this._displayHeaders = this.model.headers.length > 0;
            this._displayFileExtensions = this.model.file_extensions.length > 0;

            if (!this.model.name) {
                this._editing = true;
                this.scheduleScroll();
            }
        }
    }

    public ngOnChanges(changes: { [key: string]: SimpleChange; }): any {
        if (changes["model"]) {
            this.setModel(changes["model"].currentValue);
        }
    }

    onEdit() {
        this.enter.emit(null);
        this._editing = true;
        this.scheduleScroll();
    }

    onDelete() {
        if (confirm("Are you sure you want to delete this rule?\nName: " + this.model.name)) {
            this._service.deleteFilteringRule(this.model);
        }
    }

    onSave() {
        if (!this.isValid()) {
            return;
        }

        if (!this._displayHeaders) {
            this.model.headers.splice(0);
        }

        if (!this._displayFileExtensions) {
            this.model.file_extensions.splice(0);
        }

        this._editing = false;
        if (this.model.id) {
            let changes = DiffUtil.diff(this._original, this.model);
            if (Object.keys(changes).length > 0) {
                this._service.updateFilteringRule(this.model, changes)
                    .then(() => this.setModel(this.model));
            }
        }
        else {
            this._service.addFilteringRule(this.model);
        }
        this.leave.emit(null);
    }

    onDiscard() {
        this._editing = false;

        for (let key of Object.keys(this._original)) {
            this.model[key] = JSON.parse(JSON.stringify(this._original[key] || null));
        }

        this.leave.emit(null);
    }

    setEditable(val: boolean) {
        this._editable = val;
    }

    addHeader() {
        this.headers.add();
    }

    addFileExtension() {
        this.fileExtensions.add();
    }

    addDenyString() {
        this.denyStrings.add();
    }

    removeHeader(index: number) {
        this.model.headers.splice(index, 1);
    }

    removeFileExtension(index: number) {
        this.model.file_extensions.splice(index, 1);
    }

    removeDenyString(index: number) {
        this.model.deny_strings.splice(index, 1);
    }

    isValid(): boolean {
        return !!this.model.name;
    }

    scheduleScroll() {
        setTimeout(() => {
            ComponentUtil.scrollTo(this._eRef);
        });
    }

    private denyStringsVisible() {
        if (!this.denyStrings) {
            return this.model.deny_strings.length > 0;
        }

        return this.denyStrings.list.length > 0;
    }

    private setModel(model: FilteringRule) {
        this.model = model;
        this._original = JSON.parse(JSON.stringify(this.model));
    }
}

@Component({
    selector: 'rules',
    template: `
        <div *ngIf="rules">
            <button class="create" (click)="onAdd()" [disabled]="locked" [class.inactive]="_editing"><i class="fa fa-plus color-active"></i><span>Add</span></button>

            <div class="container-fluid" [hidden]="!rules || rules.length < 1">
                <div class="row hidden-xs border-active grid-list-header">
                    <label class="col-sm-3">Name</label>
                    <label class="col-sm-5 col-md-6">Denied Values</label>
                </div>
            </div>

            <ul class="grid-list container-fluid">
                <li *ngIf="_newRule">
                    <rule [model]="_newRule" [locked]="locked" (leave)="leaveNewRule()"></rule>
                </li>
                <li *ngFor="let r of rules; let i = index;">
                    <rule [model]="r" [locked]="locked" (enter)="enterRule(i)" (leave)="leaveRule(i)"></rule>
                </li>
            </ul>
        </div>
    `,
})
export class RulesComponent implements OnInit, OnDestroy {
    @Input() rules: Array<FilteringRule> = [];
    @Input() locked: boolean;

    @ViewChildren(RuleComponent) ruleComponents: QueryList<RuleComponent>;

    private _editing: boolean;
    private _newRule: FilteringRule;
    private _subscriptions: Array<Subscription> = [];

    constructor(private _service: RequestFilteringService) {
    }

    public ngOnInit() {
        this._subscriptions.push(this._service.filteringRules.subscribe(rules => this.rules = rules));
    }

    public ngOnDestroy() {
        this._subscriptions.forEach(sub => sub.unsubscribe());
    }

    private onAdd() {
        if (this._newRule) {
            return;
        }

        this.setEditable(false);
        this._newRule = new FilteringRule();
        this._newRule.name = '';
        this._newRule.headers = [];
        this._newRule.file_extensions = [];
        this._newRule.deny_strings = [];
    }

    private setEditable(val: boolean) {
        this._editing = !val;
        let rules = this.ruleComponents.toArray();
        rules.forEach((rule, i) => {
            rule.setEditable(val);
        });
    }

    private enterRule(index: number) {
        this.setEditable(false);
    }

    private leaveRule(index: number) {
        this.setEditable(true);
    }

    private leaveNewRule() {
        this._newRule = null;
        this.setEditable(true);
    }
}
