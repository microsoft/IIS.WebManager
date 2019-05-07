import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { DiffUtil } from 'utils/diff';
import { AuthorizationService, ApiURL } from './authorization.service';
import { Authorization } from './authorization';
import { FeatureToggle, WebServerFeatureToggle, EnableToggleLabel } from 'header/feature-header.component';
import { ActivatedRoute } from '@angular/router';
import { LoggerFactory } from 'diagnostics/logger';
import { Status } from 'common/status';
import { HttpClient } from 'common/http-client';
import { NotificationService } from 'notification/notification.service';

@Component({
    template: `
        <loading *ngIf="service.status == 'unknown' && !service.error"></loading>
        <error [error]="service.error"></error>
        <span *ngIf="service.status == 'stopped' && !service.webserverScope">Authorization is off. Turn it on <a [routerLink]="['/webserver/authorization']">here</a></span>
        <override-mode class="pull-right"
            *ngIf="authorization"
            [scope]="authorization.scope"
            [metadata]="authorization.metadata"
            (revert)="onRevert()"
            (modelChanged)="onModelChanged()"></override-mode>
        <div *ngIf="authorization">
            <auth-rules></auth-rules>
        </div>
    `,
    styles: [`
        .install {
            margin-bottom: 40px;
        }
    `]
})
export class AuthorizationComponent implements OnInit, OnDestroy {
    id: string;
    authorization: Authorization;
    private original: Authorization;
    private subscriptions: Array<Subscription> = [];
    public featureToggles: FeatureToggle[] = [];

    constructor(
        private loggerFactory: LoggerFactory,
        private route: ActivatedRoute,
        private notifications: NotificationService,
        private httpClient: HttpClient,
        private _service: AuthorizationService,
    ) {
        this.subscriptions.push(_service.authorization.subscribe(settings => this.setFeature(settings)));
    }

    public ngOnInit() {
        this._service.initialize(this.id);
    }

    public ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    get service() {
        return this._service;
    }

    onModelChanged() {
        let changes = DiffUtil.diff(this.original, this.authorization);
        if (Object.keys(changes).length > 0) {
            this._service.save(changes);
        }
    }

    onRevert() {
        this._service.revert();
    }

    private setFeature(feature: Authorization) {
        this.authorization = feature;
        this.featureToggles = [
            new WebServerFeatureToggle<Authorization>(
                this.loggerFactory,
                this.route,
                this.notifications,
                this.httpClient,
                ApiURL,
                this.service.authorization,
                EnableToggleLabel,
        )];
        if (feature) {
            this.original = JSON.parse(JSON.stringify(feature));
        }
    }
}
