import { NgModule, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Module as BModel } from '../common/bmodel';
import { Module as Selector } from '../common/selector';
import { Module as CheckBox } from '../common/checkbox.component';
import { Module as Tooltip } from '../common/tooltip.component';
import { Module as VTabs } from '../common/vtabs.component';
import { Routing } from './connect.routes';

import { ServersComponent } from './servers.component';
import { ServerListComponent } from './server-list';
import { ServerListItem } from './server-list-item';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        Routing,
        BModel,
        Selector,
        CheckBox,
        Tooltip,
        VTabs
    ],
    declarations: [
        ServersComponent,
        ServerListComponent,
        ServerListItem
    ]
})
export class ConnectModule {
}
