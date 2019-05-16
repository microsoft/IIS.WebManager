import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { TitlesService } from './titles.service';

export interface Heading {
    name: string;
    ico: string;
}

@Component({
    selector: 'feature-header',
    template: `
<div class="feature-title sme-focus-zone">
    <h1>
        <i [class]="titles.heading.ico"></i><span class="border-active">{{titles.heading.name}}</span>
    </h1>
</div>
    `,
    styles: [`
i {
    padding-right: 0.3em;
}

.feature-title {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    padding-left: 5px;
    padding-bottom: 5px;
}

.feature-title h1 {
    font-size: 20px;
    display: inline;
}

.feature-title h1:before {
    display:inline-block;
}
    `]
})
export class FeatureHeaderComponent {
    constructor(
        private titles: TitlesService,
    ) {}
}
