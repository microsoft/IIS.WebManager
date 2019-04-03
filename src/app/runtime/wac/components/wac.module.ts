import { NgModule } from "@angular/core";
import { InstallComponent } from "./install.component";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { WACIdleComponent } from "./wac-idle.component";

@NgModule({
    imports: [
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
