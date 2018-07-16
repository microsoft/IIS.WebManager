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
var webserver_1 = require("./webserver");
var WebServerGeneralComponent = /** @class */ (function () {
    function WebServerGeneralComponent() {
    }
    __decorate([
        core_1.Input(),
        __metadata("design:type", webserver_1.WebServer)
    ], WebServerGeneralComponent.prototype, "model", void 0);
    WebServerGeneralComponent = __decorate([
        core_1.Component({
            selector: 'webserver-general',
            template: "\n        <fieldset>\n            <label>Name</label>\n            <span class=\"form-control\">{{model.name}}</span>\n        </fieldset>\n        <fieldset>\n            <label>Version</label>\n            <span class=\"form-control\">{{model.version}}</span>\n        </fieldset>\n    "
        })
    ], WebServerGeneralComponent);
    return WebServerGeneralComponent;
}());
exports.WebServerGeneralComponent = WebServerGeneralComponent;
//# sourceMappingURL=webserver-general.component.js.map