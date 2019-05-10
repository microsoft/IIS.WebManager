import { NgModule, Inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Module as BModel } from '../../common/bmodel';
import { Module as NotFound } from '../../common/notfound.component';
import { Module as Switch } from '../../common/switch.component';
import { Module as Dynamic } from '../../common/dynamic.component';
import { Module as VTabs } from '../../common/vtabs.component';
import { Module as Loading } from '../../notification/loading.component';
import { Module as Sort } from '../../common/sort.pipe';
import { Module as Selector } from '../../common/selector';
import { Module as Tabs } from '../../common/tabs.component';
import { Module as AutoFocus } from '../../common/focus';

import { Module as WebSitesModule } from '../websites/module';
import { Module as AppPoolsModule } from '../app-pools/module';
import { FilesModule } from '../../files/files.module';
import { Routing } from './webapp.routes';

import { WebAppsService } from './webapps.service';
import { WebAppComponent } from './webapp.component';
import { WebAppListComponent } from './webapp-list.component';
import { WebAppItem, WebAppList } from './webapp-list';
import { WebAppGeneralComponent } from './webapp-general.component';
import { NewWebAppComponent } from './new-webapp.component';
import { ListModule } from 'common/list';


@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        WebSitesModule,
        AppPoolsModule,
        FilesModule,
        Routing,
        BModel,
        NotFound,
        Switch,
        Dynamic,
        VTabs,
        Loading,
        Sort,
        Selector,
        Tabs,
        AutoFocus,
        ListModule,
    ],
    declarations: [
        WebAppComponent,
        WebAppListComponent,
        WebAppItem,
        WebAppList,
        WebAppGeneralComponent,
        NewWebAppComponent
    ],
    providers: [
        { provide: "WebAppsService", useClass: WebAppsService }
    ]
})
export class WebAppsModule implements OnDestroy {

    constructor( @Inject("WebAppsService") private _svc: WebAppsService) { }

    ngOnDestroy() {
        this._svc.destroy();
    }
}
