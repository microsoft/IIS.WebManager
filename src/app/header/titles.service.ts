import { Injectable } from "@angular/core";
import { Breadcrumb } from "./breadcrumb";
import { Observable, Subject, ReplaySubject } from "rxjs";
import { Heading } from "./feature-header.component";
import { ModelStatusUpdater } from "./model-header.component";

@Injectable()
export class TitlesService {
    private readonly _modelUpdate: Subject<ModelStatusUpdater> = new ReplaySubject<ModelStatusUpdater>(1);
    private readonly _crumbs: Subject<Breadcrumb[]> = new ReplaySubject<Breadcrumb[]>(1);
    private readonly _heading: Subject<Heading> = new ReplaySubject<Heading>(1);

    public loadModelUpdater(updater: ModelStatusUpdater) {
        this._modelUpdate.next(updater);
    }

    public loadHeading(heading: Heading) {
        this._heading.next(heading);
    }

    public loadCrumbs(crumbs: Breadcrumb[]) {
        this._crumbs.next(crumbs);
    }

    public get modelUpdate(): Observable<ModelStatusUpdater> {
        return this._modelUpdate;
    }

    public get crumbs(): Observable<Breadcrumb[]> {
        return this._crumbs;
    }

    public get heading(): Observable<Heading> {
        return this._heading;
    }
}
