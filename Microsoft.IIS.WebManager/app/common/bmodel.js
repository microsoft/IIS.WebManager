"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var forms_1 = require("@angular/forms");
var common_1 = require("@angular/common");
var forms_2 = require("@angular/forms");
var Observable_1 = require("rxjs/Observable");
require("rxjs/add/observable/fromEvent");
require("rxjs/add/operator/map");
require("rxjs/add/operator/filter");
require("rxjs/add/operator/debounceTime");
require("rxjs/add/operator/distinctUntilChanged");
var Throttle = /** @class */ (function () {
    function Throttle(__renderer, el) {
        this.__renderer = __renderer;
        this.el = el;
        this._modified = false;
        this._subscriptions = [];
        this.onChange = function (_) { };
        this.onTouched = function () { };
    }
    Throttle_1 = Throttle;
    Throttle.prototype.ngOnInit = function () {
        var _this = this;
        // Observable subscription handlers overwrite 'this' inside handling function
        var self = this;
        var onChange = function (x) {
            if (self._modified) {
                self.onChange(x);
            }
            self._modified = false;
        };
        var keyupEnter = Observable_1.Observable.fromEvent(this.el.nativeElement, 'keyup')
            .filter(function (e) {
            // 13 is the keycode for enter
            // 'which' is the recommended way to access the keycode
            return (e.which == 13) || !!_this.delay;
        })
            .map(function (val) { return _this.el.nativeElement.value; })
            .debounceTime(this.delay)
            .distinctUntilChanged();
        var blur = Observable_1.Observable.fromEvent(this.el.nativeElement, 'blur')
            .map(function (val) { return _this.el.nativeElement.value; });
        // Default Value Accessor calls onChange whenever user types into text box
        // We limit it to pressing the enter key and blur
        this._subscriptions.push(keyupEnter.subscribe(onChange));
        this._subscriptions.push(blur.subscribe(onChange));
    };
    Throttle.prototype.registerOnChange = function (fn) { this.onChange = fn; };
    Throttle.prototype.registerOnTouched = function (fn) { this.onTouched = fn; };
    Throttle.prototype.writeValue = function (value) {
        this.__renderer.setElementProperty(this.el.nativeElement, 'value', value);
    };
    Throttle.prototype.onInputChange = function ($event) {
        this._modified = true;
    };
    Throttle.prototype.reset = function () {
        this._modified = false;
    };
    Throttle.prototype.ngOnDestroy = function () {
        this._subscriptions.forEach(function (sub) {
            sub.unsubscribe();
        });
    };
    __decorate([
        core_1.Input('throttle'),
        __metadata("design:type", Number)
    ], Throttle.prototype, "delay", void 0);
    Throttle = Throttle_1 = __decorate([
        core_1.Directive({
            selector: '[throttle][ngModel]',
            providers: [{
                    provide: forms_1.NG_VALUE_ACCESSOR,
                    useExisting: core_1.forwardRef(function () { return Throttle_1; }),
                    multi: true
                }],
            host: {
                '[class.highlight]': '_modified',
                '(input)': 'onInputChange($event)'
            }
        }),
        __metadata("design:paramtypes", [core_1.Renderer,
            core_1.ElementRef])
    ], Throttle);
    return Throttle;
    var Throttle_1;
}());
var FocusMarker = /** @class */ (function () {
    function FocusMarker() {
    }
    FocusMarker = __decorate([
        core_1.Directive({
            selector: 'input',
            host: {
                '[class.unfocused]': '!_visited',
                '(focus)': '_visited=true'
            }
        })
    ], FocusMarker);
    return FocusMarker;
}());
var Validator = /** @class */ (function () {
    function Validator(_valueAccessors, _control) {
        this._valueAccessors = _valueAccessors;
        this._control = _control;
    }
    Validator.prototype.ngOnInit = function () {
        var _this = this;
        if (this._valueAccessors) {
            var targetAccessor = this._valueAccessors[this._valueAccessors.length - 1];
            this._prev = targetAccessor.onChange;
            targetAccessor.registerOnChange(function (x) {
                _this.onChange(x);
            });
        }
    };
    Validator.prototype.onChange = function ($event) {
        // Original value of control
        var original = this._control.value;
        // Change value of control
        (this._control.control).updateValue($event, { onlySelf: false, emitEvent: false, emitModelToViewChange: false });
        // Attain the valid state of the control while it has the new value
        var valid = this._control.valid;
        // Restore original value of the control
        (this._control.control).updateValue(original, { onlySelf: false, emitEvent: false, emitModelToViewChange: false });
        if (valid) {
            if (typeof (this._prev) == 'function') {
                this._prev($event);
            }
        }
    };
    Validator = __decorate([
        core_1.Directive({
            selector: '[ngModel][validate]'
        }),
        __param(0, core_1.Optional()), __param(0, core_1.Self()), __param(0, core_1.Inject(forms_1.NG_VALUE_ACCESSOR)),
        __param(1, core_1.Optional()), __param(1, core_1.Self()), __param(1, core_1.Inject(forms_1.NgControl)),
        __metadata("design:paramtypes", [Array, forms_1.NgControl])
    ], Validator);
    return Validator;
}());
var ModelChange = /** @class */ (function () {
    function ModelChange(_valueAccessors, _control) {
        this._valueAccessors = _valueAccessors;
        this._control = _control;
        this.modelChanged = new core_1.EventEmitter();
    }
    ModelChange.prototype.ngOnInit = function () {
        var _this = this;
        if (this._valueAccessors) {
            var targetAccessor = this._valueAccessors[this._valueAccessors.length - 1];
            this._prev = targetAccessor.onChange;
            targetAccessor.registerOnChange(function (x) {
                _this.onChange(x);
            });
        }
    };
    ModelChange.prototype.onChange = function ($event) {
        if (typeof (this._prev) == 'function') {
            this._prev($event);
        }
        this.modelChanged.emit(null);
    };
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], ModelChange.prototype, "modelChanged", void 0);
    ModelChange = __decorate([
        core_1.Directive({
            selector: 'input[ngModel],select[ngModel]'
        }),
        __param(0, core_1.Optional()), __param(0, core_1.Inject(forms_1.NG_VALUE_ACCESSOR)),
        __param(1, core_1.Optional()), __param(1, core_1.Self()), __param(1, core_1.Inject(forms_1.NgControl)),
        __metadata("design:paramtypes", [Array, forms_1.NgControl])
    ], ModelChange);
    return ModelChange;
}());
exports.MODEL_DIRECTIVES = [
    Throttle,
    FocusMarker,
    ModelChange,
    Validator
];
var Module = /** @class */ (function () {
    function Module() {
    }
    Module = __decorate([
        core_1.NgModule({
            imports: [
                forms_2.FormsModule,
                common_1.CommonModule
            ],
            exports: [
                exports.MODEL_DIRECTIVES
            ],
            declarations: [
                exports.MODEL_DIRECTIVES
            ]
        })
    ], Module);
    return Module;
}());
exports.Module = Module;
//# sourceMappingURL=bmodel.js.map