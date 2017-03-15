import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {Module as BModel} from '../../common/bmodel';
import {Module as Switch} from '../../common/switch.component';
import {Module as Loading} from '../../notification/loading.component';
import {Module as OverrideMode} from '../../common/override-mode.component';
import {Module as ErrorComponent} from '../../error/error.component';
import {Module as Sort} from '../../common/sort.pipe';

import {DefaultDocumentsService} from './default-documents.service';

import {DefaultDocumentsComponent} from './default-documents.component';
import {FileListComponent, FileListItem} from './file-list.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        BModel,
        Switch,
        Loading,
        Sort,
        OverrideMode,
        ErrorComponent
    ],
    declarations: [
        DefaultDocumentsComponent,
        FileListItem,
        FileListComponent
    ],
    providers: [
        DefaultDocumentsService
    ]
})
export class DefaultDocumentsModule { }