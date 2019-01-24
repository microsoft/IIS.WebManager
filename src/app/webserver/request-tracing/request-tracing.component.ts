import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApiFile } from '../../files/file';
import { DiffUtil } from '../../utils/diff';
import { Status } from '../../common/status';
import { RequestTracingService } from './request-tracing.service';
import { NotificationService } from '../../notification/notification.service';
import { RequestTracing, RequestTracingRule, Trace, EventSeverity, Verbosity } from './request-tracing';


@Component({
    template: `
        <loading *ngIf="service.status == 'unknown' && !service.error"></loading>
        <error [error]="service.error"></error>
        <switch class="install" *ngIf="service.webserverScope && service.status != 'unknown'" #s
                [auto]="false"
                [model]="service.status == 'started' || service.status == 'starting'"
                [disabled]="service.status == 'starting' || service.status == 'stopping'"
                (modelChanged)="install(!s.model)">
                    <span *ngIf="!isPending()">{{s.model ? "On" : "Off"}}</span>
                    <span *ngIf="isPending()" class="loading"></span>
        </switch>
        <span *ngIf="service.status == 'stopped' && !service.webserverScope">Request Tracing is off. Turn it on <a [routerLink]="['/webserver/request-tracing']">here</a></span>
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
                        <input type="text" class="form-control left-with-button" [(ngModel)]="requestTracing.directory" (modelChanged)="onModelChanged()" throttle />
                        <button title="Select Folder" [class.background-active]="fileSelector.isOpen()" class="select" (click)="fileSelector.toggle()"></button>
                        <server-file-selector #fileSelector [types]="['directory']" [defaultPath]="requestTracing.directory" (selected)="onSelectPath($event)"></server-file-selector>
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
export class RequestTracingComponent implements OnInit, OnDestroy {
    id: string;
    private _redirect: boolean;
    private _original: RequestTracing;
    private requestTracing: RequestTracing;
    private _subscriptions: Array<Subscription> = [];

    constructor(private _service: RequestTracingService,
                private _notificationService: NotificationService) {
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

    get service() {
        return this._service;
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
                                    trace.verbosity = Verbosity.Verbose;
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

    private install(val: boolean) {
        if (val) {
            return this._service.install();
        }
        else {
            this._notificationService.confirm("Turn Off Request Tracing", 'This will turn off "Request Tracing" for the entire web server.')
                .then(result => {
                    if (result) {
                        this._service.uninstall();
                    }
                });
        }
    }
}
