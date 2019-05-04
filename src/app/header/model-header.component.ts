import { Component } from "@angular/core";
import { FeatureContext } from "common/feature-vtabs.component";

@Component({
    selector: 'model-header',
    template: `
    <div *ngIf="!model">loading module...</div>
`,
})
export class ModelHeaderComponent {
    model: FeatureContext;

}