import { Injectable } from "@angular/core";
import { Breadcrumb } from "./breadcrumb";
import { Observable, Subject, ReplaySubject } from "rxjs";
import { LoggerFactory, Logger } from "diagnostics/logger";
import { Heading } from "./feature-header.component";

@Injectable()
export class TitlesService {
    private readonly _crumbs: Subject<Breadcrumb[]> = new ReplaySubject<Breadcrumb[]>();
    private readonly _heading: Subject<Heading> = new ReplaySubject<Heading>();
    private logger: Logger;

    constructor(
        private factory: LoggerFactory,
    ) {
        this.logger = factory.Create(this);
    }

    public loadHeading(heading: Heading) {
        this._heading.next(heading);
    }

    public loadCrumbs(crumbs: Breadcrumb[]) {
        this._crumbs.next(crumbs);
    }

    public get crumbs(): Observable<Breadcrumb[]> {
        return this._crumbs;
    }

    public get heading(): Observable<Heading> {
        return this._heading;
    }
}
