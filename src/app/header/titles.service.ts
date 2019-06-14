import { Injectable } from "@angular/core";
import { Breadcrumb } from "./breadcrumb";
import { Observable, Subject, ReplaySubject } from "rxjs";
import { Heading } from "./feature-header.component";

@Injectable()
export class TitlesService {
    private readonly _crumbs: Subject<Breadcrumb[]> = new ReplaySubject<Breadcrumb[]>(1);
    public heading: Heading;

    public loadCrumbs(crumbs: Breadcrumb[]) {
        this._crumbs.next(crumbs);
    }

    public get crumbs(): Observable<Breadcrumb[]> {
        return this._crumbs;
    }
}
