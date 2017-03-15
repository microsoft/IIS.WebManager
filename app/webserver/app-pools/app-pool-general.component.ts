/// <reference path="../../../node_modules/@angular/core/src/core.d.ts" />

import {Component, Input, Output, EventEmitter} from '@angular/core';

import {AppPoolsService} from './app-pools.service';
import {ApplicationPool} from './app-pool';


@Component({
    selector: 'app-pool-general',
    template: `
        <fieldset>
            <label>Name</label>
            <input class="form-control name" type="text" [(ngModel)]="pool.name" (modelChanged)="onModelChanged()" required throttle />
        </fieldset>
        <fieldset>
            <label>Auto Start</label>
            <switch class="block" [(model)]="pool.auto_start" (modelChanged)="onModelChanged()">{{pool.auto_start ? "On" : "Off"}}</switch>
        </fieldset>
        <fieldset>
            <identity [model]="pool.identity" (modelChanged)="onModelChanged()"></identity>
        </fieldset>
        <fieldset>
            <label>Pipeline</label>
            <enum [(model)]="pool.pipeline_mode" (modelChanged)="onModelChanged()">
                <field name="Integrated" value="integrated"></field>
                <field name="Classic" value="classic"></field>
            </enum>
        </fieldset>
        <fieldset>
            <label>.NET Framework</label>
            <enum  [(model)]="pool.managed_runtime_version" (modelChanged)="onModelChanged()">
                <field name="3.5" value="v2.0"></field>
                <field name="4.x" value="v4.0"></field>
                <field name="None" value=""></field>
            </enum>
        </fieldset>
        <section>
            <div class="collapse-heading collapsed" data-toggle="collapse" data-target="#limits">
                <h2>Limits</h2>
            </div>
            <div id="limits" class="collapse">
                <fieldset>
                    <label>Request Queue Length</label>
                    <div class="validation-container">
                        <input class="form-control" type="number" [(ngModel)]="pool.queue_length" throttle (modelChanged)="onModelChanged()" />
                    </div>
                </fieldset>
                <cpu [model]="pool.cpu" (modelChanged)="onModelChanged()"></cpu>
            </div>
        </section>
    `
})
export class AppPoolGeneralComponent {
    @Input()
    pool: ApplicationPool;

    @Output()
    modelChanged: EventEmitter<any> = new EventEmitter();

    onModelChanged() {
        // Bubble up model changed event to parent
        this.modelChanged.emit(null);
    }
}