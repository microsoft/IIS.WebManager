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
    h1 {
        line-height: 30px;
        font-size: 16px;
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
            takeUntil(this.destroy),
        ).subscribe(
            v => this.Crumbs = v,
            e => logger.log(LogLevel.WARN, `Error receiving crumb ${e}`),
        );
    }

    onClick(crumb: Breadcrumb) {
        this.router.navigate(crumb.RouterLink, {});
    }
    
    ngOnDestroy(): void {
        this.destroy.next(true);
    }
}
