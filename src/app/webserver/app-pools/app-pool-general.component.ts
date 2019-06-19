
import { Component, Input, Output, EventEmitter, Inject, OnInit } from '@angular/core';
import { AppPoolsService } from './app-pools.service';
import { ApplicationPool } from './app-pool';
import { StatusController } from 'common/status-controller.component';

class AppPoolStatusController extends StatusController {
    constructor(
        private srv: AppPoolsService,
        private pool: ApplicationPool,
    ) { super(pool); }

    startImpl(): Promise<any> {
        return this.srv.start(this.pool);
    }

    stopImpl(): Promise<any> {
        return this.srv.stop(this.pool);
    }

    restartImpl(): Promise<any> {
        return this.srv.recycle(this.pool);
    }
}

@Component({
    selector: 'app-pool-general',
    template: `
<status-controller
    [restartLabel]="'Recycle'"
    [controller]="controller"></status-controller>
<tabs>
    <tab [name]="'Settings'">
        <fieldset>
            <label>Name</label>
            <input class="form-control name" type="text" [(ngModel)]="pool.name" (modelChanged)="onModelChanged()" required throttle />
        </fieldset>
        <fieldset>
            <switch label="Auto Start" class="block" [(model)]="pool.auto_start" (modelChanged)="onModelChanged()">{{pool.auto_start ? "On" : "Off"}}</switch>
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
    </tab>
    <tab [name]="'Process'">
        <process-model [model]="pool" (modelChanged)="onModelChanged()"></process-model>
        <process-orphaning [model]="pool.process_orphaning" (modelChanged)="onModelChanged()"></process-orphaning>
    </tab>
    <tab [name]="'Fail Protection'">
        <rapid-fail-protection [model]="pool.rapid_fail_protection" (modelChanged)="onModelChanged()"></rapid-fail-protection>
    </tab>
    <tab [name]="'Recycling'">
        <recycling [model]="pool.recycling" (modelChanged)="onModelChanged()"></recycling>
    </tab>
    <tab [name]="'Limits'">
        <fieldset>
            <label>Request Queue Length</label>
            <div class="validation-container">
                <input class="form-control" type="number" [(ngModel)]="pool.queue_length" throttle (modelChanged)="onModelChanged()" />
            </div>
        </fieldset>
        <cpu [model]="pool.cpu" (modelChanged)="onModelChanged()"></cpu>
    </tab>
</tabs>`,
    styles:[`
.controller {
    padding-bottom: 15px;
}
`],
})
export class AppPoolGeneralComponent implements OnInit {
    controller: StatusController;
    @Input()
    pool: ApplicationPool;
    @Output()
    modelChanged: EventEmitter<any> = new EventEmitter();

    constructor(
        @Inject("AppPoolsService") private srv: AppPoolsService,
    ) {}

    ngOnInit(): void {
        this.controller = new AppPoolStatusController(this.srv, this.pool);
    }

    onModelChanged() {
        // Bubble up model changed event to parent
        this.modelChanged.emit(null);
    }
}
