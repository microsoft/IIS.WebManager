import { NgModule } from "@angular/core";
import { InstallComponent } from "./install.component";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { WACIdleComponent } from "./wac-idle.component";
import { Routes, RouterModule } from "@angular/router";

export const routes: Routes = [
    { path: 'install', component: InstallComponent },
]

@NgModule({
    imports: [
        RouterModule.forChild(routes),
        CommonModule,
        FormsModule
    ],
    declarations: [
        InstallComponent,
        WACIdleComponent,
    ],
    exports: [
        InstallComponent,
        WACIdleComponent,
    ],
    entryComponents: [
        InstallComponent,
        WACIdleComponent,
    ],
})
export class WACModule {}
