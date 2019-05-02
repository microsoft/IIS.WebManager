import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DiffUtil } from '../../utils/diff';
import { ApplicationPool } from './app-pool';
import { AppPoolsService } from './app-pools.service';
import { AppPoolsModuleName, AppPoolModuleIcon } from 'main/settings';
import { BreadcrumbsResolver, FeatureContext } from 'common/feature-vtabs.component';
import { Breadcrumb, BreadcrumbsRoot, AppPoolsCrumb } from 'header/breadcrumb';
import { ModelStatusUpdater, UpdateType } from 'header/model-header.component';
import { TitlesService } from 'header/titles.service';
import { resolveAppPoolRoute } from 'webserver/webserver-routing.module';

const crumbsRoot = BreadcrumbsRoot.concat(AppPoolsCrumb);
class AppPoolBreadcrumbResolver implements BreadcrumbsResolver {
    resolve(model: FeatureContext): Breadcrumb[] {
        const pool = <ApplicationPool> model;
        return crumbsRoot.concat(<Breadcrumb>{ label: pool.name, routerLink: [resolveAppPoolRoute(pool.id)] });
    }
}

class AppPoolStatusUpdater extends ModelStatusUpdater {
    constructor(
        service: AppPoolsService,
        pool: ApplicationPool,
    ) {
        super(
            AppPoolsModuleName,
            AppPoolModuleIcon,
            pool.name,
            pool,
            new Map<UpdateType, () => void>([
                [UpdateType.Recycle, () => service.recycle(pool)],
                [UpdateType.Start, () => service.start(pool)],
                [UpdateType.Stop, () => service.stop(pool)],
                // [UpdateType.delete, () => service.delete(pool)],
            ]),
        )
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
    private original: ApplicationPool;

    constructor(
        private title: TitlesService,
        private route: ActivatedRoute,
        private router: Router,
        @Inject("AppPoolsService") private service: AppPoolsService,
    ){
        this.id = this.route.snapshot.params['id'];
    }

    ngOnInit() {
        this.service.get(this.id)
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
        var changes = DiffUtil.diff(this.original, this.pool);

        if (Object.keys(changes).length > 0) {
            var id = this.pool.id;
            this.service.update(this.pool, changes).then(p => {
                if (p.id != id) {
                    //
                    // Refresh if the Id has changed
                    this.router.navigate(['webserver', 'app-pools', p.id]);
                }
                else {
                    this.setAppPool(p);
                }
            });
        }
    }

    private setAppPool(p: ApplicationPool) {
        this.title.loadModelUpdater(new AppPoolStatusUpdater(this.service, p));
        this.pool = p;
        this.original = JSON.parse(JSON.stringify(p));
    }
}
