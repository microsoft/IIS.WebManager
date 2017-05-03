import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { Module as BModel } from '../../common/bmodel';
import { Module as CheckBox } from '../../common/checkbox.component';
import { Module as Switch } from '../../common/switch.component';
import { Module as Loading } from '../../notification/loading.component';
import { Module as OverrideMode } from '../../common/override-mode.component';
import { Module as ErrorComponent } from '../../error/error.component';
import { Module as Tabs } from '../../common/tabs.component';

import { AuthenticationService } from './authentication.service';

import { AnonymousAuthenticationComponent } from './anon-auth.component';
import { AuthenticationComponent } from './authentication.component';
import { BasicAuthenticationComponent } from './basic-auth.component';
import { DigestAuthenticationComponent } from './digest-auth.component';
import { WindowsAuthenticationComponent } from './win-auth.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        BModel,
        CheckBox,
        Switch,
        Loading,
        OverrideMode,
        ErrorComponent,
        Tabs
    ],
    declarations: [
        AnonymousAuthenticationComponent,
        AuthenticationComponent,
        BasicAuthenticationComponent,
        DigestAuthenticationComponent,
        WindowsAuthenticationComponent
    ],
    providers: [
        AuthenticationService
    ]
})
export class AuthenticationModule { }
