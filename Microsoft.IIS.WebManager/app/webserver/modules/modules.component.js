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
var router_1 = require("@angular/router");
var notification_service_1 = require("../../notification/notification.service");
var diff_1 = require("../../utils/diff");
var modules_service_1 = require("./modules.service");
var ModulesComponent = /** @class */ (function () {
    function ModulesComponent(_service, _router, _notificationService) {
        this._service = _service;
        this._router = _router;
        this._notificationService = _notificationService;
    }
    ModulesComponent.prototype.ngOnInit = function () {
        this.initialize();
    };
    ModulesComponent.prototype.onModelChanged = function () {
        var _this = this;
        if (this.modules) {
            var changes = diff_1.DiffUtil.diff(this._original, this.modules);
            if (Object.keys(changes).length > 0) {
                this._service.patchFeature(this.modules, changes)
                    .then(function (feature) {
                    _this.modules = feature;
                    _this._original = JSON.parse(JSON.stringify(feature));
                });
            }
        }
    };
    ModulesComponent.prototype.onAddNativeModule = function (newModule) {
        var _this = this;
        newModule.modules = this.modules;
        this._service.addGlobalModule(newModule)
            .then(function (nativeModule1) {
            _this.globalModules.unshift(nativeModule1);
            _this._service.addModule(_this.modules, newModule)
                .then(function (nativeModule2) {
                _this.enabledNativeModules.unshift(nativeModule1);
                _this.activeModules.unshift(nativeModule2);
            }).catch(function (e) {
                _this.disabledNativeModules.unshift(nativeModule1);
            });
        });
    };
    ModulesComponent.prototype.onAddManagedModule = function (newModule) {
        var _this = this;
        newModule.modules = this.modules;
        this._service.addModule(this.modules, newModule)
            .then(function (module) {
            _this.activeModules.unshift(module);
            _this.managedModules.unshift(module);
        });
    };
    ModulesComponent.prototype.onRemoveManaged = function (index) {
        for (var i = 0; i < this.activeModules.length; i++) {
            if (this.activeModules[i].id == this.managedModules[index].id) {
                this.activeModules.splice(i, 1);
                break;
            }
        }
        this._service.removeModule(this.managedModules[index]);
        this.managedModules.splice(index, 1);
    };
    ModulesComponent.prototype.onRemoveNative = function (index, isEnabled) {
        var _this = this;
        if (isEnabled) {
            var tempId = this.enabledNativeModules[index].id;
            var tempName = this.enabledNativeModules[index].name;
            this._service.removeModule(this.enabledNativeModules[index])
                .then(function () {
                for (var i = 0; i < _this.globalModules.length; i++) {
                    if (tempId == _this.globalModules[i].id)
                        _this.globalModules.splice(i, 1);
                }
            });
            for (var i = 0; i < this.activeModules.length; i++) {
                if (this.activeModules[i].name == tempName) {
                    this.activeModules.splice(i, 1);
                }
            }
            this.enabledNativeModules.splice(index, 1);
        }
        else {
            var tempId = this.disabledNativeModules[index].id;
            this._service.removeModule(this.disabledNativeModules[index])
                .then(function () {
                for (var i = 0; i < _this.globalModules.length; i++) {
                    if (tempId == _this.globalModules[i].id)
                        _this.globalModules.splice(i, 1);
                }
            });
            this.disabledNativeModules.splice(index, 1);
        }
    };
    ModulesComponent.prototype.onEnable = function (index) {
        var _this = this;
        var tempModule = JSON.parse(JSON.stringify(this.disabledNativeModules[index]));
        tempModule.modules = this.modules;
        this._service.addModule(this.modules, tempModule)
            .then(function (module) {
            _this.activeModules.unshift(module);
        });
        this.enabledNativeModules.unshift(this.disabledNativeModules[index]);
        this.disabledNativeModules.splice(index, 1);
    };
    ModulesComponent.prototype.onDisable = function (index) {
        for (var i = 0; i < this.activeModules.length; i++) {
            if (this.activeModules[i].name == this.enabledNativeModules[index].name) {
                this._service.removeModule(this.activeModules[i]); // cannot call "removeModule" on "enabledNativeModules[index]", this will delete the global module
                this.activeModules.splice(i, 1);
                this.disabledNativeModules.unshift(this.enabledNativeModules[index]);
                this.enabledNativeModules.splice(index, 1);
                break;
            }
        }
    };
    ModulesComponent.prototype.onRevert = function () {
        var _this = this;
        this._service.revert(this.modules.id)
            .then(function (_) {
            _this.initialize();
        })
            .catch(function (e) {
            _this._error = e;
        });
    };
    ModulesComponent.prototype.initialize = function () {
        var _this = this;
        this._service.get(this.id)
            .then(function (s) {
            _this.activeModules = s.modules;
            _this.globalModules = s.globalModules;
            _this.modules = s.feature;
            _this.isServerSetting = (s.feature.scope == "");
            _this._original = JSON.parse(JSON.stringify(s.feature));
            _this.enabledNativeModules = [];
            _this.disabledNativeModules = [];
            _this.managedModules = [];
            for (var i in s.modules) {
                if (s.modules[i].type)
                    _this.managedModules.unshift(s.modules[i]);
            }
            for (var i in s.globalModules) {
                var enabled = false;
                for (var j in s.modules) {
                    if (s.modules[j].name == s.globalModules[i].name)
                        enabled = true;
                }
                if (!enabled)
                    _this.disabledNativeModules.unshift(s.globalModules[i]);
                else
                    _this.enabledNativeModules.unshift(s.globalModules[i]);
            }
            _this._locked = _this.modules.metadata.is_locked;
        })
            .catch(function (e) {
            _this._error = e;
        });
    };
    ModulesComponent = __decorate([
        core_1.Component({
            selector: 'modules',
            template: "\n        <loading *ngIf=\"!(modules || _error)\"></loading>\n        <error [error]=\"_error\"></error>        \n        <div *ngIf=\"modules\">\n            <override-mode class=\"pull-right\" [metadata]=\"modules.metadata\" (revert)=\"onRevert()\" (modelChanged)=\"onModelChanged()\"></override-mode>\n            <module-list [enabledNativeModules] = \"enabledNativeModules\"\n                         [disabledNativeModules] = \"disabledNativeModules\"\n                         [managedModules] = \"managedModules\"\n                         [isServerSetting] = \"isServerSetting\"\n                         (removeM) = \"onRemoveManaged($event)\"\n                         (removeE) = \"onRemoveNative($event, true)\"\n                         (removeD) = \"onRemoveNative($event, false)\"\n                         (enable) = \"onEnable($event)\"\n                         (disable) = \"onDisable($event)\"\n                         (saveNative) = \"onAddNativeModule($event)\"\n                         (saveManaged) = \"onAddManagedModule($event)\"\n                         [locked]=\"_locked\"></module-list>\n        </div>\n    "
        }),
        __metadata("design:paramtypes", [modules_service_1.ModuleService,
            router_1.Router,
            notification_service_1.NotificationService])
    ], ModulesComponent);
    return ModulesComponent;
}());
exports.ModulesComponent = ModulesComponent;
//# sourceMappingURL=modules.component.js.map