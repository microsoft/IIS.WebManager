import { NgModule, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Module as BModel } from '../../common/bmodel';
import { Module as CheckBox } from '../../common/checkbox.component';
import { Module as Switch } from '../../common/switch.component';
import { Module as Loading } from '../../notification/loading.component';
import { Module as OverrideMode } from '../../common/override-mode.component';
import { Module as ErrorComponent } from '../../error/error.component';
import { Module as Sort } from '../../common/sort.pipe';
import { Module as Filter } from '../../common/filter.pipe';
import { Module as Selector } from '../../common/selector';
import { Module as FileSelector } from '../../common/file-selector';
import { Module as VirtualList } from '../../common/virtual-list.component';
import { Module as AutoFocus } from '../../common/focus';
import { Module as Selectable } from '../../common/selectable';
import { Module as Toolbar } from '../../files/toolbar.component';
import { Module as Navigation } from '../../files/navigation.component';
import { Module as FileEditor } from "../../files/file-editor";

import { FilesService } from '../../files/files.service';
import { WebFilesService } from './webfiles.service';
import { NavigationHelper } from './navigation-helper';

import { WebFilesComponent } from './webfiles.component';
import { WebFileListComponent } from './webfile-list';
import { WebFileComponent } from './webfile-list-item';
import { WebFileExplorer } from './webfile-explorer';
import { NewWebFileComponent } from './new-webfile.component';



@NgModule({
    imports: [
        RouterModule,
        CommonModule,
        FormsModule,
        BModel,
        CheckBox,
        Switch,
        Loading,
        OverrideMode,
        ErrorComponent,
        Sort,
        Filter,
        Selector,
        FileSelector,
        VirtualList,
        AutoFocus,
        Selectable,
        Toolbar,
        Navigation,
        FileEditor
    ],
    declarations: [
        WebFilesComponent,
        WebFileListComponent,
        WebFileComponent,
        NewWebFileComponent,
        WebFileExplorer
    ],
    providers: [
        WebFilesService,
        { provide: "INavigation", useClass: NavigationHelper }
    ]
})
export class WebFilesModule implements OnDestroy {
    constructor(private _svc: WebFilesService) { }

    ngOnDestroy() {
        if (this._svc != null) {
            this._svc.dispose();
            this._svc = null;
        }
    }
}
