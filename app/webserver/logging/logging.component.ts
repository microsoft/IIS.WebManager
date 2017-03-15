import { Component, OnInit } from '@angular/core';

import { LoggingService } from './logging.service';
import { NotificationService } from '../../notification/notification.service';
import { DiffUtil } from '../../utils/diff';

import { ApiFile } from '../../files/file';
import { Logging, LogFileFormat } from './logging'
import { LogFieldsComponent, CustomFieldsComponent } from './logfields.component'

@Component({
    template: `
        <loading *ngIf="!(logging || _error)"></loading>
        <error [error]="_error"></error>
        <div *ngIf="logging">
            <override-mode class="pull-right" [metadata]="logging.metadata" (revert)="onRevert()" (modelChanged)="onModelChanged()"></override-mode>
            <fieldset>
                <switch class="block" [(model)]="logging.enabled" (modelChanged)="onModelChanged()">{{logging.enabled ? "On" : "Off"}}</switch>
            </fieldset>
            <div [hidden]="!logging.enabled">
                <fieldset class="path">
                    <label>Directory</label>
                    <button title="Select Folder" [class.background-active]="fileSelector.isOpen()" class="right select" (click)="fileSelector.toggle()"></button>
                    <div class="fill">
                        <input [disabled]="!logging.log_per_site && logging.website" type="text" class="form-control" [(ngModel)]="logging.directory" throttle (modelChanged)="onModelChanged()" throttle required />
                    </div>
                    <server-file-selector #fileSelector [types]="['directory']" (selected)="onSelectPath($event)"></server-file-selector>
                </fieldset>
                <fieldset *ngIf="!logging.website">
                    <label>Separate Log per Web Site</label>
                    <switch class="block" [(model)]="logging.log_per_site" (modelChanged)="onModelChanged()">{{logging.log_per_site ? "On" : "Off"}}</switch>
                </fieldset>
                <fieldset>
                    <format [model]="logging" (modelChange)="onModelChanged()"></format>
                </fieldset>
                <section *ngIf="logging.log_per_site || !logging.website">
                    <div class="collapse-heading collapsed" data-toggle="collapse" data-target="#logginRollover">
                        <h2>Log File Rollover</h2>
                    </div>
                    <div id="logginRollover" class="collapse">
                        <rollover [model]="logging.rollover" (modelChange)="onModelChanged()"></rollover>
                    </div>
                </section>        
                <section *ngIf="logging.log_fields">
                    <div class="collapse-heading collapsed" data-toggle="collapse" data-target="#logFields">
                        <h2>Log Fields</h2>
                    </div>
                    <div class="collapse" id="logFields">
                        <logfields [model]="logging.log_fields" (modelChange)="onModelChanged()"></logfields>
                        <br />
                        <customfields *ngIf="logging.custom_log_fields" [(model)]="logging.custom_log_fields" (modelChange)="onModelChanged()"></customfields>
                    </div>
                </section>
                <section *ngIf="this.logging.scope">
                    <div class="collapse-heading" data-toggle="collapse" data-target="#file-list">
                        <h2>Logs</h2>
                    </div>
                    <div id="file-list" class="collapse in">
                        <log-files></log-files>
                    </div>
                </section>
            </div>
        </div>
    `,
    styles: [`
        fieldset {
            padding-left: 0;
        }
    `]
})
export class LoggingComponent implements OnInit {
    id: string;
    logging: Logging;

    private _original: Logging;
    private _error: any;

    constructor(private _service: LoggingService,
                private _notificationService: NotificationService) {
    }

    ngOnInit() {
        this.initialize();
    }

    onModelChanged() {
        if (!this.logging) {
            return;
        }

        // Set up diff object
        var changes = DiffUtil.diff(this._original, this.logging);
        if (Object.keys(changes).length == 0) {
            return;
        }

        //
        // Update
        this._service.update(this.logging.id, changes)
            .then(logging => {
                this.setFeature(logging)
                this._notificationService.clearWarnings();
            });
    }

    onRevert() {
        this._service.revert(this.logging.id)
            .then(_ => {
                this.initialize();
            })
            .catch(e => {
                this._error = e;
            });
    }

    initialize() {
        this._service.get(this.id)
            .then(s => {
                this.setFeature(s);
            })
            .catch(e => {
                this._error = e;
            });
    }

    private setFeature(logging: Logging) {
        this.logging = logging;
        this._original = JSON.parse(JSON.stringify(logging));
    }

    private onSelectPath(target: Array<ApiFile>) {
        this.logging.directory = target[0].physical_path;
        this.onModelChanged();
    }
}