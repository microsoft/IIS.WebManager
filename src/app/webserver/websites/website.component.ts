import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WebSite } from './site';
import { WebSitesService } from './websites.service';
import { DiffUtil } from 'utils/diff';
import { BreadcrumbsRoot, WebSitesCrumb, Breadcrumb, resolveWebsiteRoute } from 'header/breadcrumb';
import { WebSitesModuleName, WebSiteModuleIcon } from 'main/settings';
import { BreadcrumbsResolver, FeatureContext } from 'common/feature-vtabs.component';
import { ModelStatusUpdater, UpdateType } from 'header/model-header.component';
import { TitlesService } from 'header/titles.service';
import { filter, map } from 'rxjs/operators';

const crumbsRoot = BreadcrumbsRoot.concat(WebSitesCrumb);
class WebSiteBreadcrumbResolver implements BreadcrumbsResolver {
    resolve(model: FeatureContext): Breadcrumb[] {
        const site = <WebSite> model;
        return crumbsRoot.concat(<Breadcrumb>{ label: site.name, routerLink: [resolveWebsiteRoute(site.id)] });
    }
}

class WebSiteStatusUpdater extends ModelStatusUpdater {
    constructor(
        service: WebSitesService,
        site: WebSite,
    ) {
        super(
            WebSitesModuleName,
            WebSiteModuleIcon,
            site.name,
            service.statusUpdates.pipe(
                filter(s => s.id == site.id),
                map(s => s.status),
            ),
            new Map<UpdateType, () => void>([
                [UpdateType.start, () => service.start(site)],
                [UpdateType.stop, () => service.stop(site)],
                // [UpdateType.delete, () => service.delete(site)],
            ]),
        )
    }
}

@Component({
    template: `
<not-found *ngIf="notFound"></not-found>
<loading *ngIf="!(site || notFound)"></loading>
<feature-vtabs
    *ngIf="site"
    [model]="site"
    [resource]="'website'"
    [subcategory]="'${WebSitesModuleName}'"
    [breadcrumbsResolver]="breadcrumbsResolver">
    <website-general class="general-tab" [site]="site" (modelChanged)="onModelChanged()"></website-general>
</feature-vtabs>
    `,
})
export class WebSiteComponent implements OnInit {
    id: string;
    site: WebSite;
    notFound: boolean;
    breadcrumbsResolver = new WebSiteBreadcrumbResolver();

    private _original: any;

    constructor(
        private title: TitlesService,
        private route: ActivatedRoute,
        @Inject("WebSitesService") private service: WebSitesService,
    ){
        this.id = this.route.snapshot.params['id'];
    }

    ngOnInit() {
        var site = this.service.get(this.id);
        site.then(s => {
            this.setSite(s);
        }).catch(s => {
            if (s && s.status == '404') {
                this.notFound = true;
            }
        });
    }

    onModelChanged() {
        //
        // Track model changes
        if (this.site) {
            // Set up diff object
            var changes = DiffUtil.diff(this._original, this.site);
            
            if (Object.keys(changes).length > 0) {
                this.service.update(this.site, changes).then(s => this.setSite(s));
            }
        }
    }

    private setSite(s) {
        this.title.loadModelUpdater(
            new WebSiteStatusUpdater(
                this.service,
                s,
            )
        );
        this.site = s;
        this._original = JSON.parse(JSON.stringify(s));
    }
}
