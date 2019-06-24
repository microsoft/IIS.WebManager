import { Component, Input, NgModule } from "@angular/core";
import { Status } from "./status";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";

export interface StatusModel {
    readonly name: string;
    readonly status: Status;
}

export abstract class StatusController {
    private inProgress: boolean = false;

    constructor(
        private model: StatusModel,
    ) {}

    async restartImpl(): Promise<any> {
        await this.stopImpl();
        await this.startImpl();
    }

    canStart(): boolean {
        return !this.inProgress && this.model.status == Status.Stopped;
    }

    start(): void {
        this.invoke(this.startImpl());
    }
    
    canStop(): boolean {
        return !this.inProgress && this.model.status == Status.Started;
    }

    stop(): void {
        this.invoke(this.stopImpl());
    }

    restart(): void {
        this.invoke(this.restartImpl());
    }

    invoke(operation: Promise<any>): void {
        this.inProgress = true;
        operation.finally(() => this.inProgress = false);
    }

    abstract startImpl(): Promise<any>;
    abstract stopImpl(): Promise<any>;
}

@Component({
    selector: 'status-controller',
    template: `
<div class="controller">
    <button class="refresh" title="{{restartLabel}}" [attr.disabled]="!controller.canStop() || null" (click)="controller.restart()">{{restartLabel}}</button>
    <button class="start" title="Start" [attr.disabled]="!controller.canStart() || null" (click)="controller.start()">Start</button>
    <button class="stop" title="Stop" [attr.disabled]="!controller.canStop() || null" (click)="controller.stop()">Stop</button>
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