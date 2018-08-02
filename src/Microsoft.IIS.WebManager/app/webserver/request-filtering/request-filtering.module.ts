import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { Module as BModel } from '../../common/bmodel';
import { Module as Switch } from '../../common/switch.component';
import { Module as Loading } from '../../notification/loading.component';
import { Module as OverrideMode } from '../../common/override-mode.component';
import { Module as StringList } from '../../common/string-list.component';
import { Module as ErrorComponent } from '../../error/error.component';
import { Module as Tabs } from '../../common/tabs.component';

import { RequestFilteringService } from './request-filtering.service';

import { FileExtensionsComponent, FileExtensionComponent } from './file-extensions.component';
import { RequestFilteringComponent } from './request-filtering.component';
import { RulesComponent, RuleComponent } from './rules.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        BModel,
        Switch,
        Loading,
        OverrideMode,
        StringList,
        ErrorComponent,
        Tabs
    ],
    declarations: [
        FileExtensionsComponent,
        FileExtensionComponent,
        RequestFilteringComponent,
        RulesComponent,
        RuleComponent
    ],
    providers: [
        RequestFilteringService
    ]
})
export class RequestFilteringModule { }
