import {Component, OnInit, Inject} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import {ModuleUtil} from '../../utils/module';
import {DiffUtil} from '../../utils/diff';
import {OptionsService} from '../../main/options.service';

import {ApplicationPool} from './app-pool';
import {AppPoolsService} from './app-pools.service';
import { BreadcrumbsService } from 'header/breadcrumbs.service';
import { BreadcrumbsRoot, AppPoolsCrumb, Breadcrumb } from 'header/breadcrumb';


@Component({
    template: `
        <not-found *ngIf="notFound"></not-found>
        <loading *ngIf="!(pool || notFound)"></loading>
        <app-pool-header *ngIf="pool" [pool]="pool" class="crumb-content" [class.sidebar-nav-content]="_options.active"></app-pool-header>

        <div *ngIf="pool" class="sidebar crumb" [class.nav]="_options.active">
            <vtabs [markLocation]="true" (activate)="_options.refresh()">
                <item [name]="'General'" [ico]="'fa fa-wrench'">
                    <app-pool-general [pool]="pool" (modelChanged)="onModelChanged()"></app-pool-general>
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
export class AppPoolComponent implements OnInit {
    private id: string;
    private pool: ApplicationPool;
    private notFound: boolean;
    private modules: Array<any> = [];
    private _original: ApplicationPool;

    constructor(
        private _route: ActivatedRoute,
        private _options: OptionsService,
        private _router: Router,
        private crumbs: BreadcrumbsService,
        @Inject("AppPoolsService") private _service: AppPoolsService,
    ){
        this.id = this._route.snapshot.params['id'];
    }

    ngOnInit() {
        this._service.get(this.id)
            .then(p => {
                this.setAppPool(p);
                ModuleUtil.initModules(this.modules, this.pool, "appPool");
                let crumbs = BreadcrumbsRoot.concat(
                    AppPoolsCrumb,
                    <Breadcrumb>{ Label: p.name },
                );
                debugger

                this.crumbs.load(
                    BreadcrumbsRoot.concat(
                        AppPoolsCrumb,
                        <Breadcrumb>{ Label: p.name },
                    ));
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
