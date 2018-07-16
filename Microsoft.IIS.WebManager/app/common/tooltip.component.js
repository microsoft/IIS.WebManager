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
var TooltipComponent = /** @class */ (function () {
    function TooltipComponent(_svc) {
        this._svc = _svc;
        this._defaultHeight = null;
        this._defaultWidth = null;
        this._height = this._defaultHeight;
        this._width = this._defaultWidth;
        this._left = 12;
        this._bottom = 16;
        this._heightStyle = "initial";
        this._widthStyle = "initial";
        this._leftStyle = this._left + 'px';
        this._bottomStyle = this._bottom + 'px';
        this._timer = null;
        this._visible = false;
        this._hideDelay = 150; //ms
        this._subscriptions = [];
    }
    TooltipComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        this._subscriptions.push(this._svc.resize.subscribe(function (resize) {
            _this.calculateDimensions();
            _this.calculatePosition();
        }));
    };
    TooltipComponent.prototype.ngOnDestroy = function () {
        this._subscriptions.forEach(function (sub) { return sub.unsubscribe(); });
    };
    TooltipComponent.prototype.onMouseOver = function () {
        if (this._timer) {
            window.clearTimeout(this._timer);
        }
        this._visible = true;
    };
    TooltipComponent.prototype.onMouseLeave = function () {
        var _this = this;
        this._timer = window.setTimeout(function () {
            _this._visible = false;
        }, this._hideDelay);
    };
    TooltipComponent.prototype.calculateDimensions = function () {
        if (this._defaultHeight === null) {
            this.initializeDefaults();
        }
        var width = Math.min(this._defaultWidth, window.innerWidth - this._padding);
        var height = Math.min(this._defaultHeight, this.windowHeight - this._padding);
        this._height = height;
        this._width = width;
        this._heightStyle = this._height + 'px';
        this._widthStyle = this._width + 'px';
    };
    TooltipComponent.prototype.calculatePosition = function () {
        var rect = this._helpContent.nativeElement.getBoundingClientRect();
        var elem = this._helpContent.nativeElement;
        var right = rect.left + this._width;
        var leftDiff = right - window.innerWidth + (this._padding / 2);
        if (leftDiff > 0) {
            this._left -= leftDiff;
            this._leftStyle = this._left + 'px';
        }
    };
    Object.defineProperty(TooltipComponent.prototype, "windowHeight", {
        get: function () {
            return window.innerHeight - 50;
        },
        enumerable: true,
        configurable: true
    });
    TooltipComponent.prototype.initializeDefaults = function () {
        this._defaultWidth = Math.max(this._helpContent.nativeElement.offsetWidth, 250);
        this._defaultHeight = this._helpContent.nativeElement.offsetHeight;
    };
    __decorate([
        core_1.ViewChild('helpContent'),
        __metadata("design:type", core_1.ElementRef)
    ], TooltipComponent.prototype, "_helpContent", void 0);
    TooltipComponent = __decorate([
        core_1.Component({
            selector: 'tooltip',
            template: "\n        <div tabindex=\"-1\" class=\"help-container\"\n            (mouseover)=\"onMouseOver()\"\n            (mouseleave)=\"onMouseLeave()\">\n            <i class=\"fa fa-question-circle-o\" aria-hidden=\"true\"></i>\n            <div #helpContent class=\"help-content border-color shadow\" \n                [style.visibility]=\"_visible ? 'visible' : 'hidden'\"\n                [style.height]=\"_heightStyle\"\n                [style.width]=\"_widthStyle\"\n                [style.left]=\"_leftStyle\"\n                [style.bottom]=\"_bottomStyle\">\n                <ng-content></ng-content>\n            </div>\n        </div>\n    ",
            styles: ["\n        .help-container {\n            position: relative;\n            display: inline-block;\n        }\n\n        .help-content {\n            position: absolute;\n            background: #f7f7f7;\n            border-style: solid;\n            border-width: 1px;\n            bottom: 16px;\n            left: 12px;\n            min-width: 250px;\n            padding: 5px 10px;\n            margin: 0;\n            display: inline-block;\n            z-index: 1;\n        }\n\n        .help-container:hover .help-content {\n            visibility: visible !important;\n        }\n    "]
        }),
        __metadata("design:paramtypes", [window_service_1.WindowService])
    ], TooltipComponent);
    return TooltipComponent;
}());
exports.TooltipComponent = TooltipComponent;
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
                TooltipComponent
            ],
            declarations: [
                TooltipComponent
            ]
        })
    ], Module);
    return Module;
}());
exports.Module = Module;
//# sourceMappingURL=tooltip.component.js.map