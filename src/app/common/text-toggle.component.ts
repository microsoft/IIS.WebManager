import { NgModule, Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'text-toggle',
    styles: [`
        .text-toggle {
	        position: relative;
	        display: inline-block;
	        vertical-align: top;
	        height: 34px;
	        cursor: pointer;
            font-weight: normal;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }

        .toggle-input {
	        position: absolute;
	        top: 0;
	        left: 0;
	        opacity: 0;
        }

        .toggle-input:focus + span {
            outline-style: dashed;
            outline-color: #000;
            outline-width: 2px;
            outline-offset: -2px;
            text-decoration: underline;
        }

        .toggle-container {
            display: inline-block;
            height: 34px;
        }
    `],
    template: `
        <div class="toggle-container" [attr.disabled]="disabled ? true : null">
            <label class="text-toggle">
                <input #checkbox class="toggle-input" type="checkbox"  [ngModel]="toBool()" (ngModelChange)="updateData($event)"/>
                <span class="color-active" *ngIf="toBool()">{{onText}}</span>
                <span class="red" *ngIf="!toBool()">{{offText}}</span>
            </label>
        </div>
    `
})
export class TextToggleComponent {
    @Input() public on: any;
    @Input() public off: any;
    @Input() public onText: string;
    @Input() public offText: string;
    @Input() public disabled: boolean;

    @Input('model') model: any;
    @Output('modelChange') modelChange: any = new EventEmitter();
    @Output() modelChanged: any = new EventEmitter();

    @ViewChild('checkbox') private _checkbox: ElementRef;

    private updateData(event) {
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
        TextToggleComponent
    ],
    declarations: [
        TextToggleComponent
    ]
})
export class Module { }
