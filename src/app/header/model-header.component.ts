import { Component, OnInit, OnDestroy } from "@angular/core";
import { Status } from "common/status";
import { Subscribable, Unsubscribable } from "rxjs";
import { TitlesService } from "./titles.service";

export interface ModelStatusController {
    start();
    stop();
    restart();
}

export abstract class ModelStatusUpdater {
    constructor(
        public modelType: string,
        public ico: string,
        public model: Promise<any>,
        public statusUpdate: Subscribable<Status>,
        public controller: ModelStatusController,
    ) {}

    public getDisplayName(model): string {
        return model.name;
    }
}

@Component({
    selector: 'model-header',
    template: `
<div class="model-header">
    <div *ngIf="!displayName">fetching information for {{modelType}}...</div>
    <div class="status-digest"><i [class]="ico"></i><span *ngIf="displayName" [ngClass]="status">{{displayName}}</span></div>
    <div *ngIf="modelUpdater.controller" class="status-digest controller">
        <button class="compact-button refresh" title="Restart" (click)="modelUpdater.controller.restart()"></button>
        <button class="compact-button start" title="Start" [attr.disabled]="status != 'stopped' || null" (click)="modelUpdater.controller.start()"></button>
        <button class="compact-button stop" title="Stop" [attr.disabled]="status != 'started' || null" (click)="modelUpdater.controller.stop()"></button>
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
    displayName: string;
    ico: string;
    private subscriptions: Unsubscribable[] = [];
    private modelUpdater: ModelStatusUpdater;

    constructor(
        private title: TitlesService,
    ) {}

    ngOnInit() {
        this.subscriptions.push(
            this.title.modelUpdate.subscribe(
                updater => {
                    this.modelUpdater = updater,
                    this.ico = this.modelUpdater.ico;
                }
            )
        );
        this.modelUpdater.model.then(
            model => {
                this.displayName = this.modelUpdater.getDisplayName(model);
                this.subscriptions.push(
                    this.modelUpdater.statusUpdate.subscribe(
                        status => this.status = status,
                    )
                )
            },
        );
    }

    ngOnDestroy() {
        for (let s of this.subscriptions) {
            s.unsubscribe();
        }
    }

    get modelType() {
        return this.modelUpdater.modelType;
    }
}
