import { NgModule, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Module as AutoSize } from '../../common/autosize';
import { Module as BModel } from '../../common/bmodel';
import { Module as CheckBox } from '../../common/checkbox.component';
import { Module as Switch } from '../../common/switch.component';
import { Module as Loading } from '../../notification/loading.component';
import { Module as Sort } from '../../common/sort.pipe';
import { Module as OverrideMode } from '../../common/override-mode.component';
import { Module as Enum } from '../../common/enum.component';
import { Module as StringList } from '../../common/string-list.component';
import { Module as VirtualList } from '../../common/virtual-list.component';
import { Module as Selector } from '../../common/selector';
import { Module as ErrorComponent } from '../../error/error.component';
import { Module as Selectable } from '../../common/selectable';
import { Module as Toolbar } from '../../files/toolbar.component';
import { Module as Warning } from '../../notification/warning.component';
import { Module as Tabs } from '../../common/tabs.component';

import { FilesModule } from '../../files/files.module';

import { RequestTracingService } from './request-tracing.service';
import { ProvidersComponent } from './provider-list.component';
import { ProviderComponent } from './provider.component';
import { RequestTracingComponent } from './request-tracing.component';
import { RulesComponent } from './rule-list.component';
import { RuleComponent } from './rule.component';
import { TraceComponent } from './trace.component';
import { TraceFileListComponent } from './trace-file-list.component';
import { TraceFileComponent } from './trace-file.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        AutoSize,
        BModel,
        CheckBox,
        Switch,
        Loading,
        Sort,
        OverrideMode,
        Enum,
        StringList,
        VirtualList,
        Selector,
        ErrorComponent,
        Selectable,
        Toolbar,
        Warning,
        Tabs,
        FilesModule
    ],
    declarations: [
        ProvidersComponent,
        ProviderComponent,
        RequestTracingComponent,
        RulesComponent,
        RuleComponent,
        TraceComponent,
        TraceFileComponent,
        TraceFileListComponent
    ],
    providers: [
        RequestTracingService
    ]
})
export class RequestTracingModule implements OnDestroy {

    constructor(private _svc: RequestTracingService) {
    }

    public ngOnDestroy() {
        if (this._svc) {
            this._svc.dispose();
            this._svc = null;
        }
    }
}
