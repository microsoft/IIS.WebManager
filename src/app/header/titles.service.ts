import { Injectable } from "@angular/core";
import { Breadcrumb } from "./breadcrumb";
import { BehaviorSubject, Observable } from "rxjs";
import { LoggerFactory, Logger, LogLevel } from "diagnostics/logger";

@Injectable()
export class TitlesService {
    private readonly _crumbs: BehaviorSubject<Breadcrumb[]> = new BehaviorSubject<Breadcrumb[]>([]);
    private logger: Logger;

    constructor(
        private factory: LoggerFactory,
    ) {
        this.logger = factory.Create(this);
    }

    public load(crumbs: Breadcrumb[]) {
        this._crumbs.next(crumbs);
    }

    public get crumbs(): Observable<Breadcrumb[]> {
        return this._crumbs;
    }
}
