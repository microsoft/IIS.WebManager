import {Component, OnInit, Inject } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DiffUtil} from '../../utils/diff';
import {ApplicationPool} from './app-pool';
import {AppPoolsService} from './app-pools.service';
import { AppPoolsModuleName } from 'main/settings';
import { BreadcrumbsResolver, FeatureContext } from 'common/feature-vtabs.component';
import { Breadcrumb, BreadcrumbsRoot, AppPoolsCrumb, resolveAppPoolRoute } from 'header/breadcrumb';

const crumbsRoot = BreadcrumbsRoot.concat(AppPoolsCrumb);
class AppPoolBreadcrumbResolver implements BreadcrumbsResolver {
    resolve(model: FeatureContext): Breadcrumb[] {
        const pool = <ApplicationPool> model;
        return crumbsRoot.concat(<Breadcrumb>{ label: pool.name, routerLink: [resolveAppPoolRoute(pool.id)] });
    }
}

@Component({
    template: `
        <not-found *ngIf="notFound"></not-found>
        <loading *ngIf="!(pool || notFound)"></loading>
        <feature-vtabs
            *ngIf="pool" [model]="pool"
            [resource]="'appPool'"
            [subcategory]="'${AppPoolsModuleName}'"
            [breadcrumbsResolver]="breadcrumbsResolver">
            <app-pool-general class="general-tab" [pool]="pool" (modelChanged)="onModelChanged()"></app-pool-general>
        </feature-vtabs>
`,
})
export class AppPoolComponent implements OnInit {
    pool: ApplicationPool;
    notFound: boolean;
    breadcrumbsResolver = new AppPoolBreadcrumbResolver();
    private id: string;
    private _original: ApplicationPool;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        @Inject("AppPoolsService") private _service: AppPoolsService,
    ){
        this.id = this._route.snapshot.params['id'];
    }

    ngOnInit() {
        this._service.get(this.id)
            .then(p => {
                this.setAppPool(p);
            })
            .catch(s => {
                if (s && s.status == '404') {
                    this.notFound = true;
                }
            });
    }

    onModelChanged() {
        if (!this.pool) {
            return;
        }

        // Set up diff object
        var changes = DiffUtil.diff(this._original, this.pool);

        if (Object.keys(changes).length > 0) {
            var id = this.pool.id;
            this._service.update(this.pool, changes).then(p => {
                if (p.id != id) {
                    //
                    // Refresh if the Id has changed
                    this._router.navigate(['webserver', 'app-pools', p.id]);
                }
                else {
                    this.setAppPool(p);
                }
            });
        }
    }

    private setAppPool(p: ApplicationPool) {
        this.pool = p;
        this._original = JSON.parse(JSON.stringify(p));
    }
}
