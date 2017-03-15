/// <reference path="../../../node_modules/@angular/core/src/core.d.ts" />

import {Component, Input, Output, EventEmitter} from '@angular/core';

import {ApplicationPool, ProcessModel, ProcessOrphaning} from './app-pool';



@Component({
    selector: 'process-model',
    template: `
        <fieldset>
            <label>Process Bitness</label>
            <enum [(model)]="model.enable_32bit_win64" (modelChanged)="onModelChanged()">
                <field name="32 bit" value="true"></field>
                <field name="64 bit" value="false"></field>
            </enum>
        </fieldset>
        <div>
            <fieldset class="inline-block">
                <label>Web Garden</label>
                <switch class="block" [model]="model.process_model.max_processes > 1" (modelChange)="onWebGarden($event)">
                    {{model.process_model.max_processes > 1 ? "On" : "Off"}}
                </switch>
            </fieldset>
            <fieldset class="inline-block" *ngIf="model.process_model.max_processes > 1">
                <label>Max Processes</label>
                <div class="validation-container">
                    <input class="form-control" type="number" [(ngModel)]="model.process_model.max_processes" throttle (modelChanged)="onModelChanged()" />
                </div>
            </fieldset>
        </div>
        <div>
            <fieldset class="inline-block">
                <label>Idle Timeout <span class="units">(min)</span></label>
                <div class="validation-container">
                    <input class="form-control" type="number" [(ngModel)]="model.process_model.idle_timeout" throttle (modelChanged)="onModelChanged()" />
                </div>
            </fieldset>
            <fieldset class="inline-block" *ngIf='model.process_model.idle_timeout_action'>
                <label>Idle Action</label>
                <enum [(model)]="model.process_model.idle_timeout_action" (modelChanged)="onModelChanged()">
                    <field name="Terminate" value="Terminate"></field>
                    <field name="Suspend" value="Suspend"></field>
                </enum>
            </fieldset>
        </div>
        <fieldset>
            <label>Startup Timeout <span class="units">(s)</span></label>
            <div class="validation-container">
                <input class="form-control" type="number" [(ngModel)]="model.process_model.startup_time_limit" throttle (modelChanged)="onModelChanged()" />
            </div>
        </fieldset>
        <fieldset>
            <label>Shutdown Timeout <span class="units">(s)</span></label>
            <div class="validation-container">
                <input class="form-control" type="number" [(ngModel)]="model.process_model.shutdown_time_limit" throttle (modelChanged)="onModelChanged()" />
            </div>
        </fieldset>
        <div>
            <fieldset class="inline-block">
                <label>Health Monitoring</label>
                <switch class="block" [(model)]="model.process_model.pinging_enabled" (modelChanged)="onModelChanged()">
                    {{model.process_model.pinging_enabled ? "On" : "Off"}}
                </switch>
            </fieldset>
            <div *ngIf="model.process_model.pinging_enabled" class="inline-block">
                <fieldset class="inline-block">
                    <label>Ping Interval <span class="units">(s)</span></label>
                    <div class="validation-container">
                        <input class="form-control" type="number" [(ngModel)]="model.process_model.ping_interval" throttle (modelChanged)="onModelChanged()" />
                    </div>
                </fieldset>
                <fieldset class="inline-block">
                    <label>Max Response Time <span class="units">(s)</span></label>
                    <div class="validation-container">
                        <input class="form-control" type="number" [(ngModel)]="model.process_model.ping_response_time" throttle (modelChanged)="onModelChanged()" />
                    </div>
                </fieldset>
            </div>
        </div>
    `
})
export class ProcessModelComponent {
    @Input()
    model: ApplicationPool;

    @Output()
    modelChanged: EventEmitter<any> = new EventEmitter();

    onModelChanged() {
        this.modelChanged.emit(null);
    }

    onWebGarden(value: boolean) {
        if (!value) {
            this.model.process_model.max_processes = 1;
        }
        else {
            this.model.process_model.max_processes = 2;
        }

        this.onModelChanged();
    }
}


@Component({
    selector: 'process-orphaning',
    template: `            
        <fieldset>
            <label>Process Orphaning</label>
            <switch class="block" [(model)]="model.enabled" (modelChanged)="onModelChanged()">
                {{model.enabled ? "On" : "Off"}}
            </switch>
        </fieldset>
        <div *ngIf="model.enabled">
            <fieldset>
                <label>Action Path</label>
                <input class="form-control path" type="text" [(ngModel)]="model.orphan_action_exe" throttle (modelChanged)="onModelChanged()" />
            </fieldset>
            <fieldset>
                <label>Action Parameters</label>
                <input class="form-control path" type="text" [(ngModel)]="model.orphan_action_params" throttle (modelChanged)="onModelChanged()" />
            </fieldset>
        </div>
    `
})
export class ProcessOrphaningComponent {
    @Input()
    model: ProcessOrphaning;

    @Output()
    modelChanged: EventEmitter<any> = new EventEmitter();

    onModelChanged() {
        this.modelChanged.emit(null);
    }
}