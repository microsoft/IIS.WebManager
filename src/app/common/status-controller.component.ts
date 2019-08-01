import { Component, Input, NgModule } from "@angular/core";
import { Status } from "./status";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";

export interface StatusModel {
    readonly name: string;
    readonly status: Status;
}

export abstract class StatusController {
    private _inProgress: boolean = false;

    constructor(
        private model: StatusModel,
    ) {}

    async restartImpl(): Promise<any> {
        await this.stopImpl();
        await this.startImpl();
    }

    canStart(): boolean {
        return !this._inProgress && this.model.status == Status.Stopped;
    }

    start(): void {
        this.invoke(this.startImpl());
    }
    
    canStop(): boolean {
        return !this._inProgress && this.model.status == Status.Started;
    }

    stop(): void {
        this.invoke(this.stopImpl());
    }

    restart(): void {
        this.invoke(this.restartImpl());
    }

    invoke(operation: Promise<any>): void {
        this._inProgress = true;
        operation.finally(() => this._inProgress = false);
    }

    get inProgress() {
        return this._inProgress;
    }

    get status() {
        return this.model.status;
    }

    abstract startImpl(): Promise<any>;
    abstract stopImpl(): Promise<any>;
}

@Component({
    selector: 'status-controller',
    template: `
<div class="controller">
    <button class="refresh list-action-button" title="{{restartLabel}}" [attr.disabled]="!controller.canStop() || null" (click)="controller.restart()">{{restartLabel}}</button>
    <button class="start list-action-button" title="Start" [attr.disabled]="!controller.canStart() || null" (click)="controller.start()">Start</button>
    <button class="stop list-action-button" title="Stop" [attr.disabled]="!controller.canStop() || null" (click)="controller.stop()">Stop</button>
    <div *ngIf="inProgress" class="processing"><i aria-hidden="true" class="fa fa-spinner fa-spin"></i><span>{{status}}...</span></div>
</div>
`,
    styles: [`
.controller {
    padding-bottom: 15px;
}

.processing {
    display: inline-block;
}

.processing i {
    font-size: 18px;
    padding: 3px;
}
`],
})
export class StatusControllerComponent {
    // NOTE: restartLabel is a variable only because in the context AppPool, we call the action "Recycle"
    @Input() restartLabel: string = "Restart";
    @Input() controller: StatusController;

    get inProgress() {
        return this.controller.inProgress;
    }

    get status() {
        return this.controller.status;
    }
}

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
    ],
    exports: [
        StatusControllerComponent,
    ],
    declarations: [
        StatusControllerComponent,
    ],
})
export class Module {

}