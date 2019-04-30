import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Module as BModel } from '../common/bmodel';
import { Module as Dynamic } from '../common/dynamic.component';
import { Module as VTabs } from '../common/vtabs.component';
import { Module as Selector } from '../common/selector';
import { Module as Loading } from '../notification/loading.component';

import { WebServerRoutingModule } from './webserver-routing.module';

import { WebServerGeneralComponent } from './webserver-general.component';
import { WebServerHeaderComponent } from './webserver-header.component';
import { WebServerComponent, WebServerViewComponent } from './webserver.component';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        WebServerRoutingModule,
        BModel,
        Dynamic,
        VTabs,
        Selector,
        Loading
    ],
    declarations: [
        WebServerGeneralComponent,
        WebServerHeaderComponent,
        WebServerComponent,
        WebServerViewComponent,
    ]
})
export class WebServerModule {
}
