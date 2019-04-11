import { Component, OnDestroy } from "@angular/core";
import { BreadcrumbsService } from "./breadcrumbs.service";
import { Breadcrumb } from "./breadcrumb";
import { takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";
import { LoggerFactory, LogLevel } from "diagnostics/logger";
import { Router } from "@angular/router";

@Component({
    selector: `breadcrumbs`,
    templateUrl: './breadcrumbs.component.html',
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
export class BreadcrumbsComponent implements OnDestroy {
    public Crumbs: Breadcrumb[] = [];
    private destroy: Subject<boolean> = new Subject<boolean>();

    constructor(
        private router: Router,
        private factory: LoggerFactory,
        private srv: BreadcrumbsService,
    ){
        let logger = factory.Create(this);
        srv.crumbs.pipe(
            // close the observable on destroy, the subscription would be unsubscribed
            takeUntil(this.destroy),
        ).subscribe(
            v => this.Crumbs = v,
            e => logger.log(LogLevel.WARN, `Error receiving crumb ${e}`),
        );
    }
    
    ngOnDestroy(): void {
        this.destroy.next(true);
    }
}
