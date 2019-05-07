import { Component, OnInit, OnDestroy } from "@angular/core";
import { Status } from "common/status";
import { Subscribable, Unsubscribable } from "rxjs";
import { TitlesService } from "./titles.service";
import { NotificationService } from "notification/notification.service";

export enum UpdateType {
    restart, recycle, start, stop, delete
}

class ModelAction {
    constructor(
        public action: UpdateType,
        public ico: string,
        public displayName: string,
        public requiredStatus: Status = null,
    ) {}
}

const MODEL_ACTIONS = [
    <ModelAction> { action: UpdateType.restart, ico: "refresh", displayName: "Restart", requiredStatus: Status.Started },
    <ModelAction> { action: UpdateType.recycle, ico: "refresh", displayName: "Recycle", requiredStatus: Status.Started },
    <ModelAction> { action: UpdateType.start, ico: "start", displayName: "Start", requiredStatus: Status.Stopped },
    <ModelAction> { action: UpdateType.stop, ico: "stop", displayName: "Stop", requiredStatus: Status.Started },
    <ModelAction> { action: UpdateType.delete, ico: "delete", displayName: "Delete" },
];

export abstract class ModelStatusUpdater {
    constructor(
        public modelType: string,
        public ico: string,
        public displayName: string,
        public statusUpdate: Subscribable<Status>,
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
        <button *ngFor="let action of applicableActions" [ngClass]="['compact-button', action.ico]" [attr.disabled]="action.requiredStatus && status != action.requiredStatus" (click)="invoke(action.action)"></button>
    </div>
</div>
`,
    styles: [`
i {
    padding-right: 0.3em;
}

.model-header {
    font-size: 14px;
    padding-left: 5px;
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
    status: Status;
    ico: string;
    private subscriptions: Unsubscribable[] = [];
    private modelUpdater: ModelStatusUpdater;

    constructor(
        private title: TitlesService,
        private notifications: NotificationService,
    ) {}

    ngOnInit() {
        this.subscriptions.push(
            this.title.modelUpdate.subscribe(
                updater => {
                    this.modelUpdater = updater,
                    this.ico = this.modelUpdater.ico;
                }
            ),
        );
        this.subscriptions.push(
            this.modelUpdater.statusUpdate.subscribe(
                status => this.status = status,
            ),
        );
    }

    get applicableActions() {
        return MODEL_ACTIONS.filter(a => this.modelUpdater.controller.get(a.action));
    }

    ngOnDestroy() {
        for (let s of this.subscriptions) {
            s.unsubscribe();
        }
    }

    restart() {

    }

    recycle() {

    }

    stop() {

    }

    delete() {

    }

    get modelType() {
        return this.modelUpdater.modelType;
    }
}
