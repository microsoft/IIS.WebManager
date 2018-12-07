
import {Component, Input, Output, EventEmitter, OnInit, ViewChild} from '@angular/core';
import {NgModel} from '@angular/forms';

import {Recycling} from './app-pool';

import {TimeSpan} from '../../common/primitives';
import {StringListComponent} from '../../common/string-list.component';


@Component({
    selector: 'daily-schedule',
    template: `
        <div *ngIf="model">
            <fieldset class='inline-block'>
                <label>Schedule</label>
                <switch class="block" [model]="model.length > 0" (modelChange)="enable($event)">
                    {{model.length > 0 ? "On" : "Off"}}
                </switch>
            </fieldset>
            <fieldset class='inline-block add' *ngIf='model.length > 0'>
                <button (click)="addTime()"><i class="fa fa-plus color-active"></i>Add Time</button>
            </fieldset>
            <string-list #times="stringList" [(model)]="model" (modelChanged)="onModelChanged($event)" [validator]="validator" [title]="'HH:MM'"></string-list>
        </div>
    `,
    styles: [`
        .grid-list {
            margin-left: 0;
        }
        
        fieldset.add {
            padding-top: 40px;
            margin-right: 0;
        }
    `]
})
export class DailyScheduleComponent {
    @Input()  model: Array<string>;
    @Output() modelChange: EventEmitter<any> = new EventEmitter();

    @ViewChild('times') times: StringListComponent;

    onModelChanged() {
        this.modelChange.emit(this.model);
    }

    enable(value: boolean) {
        if (!value) {
            this.model.splice(0, this.model.length);
        }
        else {
            this.model.push("00:00");
        }

        this.onModelChanged();
    }

    addTime() {
        this.times.add();
    }

    validator(val: string) {
        let regexp = /\b(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]\b/;
        return val && regexp.test(val) ? null : {valid: false};
    }
}



@Component({
    selector: 'recycling',
    template: `
    <div class='row'>
        <div class='col-sm-7 col-lg-4'>
            <div>
                <fieldset>
                    <label>Overlapped Recycle</label>
                    <switch class="block" [model]="!model.disable_overlapped_recycle" (modelChange)="model.disable_overlapped_recycle = !$event" (modelChanged)="onModelChanged()">
                        {{model.disable_overlapped_recycle ? "Off" : "On"}}
                    </switch>
                </fieldset>
                <fieldset>
                    <label>Config Change</label>
                    <switch class="block" [model]="!model.disable_recycle_on_config_change" (modelChange)="model.disable_recycle_on_config_change = !$event" (modelChanged)="onModelChanged()">
                        {{model.disable_recycle_on_config_change ? "Off" : "On"}}
                    </switch>
                </fieldset>
            </div>
            <div>
                <fieldset class='inline-block'>
                    <label>Private Memory</label>
                    <switch class="block" [model]="model.periodic_restart.private_memory > 0" (modelChange)="onPrivateMemory($event)">
                        {{model.periodic_restart.private_memory > 0 ? "On" : "Off"}}
                    </switch>
                </fieldset>
                <fieldset class='inline-block' *ngIf='model.periodic_restart.private_memory > 0'>
                    <label>Memory Limit <span class="units">(KB)</span></label>
                    <input class="form-control" type="number" [(ngModel)]="model.periodic_restart.private_memory" throttle (modelChanged)="onModelChanged()" />
                </fieldset>
            </div>
            <div>
                <fieldset class='inline-block'>
                    <label>Virtual Memory</label>
                    <switch class="block" [model]="model.periodic_restart.virtual_memory > 0" (modelChange)="onVirtualMemory($event)">
                        {{model.periodic_restart.virtual_memory > 0 ? "On" : "Off"}}
                    </switch>
                </fieldset>
                <fieldset class='inline-block' *ngIf='model.periodic_restart.virtual_memory > 0'>
                    <label>Memory Limit <span class="units">(KB)</span></label>
                    <input class="form-control" type="number" [(ngModel)]="model.periodic_restart.virtual_memory" throttle (modelChanged)="onModelChanged()" />
                </fieldset>
            </div>
            <div>
                <fieldset class='inline-block'>
                    <label>Request Limit</label>
                    <switch class="block" [model]="model.periodic_restart.request_limit > 0" (modelChange)="onRequestLimit($event)">
                        {{model.periodic_restart.request_limit > 0 ? "On" : "Off"}}
                    </switch>
                </fieldset>
                <fieldset class='inline-block' *ngIf='model.periodic_restart.request_limit > 0'>
                    <label>Total Requests</label>
                    <input class="form-control" type="number" [(ngModel)]="model.periodic_restart.request_limit" throttle (modelChanged)="onModelChanged()" />
                </fieldset>
            </div>
            <div>
                <fieldset class='inline-block'>
                    <label>Periodically</label>
                    <switch class="block" [model]="timeIntervalEnabled()" (modelChange)="onTimeInterval($event)">
                        {{timeIntervalEnabled() ? "On" : "Off"}}
                    </switch>
                </fieldset>
                <fieldset class='inline-block' *ngIf='timeIntervalEnabled()'>
                    <label>Time Interval <span class="units">(min)</span></label>
                    <input class="form-control" type="number" [(ngModel)]="model.periodic_restart.time_interval" throttle (modelChanged)="onModelChanged()" />
                </fieldset>
            </div>
            <div>
                <daily-schedule [(model)]="model.periodic_restart.schedule" (modelChange)="onModelChanged()"></daily-schedule>
            </div>
        </div>

        <div class="col-sm-5">
            <fieldset>
                <label>Log Events</label>
                <div class="flags">
                    <checkbox2 [(model)]="model.log_events.time" (modelChanged)="onModelChanged()">Time</checkbox2>
                    <checkbox2 [(model)]="model.log_events.requests" (modelChanged)="onModelChanged()">Requests</checkbox2>
                    <checkbox2 [(model)]="model.log_events.schedule" (modelChanged)="onModelChanged()">Schedule</checkbox2>
                    <checkbox2 [(model)]="model.log_events.memory" (modelChanged)="onModelChanged()">Memory</checkbox2>
                    <checkbox2 [(model)]="model.log_events.isapi_unhealthy" (modelChanged)="onModelChanged()">Isapi Unhealthy</checkbox2>
                    <checkbox2 [(model)]="model.log_events.on_demand" (modelChanged)="onModelChanged()">On Demand</checkbox2>
                    <checkbox2 [(model)]="model.log_events.config_change" (modelChanged)="onModelChanged()">Config Change</checkbox2>
                    <checkbox2 [(model)]="model.log_events.private_memory" (modelChanged)="onModelChanged()">Private Memory</checkbox2>
                </div>
            </fieldset>
        </div>
    </div>
    `,
    styles: [`
    `]
})
export class RecyclingComponent {
    @Input()
    model: Recycling;

    @Output()
    modelChanged: EventEmitter<any> = new EventEmitter();

    onModelChanged() {
        this.modelChanged.emit(this.model);
    }

    onPrivateMemory(value: boolean) {
        if (!value) {
            this.model.periodic_restart.private_memory = 0;
        }
        else {
            this.model.periodic_restart.private_memory = 500000; // 500MB
        }
    }

    onVirtualMemory(value: boolean) {
        if (!value) {
            this.model.periodic_restart.virtual_memory = 0;
        }
        else {
            this.model.periodic_restart.virtual_memory = 1000000; // 1GB
        }
    }

    onRequestLimit(value: boolean) {
        if (!value) {
            this.model.periodic_restart.request_limit = 0;
        }
        else {
            this.model.periodic_restart.request_limit = 9999999;
        }

        this.onModelChanged();
    }

    onTimeInterval(value: boolean) {
        if (!value) {
            this.model.periodic_restart.time_interval = TimeSpan.MaxMinutes;
        }
        else {
            this.model.periodic_restart.time_interval = 29 * 60; // Default (29 hours)
        }

        this.onModelChanged();
    }

    onSchedule(value: boolean) {
        if (!value) {
            this.model.periodic_restart.schedule = [];
        }
        else {
            this.model.periodic_restart.schedule.push("00:00:00");
        }

        this.onModelChanged();
    }

    addTime() {
        this.model.periodic_restart.schedule.splice(0, 0, "01:00:00");
        this.onModelChanged();
    }

    timeIntervalEnabled(): boolean {
        return this.model.periodic_restart.time_interval < TimeSpan.MaxMinutes;
    }
}
