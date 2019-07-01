import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';

import {ClientCache} from './static-content'

@Component({
    selector: 'client-cache',
    template: `
        <fieldset>
            <switch label="E-Tag" class="block" [disabled]="locked" [(model)]="model.set_e_tag" (modelChanged)="onModelChanged()">{{model.set_e_tag ? "On" : "Off"}}</switch>
        </fieldset>
        <fieldset>
            <label>Cache-Control</label>
            <enum [disabled]="locked" [(model)]="model.control_mode" (modelChanged)="onModelChanged()">
                <field name="Not Set" value="no_control"></field>
                <field name="Disabled" value="disable_cache"></field>
                <field name="Max-Age" value="use_max_age"></field>
                <field name="Expires" value="use_expires"></field>
            </enum>
        </fieldset>
        <fieldset [hidden]="model.control_mode !== 'use_max_age'">
            <label>Max Age <span class="units"> (minutes)</span></label>
            <input class="form-control" type="number" [disabled]="locked" [(ngModel)]="model.max_age" (modelChanged)="onModelChanged()" throttle />
        </fieldset>
        <fieldset [hidden]="model.control_mode !== 'use_expires'">
            <label>Expiration Date</label>
            <input class="form-control path" type="text" [disabled]="locked" [(ngModel)]="model.http_expires" (modelChanged)="onModelChanged()" throttle />
        </fieldset>
        <fieldset class="inline-block pull-left">
            <switch label="Custom Cache-Control" [(model)]="_useCustom" (modelChanged)="onCustom()">{{_useCustom ? "On" : "Off"}}</switch>
        </fieldset>
        <fieldset *ngIf="_useCustom" class="fill">
            <label>&nbsp;</label>
            <input title="Value of cacheControlCustom" class="form-control name" type="text" [disabled]="locked" [(ngModel)]="model.control_custom" (modelChanged)="onModelChanged()" throttle />
        </fieldset>
    `,
    styles: [`
        .name {
            min-width: 200px;
        }
    `]
})
export class ClientCacheComponent implements OnInit {
    @Input() model: ClientCache;
    @Input() locked: boolean;
    @Output() modelChange: any = new EventEmitter();

    private _useCustom: boolean;
    private _cacheCustom: string;

    public ngOnInit() {
        this._useCustom = !!this.model.control_custom;
    }

    onModelChanged() {
        this.modelChange.emit(this.model);
    }

    private onCustom() {
        if (!this._useCustom) {
            this._cacheCustom = this.model.control_custom;
            this.model.control_custom = "";
            this.onModelChanged();
        }
    }
}
