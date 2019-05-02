import { Component, OnInit, OnDestroy } from "@angular/core";
import { Status } from "common/status";
import { Unsubscribable } from "rxjs";
import { TitlesService } from "./titles.service";
import { NotificationService } from "notification/notification.service";
import { FeatureContext } from "common/feature-vtabs.component";

export enum UpdateType {
    Restart, Recycle, Start, Stop, Delete
}

class ModelAction {
    constructor(
        public action: UpdateType,
        public ico: string,
        public displayName: string,
        public requiredStatus: Status = null,
        public prompt: string,
    ) {}
}

const MODEL_TYPE_TOKEN = "{moduleType}";
const MODEL_NAME_TOKEN = "{updateAction}";
const MODEL_ACTIONS = [
    <ModelAction> { action: UpdateType.Restart, ico: "refresh", displayName: "Restart", requiredStatus: Status.Started, prompt: `Restart ${MODEL_TYPE_TOKEN} "${MODEL_NAME_TOKEN}"?` },
    <ModelAction> { action: UpdateType.Recycle, ico: "refresh", displayName: "Recycle", requiredStatus: Status.Started, prompt: `Recycle ${MODEL_TYPE_TOKEN} "${MODEL_NAME_TOKEN}"?` },
    <ModelAction> { action: UpdateType.Start, ico: "start", displayName: "Start", requiredStatus: Status.Stopped },
    <ModelAction> { action: UpdateType.Stop, ico: "stop", displayName: "Stop", requiredStatus: Status.Started, prompt: `Stop ${MODEL_TYPE_TOKEN} "${MODEL_NAME_TOKEN}"?` },
    <ModelAction> { action: UpdateType.Delete, ico: "delete", displayName: "Delete", prompt: `Delete ${MODEL_TYPE_TOKEN} "${MODEL_NAME_TOKEN}"?` },
];

export abstract class ModelStatusUpdater {
    constructor(
        public modelType: string,
        public ico: string,
        public displayName: string,
        public model: FeatureContext,
        public controller: Map<UpdateType, () => void>,
    ) {}
}

@Component({
    selector: 'model-header',
    template: `
<div class="model-header">
    <div *ngIf="!modelUpdater.displayName">fetching information for {{modelType}}...</div>
    <div class="status-digest"><i [class]="ico"></i><span *ngIf="modelUpdater.displayName" [ngClass]="status">{{modelUpdater.displayName}}</span></div>
    <div *ngIf="modelUpdater.controller" class="status-digest controller">
        <button *ngFor="let action of applicableActions" [ngClass]="['compact-button', action.ico]" [attr.disabled]="isDisabled(action)" (click)="invoke(action)"></button>
    </div>
</div>
`,
    styles: [`
i {
    padding-right: 0.3em;
}

.model-header {
    font-size: 14px;
    padding-left: 10px;
    padding-top: 5px;
    padding-bottom: 10px;
}

.compact-button {
    font-size: 10px;
    border: none;
    background: none;
    padding: 0px 8px;
    margin: 0px;
}

.status-digest {
    display: inline-block;
}
`]
})
export class ModelHeaderComponent implements OnInit, OnDestroy {
    ico: string;
    private subscriptions: Unsubscribable[] = [];
    private modelUpdater: ModelStatusUpdater;

    constructor(
        private title: TitlesService,
        private notifications: NotificationService,
    ) {}

    ngOnInit() {
        this.subscriptions.push(
            this.title.modelUpdater.subscribe(
                updater => {
                    this.modelUpdater = updater,
                    this.ico = this.modelUpdater.ico;
                }
            ),
        );
    }

    get status() {
        return (<any> this.modelUpdater.model).status || Status.Unknown;
    }

    isDisabled(action: ModelAction) {
        if (action.requiredStatus && this.status != action.requiredStatus) {
            return true;
        } else {
            return null;
        }
    }

    ngOnDestroy() {
        for (let s of this.subscriptions) {
            s.unsubscribe();
        }
    }

    invoke(action: ModelAction) {
        // TODO: adding gui wait for the action
        if (action.prompt) {
            this.notifications.confirm(`${action.displayName} Confirmation`, action.prompt
                .replace(MODEL_TYPE_TOKEN, this.modelUpdater.modelType)
                .replace(MODEL_NAME_TOKEN, this.modelUpdater.displayName)).then(confirmed => {
                    if (confirmed) {
                        this.invokeAction(action);
                    }
                })
        } else {
            this.invokeAction(action);
        }
    }

    private invokeAction(action: ModelAction) {
        this.modelUpdater.controller.get(action.action)();
    }

    get applicableActions() {
        if (this.modelUpdater.controller) {
            return MODEL_ACTIONS.filter(a => this.modelUpdater.controller.get(a.action));
        } else {
            return [];
        }
    }

    get modelType() {
        return this.modelUpdater.modelType;
    }
}
