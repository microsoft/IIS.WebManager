import { NgModule, Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'switch',
    styles: [`
        .switch {
	        position: relative;
	        display: inline-block;
	        vertical-align: top;
	        width: 94px;
	        height: 34px;
	        cursor: pointer;
        }

        .switch-label {
            display:inline-block;
            margin-right: 5px;
        }

        .switch-input[disabled] {
            height: 500px;
        }

        .switch-input {
	        position: absolute;
	        top: 0;
	        left: 0;
	        opacity: 0;
        }
        .switch-content {
	        position: relative;
	        display: block;
	        height: inherit;
	        font-size: 12px;
	        text-transform: uppercase;
	        border-radius: inherit;
            border-style: solid;
            border-width: 1px;
        }
        .switch-content:before, .switch-content:after {
	        position: absolute;
	        top: 50%;
	        margin-top: -.5em;
	        line-height: 1;
	        -webkit-transition: inherit;
	        -moz-transition: inherit;
	        -o-transition: inherit;
	        transition: inherit;
        }
        .switch-content:before {
	        content: attr(data-off);
	        right: 11px;
	        color: #a94442;
        }
        .switch-content:after {
	        content: attr(data-on);
	        left: 11px;
	        color: #3c763d;
	        opacity: 0;
        }
        .switch-fill {
            width: 0;
	        -webkit-transition: inherit;
	        -moz-transition: inherit;
	        -o-transition: inherit;
	        transition: inherit;

            height: 28px;
            position: absolute;
            left: 2px;
            top: 2px;
        }
        .switch-input:checked ~ .switch-content > .switch-fill {
            width: 66px;
        }
        .switch-input:checked ~ .switch-content:before {
	        opacity: 0;
        }
        .switch-input:checked ~ .switch-content:after {
	        opacity: 1;
        }
        .switch-handle {
	        position: absolute;
	        top: 3px;
	        left: 3px;
	        width: 20px;
	        height: 28px;
            border-style: solid;
            border-width: 2px;
        }
        .switch-handle:before {
	        content: "";
	        position: absolute;
	        top: 50%;
	        left: 50%;
	        margin: -6px 0 0 -6px;
	        width: 12px;
	        height: 12px;
        }
        .switch-input:checked ~ .switch-handle {
	        left: 71px;
        }
        .switch-container {
            display: inline-block;
            height: 34px;
        }
        .switch-content, .switch-handle {
	        transition:             All 0.3s ease;
	        -webkit-transition:     All 0.3s ease;
	        -moz-transition:        All 0.3s ease;
	        -o-transition:          All 0.3s ease;
        }

        .switch-line {
            display:inline-block;
            vertical-align:bottom;
            line-height:34px;
        }
    `],
    template: `
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
