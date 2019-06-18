import { Component, Input, NgModule } from "@angular/core";
import { Status } from "./status";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";

export interface StatusModel {
    readonly status: Status;
}

export abstract class StatusController {
    private inProgress: boolean = false;
    abstract StartImpl(): Promise<any>;
    abstract StopImpl(): Promise<any>;
    constructor(
        private model: StatusModel,
    ) {}

    async RestartImpl(): Promise<any> {
        await this.StopImpl();
        await this.StartImpl();
    }

    CanStart() {
        return !this.inProgress && this.model.status == Status.Stopped;
    }

    Start() {
        this.Invoke(this.StartImpl());
    }
    
    CanStop() {
        return !this.inProgress && this.model.status == Status.Started;
    }

    Stop() {
        this.Invoke(this.StopImpl());
    }

    Restart() {
        this.Invoke(this.RestartImpl());
    }

    Invoke(operation: Promise<any>) {
        this.inProgress = true;
        operation.finally(() => this.inProgress = false);
    }
}

@Component({
    selector: 'status-controller',
    template: `
<div class="controller">
    <button class="refresh" title="{{restartLabel}}" [attr.disabled]="!controller.CanStop() || null" (click)="controller.Restart()">{{restartLabel}}</button>
    <button class="start" title="Start" [attr.disabled]="!controller.CanStart() || null" (click)="controller.Start()">Start</button>
    <button class="stop" title="Stop" [attr.disabled]="!controller.CanStop() || null" (click)="controller.Stop()">Stop</button>
</div>`,
    styles: [`
.controller {
    padding-bottom: 15px;
}
`],
})
export class StatusControllerComponent {
    // NOTE: restartLabel is a variable only because in the context AppPool, we call the action "Recycle"
    @Input() restartLabel: string = "Restart";
    @Input() controller: StatusController;
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