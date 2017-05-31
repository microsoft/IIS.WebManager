import { NgModule, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Module as BModel } from '../common/bmodel';
import { Module as Selector } from '../common/selector';
import { Module as CheckBox } from '../common/checkbox.component';
import { Module as Tooltip } from '../common/tooltip.component';
import { Routing } from './connect.routes';

import { ServerListComponent } from './server-list';
import { ServerListItem } from './server-list-item';
import { ServerEditComponent } from './server-edit.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        Routing,
        BModel,
        Selector,
        CheckBox,
        Tooltip
    ],
    declarations: [
        ServerListComponent,
        ServerListItem,
        ServerEditComponent
    ]
})
export class ConnectModule {
}
