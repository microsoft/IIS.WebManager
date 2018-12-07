import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { Module as BModel } from '../../common/bmodel';
import { Module as Loading } from '../../notification/loading.component';
import { Module as OverrideMode } from '../../common/override-mode.component';
import { Module as ErrorComponent } from '../../error/error.component';
import { Module as AutoFocus } from '../../common/focus';

import { StaticContentService } from '../static-content/static-content.service';

import { MimeMapListItem, MimeMapsListComponent } from './mime-maps-list.component';
import { MimeMapsComponent } from './mime-maps.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        BModel,
        Loading,
        OverrideMode,
        ErrorComponent,
        AutoFocus,
    ],
    declarations: [
        MimeMapListItem,
        MimeMapsComponent,
        MimeMapsListComponent
    ],
    providers: [
        StaticContentService
    ]
})
export class MimeMapsModule { }
