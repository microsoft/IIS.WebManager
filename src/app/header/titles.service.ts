import { Injectable } from "@angular/core";
import { Breadcrumb } from "./breadcrumb";
import { Observable, Subject, ReplaySubject } from "rxjs";
import { Heading } from "./feature-header.component";
import { ModelStatusUpdater } from "./model-header.component";

@Injectable()
export class TitlesService {
    private readonly _modelUpdater: Subject<ModelStatusUpdater> = new ReplaySubject<ModelStatusUpdater>(1);
    private readonly _crumbs: Subject<Breadcrumb[]> = new ReplaySubject<Breadcrumb[]>(1);
    public heading: Heading;
    public featureModel: any;

    public loadModelUpdater(updater: ModelStatusUpdater) {
        this._modelUpdater.next(updater);
    }

    public get modelUpdater(): Observable<ModelStatusUpdater> {
        return this._modelUpdater;
    }

    public loadCrumbs(crumbs: Breadcrumb[]) {
        this._crumbs.next(crumbs);
    }

    public get crumbs(): Observable<Breadcrumb[]> {
        return this._crumbs;
    }
}
