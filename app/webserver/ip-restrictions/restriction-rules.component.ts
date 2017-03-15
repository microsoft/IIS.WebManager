/// <reference path="../../../node_modules/@angular/core/src/core.d.ts" />

import {Component, Input, Output, EventEmitter, ElementRef, OnInit, ViewChildren, QueryList} from '@angular/core';
import {NgModel} from '@angular/forms';

import {RestrictionRule} from './ip-restrictions'

@Component({
    selector: 'restriction-rule',
    template: `
        <div class="row grid-item" [class.background-editing]="isEditing">

            <div class="actions">
                <button class="no-border" title="Ok" *ngIf="isEditing" [disabled]="!isValid() || null" (click)="onSave()">
                    <i class="fa fa-check blue"></i>
                </button>
                <button enabled class="no-border" title="Cancel" *ngIf="isEditing" (click)="onDiscard()">
                    <i class="fa fa-times red"></i>
                </button>
                <button enabled class="no-border" title="Edit" [class.inactive]="!_editable" *ngIf="!isEditing" (click)="onEdit()">
                    <i class="fa fa-pencil blue"></i>
                </button>
                <button class="no-border" *ngIf="model.id" title="Delete" [class.inactive]="!_editable" (click)="onDelete()">
                    <i class="fa fa-trash-o red"></i>
                </button>
            </div>

            <fieldset class="col-xs-8 col-md-2">
                <label class="visible-xs visible-sm">Status</label>
                <label class="hidden-xs hidden-sm editing">Status</label>
                <i class="fa fa-circle green hidden-xs hidden-sm" *ngIf="model.allowed && !isEditing"></i>
                <i class="fa fa-ban red hidden-xs hidden-sm" *ngIf="!model.allowed && !isEditing"></i>
                <span>{{model.allowed ? "Allow" : "Deny"}}</span>
                <switch class="block" *ngIf="isEditing" [(model)]="model.allowed">{{model.allowed ? "Allow" : "Deny"}}</switch>
                <div *ngIf="!isEditing">
                    <br class="visible-xs visible-sm" />
                </div>
            </fieldset>

            <fieldset class="col-xs-12 col-md-3">
                <label class="visible-xs visible-sm">IP Address</label>
                <label class="hidden-xs hidden-sm editing">IP Address</label>
                <span>{{model.ip_address}}</span>
                <input class="form-control" type="text" [(ngModel)]="model.ip_address" throttle required pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$" />
                <div *ngIf="!isEditing">
                    <br class="visible-xs visible-sm" />
                </div>
            </fieldset>

            <fieldset class="col-xs-12 col-md-3">
                <label class="visible-xs visible-sm">Subnet Mask</label>
                <label class="hidden-xs hidden-sm editing">Subnet Mask</label>
                <span>{{model.subnet_mask}}</span>
                <input class="form-control" type="text" [(ngModel)]="model.subnet_mask" throttle required />
                <div *ngIf="!isEditing">
                    <br class="visible-xs visible-sm" />
                </div>
            </fieldset>

            <fieldset class="col-xs-12 col-md-2" *ngIf="enableDomainName && (isEditing || model.domain_name != '')">
                <label class="visible-xs visible-sm">Domain Name</label>
                <label class="hidden-xs hidden-sm editing">Domain Name</label>
                <span>{{model.domain_name}}</span>
                <input class="form-control" type="text" [(ngModel)]="model.domain_name" throttle />
                <div *ngIf="!isEditing">
                    <br class="visible-xs visible-sm" />
                </div>
            </fieldset>
        </div>
    `,
    styles: [`
        .fa-circle,
        .fa-ban {
            font-size: 20px;
            margin-right: 10px;
            padding-left: 1px
        }

        .grid-item:not(.background-editing) fieldset {
            padding-top: 5px;
            padding-bottom: 0;
        }
    `]
})
export class RestrictionRuleComponent implements OnInit {

    @Input() model: RestrictionRule;
    @Input() isEditing: boolean;
    @Input() enableDomainName: boolean;

    @Output()
    save: EventEmitter<any> = new EventEmitter();
    @Output()
    edit: EventEmitter<any> = new EventEmitter();
    @Output()
    discard: EventEmitter<any> = new EventEmitter();
    @Output()
    delete: EventEmitter<any> = new EventEmitter();

    @ViewChildren(NgModel)
    validators: QueryList<NgModel>;

    private _editable: boolean = true;

    ngOnInit() {
    }

    onSave() {
        this.save.emit(null);
    }

    onEdit() {
        this.edit.emit(null);
    }

    onDiscard() {
        this.discard.emit(null);
    }

    onDelete() {
        this.delete.emit(null);
    }

    setEditable(val: boolean) {
        this._editable = val;
    }

    isValid() {
        var valid = !!this.validators;

        if (this.validators) {
            this.validators.forEach(v => {
                if (!v.valid) {
                    valid = false;
                }
            });
        }

        return valid;
    }
}