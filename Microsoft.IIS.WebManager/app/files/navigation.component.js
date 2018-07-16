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
var common_1 = require("@angular/common");
var forms_1 = require("@angular/forms");
var Observable_1 = require("rxjs/Observable");
var component_1 = require("../utils/component");
var bmodel_1 = require("../common/bmodel");
var Drop = /** @class */ (function () {
    function Drop() {
    }
    return Drop;
}());
exports.Drop = Drop;
var NavigationComponent = /** @class */ (function () {
    function NavigationComponent(_eRef, _navigator) {
        this._eRef = _eRef;
        this._navigator = _navigator;
        this._path = "";
        this._typing = false;
        this._crumbs = [];
        this._subscriptions = [];
        this.current = new Observable_1.Observable();
        this.load = new core_1.EventEmitter();
        this.drop = new core_1.EventEmitter();
    }
    NavigationComponent.prototype.ngOnInit = function () {
        var _this = this;
        this._subscriptions.push(this._navigator.path.subscribe(function (path) {
            _this.path = path;
        }));
    };
    NavigationComponent.prototype.ngOnDestroy = function () {
        for (var _i = 0, _a = this._subscriptions; _i < _a.length; _i++) {
            var sub = _a[_i];
            sub.unsubscribe();
        }
    };
    Object.defineProperty(NavigationComponent.prototype, "path", {
        set: function (val) {
            val = val.replace(/\\/g, "/");
            var v = val;
            // _path always ends with '/'
            if (v.charAt(v.length - 1) != '/') {
                v = v + '/';
            }
            this._path = v;
            // _crumbs always split from path without leading slash
            if (val[val.length - 1] == '/') {
                val = val.substr(0, val.length - 1);
            }
            this._crumbs = val.split('/');
        },
        enumerable: true,
        configurable: true
    });
    NavigationComponent.prototype.onPathChanged = function (path) {
        if (path == "" || path.charAt(0) != "/") {
            path = "/" + path;
        }
        this._navigator.onPathChanged(path);
    };
    NavigationComponent.prototype.onClickCrumb = function (index, e) {
        e.preventDefault();
        this._navigator.onPathChanged(this.getPath(index) || "/");
    };
    NavigationComponent.prototype.onClickAddress = function (e) {
        var _this = this;
        if (e.defaultPrevented) {
            return;
        }
        this._typing = true;
        setTimeout(function () {
            _this._addressBar.nativeElement.focus();
        }, 1);
    };
    NavigationComponent.prototype.onClickUp = function () {
        var curPath = this._path;
        if (!curPath) {
            return;
        }
        // Trim trailing '/'
        if (curPath.charAt(curPath.length - 1) == '/') {
            curPath = curPath.substr(0, curPath.length - 1);
        }
        var parts = curPath.split('/');
        if (parts.length <= 0) {
            return;
        }
        var newParts = [];
        for (var i = 0; i < parts.length - 1; i++) {
            newParts.push(parts[i]);
        }
        this.onPathChanged(newParts.join('/'));
    };
    NavigationComponent.prototype.dClick = function (evt) {
        if (!this._typing) {
            return;
        }
        var inside = component_1.ComponentUtil.isClickInsideComponent(evt, this._eRef);
        if (!inside) {
            this.reset();
        }
    };
    NavigationComponent.prototype.reset = function () {
        this.path = this._path;
        this._addressBar.nativeElement.value = this._path;
        this._typing = false;
    };
    NavigationComponent.prototype.getPath = function (index) {
        var parts = [];
        for (var i = 0; i <= index; i++) {
            parts.push(this._crumbs[i]);
        }
        return parts.join("/") || "/";
    };
    NavigationComponent.prototype.dragOver = function (index, e) {
        e.stopPropagation();
        e.preventDefault();
        if (e.dataTransfer.effectAllowed.toLowerCase() == "copymove") {
            e.dataTransfer.dropEffect = e.ctrlKey ? "copy" : "move";
        }
        else if (e.dataTransfer.effectAllowed == "all") {
            e.dataTransfer.dropEffect = "copy";
        }
        this._selected = index;
    };
    NavigationComponent.prototype.onDrop = function (index, e) {
        e.stopPropagation();
        e.preventDefault();
        this._selected = -1;
        this._navigator.drop({ event: e, destination: this.getPath(index) });
    };
    __decorate([
        core_1.ViewChild('addressBar'),
        __metadata("design:type", core_1.ElementRef)
    ], NavigationComponent.prototype, "_addressBar", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Observable_1.Observable)
    ], NavigationComponent.prototype, "current", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], NavigationComponent.prototype, "load", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], NavigationComponent.prototype, "drop", void 0);
    NavigationComponent = __decorate([
        core_1.Component({
            selector: 'navigation',
            template: "\n        <div>\n            <button class=\"no-border pull-left color-active\" title=\"Go Up\" (click)=\"onClickUp($event)\"><i class=\"fa fa-level-up\"></i></button>\n            <div class=\"fill\">\n                <ul *ngIf=\"_crumbs.length > 0\" [hidden]=\"_typing\" class=\"nav border-color\" (click)=\"onClickAddress($event)\">\n                    <li *ngFor=\"let item of _crumbs; let i = index;\" \n                        (dragover)=\"dragOver(i, $event)\" \n                        (drop)=\"onDrop(i, $event)\"\n                        (dragleave)=\"_selected=-1\">\n                        <span class=\"crumb hover-active\" [class.background-active]=\"i==_selected\" (click)=\"onClickCrumb(i, $event)\">{{item}}</span>/\n                    </li>\n                </ul>\n                <input #addressBar type=\"text\" class=\"form-control\" *ngIf=\"_crumbs.length > 0\" [hidden]=\"!_typing\" [ngModel]=\"_path\" (ngModelChange)=\"onPathChanged($event)\" throttle  />\n            </div>\n        </div>\n    ",
            styles: ["\n        button {\n            padding: 6px 8px;\n        }\n\n        .crumb {\n            cursor: pointer;\n            padding: 0 1px;\n            direction: ltr;\n        }\n\n        .crumb:empty:before {\n            font-family: FontAwesome;\n            content: \"\\f115\";\n            padding: 0 2px;\n        }\n\n        .nav {\n            border-style: solid;\n            border-width: 1px;\n            padding: 8px 4px;\n            height: 36px;\n        }\n\n        .nav li {\n            display: inline-block;\n        }\n\n        input {\n            height: 36px;\n            padding: 8px;\n        }\n\n        .fill {\n            width: auto;\n            overflow: hidden;\n        }\n\n        .crumb-list-wrapper {\n            height: 36px;\n            overflow: hidden;\n        }\n\n        .crumb-list-wrapper > div {\n            display: inline-block;\n            position: relative;\n        }\n\n        .crumb-list {\n            white-space: nowrap;\n            position: absolute;\n            right: 0;\n        }\n\n        .place-holder {\n            display: inline-block;\n            overflow: hidden;\n            height: 0px;\n            visibility: hidden;\n            word-break: break-all;\n        }\n\n        .crumb-list > li, .place-holder > li {\n            display: inline-block;\n        }\n    "],
            host: {
                '(document:click)': 'dClick($event)'
            }
        }),
        __param(1, core_1.Inject("INavigation")),
        __metadata("design:paramtypes", [core_1.ElementRef, Object])
    ], NavigationComponent);
    return NavigationComponent;
}());
exports.NavigationComponent = NavigationComponent;
var Module = /** @class */ (function () {
    function Module() {
    }
    Module = __decorate([
        core_1.NgModule({
            imports: [
                forms_1.FormsModule,
                common_1.CommonModule,
                bmodel_1.Module
            ],
            exports: [
                NavigationComponent
            ],
            declarations: [
                NavigationComponent
            ]
        })
    ], Module);
    return Module;
}());
exports.Module = Module;
//# sourceMappingURL=navigation.component.js.map