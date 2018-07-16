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
var ip_restrictions_1 = require("./ip-restrictions");
var IpAddressesComponent = /** @class */ (function () {
    function IpAddressesComponent() {
        this.modelChanged = new core_1.EventEmitter();
    }
    IpAddressesComponent.prototype.onModelChanged = function () {
        this.modelChanged.emit();
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", ip_restrictions_1.IpRestrictions)
    ], IpAddressesComponent.prototype, "model", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", Object)
    ], IpAddressesComponent.prototype, "modelChanged", void 0);
    IpAddressesComponent = __decorate([
        core_1.Component({
            selector: 'ip-addresses',
            template: "\n        <fieldset>\n            <label>Response Status When Denied</label>\n            <select class=\"form-control name\" [(ngModel)]=\"model.deny_action\" (modelChanged)=\"onModelChanged()\">\n                <option value=\"Abort\">Abort Connection</option>\n                <option value=\"Unauthorized\">HTTP 401 Unauthorized</option>\n                <option value=\"Forbidden\">HTTP 403 Forbidden</option>\n                <option value=\"NotFound\">HTTP 404 Not Found</option>\n            </select>\n        </fieldset>\n        <fieldset>\n            <label>Proxy Mode</label>\n            <switch class=\"block\" [(model)]=\"model.enable_proxy_mode\" (modelChanged)=\"onModelChanged()\">{{model.enable_proxy_mode ? \"On\" : \"Off\"}}</switch>\n        </fieldset>\n        <fieldset>\n            <label>Use Reverse DNS Lookup</label>\n            <switch class=\"block\" [(model)]=\"model.enable_reverse_dns\" (modelChanged)=\"onModelChanged()\">{{model.enable_reverse_dns ? \"Yes\" : \"No\"}}</switch>\n        </fieldset>\n    ",
            styles: ["\n        li select,\n        li input {\n            display: inline;\n        }\n\n        .grid-list > li .actions {\n            z-index: 1;\n            position: absolute;\n            right: 0;\n        }\n        .grid-list > li.background-editing .actions {\n            top: 32px;\n        }\n    "]
        })
    ], IpAddressesComponent);
    return IpAddressesComponent;
}());
exports.IpAddressesComponent = IpAddressesComponent;
//# sourceMappingURL=ip-addresses.component.js.map