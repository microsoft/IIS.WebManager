import { NgModule, Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'switch',
    styles: [`
    `],
    template: `
        <div class="inline-label" *ngIf="inlineLabel">{{inlineLabel}}</div>
        <div class="switch-container" [attr.disabled]="disabled ? true : null">
            <label class="switch">
                <input #checkbox class="switch-input" type="checkbox"  [ngModel]="toBool()" (ngModelChange)="updateData($event)"/>
                <span class="switch-content border-color background-normal" ><div class="switch-fill background-active"></div></span>
                <span class="switch-handle border-active background-normal"></span>
            </label>
        </div>
        <div class="switch-line"><ng-content></ng-content></div>
    `,
    exportAs: 'switchVal'
})
export class SwitchComponent {
    @Input() inlineLabel: string;
    @Input() on: any;
    @Input() off: any;
    @Input() disabled: boolean;
    @Input() auto: boolean = true;

    @Input('model') model: any;
    @Output('modelChange') modelChange: any = new EventEmitter();
    @Output() modelChanged: any = new EventEmitter();

    @ViewChild('checkbox') private _checkbox: ElementRef;

    public ngOnChanges() {
        if (!this.auto) {
            this._checkbox.nativeElement.checked = this.model;
        }
    }

    private updateData(event) {
        if (!this.auto) {
            this.model = !event;
            this._checkbox.nativeElement.checked = this.model;
            this.modelChanged.emit();
            return;
        }

        this.model = event;

        var emitValue = event
        if (event && this.on !== undefined) {
            emitValue = this.on;
        }
        else if (!event && this.off !== undefined) {
            emitValue = this.off;
        }

        this.modelChange.emit(emitValue);
        this.modelChanged.emit();
    }

    private toBool(): boolean {
        if (this.model === undefined || this.model === null) {
            return false;
        }

        if (this.model === this.on) {
            return true;
        }

        if (this.model === this.off) {
            return false;
        }

        return !!this.model;
    }
}

@NgModule({
    imports: [
        FormsModule,
        CommonModule
    ],
    exports: [
        SwitchComponent
    ],
    declarations: [
        SwitchComponent
    ]
})
export class Module { }
