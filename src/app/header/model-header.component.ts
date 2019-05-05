import { Component, OnInit, OnDestroy } from "@angular/core";
import { Status } from "common/status";
import { Subscribable, Unsubscribable } from "rxjs";
import { TitlesService } from "./titles.service";

export class ModelStatusUpdater {
    constructor(
        public ico: string,
        public model: Promise<any>,
        public statusUpdate: Subscribable<Status>,
    ) {}

    public getDisplayName(model): string {
        return model.name;
    }
}

@Component({
    selector: 'model-header',
    template: `
<div class="model-header">
    <div *ngIf="!displayName">loading module...</div>
    <i [class]="ico"></i><span *ngIf="displayName" [ngClass]="status">{{displayName}}</span>
    <div>Status: {{status}}</div>
</div>
`,
    styles: [`
i {
    padding-right: 0.3em;
}

.model-header {
    font-size: 14px;
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
                        status => {
                            debugger
                            this.status = status
                        },
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
}
