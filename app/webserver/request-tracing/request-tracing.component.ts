import { Component, OnInit } from '@angular/core';

import { NotificationService } from '../../notification/notification.service';
import { DiffUtil } from '../../utils/diff';

import { ApiFile } from '../../files/file';
import { RequestTracingService } from './request-tracing.service';
import { RequestTracing, RequestTracingRule, Trace, EventSeverity, Verbosity } from './request-tracing';


@Component({
    template: `
        <loading *ngIf="!(requestTracing || _service.error)"></loading>
        <error [error]="_service.error"></error>
        <div *ngIf="requestTracing" [attr.disabled]="requestTracing.metadata.is_locked ? true : null">
            <section>
                <override-mode class="pull-right" [metadata]="requestTracing.metadata" (modelChanged)="onModelChanged()"></override-mode>
                <div *ngIf="scopeType() != 'webserver'">
                    <fieldset [disabled]="scopeType() != 'website' || null">
                        <switch class="block" [(model)]="requestTracing.enabled" (modelChanged)="onModelChanged()">{{requestTracing.enabled ? "On" : "Off"}}</switch>
                    </fieldset>
                </div>
            </section>

            <tabs *ngIf="requestTracing.enabled">
                <tab [name]="'trace logs'" *ngIf="scopeType() != 'webserver' && hasFeature('traces')">
                    <trace-files></trace-files>
                </tab>
                <tab [name]="'settings'" *ngIf="scopeType() == 'website'">
                    <fieldset class="path">
                        <label>Directory</label>
                        <button title="Select Folder" [class.background-active]="fileSelector.isOpen()" class="right select" (click)="fileSelector.toggle()"></button>
                        <div class="fill">
                            <input type="text" class="form-control" [(ngModel)]="requestTracing.directory" (modelChanged)="onModelChanged()" throttle />
                        </div>
                        <server-file-selector #fileSelector [types]="['directory']" (selected)="onSelectPath($event)"></server-file-selector>
                    </fieldset>
                    <fieldset>
                        <label>Max Trace Files</label>
                        <input class="form-control" type="number" [(ngModel)]="requestTracing.maximum_number_trace_files" (modelChanged)="onModelChanged()" throttle />
                    </fieldset>
                </tab>
                <tab [name]="'rules'" *ngIf="true">
                    <rule-list></rule-list>
                </tab>
                <tab [name]="'providers'" *ngIf="scopeType() == 'webserver'">
                    <provider-list></provider-list>
                </tab>
            </tabs>
        </div>
    `,
    styles: [`
        tabs {
            display: block;
            clear: both;
        }

        section {
            margin-bottom: 15px;
        }
    `]
})
export class RequestTracingComponent implements OnInit {
    id: string;
    private requestTracing: RequestTracing;
    private _original: RequestTracing;

    constructor(private _service: RequestTracingService) {
    }

    ngOnInit() {
        this._service.get(this.id)
            .then(obj => {
                this.setFeature(obj);
            });
    }

    onModelChanged() {
        if (this.requestTracing) {
            var changes = DiffUtil.diff(this._original, this.requestTracing);

            if (Object.keys(changes).length > 0) {
                this._service.update(changes)
                    .then(feature => {
                        if (changes.enabled) {
                            this.onEnable();
                        }
                        this.setFeature(feature);
                    });

            }
        }
    }

    private hasFeature(name: string) {
        return this.requestTracing && this.requestTracing._links[name];
    }

    private setFeature(feature: RequestTracing) {
        this.requestTracing = feature;
        this._original = JSON.parse(JSON.stringify(feature));
    }

    private scopeType(): string {
        if (!this.requestTracing.scope) {
            return "webserver";
        }

        if (this.requestTracing.website && this.requestTracing.scope == this.requestTracing.website.name + "/") {
            return "website";
        }

        return "webapp";
    }

    private onEnable() {
        //
        // Add default rule if the rules list is empty
        this._service.rules
            .then(rules => {
                if (rules.length == 0) {
                    this._service.providers
                        .then(providers => {
                            let rule: RequestTracingRule = new RequestTracingRule();
                            rule.status_codes = ["100-999"];
                            rule.path = "*";
                            rule.event_severity = EventSeverity.Ignore;
                            providers.forEach(prov => {
                                if (prov.name.toLocaleLowerCase() == "www server") {
                                    let trace = new Trace();
                                    trace.provider = prov;
                                    trace.verbosity = Verbosity.Warning;
                                    trace.allowed_areas = {};
                                    prov.areas.forEach(area => trace.allowed_areas[area] = true);
                                    rule.traces = [trace];
                                }
                            });

                            this._service.createRule(rule);
                        });
                }
            })
    }

    private onSelectPath(target: Array<ApiFile>) {
        this.requestTracing.directory = target[0].physical_path;
        this.onModelChanged();
    }
}
