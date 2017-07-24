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

import { UrlRewriteComponent } from './url-rewrite.component';
import { RuleWizardComponent } from './rule-wizard/rule-wizard';
import { NameSlideComponent } from './rule-wizard/name-slide';
import { PatternSlideComponent } from './rule-wizard/pattern-slide';
import { ActionSlideComponent } from './rule-wizard/action-slide';

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
        UrlRewriteComponent,
        RuleWizardComponent,
        NameSlideComponent,
        PatternSlideComponent,
        ActionSlideComponent
    ]
})
export class UrlRewriteModule { }
