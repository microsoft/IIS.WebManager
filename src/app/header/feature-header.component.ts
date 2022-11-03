import { Component } from '@angular/core';
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
        <i [class]="heading.ico"><span class="border-active">{{heading.name}}</span></i>
    </h1>
</div>
    `,
    styles: [`

.feature-title {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    padding-left: 5px;
    padding-bottom: 5px;
}

.feature-title h1 i span,
.feature-title h1 i.sme-icon:before{
    font-size: 20px;
    line-height: 20px;
    display: inline-block;
    font-weight: 600;
    vertical-align: middle;
    margin: 0px;
}

i.sme-icon:before {
    padding-right: 0.3em;
}
    `]
})
export class FeatureHeaderComponent {
    constructor(
        private titles: TitlesService,
    ) {}

    get heading() {
        return this.titles.heading;
    }
}
