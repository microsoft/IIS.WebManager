import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Subscription } from 'rxjs/Subscription';
import { NotificationService } from '../../notification/notification.service';
import { DiffUtil } from '../../utils/diff';

import { ApiFile } from '../../files/file';
import { Status } from '../../common/status';
import { RequestTracingService } from './request-tracing.service';
import { RequestTracing, RequestTracingRule, Trace, EventSeverity, Verbosity } from './request-tracing';


@Component({
    template: `
        <loading *ngIf="_service.status == 'unknown' && !_service.error"></loading>
        <error [error]="_service.error"></error>
        <switch class="install" *ngIf="_service.webserverScope && _service.status != 'unknown'" #s
                [model]="_service.status == 'started' || _service.status == 'starting'" 
                [disabled]="_service.status == 'starting' || _service.status == 'stopping'"
                (modelChange)="_service.install($event)">
                    <span *ngIf="!isPending()">{{s.model ? "On" : "Off"}}</span>
                    <span *ngIf="isPending()" class="loading"></span>
        </switch>
        <span *ngIf="_service.status == 'stopped' && !_service.webserverScope">Request Tracing is off. Turn it on <a [routerLink]="['/webserver/request-tracing']">here</a></span>
        <override-mode class="pull-right"
            *ngIf="requestTracing"
            [scope]="requestTracing.scope"
            [metadata]="requestTracing.metadata"
            (revert)="onRevert()"
            (modelChanged)="onModelChanged()"></override-mode>
        <div *ngIf="requestTracing" [attr.disabled]="requestTracing.metadata.is_locked ? true : null">
            <section>
                <fieldset *ngIf="scopeType() != 'webserver'" [disabled]="scopeType() != 'website' || null">
                    <switch class="block" [(model)]="requestTracing.enabled" (modelChanged)="onModelChanged()">{{requestTracing.enabled ? "On" : "Off"}}</switch>
                </fieldset>
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

        .install {
            display: inline-block;
            margin-bottom: 15px;
        }

        section {
            margin-bottom: 15px;
        }
    `]
})
export class RequestTracingComponent implements OnInit, OnDestroy {
    id: string;
    private _redirect: boolean;
    private _original: RequestTracing;
    private requestTracing: RequestTracing;
    private _subscriptions: Array<Subscription> = [];

    constructor(private _service: RequestTracingService) {
    }

    public ngOnInit() {
        this.reset();
        this._subscriptions.push(this._service.requestTracing.subscribe(req => {
            this.setFeature(req);
        }));
    }

    public ngOnDestroy() {
        this._subscriptions.forEach(sub => sub.unsubscribe());
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

    private onRevert() {
        this._service.revert(this.requestTracing)
            .then(() => {
                this.reset();
            });
    }

    private isPending(): boolean {
        return this._service.status == Status.Starting
            || this._service.status == Status.Stopping;
    }

    private reset() {
        this.setFeature(null);
        this._service.init(this.id);
    }
}
