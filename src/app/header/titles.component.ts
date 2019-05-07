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
    styles: [`
.breadcrumbs {
    font-size: 14px;
    display: inline;
    position: sticky;
    display: inline-block;
    margin-block-end: 0%;
    margin-top: 1em;
    padding-bottom: 0.5em;
    border-bottom: 1px solid #999;
    width: 100%;
    padding-left: 10px;
}

.breadcrumbs li {
    float: left;
}

.breadcrumbs li span.root {
    font-weight: bold;
}

.breadcrumbs .separator {
    margin-right: 0.2em;
    margin-left: 0.2em;
}

.breadcrumbs .pointer:hover {
    text-decoration: underline;
}

.breadcrumbs button {
    padding: 0px;
    margin: 0px;
    border: none;
    outline: none;
}

.model-header {
    line-height: 2em;
    vertical-align: middle;
}

.headings {
    padding-left: 10px;
}

.titles {
    padding-bottom: 2em;
}
`],
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
