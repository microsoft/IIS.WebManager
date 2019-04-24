import { Inject, Component, ViewEncapsulation, OnInit, ViewChild, ElementRef, Renderer, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Angulartics2 } from 'angulartics2';
import { LoadingService } from '../notification/loading.service';
import { WindowService } from './window.service';
import { Runtime } from '../runtime/runtime';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';
import { IsWAC } from 'environments/environment';
import { BreadcrumbsService } from 'header/breadcrumbs.service';

@Component({
    selector: 'app-root',
    template: `
<div class='content' (dragover)="dragOver($event)">
    <header *ngIf="showHeader()"></header>
    <div class="container-fluid" id="mainContainer" #mainContainer>
        <breadcrumbs></breadcrumbs>
        <div class="row" id="mainRow">
            <div class="col-xs-12">
                <div id="bodyContent">
                    <router-outlet (activate)='onActivate($event)'></router-outlet>
                </div>
            </div>
        </div>
    </div>
</div>
`,
    styles: [`
        .content {
            height: 100%;
        }

        #mainContainer {
             height: 100%;
             width:100%;
             overflow-x:hidden;
             min-width:initial;
        }

        #mainContainer.fixed {
            min-width: 500px;
        }

        #mainRow {
            height: 100%
        }

        #bodyContent {
            height: 100%;
        }
    `],
    encapsulation: ViewEncapsulation.None,  // Use to disable CSS Encapsulation for this component
})
export class AppComponent implements OnInit {
    constructor(private _router: Router,
        private _loadingSvc: LoadingService,
        private _windowService: WindowService,
        private _renderer: Renderer,
        private _crumbsSrv: BreadcrumbsService,
        @Inject("Runtime") private runtime: Runtime,
        angulartics2: Angulartics2,
        angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics) {
    }

    @ViewChild('mainContainer') mainContainer: ElementRef;

    ngOnInit() {
        this.runtime.OnAppInit()
        this._windowService.initialize(this.mainContainer, this._renderer)
    }

    showHeader() {
        return !this.isRouteActive('Get')
    }

    isRouteActive(route: string): boolean {
        return this._router.isActive(route, true);
    }

    onActivate(component) {
        // If the component does not have a breadcrumb service, clean up the breadcrumb
        // otherwise the component itself is responsible for loading breadcrumb on itself
        if (!Object.getOwnPropertyNames(component).find(name => component[name] instanceof BreadcrumbsService)) {
            this._crumbsSrv.load([]);
        }
    }

    @HostListener('window:beforeunload', ['$event'])
    beforeUnloadHander(_) {
        this._loadingSvc.destroy()
        this.runtime.OnAppDestroy()
    }

    get isWAC() {
        return IsWAC;
    }

    private dragOver(e: DragEvent) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "none"; // Disable drop
    }
}
