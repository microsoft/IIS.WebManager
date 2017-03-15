/// <reference path="../../node_modules/@angular/core/src/core.d.ts" />
/// <reference path="../../node_modules/@angular/http/src/http.d.ts" />

import {NgModule, Directive, forwardRef, Input} from '@angular/core';
import {NG_VALIDATORS, NgControl, NgModel, AbstractControl, Validator} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Directive({
    selector: '[validateEqual][ngModel]',
    providers: [
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => EqualValidator), multi: true }
    ]
})
export class EqualValidator implements Validator {
    @Input()
    validateEqual: any;

    validator: Function = (c: NgControl) => {
        return c.value != this.validateEqual ? { "equal": this.validateEqual } : null
    };
    
    validate(c: AbstractControl): { [key: string]: any } {
        return this.validator(c);
    }
}

@Directive({
    selector: '[lateBindValidator][ngModel]',
    providers: [
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => LateBindValidator), multi: true }
    ]
})
export class LateBindValidator implements Validator {
    @Input()
    lateBindValidator: any;

    _validator: Function;

    constructor() {
        this._validator = (c: NgControl) => {

            return !this.lateBindValidator || this.lateBindValidator(c.value);
        };
    }

    validate(c: AbstractControl): { [key: string]: any } {
        return this._validator(c);
    }
}



export const VALIDATOR_DIRECTIVES: any[] = [
    EqualValidator,
    LateBindValidator
];

@NgModule({
    imports: [
        FormsModule,
        CommonModule
    ],
    exports: [
        VALIDATOR_DIRECTIVES
    ],
    declarations: [
        VALIDATOR_DIRECTIVES
    ]
})
export class Module { }