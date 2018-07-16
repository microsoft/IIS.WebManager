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
var request_tracing_1 = require("./request-tracing");
var TraceComponent = /** @class */ (function () {
    function TraceComponent() {
    }
    TraceComponent.prototype.getKeys = function (o) {
        return Object.keys(o);
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", request_tracing_1.Trace)
    ], TraceComponent.prototype, "model", void 0);
    TraceComponent = __decorate([
        core_1.Component({
            selector: 'trace',
            template: "\n        <div *ngIf=\"model\">\n            <fieldset class=\"inline-block pull-left\">\n                <label>Verbosity</label>\n                <div>\n                    <select id=\"s\" class=\"form-control\" [(ngModel)]=\"model.verbosity\">\n                        <option value=\"general\">General</option>\n                        <option value=\"criticalerror\">Critical Error</option>\n                        <option value=\"error\">Error</option>\n                        <option value=\"warning\">Warning</option>\n                        <option value=\"information\">Information</option>\n                        <option value=\"verbose\">Verbose</option>\n                    </select>\n                </div>\n            </fieldset>\n            <fieldset class=\"inline-block\" *ngIf=\"getKeys(model.allowed_areas).length > 0\">\n                <label>Areas</label>\n                <ul>\n                    <li *ngFor=\"let area of getKeys(model.allowed_areas)\">                        \n                        <checkbox2 [(model)]=\"model.allowed_areas[area]\"><span>{{area}}</span></checkbox2>\n                    </li>\n                </ul>\n            </fieldset>\n        </div>\n    ",
            styles: ["\n        li {\n            margin-top: 4px;\n        }\n        \n        li:first-of-type {\n            margin-top: 0;\n        }\n\n        li span {\n            font-weight: normal;\n        }\n    \n        fieldset {\n            \n        }\n\n        fieldset div {\n            max-width: 180px;\n            display: block;\n        }\n    "],
        })
    ], TraceComponent);
    return TraceComponent;
}());
exports.TraceComponent = TraceComponent;
//# sourceMappingURL=trace.component.js.map