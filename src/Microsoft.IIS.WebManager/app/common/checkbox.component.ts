
import {NgModule, Component, Input, Output, EventEmitter} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';


@Component({
    selector: 'checkbox2',
    styles: [`
.checkbox-revamped {
    display: inline-block;
}

input[type=checkbox].revamped {
    width     : 14px;
    margin    : 0;
    padding   : 0;
    opacity   : 0;
    position  : relative;
    cursor    : pointer;
}

input[type=checkbox].revamped + label {
    display      : inline;
    margin       : 0px;
    margin-left  : -18px;
    line-height  : 18px;
    padding      : 0px;
    cursor       : pointer;
}

input[type=checkbox].revamped + label > span:first-of-type {
    display          : inline-block;
    width            : 18px;
    height           : 18px;
    margin-right     : 3px;
    vertical-align   : bottom;
    border-style     : solid;
    border-width     : 1px;
}


input[type=checkbox].revamped:checked + label > span:first-of-type:before {
    content     : '✓';
    display     : block;
    width       : 16px;
    font-size   : 15px;
    line-height : 1em;
    text-align  : center;
    font-weight : bold;
}

input[type=checkbox][disabled] + label {
    cursor           : default;
}

label {
    font-weight : normal;
}
    `],

    template: `
<div class="checkbox-revamped">
    <input type="checkbox" [disabled]="disabled ? true: null" class="revamped" [ngModel]="model" (ngModelChange)="updateData($event)" />
    <label (click)="labelClick()">
        <span class="color-active border-color background-normal" [attr.disabled]="disabled ? true: null"><span></span></span>
        <ng-content></ng-content>
    </label>
</div>
`
})
export class CheckBoxComponent {    

    @Input()
    model: any;
    @Input()
    disabled: boolean;
    @Output()
    modelChange: any = new EventEmitter();
    @Output()
    modelChanged: any = new EventEmitter();

    updateData(event) {
        if (this.disabled) {
            return;
        }

        this.model = event;
        this.modelChange.emit(event);
        this.modelChanged.emit();
    }

    labelClick() {
        this.updateData(!this.model);
    }
}

@NgModule({
    imports: [
        FormsModule,
        CommonModule
    ],
    exports: [
        CheckBoxComponent
    ],
    declarations: [
        CheckBoxComponent
    ]
})
export class Module { }
