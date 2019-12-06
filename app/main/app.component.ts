import { NgModule, Component, ViewEncapsulation, OnInit, OnDestroy, ViewChild, ElementRef, Renderer } from '@angular/core';
import { Router } from '@angular/router';

import 'rxjs/add/operator/take';

import { Angulartics2 } from 'angulartics2';
import { Angulartics2GoogleAnalytics } from 'angulartics2/src/providers/angulartics2-ga';

import { ConnectService } from '../connect/connect.service';
import { LoadingService } from '../notification/loading.service';
import { WindowService } from './window.service';
import { VersionService } from '../versioning/version.service';
import { ServerAnalyticService } from '../webserver/server-analytic.service';


@Component({
    selector: 'app',
    styles: [`
        #flexWrapper {
             padding-top:35px;
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

        .deprecation_banner {
            padding: 0.5em;
            background-color: #ffff7f;
        }
    `],
    encapsulation: ViewEncapsulation.None,  // Use to disable CSS Encapsulation for this component
    template: `
        <div class="deprecation_banner">IIS Web Manager is deprecatd. For next generateion of IIS server management install <a href="https://msft-sme.myget.org/feed/windows-admin-center-feed/package/nuget/msft.iis.iis-management">IIS extension for Windows Admin Center</a></div>
        <div (dragover)="dragOver($event)">
            <header *ngIf="!isRouteActive('Get')"></header>
            <div id="flexWrapper">
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
                private _renderer: Renderer,
                angulartics2: Angulartics2,
                angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics) {
    }

    @ViewChild('mainContainer') mainContainer: ElementRef;

    ngOnInit() {
        this._connectService.active.subscribe(c => {
            this._router.events.take(1).subscribe(evt => {
                if (!c) {
                    this._connectService.gotoConnect(false);
                }
            });
        });

        this._windowService.initialize(this.mainContainer, this._renderer);
    }

    ngOnDestroy() {
        this._loadingSvc.destroy();
    }

    isRouteActive(route: string): boolean {
        return this._router.isActive(route, true);
    }

    private dragOver(e: DragEvent) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "none"; // Disable drop
    }
}
