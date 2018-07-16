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
var loading_service_1 = require("./loading.service");
var LoadingComponent = /** @class */ (function () {
    function LoadingComponent(_loadingSvc) {
        this._loadingSvc = _loadingSvc;
    }
    LoadingComponent.prototype.ngOnInit = function () {
        var _this = this;
        this._loadingSvc.begin();
        setTimeout(function (_) { return _this.setActive(true); }, 10);
    };
    LoadingComponent.prototype.ngOnDestroy = function () {
        this.setActive(false);
        this._loadingSvc.end();
    };
    LoadingComponent.prototype.setActive = function (val) {
        this._active = val;
    };
    LoadingComponent = __decorate([
        core_1.Component({
            selector: 'loading',
            template: "\n        \uFEFF<div class=\"loader\" [class.active]=\"_active\">\n            <div class=\"load-data\">\n                <span class=\"loading\">Loading</span>\n            </div>\n        </div>\n    ",
            styles: ["\n        :host {\n            position: absolute;\n        }\n    "]
        }),
        __metadata("design:paramtypes", [loading_service_1.LoadingService])
    ], LoadingComponent);
    return LoadingComponent;
}());
exports.LoadingComponent = LoadingComponent;
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
                LoadingComponent
            ],
            declarations: [
                LoadingComponent
            ]
        })
    ], Module);
    return Module;
}());
exports.Module = Module;
//# sourceMappingURL=loading.component.js.map