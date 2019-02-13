import { Inject, Component, ViewEncapsulation, OnInit, ViewChild, ElementRef, Renderer, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Angulartics2 } from 'angulartics2';
import { Angulartics2GoogleAnalytics } from 'angulartics2/src/providers/angulartics2-ga';
import { LoadingService } from '../notification/loading.service';
import { WindowService } from './window.service';
import { Runtime } from '../runtime/runtime';
import { environment } from 'environments/environment';

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
            <header *ngIf="showHeader()"></header>
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
export class AppComponent implements OnInit {
    constructor(private _router: Router,
        private _loadingSvc: LoadingService,
        private _windowService: WindowService,
        private _renderer: Renderer,
        @Inject("Runtime") private runtime: Runtime,
        angulartics2: Angulartics2,
        angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics) {
    }

    @ViewChild('mainContainer') mainContainer: ElementRef;

    ngOnInit() {
        this.runtime.InitContext()
        this._windowService.initialize(this.mainContainer, this._renderer)
    }

    showHeader() {
        return !this.isRouteActive('Get')
    }

    isRouteActive(route: string): boolean {
        return this._router.isActive(route, true);
    }

    @HostListener('window:beforeunload', ['$event'])
    beforeUnloadHander(_) {
        this._loadingSvc.destroy()
        this.runtime.DestroyContext()
    }

    get isWAC() {
        return environment.WAC;
    }

    private dragOver(e: DragEvent) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "none"; // Disable drop
    }
}
