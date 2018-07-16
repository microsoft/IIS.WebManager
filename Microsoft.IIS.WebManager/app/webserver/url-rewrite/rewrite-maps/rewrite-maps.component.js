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
var selector_1 = require("../../../common/selector");
var url_rewrite_service_1 = require("../service/url-rewrite.service");
var url_rewrite_1 = require("../url-rewrite");
var RewriteMapsComponent = /** @class */ (function () {
    function RewriteMapsComponent(_service) {
        var _this = this;
        this._service = _service;
        this._rewriteMaps = [];
        this._subscriptions = [];
        this._subscriptions.push(this._service.rewriteMapSettings.subscribe(function (settings) { return _this._settings = settings; }));
        this._subscriptions.push(this._service.rewriteMaps.subscribe(function (r) {
            _this._rewriteMaps = r;
            _this.initializeNewRewriteMap();
        }));
        this.initializeNewRewriteMap();
    }
    RewriteMapsComponent.prototype.ngOnDestroy = function () {
        this._subscriptions.forEach(function (sub) { return sub.unsubscribe(); });
    };
    RewriteMapsComponent.prototype.initializeNewRewriteMap = function () {
        var _this = this;
        this._newRewriteMap = new url_rewrite_1.RewriteMap();
        var name = "New Rewrite Map";
        this._newRewriteMap.name = name;
        this._newRewriteMap.default_value = "";
        this._newRewriteMap.ignore_case = true;
        var i = 1;
        while (this._rewriteMaps.find(function (r) { return r.name.toLocaleLowerCase() == _this._newRewriteMap.name.toLocaleLowerCase(); })) {
            this._newRewriteMap.name = name + " " + i++;
        }
        this._newRewriteMap.mappings = new Array();
    };
    RewriteMapsComponent.prototype.saveNew = function () {
        var _this = this;
        this._service.addRewriteMap(this._newRewriteMap)
            .then(function () { return _this._newRewriteMapSelector.close(); });
    };
    RewriteMapsComponent.prototype.onModelChanged = function () {
        this._service.saveRewriteMapSettings(this._settings);
    };
    RewriteMapsComponent.prototype.onRevert = function () {
        this._service.revertRewriteMaps();
    };
    __decorate([
        core_1.ViewChild(selector_1.Selector),
        __metadata("design:type", selector_1.Selector)
    ], RewriteMapsComponent.prototype, "_newRewriteMapSelector", void 0);
    RewriteMapsComponent = __decorate([
        core_1.Component({
            selector: 'rewrite-maps',
            template: "\n        <error [error]=\"_service.rewriteMapsError\"></error>\n        <div *ngIf=\"!_service.rewriteMapsError && _settings\">\n            <override-mode class=\"pull-right\"\n                [metadata]=\"_settings.metadata\"\n                [scope]=\"_settings.scope\"\n                (revert)=\"onRevert()\" \n                (modelChanged)=\"onModelChanged()\"></override-mode>\n            <div>\n                <button [class.background-active]=\"newMap.opened\" (click)=\"newMap.toggle()\">Create Rewrite Map <i class=\"fa fa-caret-down\"></i></button>\n                <selector #newMap class=\"container-fluid create\" (hide)=\"initializeNewRewriteMap()\">\n                    <rewrite-map-edit [map]=\"_newRewriteMap\" (save)=\"saveNew()\" (cancel)=\"newMap.close()\"></rewrite-map-edit>\n                </selector>\n            </div>\n\n            <div>\n                <div class=\"container-fluid\">\n                    <div class=\"row hidden-xs border-active grid-list-header\">\n                        <label class=\"col-xs-6\">Name</label>\n                        <label class=\"col-xs-2\">Count</label>\n                    </div>\n                </div>\n\n                <ul class=\"grid-list container-fluid\">\n                    <li *ngFor=\"let map of _rewriteMaps\">\n                        <rewrite-map [map]=\"map\"></rewrite-map>\n                    </li>\n                </ul>\n            </div>\n        </div>\n    "
        }),
        __metadata("design:paramtypes", [url_rewrite_service_1.UrlRewriteService])
    ], RewriteMapsComponent);
    return RewriteMapsComponent;
}());
exports.RewriteMapsComponent = RewriteMapsComponent;
//# sourceMappingURL=rewrite-maps.component.js.map