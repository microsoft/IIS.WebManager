import { NgModule } from "@angular/core";
import { InstallComponent } from "./install.component";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

@NgModule({
    imports: [
        CommonModule,
        FormsModule
    ],
    declarations: [ InstallComponent ],
    exports: [ InstallComponent ],
    entryComponents: [ InstallComponent ],
})
export class WACModule {}