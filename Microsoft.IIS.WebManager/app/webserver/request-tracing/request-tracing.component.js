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
var request_tracing_service_1 = require("./request-tracing.service");
var notification_service_1 = require("../../notification/notification.service");
var request_tracing_1 = require("./request-tracing");
var RequestTracingComponent = /** @class */ (function () {
    function RequestTracingComponent(_service, _notificationService) {
        this._service = _service;
        this._notificationService = _notificationService;
        this._subscriptions = [];
    }
    RequestTracingComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.reset();
        this._subscriptions.push(this._service.requestTracing.subscribe(function (req) {
            _this.setFeature(req);
        }));
    };
    RequestTracingComponent.prototype.ngOnDestroy = function () {
        this._subscriptions.forEach(function (sub) { return sub.unsubscribe(); });
    };
    RequestTracingComponent.prototype.onModelChanged = function () {
        var _this = this;
        if (this.requestTracing) {
            var changes = diff_1.DiffUtil.diff(this._original, this.requestTracing);
            if (Object.keys(changes).length > 0) {
                this._service.update(changes)
                    .then(function (feature) {
                    if (changes.enabled) {
                        _this.onEnable();
                    }
                    _this.setFeature(feature);
                });
            }
        }
    };
    RequestTracingComponent.prototype.hasFeature = function (name) {
        return this.requestTracing && this.requestTracing._links[name];
    };
    RequestTracingComponent.prototype.setFeature = function (feature) {
        this.requestTracing = feature;
        this._original = JSON.parse(JSON.stringify(feature));
    };
    RequestTracingComponent.prototype.scopeType = function () {
        if (!this.requestTracing.scope) {
            return "webserver";
        }
        if (this.requestTracing.website && this.requestTracing.scope == this.requestTracing.website.name + "/") {
            return "website";
        }
        return "webapp";
    };
    RequestTracingComponent.prototype.onEnable = function () {
        var _this = this;
        //
        // Add default rule if the rules list is empty
        this._service.rules
            .then(function (rules) {
            if (rules.length == 0) {
                _this._service.providers
                    .then(function (providers) {
                    var rule = new request_tracing_1.RequestTracingRule();
                    rule.status_codes = ["100-999"];
                    rule.path = "*";
                    rule.event_severity = request_tracing_1.EventSeverity.Ignore;
                    providers.forEach(function (prov) {
                        if (prov.name.toLocaleLowerCase() == "www server") {
                            var trace_1 = new request_tracing_1.Trace();
                            trace_1.provider = prov;
                            trace_1.verbosity = request_tracing_1.Verbosity.Verbose;
                            trace_1.allowed_areas = {};
                            prov.areas.forEach(function (area) { return trace_1.allowed_areas[area] = true; });
                            rule.traces = [trace_1];
                        }
                    });
                    _this._service.createRule(rule);
                });
            }
        });
    };
    RequestTracingComponent.prototype.onSelectPath = function (target) {
        this.requestTracing.directory = target[0].physical_path;
        this.onModelChanged();
    };
    RequestTracingComponent.prototype.onRevert = function () {
        var _this = this;
        this._service.revert(this.requestTracing)
            .then(function () {
            _this.reset();
        });
    };
    RequestTracingComponent.prototype.isPending = function () {
        return this._service.status == status_1.Status.Starting
            || this._service.status == status_1.Status.Stopping;
    };
    RequestTracingComponent.prototype.reset = function () {
        this.setFeature(null);
        this._service.init(this.id);
    };
    RequestTracingComponent.prototype.install = function (val) {
        var _this = this;
        if (val) {
            return this._service.install();
        }
        else {
            this._notificationService.confirm("Turn Off Request Tracing", 'This will turn off "Request Tracing" for the entire web server.')
                .then(function (result) {
                if (result) {
                    _this._service.uninstall();
                }
            });
        }
    };
    RequestTracingComponent = __decorate([
        core_1.Component({
            template: "\n        <loading *ngIf=\"_service.status == 'unknown' && !_service.error\"></loading>\n        <error [error]=\"_service.error\"></error>\n        <switch class=\"install\" *ngIf=\"_service.webserverScope && _service.status != 'unknown'\" #s\n                [auto]=\"false\"\n                [model]=\"_service.status == 'started' || _service.status == 'starting'\" \n                [disabled]=\"_service.status == 'starting' || _service.status == 'stopping'\"\n                (modelChanged)=\"install(!s.model)\">\n                    <span *ngIf=\"!isPending()\">{{s.model ? \"On\" : \"Off\"}}</span>\n                    <span *ngIf=\"isPending()\" class=\"loading\"></span>\n        </switch>\n        <span *ngIf=\"_service.status == 'stopped' && !_service.webserverScope\">Request Tracing is off. Turn it on <a [routerLink]=\"['/webserver/request-tracing']\">here</a></span>\n        <override-mode class=\"pull-right\"\n            *ngIf=\"requestTracing\"\n            [scope]=\"requestTracing.scope\"\n            [metadata]=\"requestTracing.metadata\"\n            (revert)=\"onRevert()\"\n            (modelChanged)=\"onModelChanged()\"></override-mode>\n        <div *ngIf=\"requestTracing\" [attr.disabled]=\"requestTracing.metadata.is_locked ? true : null\">\n            <section>\n                <fieldset *ngIf=\"scopeType() != 'webserver'\" [disabled]=\"scopeType() != 'website' || null\">\n                    <switch class=\"block\" [(model)]=\"requestTracing.enabled\" (modelChanged)=\"onModelChanged()\">{{requestTracing.enabled ? \"On\" : \"Off\"}}</switch>\n                </fieldset>\n            </section>\n\n            <tabs *ngIf=\"requestTracing.enabled\">\n                <tab [name]=\"'trace logs'\" *ngIf=\"scopeType() != 'webserver' && hasFeature('traces')\">\n                    <trace-files></trace-files>\n                </tab>\n                <tab [name]=\"'settings'\" *ngIf=\"scopeType() == 'website'\">\n                    <fieldset class=\"path\">\n                        <label>Directory</label>\n                        <button title=\"Select Folder\" [class.background-active]=\"fileSelector.isOpen()\" class=\"right select\" (click)=\"fileSelector.toggle()\"></button>\n                        <div class=\"fill\">\n                            <input type=\"text\" class=\"form-control\" [(ngModel)]=\"requestTracing.directory\" (modelChanged)=\"onModelChanged()\" throttle />\n                        </div>\n                        <server-file-selector #fileSelector [types]=\"['directory']\" [defaultPath]=\"requestTracing.directory\" (selected)=\"onSelectPath($event)\"></server-file-selector>\n                    </fieldset>\n                    <fieldset>\n                        <label>Max Trace Files</label>\n                        <input class=\"form-control\" type=\"number\" [(ngModel)]=\"requestTracing.maximum_number_trace_files\" (modelChanged)=\"onModelChanged()\" throttle />\n                    </fieldset>\n                </tab>\n                <tab [name]=\"'rules'\" *ngIf=\"true\">\n                    <rule-list></rule-list>\n                </tab>\n                <tab [name]=\"'providers'\" *ngIf=\"scopeType() == 'webserver'\">\n                    <provider-list></provider-list>\n                </tab>\n            </tabs>\n        </div>\n    ",
            styles: ["\n        tabs {\n            display: block;\n            clear: both;\n        }\n\n        section {\n            margin-bottom: 15px;\n        }\n    "]
        }),
        __metadata("design:paramtypes", [request_tracing_service_1.RequestTracingService,
            notification_service_1.NotificationService])
    ], RequestTracingComponent);
    return RequestTracingComponent;
}());
exports.RequestTracingComponent = RequestTracingComponent;
//# sourceMappingURL=request-tracing.component.js.map