import { Component } from '@angular/core';
import { TitlesService } from './titles.service';
import { BehaviorSubject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Status } from 'common/status';
import { HttpClient } from 'common/http-client';
import { IsWebServerScope } from 'runtime/runtime';
import { NotificationService } from 'notification/notification.service';
import { LoggerFactory, LogLevel, Logger } from 'diagnostics/logger';

export interface Heading {
    name: string;
    ico: string;
}

export const EnableToggleLabel = "Enabled: ";

export interface FeatureToggle {
    show(): boolean;
    toggle();
    toggled(): boolean;
    disabled(): boolean;
    pending(): boolean;
}

export class WebServerFeatureToggle<T> implements FeatureToggle {
    private isWebServerScope: boolean;
    private id: string;
    private status: Status;
    private logger: Logger;

    constructor(
        loggerFactory: LoggerFactory,
        route: ActivatedRoute,
        private notifications: NotificationService,
        private httpClient: HttpClient,
        private apiUrl: string,
        private feature: BehaviorSubject<T>,
        public label: string,
    ) {
        this.isWebServerScope = IsWebServerScope(route);
        this.logger = loggerFactory.Create(this);
        this.feature.subscribe(feature => {
            if (feature) {
                this.id = (<any>feature).id;
                if (!this.id) {
                    this.logger.log(LogLevel.ERROR, `Unable to fetch id for ${typeof feature}`);
                }
            }
        });
        this.status = feature.value ? Status.Started : Status.Stopped;
    }

    public show() {
        if (this.status == Status.Unknown) {
            this.logger.log(LogLevel.ERROR, `Feature ${this.apiUrl} is in unknown state, hiding toggles`);
        }
        return this.isWebServerScope && this.status != Status.Unknown;
    }

    public toggled() {
        return this.status == Status.Started || this.status == Status.Starting;
    }

    public disabled() {
        return this.status == Status.Starting || this.status == Status.Stopping;
    }

    public pending() {
        return this.status == Status.Starting || this.status == Status.Stopping;
    }

    public toggle(): Promise<any> {
        if (this.toggled()) {
            return new Promise<any>((resolve, reject) => {
                this.notifications.confirm("Turn Off Authorization", 'This will turn off "Authorization" for the entire web server.')
                    .then(confirmed => {
                        if (confirmed) {
                            this.uninstall()
                                .then(v => resolve(v))
                                .catch(e => reject(e));
                        } else {
                            reject("User cancelled");
                        }
                    }).catch(e => reject(e));
            })
        }
        else {
            return this.install();
        }
    }

    private install() {
        this.status = Status.Starting;
        return this.httpClient.post(this.apiUrl, "")
            .then(auth => {
                this.status = Status.Started;
                this.feature.next(auth);
            })
            .catch(e => {
                this.feature.error(e);
                throw e;
            });
    }

    private uninstall() {
        this.status = Status.Stopping;
        this.feature.next(null);
        return this.httpClient.delete(this.apiUrl + this.id)
            .then(() => {
                this.status = Status.Stopped;
            })
            .catch(e => {
                this.feature.next(e);
                throw e;
            });
    }
}


@Component({
    selector: 'feature-header',
    template: `
<div class="feature-title sme-focus-zone">
    <h1>
        <i [class]="titles.heading.ico"></i><span class="border-active">{{titles.heading.name}}</span>
    </h1>
    <div class="feature-toggles">
        <ng-container *ngFor="let toggle of featureToggles">
            <switch *ngIf="toggle.show()"
                [auto]="false"
                [model]="toggle.toggled()"
                [disabled]="toggle.disabled()"
                [inlineLabel]="toggle.label"
                (modelChanged)="toggle.toggle()">
                <span *ngIf="!toggle.pending()">{{toggle.toggled() ? "On" : "Off"}}</span>
                <span *ngIf="toggle.pending()" class="loading"></span>
            </switch>
        </ng-container>
    </div>
</div>
    `,
    styles: [`
i {
    padding-right: 0.3em;
}

.feature-title {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    padding-left: 5px;
    padding-bottom: 5px;
}

.feature-title h1 {
    font-size: 20px;
    display: inline;
    padding-right: 3em;
}

.feature-title h1:before {
    display:inline-block;
}

.feature-toggles {
    display: inline-block;
}
`],
})
export class FeatureHeaderComponent {
    constructor(
        public titles: TitlesService,
    ) {}

    get featureToggles() {
        if (this.titles.featureModel) {
            return this.titles.featureModel.featureToggles;
        } else {
            return null;
        }
    }
}

// NOTE: alternative switch styles
// const toggleWidth = 44;
// const toggleHeight = 22;
// const handleWidth = 16;
// const toggleMargin = 3;
// const toggleOnHandlePosition = toggleWidth - toggleMargin - handleWidth;
// const fillHeight = toggleHeight - toggleMargin * 2;
// const fillWidth = toggleOnHandlePosition - toggleMargin;

// .switch-container {
//     display: inline-block;
//     height: ${toggleHeight}px;
//     width: ${toggleWidth}px;
// }

// .switch {
//     height: ${toggleHeight}px;
//     width: ${toggleWidth}px;
//     vertical-align: bottom;
// }

// .switch-handle {
//     height: ${fillHeight}px;
//     width: ${handleWidth}px;
// }

// .switch-fill {
//     height: ${fillHeight}px;
// }

// .switch-input:checked ~ .switch-content > .switch-fill {
//     width: ${fillWidth}px;
// }

// .switch-input:checked ~ .switch-handle {
//     left: ${toggleOnHandlePosition}px;
// }

// label {
//     margin-bottom: 0px;
// }
