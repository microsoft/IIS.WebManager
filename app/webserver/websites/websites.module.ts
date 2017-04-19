import { NgModule, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Module as BModel } from '../../common/bmodel';
import { Module as NotFound } from '../../common/notfound.component';
import { Module as Checkbox } from '../../common/checkbox.component';
import { Module as Switch } from '../../common/switch.component';
import { Module as Dynamic } from '../../common/dynamic.component';
import { Module as VTabs } from '../../common/vtabs.component';
import { Module as Loading } from '../../notification/loading.component';
import { Module as Sort } from '../../common/sort.pipe';
import { Module as Selector } from '../../common/selector';

import { Module } from './module';
import { Module as AppPoolModule } from '../app-pools/module';
import { FilesModule } from '../../files/files.module';
import { CertificatesModule } from '../../certificates/certificates.module';
import { Routing } from './website.routes';

import { WebSiteComponent } from './website.component';
import { WebSiteHeaderComponent } from './website-header.component';
import { WebSiteGeneralComponent } from './website-general.component';
import { WebSiteList, WebSiteItem } from './website-list';
import { WebSiteListComponent } from './website-list.component';
import { NewWebSiteComponent } from './new-website.component';
import { BindingList, BindingItem } from './binding-list.component';
import { LimitsComponent } from './limits.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        Module,
        AppPoolModule,
        FilesModule,
        CertificatesModule,
        Routing,
        BModel,
        NotFound,
        Checkbox,
        Switch,
        Dynamic,
        VTabs,
        Loading,
        Sort,
        Selector
    ],
    declarations: [
        WebSiteComponent,
        WebSiteHeaderComponent,
        WebSiteGeneralComponent,
        WebSiteList,
        WebSiteItem,
        WebSiteListComponent,
        NewWebSiteComponent,
        BindingList,
        BindingItem,
        LimitsComponent
    ]

})
export class WebSitesModule {
}
