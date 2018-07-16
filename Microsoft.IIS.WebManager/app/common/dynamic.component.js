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
var component_loader_1 = require("./component-loader");
var DynamicComponent = /** @class */ (function () {
    function DynamicComponent(vcRef, compiler) {
        this.vcRef = vcRef;
        this.compiler = compiler;
    }
    DynamicComponent_1 = DynamicComponent;
    DynamicComponent.prototype.ngOnInit = function () {
        this._modulePath = this.module.substr(0, this.module.indexOf("#"));
        this._moduleName = this.module.substr(this._modulePath.length + 1);
        if (this.eager) {
            this.activate();
        }
    };
    DynamicComponent.prototype.activate = function () {
        var _this = this;
        if (!this.name) {
            return;
        }
        if (this._componentRef) {
            if (typeof (this._componentRef.instance["activate"]) === "function") {
                this._componentRef.instance.activate();
            }
            return;
        }
        var data = this.data;
        this.initializeComponent()
            .then(function () {
            _this.bind(data);
        });
    };
    DynamicComponent.prototype.deactivate = function () {
        if (this._componentRef) {
            if (typeof (this._componentRef.instance["deactivate"]) === "function") {
                this._componentRef.instance.deactivate();
            }
        }
    };
    DynamicComponent.prototype.rebind = function (data) {
        this.deactivate();
        this.bind(data);
        this.activate();
    };
    DynamicComponent.prototype.destroy = function () {
        if (this._componentRef) {
            this._componentRef.destroy();
        }
        this._componentRef = null;
        if (this._moduleRef) {
            this._moduleRef.destroy();
        }
        this._moduleRef = null;
    };
    DynamicComponent.prototype.initializeComponent = function () {
        var _this = this;
        if (this._componentRef) {
            return Promise.resolve();
        }
        var vRef = this.vcRef;
        return DynamicComponent_1.CreateModuleWithComponentFactories(this.compiler, this._moduleName, this._modulePath)
            .then(function (moduleWithComponentFactories) {
            var targetFactory = moduleWithComponentFactories.componentFactories.find(function (x) {
                return x.componentType.name == _this.name;
            });
            var injector = core_1.ReflectiveInjector.fromResolvedProviders([], vRef.parentInjector);
            // AppModule is the main module, it is never loaded dynamically and it imports the browser module which can only be imported once
            if (moduleWithComponentFactories.ngModuleFactory.moduleType.name != "AppModule") {
                _this._moduleRef = moduleWithComponentFactories.ngModuleFactory.create(injector);
                injector = _this._moduleRef.injector;
            }
            _this._componentRef = _this.vcRef.createComponent(targetFactory, 0, injector, []);
        });
    };
    DynamicComponent.prototype.bind = function (data) {
        if (data && this._componentRef) {
            this.data = data;
            var keys = Object.keys(data);
            for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                var key = keys_1[_i];
                this._componentRef.instance[key] = data[key];
            }
        }
    };
    DynamicComponent.CreateModuleWithComponentFactories = function (compiler, name, path) {
        return component_loader_1.ComponentLoader.LoadAsync(name, path)
            .then(function (m) {
            return compiler.compileModuleAndAllComponentsAsync(m);
        });
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], DynamicComponent.prototype, "name", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], DynamicComponent.prototype, "module", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], DynamicComponent.prototype, "selector", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object)
    ], DynamicComponent.prototype, "data", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object)
    ], DynamicComponent.prototype, "loader", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], DynamicComponent.prototype, "eager", void 0);
    DynamicComponent = DynamicComponent_1 = __decorate([
        core_1.Directive({
            selector: 'dynamic',
        }),
        __metadata("design:paramtypes", [core_1.ViewContainerRef, core_1.Compiler])
    ], DynamicComponent);
    return DynamicComponent;
    var DynamicComponent_1;
}());
exports.DynamicComponent = DynamicComponent;
var DynamicComponentArgs = /** @class */ (function () {
    function DynamicComponentArgs() {
    }
    return DynamicComponentArgs;
}());
exports.DynamicComponentArgs = DynamicComponentArgs;
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
                DynamicComponent
            ],
            declarations: [
                DynamicComponent
            ]
        })
    ], Module);
    return Module;
}());
exports.Module = Module;
//# sourceMappingURL=dynamic.component.js.map