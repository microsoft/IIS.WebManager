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
        <i [class]="ico"></i><span class="border-active">{{title}}</span>
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
export class FeatureHeaderComponent implements OnInit, OnDestroy {
    ico: string;
    title: string;
    private subscriptions: Subscription[] = [];

    constructor(
        private titles: TitlesService,
    ) {}
    
    ngOnInit(): void {
        this.subscriptions.push(
            this.titles.heading.subscribe(
                v => {
                    this.ico = v.ico;
                    this.title = v.name;
                }
            )
        )
    }

    ngOnDestroy(): void {
        for (let sub of this.subscriptions) {
            sub.unsubscribe();
        }
    }
}
