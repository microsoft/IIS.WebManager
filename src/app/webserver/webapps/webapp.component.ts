import {Component, OnInit, Inject} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';

import {ModuleUtil} from '../../utils/module';
import {DiffUtil} from '../../utils/diff';
import {OptionsService} from '../../main/options.service';


import {WebApp} from './webapp';
import {WebAppsService} from './webapps.service';


@Component({
    template: `
        <not-found *ngIf="notFound"></not-found>
        <loading *ngIf="!(app || notFound)"></loading>
        <webapp-header *ngIf="app" [model]="app" class="crumb-content" [class.sidebar-nav-content]="_options.active"></webapp-header>

        <div *ngIf="app" class="sidebar crumb" [class.nav]="_options.active">
            <ul class="crumbs sme-focus-zone">
                <li><a [routerLink]="['/webserver']">Web Server</a></li>
                <li><a [routerLink]="['/webserver/web-sites/']">Web Sites</a></li>
                <li><a [routerLink]="['/webserver/websites/', app.website.id]">{{app.website.name}}</a></li>
            </ul>
            <vtabs [markLocation]="true" (activate)="_options.refresh()">
                <item [name]="'General'" [ico]="'fa fa-wrench'">
                    <webapp-general [model]="app" (modelChanged)="onModelChanged()"></webapp-general>
                </item>
                <item *ngFor="let module of modules" [name]="module.name" [ico]="module.ico">
                    <dynamic [name]="module.component_name" [module]="module" [data]="module.data"></dynamic>
                </item>
            </vtabs>
        </div>
    `,
    styles: [`
        :host >>> .sidebar > vtabs .vtabs > .items {
            top: 35px;
        }
        :host >>> .sidebar > vtabs .vtabs > .content {
            top: 96px;
        }
    `]
})
export class WebAppComponent implements OnInit {
    id: string;
    app: WebApp;
    notFound: boolean;
    modules: Array<any> = [];
    
    private _original: any;

    constructor(private _route: ActivatedRoute,
                @Inject("WebAppsService") private _service: WebAppsService,
                private _options: OptionsService,
                private _router: Router) {
        this.id = this._route.snapshot.params["id"];
    }

    ngOnInit() {
        this._service.get(this.id)
            .then(app => {
                this.setApp(app);
                ModuleUtil.initModules(this.modules, this.app, "webapp");
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
