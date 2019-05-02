import { NgModule } from "@angular/core";
import { TitlesService } from "./titles.service";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { TitlesComponent } from "./titles.component";

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
    ],
    declarations: [
        TitlesComponent,
    ],
    exports: [
        TitlesComponent,
    ],
    providers: [
        TitlesService,
    ]
})
export class TitlesModule {}

