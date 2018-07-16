"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var platform_browser_1 = require("@angular/platform-browser");
var http_1 = require("@angular/http");
var forms_1 = require("@angular/forms");
var angulartics2_1 = require("angulartics2");
var angulartics2_ga_1 = require("angulartics2/src/providers/angulartics2-ga");
var bmodel_1 = require("../common/bmodel");
var notfound_component_1 = require("../common/notfound.component");
var checkbox_component_1 = require("../common/checkbox.component");
var dynamic_component_1 = require("../common/dynamic.component");
var vtabs_component_1 = require("../common/vtabs.component");
var focus_1 = require("../common/focus");
var tooltip_component_1 = require("../common/tooltip.component");
var enum_component_1 = require("../common/enum.component");
var selector_1 = require("../common/selector");
var httpclient_1 = require("../common/httpclient");
var notification_service_1 = require("../notification/notification.service");
var loading_service_1 = require("../notification/loading.service");
var version_service_1 = require("../versioning/version.service");
var server_analytic_service_1 = require("../webserver/server-analytic.service");
var connect_service_1 = require("../connect/connect.service");
var logger_1 = require("../common/logger");
var options_service_1 = require("./options.service");
var app_component_1 = require("./app.component");
var app_routes_1 = require("./app.routes");
var home_component_1 = require("./home.component");
var connect_component_1 = require("../connect/connect.component");
var connection_picker_component_1 = require("../connect/connection-picker.component");
var get_component_1 = require("./get.component");
var header_component_1 = require("../header/header.component");
var settings_menu_component_1 = require("../settings/settings-menu.component");
var notification_component_1 = require("../notification/notification.component");
var notification_indicator_1 = require("../notification/notification-indicator");
var information_component_1 = require("../notification/information.component");
var modal_component_1 = require("../notification/modal.component");
var new_version_notification_component_1 = require("../versioning/new-version-notification.component");
var files_service_1 = require("../files/files.service");
var webserver_service_1 = require("../webserver/webserver.service");
var app_pools_service_1 = require("../webserver/app-pools/app-pools.service");
var websites_service_1 = require("../webserver/websites/websites.service");
var window_service_1 = require("./window.service");
var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        core_1.NgModule({
            imports: [
                platform_browser_1.BrowserModule,
                http_1.HttpModule,
                forms_1.FormsModule,
                app_routes_1.Routing,
                angulartics2_1.Angulartics2Module.forRoot(),
                bmodel_1.Module,
                notfound_component_1.Module,
                checkbox_component_1.Module,
                dynamic_component_1.Module,
                vtabs_component_1.Module,
                focus_1.Module,
                tooltip_component_1.Module,
                enum_component_1.Module,
                selector_1.Module
            ],
            declarations: [
                app_component_1.AppComponent,
                home_component_1.HomeComponent,
                connect_component_1.ConnectComponent,
                connection_picker_component_1.ConnectionPickerComponent,
                get_component_1.GetComponent,
                header_component_1.HeaderComponent,
                settings_menu_component_1.SettingsMenuComponent,
                notification_component_1.NotificationComponent,
                notification_indicator_1.NotificationIndicator,
                modal_component_1.ModalComponent,
                information_component_1.InformationComponent,
                new_version_notification_component_1.NewVersionNotificationComponent
            ],
            bootstrap: [
                app_component_1.AppComponent
            ],
            providers: [
                httpclient_1.HttpClient,
                notification_service_1.NotificationService,
                loading_service_1.LoadingService,
                window_service_1.WindowService,
                version_service_1.VersionService,
                server_analytic_service_1.ServerAnalyticService,
                connect_service_1.ConnectService,
                logger_1.Logger,
                options_service_1.OptionsService,
                angulartics2_ga_1.Angulartics2GoogleAnalytics,
                { provide: "WebServerService", useClass: webserver_service_1.WebServerService },
                { provide: "WebSitesService", useClass: websites_service_1.WebSitesService },
                { provide: "AppPoolsService", useClass: app_pools_service_1.AppPoolsService },
                { provide: "FilesService", useClass: files_service_1.FilesService }
            ]
        })
    ], AppModule);
    return AppModule;
}());
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map