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
var options_service_1 = require("./options.service");
var HomeComponent = /** @class */ (function () {
    function HomeComponent(_options, _route) {
        this._options = _options;
        this._route = _route;
    }
    HomeComponent = __decorate([
        core_1.Component({
            styles: ["\n        .sidebar .home::before {content: \"\\f015\";}\n\n        :host >>> .sidebar > vtabs .items:before {\n            content: \"\";\n        }\n\n        :host >>> .sidebar > vtabs .items {\n            top: 35px;\n        }\n\n        :host >>> .sidebar > vtabs .content {\n            margin-top: 10px;\n        }\n    "],
            template: "\n        <div>\n            <div class=\"sidebar\" [class.nav]=\"_options.active\">\n                <vtabs [markLocation]=\"true\" (activate)=\"_options.refresh()\">\n                    <item [name]=\"'Web Sites'\" [ico]=\"'fa fa-globe'\">\n                        <dynamic [name]=\"'WebSiteListComponent'\" [module]=\"'app/webserver/websites/websites.module#WebSitesModule'\"></dynamic>\n                    </item>\n                    <item [name]=\"'Web Server'\" [ico]=\"'fa fa-server'\" [routerLink]=\"['/webserver']\"></item>\n                    <item [name]=\"'Files'\" [ico]=\"'fa fa-files-o'\">\n                        <dynamic [name]=\"'FilesComponent'\" [module]=\"'app/files/files.module#FilesModule'\"></dynamic>\n                    </item>\n                    <item [name]=\"'Monitoring'\" [ico]=\"'fa fa-medkit'\">\n                        <dynamic [name]=\"'MonitoringComponent'\" [module]=\"'app/webserver/monitoring/monitoring.module#MonitoringModule'\"></dynamic>\n                    </item>\n                </vtabs>\n            </div>\n        </div>\n    "
        }),
        __metadata("design:paramtypes", [options_service_1.OptionsService,
            router_1.ActivatedRoute])
    ], HomeComponent);
    return HomeComponent;
}());
exports.HomeComponent = HomeComponent;
//# sourceMappingURL=home.component.js.map