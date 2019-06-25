import { Component, OnDestroy, OnInit } from "@angular/core";
import { TitlesService } from "./titles.service";
import { Breadcrumb } from "./breadcrumb";
import { Subscription } from "rxjs";
import { LoggerFactory, LogLevel, Logger } from "diagnostics/logger";
import { Router } from "@angular/router";

@Component({
    selector: `titles`,
    template: `
<div class="titles">
    <ul class="breadcrumbs">
        <li *ngFor="let crumb of breadcrumbs; index as i">
            <span class="accessibility-focusable" [ngClass]="{root: !i}" [class.color-active]="canNavigate(crumb)" tabIndex="0" (click)="navigate(crumb)">{{crumb.label}}</span>
            <span class="separator" *ngIf="i != breadcrumbs.length - 1">&gt;</span>
        </li>
    </ul>
    <div class="headings">
        <div class="feature-header">
            <feature-header></feature-header>
        </div>
    </div>
</div>
`,
    styles: [`
.color-active:hover {
    cursor: pointer;
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
        private router: Router,
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

    canNavigate(crumb: Breadcrumb): boolean {
        return crumb.routerLink != null ||  crumb.tabName != null;
    }

    navigate(crumb: Breadcrumb): void {
        if (crumb.tabName) {
            this.service.sections.selectSection(crumb.tabName);
        }
        if (crumb.routerLink) {
            this.router.navigate(crumb.routerLink);
        }
        throw `Unable to process crumb ${crumb.label}`;
    }
}
