import { Inject, Component, ViewEncapsulation, OnInit, OnDestroy, ViewChild, ElementRef, Renderer } from '@angular/core';
import { Router } from '@angular/router';

import { Angulartics2 } from 'angulartics2';
import { Angulartics2GoogleAnalytics } from 'angulartics2/src/providers/angulartics2-ga';

import { ConnectService } from '../connect/connect.service';
import { LoadingService } from '../notification/loading.service';
import { WindowService } from './window.service';
import { VersionService } from '../versioning/version.service';
import { ServerAnalyticService } from '../webserver/server-analytic.service';
import { AppContextService, NavigationService } from '@microsoft/windows-admin-center-sdk/angular';
import { Runtime } from '../runtime/runtime';
import { environment } from '../environments/environment'

@Component({
    selector: 'app-root',
    styles: [`
        .content {
            height: 100%;
        }

        #flexWrapper {
             padding-top:35px;
             overflow-x:hidden;
             width:100%;
             display: flex;
             height: 100%;
        }

        #wacFlexWrapper {
            overflow-x:hidden;
            width:100%;
            display: flex;
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
    template: `
        <div class='content' (dragover)="dragOver($event)">
            <header *ngIf="!isWAC && showHeader()"></header>
            <div id="{{ isWAC ? 'wacFlexWrapper' : 'flexWrapper' }}">
                <div class="container-fluid" id="mainContainer" #mainContainer>
                    <div class="row" id="mainRow">
                        <div class="col-xs-12">
                            <div id="bodyContent">
                                <router-outlet></router-outlet>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class AppComponent implements OnInit, OnDestroy {
    constructor(private _router: Router,
        private _connectService: ConnectService,
        private _loadingSvc: LoadingService,
        private _windowService: WindowService,
        private _versionService: VersionService,
        private _serverAnalyticService: ServerAnalyticService,
        @Inject("Runtime") private runtime: Runtime,
        private _renderer: Renderer,
        angulartics2: Angulartics2,
        angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics) {
    }

    @ViewChild('mainContainer') mainContainer: ElementRef;

    ngOnInit() {
        this.runtime.InitContext()
        this._windowService.initialize(this.mainContainer, this._renderer)
    }

    ngOnDestroy() {
        this._loadingSvc.destroy()
        this.runtime.DestroyContext()
    }

    showHeader() {
        return !this.isRouteActive('Get')
    }

    get isWAC() {
        return environment.WAC
    }

    isRouteActive(route: string): boolean {
        return this._router.isActive(route, true);
    }

    private dragOver(e: DragEvent) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "none"; // Disable drop
    }
}
