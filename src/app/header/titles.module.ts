import { NgModule } from "@angular/core";
import { TitlesService } from "./titles.service";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { TitlesComponent } from "./titles.component";
import { FeatureHeaderComponent } from "./feature-header.component";

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
    ],
    declarations: [
        FeatureHeaderComponent,
        TitlesComponent,
    ],
    exports: [
        FeatureHeaderComponent,
        TitlesComponent,
    ],
    providers: [
        TitlesService,
    ]
})
export class TitlesModule {}

