import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';

import { Angulartics2Module } from 'angulartics2';
import { Angulartics2GoogleAnalytics } from 'angulartics2/src/providers/angulartics2-ga';

import { Module as BModel } from '../common/bmodel';
import { Module as NotFound } from '../common/notfound.component';
import { Module as CheckBox } from '../common/checkbox.component';
import { Module as Dynamic } from '../common/dynamic.component';
import { Module as VTabs } from '../common/vtabs.component';
import { Module as AutoFocus } from '../common/focus';
import { Module as Tooltip} from '../common/tooltip.component';

import { HttpClient } from '../common/httpclient';
import { NotificationService } from '../notification/notification.service';
import { LoadingService } from '../notification/loading.service';
import { VersionService } from '../versioning/version.service';
import { ConnectService } from '../connect/connect.service';
import { Logger } from '../common/logger';
import { OptionsService } from './options.service';

import { AppComponent } from './app.component';
import { Routing } from './app.routes';

import { HomeComponent } from './home.component';
import { ConnectionComponent } from '../connect/connection.component';
import { ConnectionPickerComponent } from '../connect/connection-picker.component';
import { GetComponent } from './get.component';
import { HeaderComponent } from '../header/header.component';
import { NotificationComponent } from '../notification/notification.component';
import { NotificationIndicator } from '../notification/notification-indicator';
import { InformationComponent } from '../notification/information.component';
import { ModalComponent } from '../notification/modal.component';
import { NewVersionNotificationComponent } from '../versioning/new-version-notification.component';

import { FilesService } from '../files/files.service';
import { WebServerService } from '../webserver/webserver.service';
import { AppPoolsService } from '../webserver/app-pools/app-pools.service';
import { WebSitesService } from '../webserver/websites/websites.service';
import { WindowService } from './window.service';

@NgModule({
    imports: [
        BrowserModule,
        HttpModule,
        FormsModule,
        Routing,
        Angulartics2Module.forRoot(),
        BModel,
        NotFound,
        CheckBox,
        Dynamic,
        VTabs,
        AutoFocus,
        Tooltip
    ],
    declarations: [
        AppComponent,
        HomeComponent,
        ConnectionComponent,
        ConnectionPickerComponent,
        GetComponent,
        HeaderComponent,
        NotificationComponent,
        NotificationIndicator,
        ModalComponent,
        InformationComponent,
        NewVersionNotificationComponent
    ],
    bootstrap: [
        AppComponent
    ],
    providers: [
        HttpClient,
        NotificationService,
        LoadingService,
        WindowService,
        VersionService,
        ConnectService,
        Logger,
        OptionsService,
        Angulartics2GoogleAnalytics,

        { provide: "WebServerService", useClass: WebServerService },
        { provide: "WebSitesService", useClass: WebSitesService },
        { provide: "AppPoolsService", useClass: AppPoolsService },
        { provide: "FilesService", useClass: FilesService }
    ]
})
export class AppModule {
}
