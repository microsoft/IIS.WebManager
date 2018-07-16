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
require("rxjs/add/operator/take");
var angulartics2_1 = require("angulartics2");
var angulartics2_ga_1 = require("angulartics2/src/providers/angulartics2-ga");
var connect_service_1 = require("../connect/connect.service");
var loading_service_1 = require("../notification/loading.service");
var window_service_1 = require("./window.service");
var version_service_1 = require("../versioning/version.service");
var server_analytic_service_1 = require("../webserver/server-analytic.service");
var AppComponent = /** @class */ (function () {
    function AppComponent(_router, _connectService, _loadingSvc, _windowService, _versionService, _serverAnalyticService, _renderer, angulartics2, angulartics2GoogleAnalytics) {
        this._router = _router;
        this._connectService = _connectService;
        this._loadingSvc = _loadingSvc;
        this._windowService = _windowService;
        this._versionService = _versionService;
        this._serverAnalyticService = _serverAnalyticService;
        this._renderer = _renderer;
    }
    AppComponent.prototype.ngOnInit = function () {
        var _this = this;
        this._connectService.active.subscribe(function (c) {
            _this._router.events.take(1).subscribe(function (evt) {
                if (!c) {
                    _this._connectService.gotoConnect(false);
                }
            });
        });
        this._windowService.initialize(this.mainContainer, this._renderer);
    };
    AppComponent.prototype.ngOnDestroy = function () {
        this._loadingSvc.destroy();
    };
    AppComponent.prototype.isRouteActive = function (route) {
        return this._router.isActive(route, true);
    };
    AppComponent.prototype.dragOver = function (e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "none"; // Disable drop
    };
    __decorate([
        core_1.ViewChild('mainContainer'),
        __metadata("design:type", core_1.ElementRef)
    ], AppComponent.prototype, "mainContainer", void 0);
    AppComponent = __decorate([
        core_1.Component({
            selector: 'app',
            styles: ["\n        .content {\n            height: 100%;\n        }\n\n        #flexWrapper {\n             padding-top:35px;\n             overflow-x:hidden;\n             width:100%;\n             display: flex;\n             height: 100%;\n        }\n\n        #mainContainer {\n             height: 100%;\n             width:100%;\n             overflow-x:hidden;\n             min-width:initial;\n        }\n\n        #mainContainer.fixed {\n            min-width: 500px;\n        }\n\n        #mainRow {\n            height: 100%\n        }\n\n        #bodyContent {\n            height: 100%;\n        }\n    "],
            encapsulation: core_1.ViewEncapsulation.None,
            template: "\n        <div class='content' (dragover)=\"dragOver($event)\">\n            <header *ngIf=\"!isRouteActive('Get')\"></header>\n            <div id=\"flexWrapper\">\n                <div class=\"container-fluid\" id=\"mainContainer\" #mainContainer>\n                    <div class=\"row\" id=\"mainRow\">\n                        <div class=\"col-xs-12\">\n                            <div id=\"bodyContent\">\n                                <router-outlet></router-outlet>\n                            </div>\n                        </div>\n                    </div>\n                </div>\n            </div>\n        </div>\n    "
        }),
        __metadata("design:paramtypes", [router_1.Router,
            connect_service_1.ConnectService,
            loading_service_1.LoadingService,
            window_service_1.WindowService,
            version_service_1.VersionService,
            server_analytic_service_1.ServerAnalyticService,
            core_1.Renderer,
            angulartics2_1.Angulartics2,
            angulartics2_ga_1.Angulartics2GoogleAnalytics])
    ], AppComponent);
    return AppComponent;
}());
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map