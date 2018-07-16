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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var Module_1 = require("../utils/Module");
var options_service_1 = require("../main/options.service");
var httpclient_1 = require("../common/httpclient");
var webserver_service_1 = require("./webserver.service");
var WebServerComponent = /** @class */ (function () {
    function WebServerComponent(_service, _http, _options, _route) {
        this._service = _service;
        this._http = _http;
        this._options = _options;
        this._route = _route;
        this.modules = [];
    }
    WebServerComponent.prototype.ngOnInit = function () {
        var _this = this;
        this._service.server.then(function (ws) {
            _this.webServer = ws;
            Module_1.ModuleUtil.initModules(_this.modules, _this.webServer, "webserver");
            Module_1.ModuleUtil.addModule(_this.modules, "Certificates");
            //
            // Insert files global module after application pools
            var index = _this.modules.findIndex(function (m) { return m.name.toLocaleLowerCase() == "application pools"; }) + 1;
            _this.modules.splice(index, 0, {
                name: "Files",
                ico: "fa fa-files-o",
                component_name: "FilesComponent",
                module: "app/files/files.module#FilesModule",
                api_name: "files",
                api_path: "/api/files/{id}"
            });
            _this._http.head('/certificates/', null, false)
                .catch(function (res) {
                _this.modules = _this.modules.filter(function (m) { return m.name.toLocaleLowerCase() !== 'certificates'; });
            });
        });
    };
    WebServerComponent = __decorate([
        core_1.Component({
            template: "\n        <div *ngIf=\"_service.installStatus == 'stopped'\" class=\"not-installed\">\n            <p>\n                Web Server (IIS) is not installed on the machine\n                <br/>\n                <a href=\"https://docs.microsoft.com/en-us/iis/install/installing-iis-85/installing-iis-85-on-windows-server-2012-r2\" >Learn more</a>\n            </p>\n        </div>\n        <div *ngIf=\"webServer\">\n            <loading *ngIf=\"!webServer\"></loading>\n            <webserver-header [model]=\"webServer\" class=\"crumb-content\" [class.sidebar-nav-content]=\"_options.active\"></webserver-header>\n            <div class=\"sidebar crumb\" [class.nav]=\"_options.active\">\n                <vtabs *ngIf=\"webServer\" [markLocation]=\"true\" (activate)=\"_options.refresh()\">\n                    <item [name]=\"'General'\" [ico]=\"'fa fa-wrench'\">\n                        <webserver-general [model]=\"webServer\"></webserver-general>\n                    </item>\n                    <item *ngFor=\"let module of modules\" [name]=\"module.name\" [ico]=\"module.ico\">\n                        <dynamic [name]=\"module.component_name\" [module]=\"module.module\" [data]=\"module.data\"></dynamic>\n                    </item>\n                </vtabs>\n            </div>\n        </div>\n    ",
            styles: ["\n        :host >>> .sidebar > vtabs .vtabs > .items {\n            top: 35px;\n        }\n\n        :host >>> .sidebar > vtabs .vtabs > .content {\n            top: 96px;\n        }\n\n        .not-installed {\n            text-align: center;\n            margin-top: 50px;\n        }\n    "]
        }),
        __param(0, core_1.Inject('WebServerService')),
        __metadata("design:paramtypes", [webserver_service_1.WebServerService,
            httpclient_1.HttpClient,
            options_service_1.OptionsService,
            router_1.ActivatedRoute])
    ], WebServerComponent);
    return WebServerComponent;
}());
exports.WebServerComponent = WebServerComponent;
//# sourceMappingURL=webserver.component.js.map