import { Injectable } from "@angular/core";
import { Breadcrumb } from "./breadcrumb";
import { BehaviorSubject, Subscribable, Observable } from "rxjs";

@Injectable()
export class BreadcrumbsService {
    private readonly _crumbs: BehaviorSubject<Breadcrumb[]> = new BehaviorSubject<Breadcrumb[]>([]);

    public load(crumbs: Breadcrumb[]) {
        this._crumbs.next(crumbs);
    }

    public get crumbs(): Observable<Breadcrumb[]> {
        return this._crumbs;
    }
}
