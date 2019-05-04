import { Component, OnInit, OnDestroy } from '@angular/core';
import { Status } from 'common/status';
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
    <h1 [ngClass]="status">
        <i [class]="ico"></i><span class="border-active">{{title}}</span>
    </h1>
    <span *ngIf="statusSubject" class="status">{{status}}</span>
</div>
    `,
    styles: [`
.status {
    display: block;
    text-align: right;
}

i {
    padding-right: 0.3em;
}
    `]
})
export class FeatureHeaderComponent implements OnInit, OnDestroy {
    ico: string;
    title: string;
    status: Status = Status.Unknown;
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
