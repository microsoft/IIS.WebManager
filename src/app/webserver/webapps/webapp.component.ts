import {Component, OnInit, Inject} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {DiffUtil} from '../../utils/diff';
import {OptionsService} from '../../main/options.service';
import {WebApp} from './webapp';
import {WebAppsService} from './webapps.service';
import { BreadcrumbsService } from 'header/breadcrumbs.service';
import { BreadcrumbsRoot, WebServerCrumb, WebSitesCrumb, Breadcrumb } from 'header/breadcrumb';

@Component({
    template: `
        <not-found *ngIf="notFound"></not-found>
        <loading *ngIf="!(app || notFound)"></loading>
        <webapp-header *ngIf="app" [model]="app" class="crumb-content" [class.sidebar-nav-content]="_options.active"></webapp-header>
        <feature-vtabs *ngIf="app" [model]="app" [resource]="'webapp'" [subcategory]="'Web Application'">
            <webapp-general class="general-tab" [model]="app" (modelChanged)="onModelChanged()"></webapp-general>
        </feature-vtabs>
    `,
})
export class WebAppComponent implements OnInit {
    id: string;
    app: WebApp;
    notFound: boolean;

    private _original: any;

    constructor(
        private _route: ActivatedRoute,
        private _options: OptionsService,
        private _router: Router,
        private crumbs: BreadcrumbsService,
        @Inject("WebAppsService") private _service: WebAppsService,
    ) {
        this.id = this._route.snapshot.params["id"];
    }

    ngOnInit() {
        this._service.get(this.id)
            .then(app => {
                this.setApp(app);
                this.crumbs.load(
                    BreadcrumbsRoot.concat(
                        WebServerCrumb,
                        WebSitesCrumb,
                        <Breadcrumb>{ label: app.website.name, routerLink: ['/webserver/websites/', app.website.id] },
                        <Breadcrumb>{ label: app.path },
                    )
                );
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
        this.app = app;
        this._original = JSON.parse(JSON.stringify(app));
    }
}
