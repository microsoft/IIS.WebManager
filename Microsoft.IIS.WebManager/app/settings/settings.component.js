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
var options_service_1 = require("../main/options.service");
var SettingsComponent = /** @class */ (function () {
    function SettingsComponent(_options) {
        this._options = _options;
    }
    SettingsComponent = __decorate([
        core_1.Component({
            template: "\n        <div class=\"sidebar crumb\" [class.nav]=\"_options.active\">\n            <vtabs [markLocation]=\"true\">\n                <item [name]=\"'Servers'\" [ico]=\"'fa fa-server'\">\n                    <server-list></server-list>\n                </item>\n            </vtabs>\n        </div>\n    ",
            styles: ["\n        .sidebar .home::before {content: \"\\f015\";}\n        .sidebar .settings::before {content: \"\\f013\";}\n\n        :host >>> .sidebar > vtabs .vtabs > .items {\n            top: 35px;\n        }\n\n        :host >>> .sidebar > vtabs .content {\n            margin-top: 10px;\n        }\n    "]
        }),
        __metadata("design:paramtypes", [options_service_1.OptionsService])
    ], SettingsComponent);
    return SettingsComponent;
}());
exports.SettingsComponent = SettingsComponent;
//# sourceMappingURL=settings.component.js.map