import { Component, Input, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

export class ListOperationDef<T> {
    constructor(
        public id: T,
        public displayName: string,
        public iconClass: string,
    ) {}
}

export abstract class ListOperationContext<T> {
    show(_: ListOperationDef<T>): boolean {
        return true;
    }

    getTitle(op: ListOperationDef<T>): string {
        return op.displayName;
    }

    abstract isDisabled(op: ListOperationDef<T>);
    abstract execute(op: ListOperationDef<T>): Promise<any>;
}

@Component({
    selector: 'list-operations-bar',
    template: `
<div class="list-actions">
    <div class="list-action-controls">
        <ng-content select=".list-operation-addon-left"></ng-content>
        <ng-container *ngFor="let op of operations">
            <button
                *ngIf="show(op, context)"
                [ngClass]="['list-action-button', op.iconClass]"
                [title]="getTitle(op, context)"
                [attr.disabled]="disable(op, context)"
                (click)="execute($event, op, context)">
                {{op.displayName}}
            </button>
        </ng-container>
        <ng-content select=".list-operation-addon-right"></ng-content>
    </div>
</div>
<ng-content select=".list-operation-addon-view"></ng-content>
`,
    styles: [`
.list-action-controls {
    padding-bottom: 25px;
    width: 100vw;
}
`],
})
export class ListOperationsBar<T> {
    @Input() operations: ListOperationDef<T>;
    @Input() context: ListOperationContext<T>;

    show(op: ListOperationDef<T>, context: ListOperationContext<T>){
        if (!context) {
            return true;
        }
        return context.show(op);
    }

    getTitle(op: ListOperationDef<T>, context: ListOperationContext<T>) {
        if (!context) {
            return op.displayName;
        }
        return context.getTitle(op);
    }

    disable(op: ListOperationDef<T>, context: ListOperationContext<T>) {
        if (!context) {
            return true;
        }
        return context.isDisabled(op);
    }

    execute(event: Event, op: ListOperationDef<T>, context: ListOperationContext<T>) {
        event.preventDefault();
        if (!context) {
            event.stopPropagation();
        }
        // TODO: display something during for promise evaluation
        context.execute(op);
    }
}

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
    ],
    declarations: [
        ListOperationsBar,
    ],
    exports: [
        ListOperationsBar,
    ],
})
export class ListModule {}