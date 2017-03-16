import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {Module as BModel} from '../common/bmodel';
import {Module as Dynamic} from '../common/dynamic.component';
import {Module as VTabs} from '../common/vtabs.component';
import {Module as Loading} from '../notification/loading.component';

import {Routing} from './webserver.routes';

import {WebServerGeneralComponent} from './webserver-general.component';
import {WebServerHeaderComponent} from './webserver-header.component';
import {WebServerComponent} from './webserver.component';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        Routing,
        BModel,
        Dynamic,
        VTabs,
        Loading
    ],
    declarations: [
        WebServerGeneralComponent,
        WebServerHeaderComponent,
        WebServerComponent
    ]
})
export class WebServerModule {
}
