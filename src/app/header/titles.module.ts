import { NgModule } from "@angular/core";
import { TitlesService } from "./titles.service";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { TitlesComponent } from "./titles.component";
import { FeatureHeaderComponent } from "./feature-header.component";
import { ModelHeaderComponent } from "./model-header.component";
import { Module as SwitchModule } from "common/switch.component";

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        SwitchModule,
    ],
    declarations: [
        ModelHeaderComponent,
        FeatureHeaderComponent,
        TitlesComponent,
    ],
    exports: [
        ModelHeaderComponent,
        FeatureHeaderComponent,
        TitlesComponent,
    ],
    providers: [
        TitlesService,
    ]
})
export class TitlesModule {}

