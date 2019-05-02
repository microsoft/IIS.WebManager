import { Component, OnDestroy, OnInit, Input } from "@angular/core";
import { TitlesService } from "./titles.service";
import { Breadcrumb } from "./breadcrumb";
import { Subscription } from "rxjs";
import { LoggerFactory, LogLevel, Logger } from "diagnostics/logger";

@Component({
    selector: `titles`,
    template: `
<div class="titles">
    <ul class="breadcrumbs sme-focus-zone">
        <li *ngFor="let crumb of breadcrumbs; index as i">
            <span [ngClass]="{root: !i}" *ngIf="!(crumb.routerLink)">{{crumb.label}}</span>
            <a *ngIf="crumb.routerLink" [routerLink]="crumb.routerLink">{{crumb.label}}</a>
            <span class="separator" *ngIf="i != breadcrumbs.length - 1">&gt;</span>
        </li>
    </ul>
    <div class="headings">
        <div class="model-header">
            <model-header></model-header>
        </div>
        <div class="feature-header">
            <feature-header></feature-header>
        </div>
    </div>
</div>
`,
})
export class TitlesComponent implements OnInit, OnDestroy {
    breadcrumbs: Breadcrumb[] = [];

    private logger: Logger;
    private sub: Subscription;

    constructor(
        factory: LoggerFactory,
        public service: TitlesService,
    ){
        this.logger = factory.Create(this);
    }

    ngOnInit(): void {
        this.sub = this.service.crumbs.subscribe(
            v => this.breadcrumbs = v,
            e => this.logger.log(LogLevel.WARN, `Error receiving crumb ${e}`),
        );
    }

    ngOnDestroy(): void {
        if (this.sub) {
            this.sub.unsubscribe();
        }
    }
}
