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
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var forms_1 = require("@angular/forms");
var window_service_1 = require("../main/window.service");
var Selector = /** @class */ (function () {
    function Selector(_elem, _windowService, _renderer) {
        this._elem = _elem;
        this._windowService = _windowService;
        this._renderer = _renderer;
        this._subscriptions = [];
        this.opened = false;
        this.hide = new core_1.EventEmitter();
        this.show = new core_1.EventEmitter();
        this._menuButtonDestructors = [];
        this._fluid = this._elem.nativeElement.classList.contains('container-fluid');
        this._stretch = this._elem.nativeElement.classList.contains('stretch');
        this._id = Selector_1.getId();
        this._subscriptions.push(this.show.subscribe(function (e) {
            setTimeout(function (_) { return _windowService.trigger(); }, 10);
        }));
    }
    Selector_1 = Selector;
    Selector.prototype.ngOnInit = function () {
        var _this = this;
        if (this.opened) {
            this._pending = true;
            setTimeout(function () { return _this._pending = false; }, 10);
        }
    };
    Selector.prototype.ngAfterViewInit = function () {
        var _this = this;
        this.subscribeToMenuButtons();
        this._subscriptions.push(this._menuButtons.changes.subscribe(function (buttons) {
            _this.subscribeToMenuButtons();
        }));
    };
    Selector.prototype.toggle = function () {
        if (this.opened) {
            this.close();
        }
        else {
            this.open();
        }
    };
    Selector.prototype.open = function () {
        var _this = this;
        this._pending = true;
        this.opened = true;
        this._windowService.trigger();
        setTimeout(function () {
            _this._pending = false;
            _this.show.emit(null);
        }, 10);
    };
    Selector.prototype.close = function () {
        var _this = this;
        this._pending = true;
        this.opened = false;
        setTimeout(function () {
            _this._pending = false;
            _this.hide.emit(null);
        }, 10);
    };
    Selector.prototype.isOpen = function () {
        return this.opened;
    };
    Selector.prototype.ngOnDestroy = function () {
        for (var _i = 0, _a = this._subscriptions; _i < _a.length; _i++) {
            var sub = _a[_i];
            sub.unsubscribe();
        }
    };
    Selector.getId = function () {
        var n = Selector_1._selectorId;
        Selector_1._selectorId = Selector_1._selectorId + 1 % 4192;
        return n;
    };
    Selector.prototype.docClick = function (evt) {
        if (!this.opened || this._pending) {
            return;
        }
        var e = evt;
        if (!e._selectors || !e._selectors[this._id]) {
            this.close();
        }
    };
    Selector.prototype.insideClick = function (evt) {
        var e = evt;
        if (!e._selectors) {
            e._selectors = [];
        }
        e._selectors[this._id] = true;
    };
    Selector.prototype.subscribeToMenuButtons = function () {
        var _this = this;
        //
        // Setup subscriptions for menu buttons which should close the selector when clicked
        this._menuButtonDestructors.forEach(function (destructor) { return destructor(); });
        this._menuButtonDestructors.splice(0, this._menuButtonDestructors.length);
        if (this._menuButtons.toArray().length > 0) {
            this._menuButtons.forEach(function (menuButton) {
                _this._menuButtonDestructors.push(_this._renderer.listen(menuButton.nativeElement, 'click', function () {
                    _this.close();
                }));
            });
        }
    };
    Selector._selectorId = 0;
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], Selector.prototype, "right", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], Selector.prototype, "opened", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], Selector.prototype, "hide", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], Selector.prototype, "show", void 0);
    __decorate([
        core_1.ContentChildren('menuButton'),
        __metadata("design:type", core_1.QueryList)
    ], Selector.prototype, "_menuButtons", void 0);
    Selector = Selector_1 = __decorate([
        core_1.Component({
            selector: 'selector',
            template: "\n        <div [hidden]=\"!opened || false\" class=\"wrapper border-active background-normal shadow\" [class.align-right]=\"right\" [class.container-fluid]='_fluid' [class.stretch]='_stretch'>\n            <ng-content></ng-content>\n        </div>\n    ",
            styles: ["\n        .wrapper {\n            position:absolute;\n            z-index: 100;\n            margin-bottom: 20px;\n            border-width:1px; \n            border-style:solid;\n        }\n\n        .wrapper.container-fluid {\n            padding-top: 20px;\n        }\n\n        .wrapper.stretch,\n        .wrapper.container-fluid {\n            left:15px;\n            right:15px;\n        }\n\n        .align-right {\n            right: 0;\n        }\n\n        :host >>> ul {\n            margin-bottom: 0;\n        }\n\n        :host >>> li > button,\n        :host >>> li > .bttn {\n            min-width: 125px;\n            width: 100%;\n        }\n\n        :host.container-fluid {\n            padding: 0;\n        }\n    "
            ],
            host: {
                '(document:click)': 'docClick($event)',
                '(click)': 'insideClick($event)'
            }
        }),
        __metadata("design:paramtypes", [core_1.ElementRef,
            window_service_1.WindowService,
            core_1.Renderer])
    ], Selector);
    return Selector;
    var Selector_1;
}());
exports.Selector = Selector;
var Module = /** @class */ (function () {
    function Module() {
    }
    Module = __decorate([
        core_1.NgModule({
            imports: [
                forms_1.FormsModule,
                common_1.CommonModule
            ],
            exports: [
                Selector
            ],
            declarations: [
                Selector
            ]
        })
    ], Module);
    return Module;
}());
exports.Module = Module;
//# sourceMappingURL=selector.js.map