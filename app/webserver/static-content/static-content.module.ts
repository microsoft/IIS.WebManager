import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { Module as BModel } from '../../common/bmodel';
import { Module as Switch } from '../../common/switch.component';
import { Module as Loading } from '../../notification/loading.component';
import { Module as OverrideMode } from '../../common/override-mode.component';
import { Module as Enum } from '../../common/enum.component';
import { Module as ErrorComponent } from '../../error/error.component';

import { StaticContentService } from './static-content.service';

import { ClientCacheComponent } from './client-cache.component';
import { StaticContentComponent } from './static-content.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        BModel,
        Switch,
        Loading,
        OverrideMode,
        Enum,
        ErrorComponent
    ],
    declarations: [
        ClientCacheComponent,
        StaticContentComponent
    ],
    providers: [
        StaticContentService
    ]
})
export class StaticContentModule { }
