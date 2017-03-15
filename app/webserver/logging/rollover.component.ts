/// <reference path="../../../node_modules/@angular/core/src/core.d.ts" />

import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';

import {Logging} from './logging'


@Component({
    selector: 'rollover',
    template: `
        <fieldset>
            <label>Rollover Schedule</label>
            <enum [(model)]="model.period" (modelChanged)="onModelChanged()">
                <field name="Hourly" value="hourly"></field>
                <field name="Daily" value="daily"></field>
                <field name="Weekly" value="weekly"></field>
                <field name="Monthly" value="monthly"></field>
            </enum>
            <fieldset class="inline-block">
                <checkbox2 [(model)]="!model.use_local_time" (modelChanged)="onModelChanged()">UTC Time</checkbox2>
            </fieldset>
        </fieldset>
        <fieldset>
            <label>Rollover when the log size exceeds <span class="units">(KB)</span></label>
            <input [(ngModel)]="rollover_truncate_size" (modelChanged)="updateTruncateSize()" throttle type="number" class="form-control" min="1" step="1" required />
        </fieldset>
    `
})
export class RolloverComponent implements OnInit {
    @Input() model: any;
    @Output() modelChange: any = new EventEmitter();

    rollover_truncate_size: number;

    ngOnInit() {
        this.rollover_truncate_size = (this.model.truncate_size / 1000) | 0;
    }

    onModelChanged() {
        this.modelChange.emit(this.model);
    }

    updateTruncateSize() {
        this.model.truncate_size = this.rollover_truncate_size * 1000;
        this.onModelChanged();
    }
}