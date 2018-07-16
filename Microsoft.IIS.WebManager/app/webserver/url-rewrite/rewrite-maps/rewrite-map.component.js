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
var notification_service_1 = require("../../../notification/notification.service");
var url_rewrite_service_1 = require("../service/url-rewrite.service");
var url_rewrite_1 = require("../url-rewrite");
var RewriteMapComponent = /** @class */ (function () {
    function RewriteMapComponent(_service, _notificationService) {
        this._service = _service;
        this._notificationService = _notificationService;
        this.deleteEvent = new core_1.EventEmitter();
        this._editing = false;
    }
    RewriteMapComponent.prototype.ngOnChanges = function (changes) {
        if (changes["map"]) {
            this._original = JSON.parse(JSON.stringify(changes["map"].currentValue));
        }
    };
    RewriteMapComponent.prototype.edit = function () {
        this._editing = true;
    };
    RewriteMapComponent.prototype.delete = function () {
        var _this = this;
        this._notificationService.confirm("Delete Rewrite Map", "Are you sure you want to delete '" + this.map.name + "'?")
            .then(function (confirmed) { return confirmed && _this._service.deleteRewriteMap(_this.map); });
    };
    RewriteMapComponent.prototype.save = function () {
        var _this = this;
        this._service.saveRewriteMap(this.map)
            .then(function () { return _this._original = JSON.parse(JSON.stringify(_this.map)); });
        this._editing = false;
    };
    RewriteMapComponent.prototype.discard = function () {
        this.map = JSON.parse(JSON.stringify(this._original));
        this._editing = false;
    };
    RewriteMapComponent.prototype.copy = function () {
        this._service.copyRewriteMap(this.map);
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", url_rewrite_1.RewriteMap)
    ], RewriteMapComponent.prototype, "map", void 0);
    __decorate([
        core_1.Output('delete'),
        __metadata("design:type", core_1.EventEmitter)
    ], RewriteMapComponent.prototype, "deleteEvent", void 0);
    RewriteMapComponent = __decorate([
        core_1.Component({
            selector: 'rewrite-map',
            template: "\n        <div *ngIf=\"map\" class=\"grid-item row\" [class.background-selected]=\"_editing\" (dblclick)=\"edit()\">\n            <div class=\"col-xs-8 col-sm-6 valign\">\n                <span class=\"pointer\" (click)=\"edit()\">{{map.name}}</span>\n            </div>\n            <div class=\"hidden-xs col-sm-2 valign\">\n                {{map.mappings.length}}\n            </div>\n            <div class=\"actions\">\n                <div class=\"action-selector\">\n                    <button title=\"More\" (click)=\"selector.toggle()\" (dblclick)=\"$event.preventDefault()\" [class.background-active]=\"(selector && selector.opened) || _editing || false\">\n                        <i class=\"fa fa-ellipsis-h\"></i>\n                    </button>\n                    <selector #selector [right]=\"true\">\n                        <ul>\n                            <li><button #menuButton class=\"edit\" title=\"Edit\" (click)=\"edit()\">Edit</button></li>\n                            <li><button #menuButton class=\"delete\" title=\"Delete\" (click)=\"delete()\">Delete</button></li>\n                            <li><button #menuButton class=\"copy\" title=\"Copy\" (click)=\"copy()\">Clone</button></li>\n                        </ul>\n                    </selector>\n                </div>\n            </div>\n        </div>\n        <selector #editSelector [opened]=\"true\" *ngIf=\"_editing\" class=\"container-fluid\" (hide)=\"discard()\">\n            <rewrite-map-edit [map]=\"map\" (save)=\"save($event)\" (cancel)=\"discard()\"></rewrite-map-edit>\n        </selector>\n    "
        }),
        __metadata("design:paramtypes", [url_rewrite_service_1.UrlRewriteService, notification_service_1.NotificationService])
    ], RewriteMapComponent);
    return RewriteMapComponent;
}());
exports.RewriteMapComponent = RewriteMapComponent;
//# sourceMappingURL=rewrite-map.component.js.map