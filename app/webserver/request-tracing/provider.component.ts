/// <reference path="../../../node_modules/@angular/core/src/core.d.ts" />

import {Component, Input, Output, EventEmitter, ElementRef, OnInit, ViewChildren, QueryList} from '@angular/core';
import {NgModel} from '@angular/forms';
import {DiffUtil} from '../../utils/diff';
import {ComponentUtil} from '../../utils/component';

import {Provider} from './request-tracing';
import {RequestTracingService} from './request-tracing.service';


@Component({
    selector: 'provider',
    template: `
        <div *ngIf="model" class="grid-item row" [class.background-editing]="_isEditing">
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
            <fieldset>
                <label [hidden]="!_isEditing">Name</label>
                <input class="form-control name" type="text" [(ngModel)]="model.name" required throttle/>
                <span>{{model.name}}</span>
            </fieldset>
            <fieldset class="name" *ngIf="_isEditing">
                <label>Guid</label>
                <input *ngIf="!model.id" class="form-control" type="text" [(ngModel)]="model.guid" required pattern="[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$" throttle/>
                <span *ngIf="model.id" class="editing form-control">{{model.guid}}</span>
            </fieldset>
            <div *ngIf="_isEditing">
                <fieldset>
                    <button (click)="areas.add()" class="background-normal" ><i class="fa fa-plus color-active" ></i><span>Add Area</span></button>
                </fieldset>
                <string-list class="name"  #areas="stringList" [(model)]="model.areas"></string-list>
            </div>
        </div>
    `,
    styles: [`
        fieldset.has-list {
            padding-bottom: 0;
        }

        .grid-item:not(.background-editing) fieldset {
            padding-top: 5px;
            padding-bottom: 0;
        }

        string-list {
            display: block;
        }
    `]
})
export class ProviderComponent implements OnInit {
    @Input() model: Provider;
    @Input() readonly: boolean;

    @Output() edit: any = new EventEmitter();
    @Output() close: any = new EventEmitter();

    @ViewChildren(NgModel) validators: QueryList<NgModel>;

    private _isEditing: boolean;
    private _original: Provider;


    constructor(private _eRef: ElementRef, private _service: RequestTracingService) {
    }

    ngOnInit() {
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
            var changes = DiffUtil.diff(this._original, this.model);

            if (Object.keys(changes).length > 0) {
                this._service.updateProvider(this.model, changes).then(_ => {
                    this.set(this.model);
                    this.hide();
                })
            }
            else {
                this.hide();
            }
        }
        else {
            // Create new
            this._service.createProvider(this.model).then(_ => {
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
            this._service.deleteProvider(this.model)
        }

        this.hide();
    }

    private set(provider: Provider) {
        this._original = JSON.parse(JSON.stringify(provider));
    }

    private scheduleScroll() {
        setTimeout(()=> ComponentUtil.scrollTo(this._eRef) );
    }

    private hide() {
        this._isEditing = false;
        this.close.emit(null);
    }

    private isValid() {
        if (this.validators) {
            let vs = this.validators.toArray();
            for (var control of vs) {
                if (!control.valid) {
                    return false;
                }
            }
        }
        return true;
    }
}