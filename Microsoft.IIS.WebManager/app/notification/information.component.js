"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var InformationComponent = /** @class */ (function () {
    function InformationComponent() {
    }
    InformationComponent.prototype.getLines = function () {
        return this.notification.split("\n");
    };
    InformationComponent = __decorate([
        core_1.Component({
            selector: 'notification',
            styles: ["\n        .message {\n            text-align: center;\n        }\n    "],
            template: "\n        <div *ngIf=\"notification\">\n            <p *ngFor=\"let line of getLines(_warning)\">\n                {{line}}\n            </p>\n        </div>\n    "
        })
    ], InformationComponent);
    return InformationComponent;
}());
exports.InformationComponent = InformationComponent;
//# sourceMappingURL=information.component.js.map