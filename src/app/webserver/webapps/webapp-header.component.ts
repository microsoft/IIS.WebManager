import { Component, Input } from '@angular/core';
import { WebApp } from './webapp'

@Component({
    selector: 'webapp-header',
    template: `
        <div class="feature-header">
            <div class="feature-title sme-focus-zone">
                <h1 [title]="model.website.name + model.path">{{model.path}}</h1>
            </div>
        </div>
    `,
    styles: [`
        .feature-title h1:before {
            content: "\\f121";
        }
    `]
})
export class WebAppHeaderComponent {
    @Input() model: WebApp;
}
