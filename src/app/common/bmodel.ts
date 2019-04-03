import {NgModule, Directive, Input, Output, EventEmitter, ElementRef, Optional, Self, Inject, forwardRef, Renderer, OnDestroy} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {fromEvent, Subscription} from 'rxjs';
import {filter, map, debounceTime, distinctUntilChanged} from 'rxjs/operators';

@Directive({
    selector: '[throttle][ngModel]',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => Throttle),
        multi: true
    }],
    host: {
        '[class.highlight]': '_modified',
        '(input)': 'onInputChange($event)'
    }
})
export class Throttle implements ControlValueAccessor, OnDestroy {
    @Input('throttle') delay: number;

    private _modified = false;
    private _subscriptions: Array<Subscription> = [];

    constructor(private __renderer: Renderer,
                private el: ElementRef) {
                }

    ngOnInit() {
        // Observable subscription handlers overwrite 'this' inside handling function
        var self = this;
        var onChange = function (x) {
            if (self._modified) {
                self.onChange(x);
            }
            self._modified = false;
        }

        var keyupEnter = fromEvent(this.el.nativeElement, 'keyup').pipe(
            filter(e => {
                // 13 is the keycode for enter
                // 'which' is the recommended way to access the keycode
                return ((<any>e).which == 13) || !!this.delay;
            }),
            map(val => this.el.nativeElement.value),
            debounceTime(this.delay),
            distinctUntilChanged()
        );

        var blur = fromEvent(this.el.nativeElement, 'blur').pipe(
            map(val => this.el.nativeElement.value)
        );

        // Default Value Accessor calls onChange whenever user types into text box
        // We limit it to pressing the enter key and blur
        this._subscriptions.push(keyupEnter.subscribe(onChange));
        this._subscriptions.push(blur.subscribe(onChange));
    }

    onChange = (_: any) => { };
    onTouched = () => { };

    registerOnChange(fn: (value: any) => any): void { this.onChange = fn; }

    registerOnTouched(fn: () => any): void { this.onTouched = fn; }

    writeValue(value: any): void {
        this.__renderer.setElementProperty(this.el.nativeElement, 'value', value);
    }

    onInputChange($event) {
        this._modified = true;
    }

    reset() {
        this._modified = false;
    }

    ngOnDestroy() {
        this._subscriptions.forEach(sub => {
            sub.unsubscribe();
        })
    }
}

@Directive({
    selector: 'input',
    host: {
        '[class.unfocused]': '!_visited',
        '(focus)': '_visited=true'
    }
})
export class FocusMarker {
    private _visited: boolean;
}

@Directive({
    selector: '[ngModel][validate]'
})
export class Validator {
    private _prev;

    constructor(@Optional() @Self() @Inject(NG_VALUE_ACCESSOR) private _valueAccessors: ControlValueAccessor[],
                @Optional() @Self() @Inject(NgControl) private _control: NgControl) {
                }

    ngOnInit() {
        if (this._valueAccessors) {
            var targetAccessor = this._valueAccessors[this._valueAccessors.length - 1];
            this._prev = (<any>targetAccessor).onChange;
            targetAccessor.registerOnChange(x => {
                this.onChange(x);
            });
        }
    }

    onChange($event) {

        // Original value of control
        var original = this._control.value;

        // Change value of control
        (<any>(this._control.control)).updateValue($event, { onlySelf: false, emitEvent: false, emitModelToViewChange: false });

        // Attain the valid state of the control while it has the new value
        var valid = this._control.valid;

        // Restore original value of the control
        (<any>(this._control.control)).updateValue(original, { onlySelf: false, emitEvent: false, emitModelToViewChange: false });

        if (valid) {
            if (typeof (this._prev) == 'function') {
                this._prev($event);
            }
        }
    }
}

@Directive({
    selector: 'input[ngModel],select[ngModel]'
})
export class ModelChange {
    @Output()
    modelChanged: EventEmitter<any> = new EventEmitter();
    
    private _prev;

    constructor(@Optional() @Inject(NG_VALUE_ACCESSOR) private _valueAccessors: ControlValueAccessor[],
                @Optional() @Self() @Inject(NgControl) private _control: NgControl) {
                }

    ngOnInit() {
        if (this._valueAccessors) {
            var targetAccessor = this._valueAccessors[this._valueAccessors.length - 1];
            this._prev = (<any>targetAccessor).onChange;
            targetAccessor.registerOnChange(x => {
                this.onChange(x);
            });
        }
    }

    onChange($event) {
        if (typeof (this._prev) == 'function') {
            this._prev($event);
        }
        this.modelChanged.emit(null);
    }
}



export const MODEL_DIRECTIVES: any[] = [
    Throttle,
    FocusMarker,
    ModelChange,
    Validator
];

@NgModule({
    imports: [
        FormsModule,
        CommonModule
    ],
    exports: [
        MODEL_DIRECTIVES
    ],
    declarations: [
        MODEL_DIRECTIVES
    ]
})
export class Module { }
