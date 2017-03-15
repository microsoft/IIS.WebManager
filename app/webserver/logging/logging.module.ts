import { NgModule, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Module as BModel } from '../../common/bmodel';
import { Module as CheckBox } from '../../common/checkbox.component';
import { Module as Switch } from '../../common/switch.component';
import { Module as Loading } from '../../notification/loading.component';
import { Module as OverrideMode } from '../../common/override-mode.component';
import { Module as Enum } from '../../common/enum.component';
import { Module as ErrorComponent } from '../../error/error.component';
import { Module as Selector } from '../../common/selector';
import { Module as VirtualList } from '../../common/virtual-list.component';
import { Module as Selectable } from '../../common/selectable';
import { Module as Toolbar } from '../../files/toolbar.component';
import { Module as Warning } from '../../notification/warning.component';

import { FilesModule } from '../../files/files.module';

import { LoggingService } from './logging.service';
import { FormatComponent } from './format.component';
import { CustomFieldsComponent, LogFieldsComponent } from './logfields.component';
import { LoggingComponent } from './logging.component';
import { RolloverComponent } from './rollover.component';
import { LogFileComponent } from './log-file.component';
import { LogFilesComponent } from './log-files.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        BModel,
        CheckBox,
        Switch,
        Loading,
        OverrideMode,
        Enum,
        ErrorComponent,
        Selector,
        VirtualList,
        Selectable,
        Toolbar,
        Warning,
        FilesModule
    ],
    declarations: [
        FormatComponent,
        CustomFieldsComponent,
        LogFieldsComponent,
        LoggingComponent,
        RolloverComponent,
        LogFileComponent,
        LogFilesComponent
    ],
    providers: [
        LoggingService
    ]
})
export class LoggingModule implements OnDestroy {

    constructor(private _svc: LoggingService) {
    }

    public ngOnDestroy() {
        if (this._svc) {
            this._svc.dispose();
            this._svc = null;
        }
    }
}