import { Component, OnInit, Input, Optional, Inject, ViewChild } from '@angular/core';

import { Selector } from '../../common/selector';
import { AppPoolsService } from '../app-pools/app-pools.service';
import { ApplicationPool } from '../app-pools/app-pool';
import { DiffUtil } from '../../utils/diff';

@Component({
    selector: 'app-pool-details',
    template: `
        <fieldset>
            <label>Name</label>
            <span class="name">{{model.name}}</span>
            <span class="status" *ngIf="!started">({{model.status}})</span>
            <div class="actions">
                <div class="selector-wrapper">
                    <button (click)="openSelector()" [class.background-active]="(_selector && _selector.opened) || false"><i class="fa fa-caret-down"></i></button>
                    <selector [right]="true">
                        <ul>
                            <li><a class="bttn edit" [routerLink]="['/webserver/app-pools', model.id]">Edit</a></li>
                            <li><button class="refresh" title="Recycle" [attr.disabled]="!started || null" (click)="onRecycle()">Recycle</button></li>
                            <li><button class="start" title="Start" [attr.disabled]="model.status != 'stopped' ? true : null" (click)="onStart()">Start</button></li>
                            <li><button class="stop" title="Stop" [attr.disabled]="!started || null" (click)="onStop()">Stop</button></li>
                        </ul>
                    </selector>
                </div>
            </div>
        </fieldset>
        <fieldset *ngIf="_svc">
            <label>Auto Start</label>
            <switch class="block" [(model)]="model.auto_start" (modelChanged)="onModelChanged()">{{model.auto_start ? "On" : "Off"}}</switch>
        </fieldset>
        <fieldset *ngIf="_svc">
            <identity [model]="model.identity" [useUserProfile]="false" (modelChanged)="onModelChanged()"></identity>
        </fieldset>
        <fieldset *ngIf="_svc">
            <label>Pipeline</label>
            <enum [(model)]="model.pipeline_mode" (modelChanged)="onModelChanged()">
                <field name="Integrated" value="integrated"></field>
                <field name="Classic" value="classic"></field>
            </enum>
        </fieldset>
        <fieldset *ngIf="_svc">
            <label>.NET Framework</label>
            <enum [(model)]="model.managed_runtime_version" (modelChanged)="onModelChanged()">
                <field name="3.5" value="v2.0"></field>
                <field name="4.x" value="v4.0"></field>
                <field name="None" value=""></field>
            </enum>
        </fieldset>
    `,
    styles: [`
        .name {
            font-size: 16px;
        }

        .selector-wrapper {
            position: relative;
        }

        .actions {
            float: none;
        }

        .actions ul {
            margin-bottom: 0;
        }
    `]
})
export class AppPoolDetailsComponent {
    @Input() public model: ApplicationPool;

    @ViewChild(Selector) private _selector: Selector;
    private _original: ApplicationPool;

    constructor(@Optional() @Inject("AppPoolsService") private _svc: AppPoolsService) {
    }

    public ngOnInit() {
        this.setAppPool(this.model);
    }

    private onModelChanged(): void {
        if (!this._svc) {
            return;
        }

        // Set up diff object
        var changes = DiffUtil.diff(this._original, this.model);

        if (Object.keys(changes).length > 0) {
            var id = this.model.id;
            this._svc.update(this.model, changes).then(p => {
                this.setAppPool(p);
            });
        }
    }

    private setAppPool(p: ApplicationPool) {
        this.model = p;
        this._original = JSON.parse(JSON.stringify(p));
    }

    private openSelector() {
        this._selector.toggle();
    }

    private get started(): boolean {
        return this.model.status == 'started';
    }

    onStart(e: Event) {
        this._selector.close();
        this._svc.start(this.model);
    }

    onStop(e: Event) {
        this._selector.close();
        this._svc.stop(this.model);
    }

    onRecycle(e: Event) {
        this._selector.close();
        this._svc.recycle(this.model);
    }
}
