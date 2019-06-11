import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Module as BModel } from '../common/bmodel';
import { Module as CheckBox } from '../common/checkbox.component';
import { Module as Switch } from '../common/switch.component';
import { Module as Loading } from '../notification/loading.component';
import { Module as Sort } from '../common/sort.pipe';
import { Module as Filter } from '../common/filter.pipe';
import { Module as Selector } from '../common/selector';
import { Module as FileSelector } from '../common/file-selector';
import { Module as VirtualList } from '../common/virtual-list.component';
import { Module as AutoFocus } from '../common/focus';
import { Module as Selectable } from '../common/selectable';
import { Module as Toolbar } from './toolbar.component';
import { Module as Navigation } from './navigation.component';
import { Module as Editor } from "./file-editor";

import { FileComponent } from './file-list-item';
import { FileListComponent } from './file-list';
import { FilesComponent } from './files.component';
import { FileExplorer } from './file-explorer';
import { NewFileComponent } from './new-file.component';
import { LocationEditComponent } from './edit-location.component';
import { FileSelectorComponent } from './file-selector.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        BModel,
        CheckBox,
        Switch,
        Loading,
        Sort,
        Filter,
        Selector,
        FileSelector,
        VirtualList,
        AutoFocus,
        Selectable,
        Toolbar,
        Navigation,
        Editor
    ],
    declarations: [
        FileComponent,
        FileListComponent,
        FilesComponent,
        NewFileComponent,
        LocationEditComponent,
        FileSelectorComponent,
        FileExplorer
    ],
    exports: [
        FileComponent,
        FileListComponent,
        FilesComponent,
        NewFileComponent,
        FileSelectorComponent,
        FileExplorer
    ]
})
export class FilesModule {
}
