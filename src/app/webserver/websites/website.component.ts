import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WebSite } from './site';
import { WebSitesService } from './websites.service';
import { DiffUtil } from 'utils/diff';
import { OptionsService } from 'main/options.service';
import { BreadcrumbsService } from 'header/breadcrumbs.service';
import { WebServerCrumb, BreadcrumbsRoot, WebSitesCrumb, Breadcrumb } from 'header/breadcrumb';

@Component({
    template: `
        <not-found *ngIf="notFound"></not-found>
        <loading *ngIf="!(site || notFound)"></loading>
        <website-header *ngIf="site" [site]="site" class="crumb-content" [class.sidebar-nav-content]="_options.active"></website-header>
        <feature-vtabs *ngIf="site" [model]="site" [resource]="'website'"></feature-vtabs>
    `,
})
export class WebSiteComponent implements OnInit {
    id: string;
    site: WebSite;
    notFound: boolean;

    private _original: any;

    constructor(
        private _route: ActivatedRoute,
        private _options: OptionsService,
        private _crumbs: BreadcrumbsService,
        @Inject("WebSitesService") private _service: WebSitesService,
    ){
        this.id = this._route.snapshot.params['id'];
    }

    ngOnInit() {
        //
        // Async get website
        this._service.get(this.id)
            .then(s => {
                this.setSite(s);
                this._crumbs.load(
                    BreadcrumbsRoot.concat(
                        WebServerCrumb,
                        WebSitesCrumb,
                        <Breadcrumb>{ label: s.name },
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
        //
        // Track model changes
        if (this.site) {
            // Set up diff object
            var changes = DiffUtil.diff(this._original, this.site);
            
            if (Object.keys(changes).length > 0) {
                this._service.update(this.site, changes).then(s => this.setSite(s));
            }
        }
    }

    private setSite(s) {
        this.site = s;
        this._original = JSON.parse(JSON.stringify(s));
    }
}
