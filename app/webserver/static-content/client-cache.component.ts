
import {Component, Input, Output, EventEmitter} from '@angular/core';

import {ClientCache} from './static-content'

@Component({
    selector: 'client-cache',
    template: `
        <fieldset>
            <label>Set E Tag</label>
            <switch class="block" [disabled]="locked" [(model)]="model.set_e_tag" (modelChanged)="onModelChanged()">{{model.set_e_tag ? "On" : "Off"}}</switch>
        </fieldset>
        <fieldset>
            <label>Cache Control</label>
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
            <label>HTTP Expiration</label>
            <input class="form-control path" type="text" [disabled]="locked" [(ngModel)]="model.http_expires" (modelChanged)="onModelChanged()" throttle />
        </fieldset>
        <fieldset>
            <label>Custom</label>
            <input class="form-control path" type="text" [disabled]="locked" [(ngModel)]="model.control_custom" (modelChanged)="onModelChanged()" throttle />
        </fieldset>
    `
})
export class ClientCacheComponent {
    @Input() model: ClientCache;
    @Input() locked: boolean;

    @Output() modelChange: any = new EventEmitter();

    onModelChanged() {
        this.modelChange.emit(this.model);
    }
}
