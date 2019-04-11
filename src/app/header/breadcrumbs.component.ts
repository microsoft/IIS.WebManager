import { Component, OnDestroy, ChangeDetectorRef, OnInit } from "@angular/core";
import { BreadcrumbsService } from "./breadcrumbs.service";
import { Breadcrumb } from "./breadcrumb";
import { takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";
import { LoggerFactory, LogLevel, Logger } from "diagnostics/logger";
import { Router } from "@angular/router";

@Component({
    selector: `breadcrumbs`,
    template: `
<ul class="breadcrumbs sme-focus-zone">
    <li *ngFor="let crumb of Crumbs; index as i">
        <span *ngIf="!(crumb.routerLink)">{{crumb.label}}</span>
        <a *ngIf="crumb.routerLink" [routerLink]="crumb.routerLink">{{crumb.label}}</a>
        <span class="separator" *ngIf="i != Crumbs.length - 1">&gt;</span>
    </li>
</ul>
`,
    styles: [`
.breadcrumbs {
    line-height: 30px;
    font-size: 16px;
    display: inline;
    position: sticky;
    display: inline-block;
    font-family: 'Segoe UI';
    padding-left: 1em;
    padding-top: 1em;
    margin-block-end: 0%;
}

.breadcrumbs li {
    float: left;
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
`],
})
export class BreadcrumbsComponent implements OnInit, OnDestroy {
    public Crumbs: Breadcrumb[] = [];
    private destroy: Subject<boolean> = new Subject<boolean>();
    private logger: Logger;

    constructor(
        private router: Router,
        private factory: LoggerFactory,
        private srv: BreadcrumbsService,
        private cd: ChangeDetectorRef,
    ){
        this.logger = factory.Create(this);
    }

    ngOnInit(): void {
        this.srv.crumbs.pipe(
            // close the observable on destroy, the subscription would be unsubscribed
            takeUntil(this.destroy),
        ).subscribe(
            v => {
                console.log(v);
                // var thiss = this;
                // if (v.length) {
                //     debugger;
                // }
                this.Crumbs = v;
                this.cd.detectChanges();
            },
            e => this.logger.log(LogLevel.WARN, `Error receiving crumb ${e}`),
        );
    }

    
    ngOnDestroy(): void {
        this.destroy.next(true);
    }
}
