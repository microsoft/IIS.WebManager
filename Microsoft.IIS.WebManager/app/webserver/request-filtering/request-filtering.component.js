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
var diff_1 = require("../../utils/diff");
var status_1 = require("../../common/status");
var request_filtering_service_1 = require("./request-filtering.service");
var notification_service_1 = require("../../notification/notification.service");
var RequestFilteringComponent = /** @class */ (function () {
    function RequestFilteringComponent(_service, _notificationService) {
        this._service = _service;
        this._notificationService = _notificationService;
        this._subscriptions = [];
    }
    RequestFilteringComponent.prototype.ngOnInit = function () {
        var _this = this;
        this._subscriptions.push(this._service.requestFiltering.subscribe(function (feature) { return _this.setFeature(feature); }));
        this._service.initialize(this.id);
    };
    RequestFilteringComponent.prototype.ngOnDestroy = function () {
        this._subscriptions.forEach(function (sub) { return sub.unsubscribe(); });
    };
    RequestFilteringComponent.prototype.onFeatureChanged = function () {
        var changes = diff_1.DiffUtil.diff(this._original, this.settings);
        if (Object.keys(changes).length == 0) {
            return;
        }
        this._service.update(changes);
    };
    RequestFilteringComponent.prototype.onRevert = function () {
        this._service.revert();
    };
    RequestFilteringComponent.prototype.setFeature = function (feature) {
        if (feature) {
            this._locked = feature.metadata.is_locked;
        }
        this.settings = feature;
        this._original = JSON.parse(JSON.stringify(feature));
    };
    RequestFilteringComponent.prototype.isPending = function () {
        return this._service.status == status_1.Status.Starting
            || this._service.status == status_1.Status.Stopping;
    };
    RequestFilteringComponent.prototype.install = function (val) {
        var _this = this;
        if (val) {
            return this._service.install();
        }
        else {
            this._notificationService.confirm("Turn Off Request Filtering", 'This will turn off "Request Filtering" for the entire web server.')
                .then(function (confirmed) {
                if (confirmed) {
                    _this._service.uninstall();
                }
            });
        }
    };
    RequestFilteringComponent = __decorate([
        core_1.Component({
            template: "\n        <loading *ngIf=\"_service.status == 'unknown' && !_service.error\"></loading>\n        <error [error]=\"_service.error\"></error>\n        <override-mode class=\"pull-right\" *ngIf=\"settings\" [scope]=\"settings.scope\" [metadata]=\"settings.metadata\" (revert)=\"onRevert()\" (modelChanged)=\"onFeatureChanged()\"></override-mode>\n        <switch class=\"install\" *ngIf=\"_service.webserverScope && _service.status != 'unknown'\" #s\n                [auto]=\"false\"\n                [model]=\"_service.status == 'started' || _service.status == 'starting'\" \n                [disabled]=\"_service.status == 'starting' || _service.status == 'stopping'\"\n                (modelChanged)=\"install(!s.model)\">\n                    <span *ngIf=\"!isPending()\">{{s.model ? \"On\" : \"Off\"}}</span>\n                    <span *ngIf=\"isPending()\" class=\"loading\"></span>\n        </switch>\n        <span *ngIf=\"_service.status == 'stopped' && !_service.webserverScope\">Request Filtering is off. Turn it on <a [routerLink]=\"['/webserver/request-filtering']\">here</a></span>\n        <div *ngIf=\"settings\">\n            <tabs>\n                <tab [name]=\"'Settings'\">\n                    <div class=\"row\">\n                        <div class=\"col-xs-7 col-md-4 col-lg-3\">\n                            <fieldset>\n                                <label>Allow Unlisted File Extensions</label>\n                                <switch class=\"block\" [disabled]=\"_locked\" [(model)]=\"settings.allow_unlisted_file_extensions\" (modelChanged)=\"onFeatureChanged()\">{{settings.allow_unlisted_file_extensions ? \"Yes\" : \"No\"}}</switch>\n                            </fieldset>\n                            <fieldset>\n                                <label>Allow Unlisted Verbs</label>\n                                <switch class=\"block\" [disabled]=\"_locked\" [(model)]=\"settings.allow_unlisted_verbs\" (modelChanged)=\"onFeatureChanged()\">{{settings.allow_unlisted_verbs ? \"Yes\" : \"No\"}}</switch>\n                            </fieldset>\n                            <fieldset>\n                                <label>Allow High Bit Characters</label>\n                                <switch class=\"block\" [disabled]=\"_locked\" [(model)]=\"settings.allow_high_bit_characters\" (modelChanged)=\"onFeatureChanged()\">{{settings.allow_high_bit_characters ? \"Yes\" : \"No\"}}</switch>\n                            </fieldset>\n                            <fieldset>\n                                <label>Allow Double Escaping</label>\n                                <switch class=\"block\" [disabled]=\"_locked\" [(model)]=\"settings.allow_double_escaping\" (modelChanged)=\"onFeatureChanged()\">{{settings.allow_double_escaping ? \"Yes\" : \"No\"}}</switch>\n                            </fieldset>\n                        </div>\n                        <div class=\"col-xs-7 col-md-4\">\n                            <fieldset>\n                                <label>Max Content Length <span class=\"units\">(bytes)</span></label>\n                                <input class=\"form-control\" [disabled]=\"_locked\" [(ngModel)]=\"settings.max_content_length\" (modelChanged)=\"onFeatureChanged()\" type=\"number\" throttle />\n                            </fieldset>\n                            <fieldset>\n                                <label>Max Url Length <span class=\"units\">(bytes)</span></label>\n                                <input class=\"form-control\" [disabled]=\"_locked\" [(ngModel)]=\"settings.max_url_length\" (modelChanged)=\"onFeatureChanged()\" type=\"number\" throttle />\n                            </fieldset>\n                            <fieldset>\n                                <label>Max Query String Length <span class=\"units\">(bytes)</span></label>\n                                <input class=\"form-control\" [disabled]=\"_locked\" [(ngModel)]=\"settings.max_query_string_length\" (modelChanged)=\"onFeatureChanged()\" type=\"number\" throttle />\n                            </fieldset>\n                        </div>\n                    </div>\n                </tab>\n                <tab [name]=\"'Rules'\">\n                    <rules [locked]=\"_locked\"></rules>\n                </tab>\n                <tab [name]=\"'File Extensions'\">\n                    <file-extensions [locked]=\"_locked\"></file-extensions>\n                </tab>\n            </tabs>\n        </div>\n    ",
            styles: ["\n        tabs {\n            display: block;\n            clear: both;\n        }\n\n        .install {\n            margin-bottom: 45px;\n        }\n    "]
        }),
        __metadata("design:paramtypes", [request_filtering_service_1.RequestFilteringService,
            notification_service_1.NotificationService])
    ], RequestFilteringComponent);
    return RequestFilteringComponent;
}());
exports.RequestFilteringComponent = RequestFilteringComponent;
//# sourceMappingURL=request-filtering.component.js.map