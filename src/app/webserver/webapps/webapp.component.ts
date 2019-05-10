import {Component, OnInit, Inject} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {DiffUtil} from '../../utils/diff';
import {WebApp} from './webapp';
import {WebAppsService} from './webapps.service';
import { WebAppsModuleName, WebAppModuleIcon } from 'main/settings';
import { BreadcrumbsRoot, WebSitesCrumb, Breadcrumb } from 'header/breadcrumb';
import { BreadcrumbsResolver, FeatureContext } from 'common/feature-vtabs.component';
import { ModelStatusUpdater } from 'header/model-header.component';
import { TitlesService } from 'header/titles.service';
import { resolveWebsiteRoute, resolveWebAppRoute } from 'webserver/webserver-routing.module';

const crumbsRoot = BreadcrumbsRoot.concat(WebSitesCrumb);
class WebAppCrumbsResolver implements BreadcrumbsResolver {
    resolve(model: FeatureContext): Breadcrumb[] {
        let app = <WebApp> model;
        return crumbsRoot.concat(
            <Breadcrumb>{ label: app.website.name, routerLink: [resolveWebsiteRoute(app.website.id)] },
            <Breadcrumb>{ label: app.path, routerLink: [resolveWebAppRoute(app.id)] },
        );
    }
}

class WebAppStatusUpdater extends ModelStatusUpdater {
    constructor(app: WebApp) {
        super(
            WebAppsModuleName,
            WebAppModuleIcon,
            app.path,
            app,
            null,
        )
    }
}

@Component({
    template: `
        <not-found *ngIf="notFound"></not-found>
        <loading *ngIf="!(app || notFound)"></loading>
        <feature-vtabs
            class="sme-focus-zone"
            *ngIf="app" [model]="app"
            [resource]="'webapp'"
            [subcategory]="'${WebAppsModuleName}'"
            [breadcrumbsResolver]="breadcrumbsResolver">
            <webapp-general class="general-tab" [model]="app" (modelChanged)="onModelChanged()"></webapp-general>
        </feature-vtabs>
    `,
})
export class WebAppComponent implements OnInit {
    id: string;
    app: WebApp;
    notFound: boolean;
    breadcrumbsResolver = new WebAppCrumbsResolver();

    private _original: any;

    constructor(
        private title: TitlesService,
        private _route: ActivatedRoute,
        private _router: Router,
        @Inject("WebAppsService") private _service: WebAppsService,
    ) {
        this.id = this._route.snapshot.params["id"];
    }

    ngOnInit() {
        this._service.get(this.id)
            .then(app => {
                this.setApp(app);
            })
            .catch(s => {
                if (s && s.status == '404') {
                    this.notFound = true;
                }
            });
    }

    onModelChanged() {
        if (!this.app) {
            return;
        }

        //
        // Track model changes
        var changes = DiffUtil.diff(this._original, this.app);

        if (Object.keys(changes).length > 0) {
            var id = this.app.id;

            this._service.update(this.app, changes).then(app => {
                if (id != app.id) {
                    //
                    // Refresh if the Id has changed
                    this._router.navigate(['/WebServer/WebApps/WebApp', { id: app.id }]);
                }
                else {
                    this.setApp(app);
                }
            });
        }
    }

    private setApp(app: WebApp) {
        this.title.loadModelUpdater(new WebAppStatusUpdater(app));
        this.app = app;
        this._original = JSON.parse(JSON.stringify(app));
    }
}
