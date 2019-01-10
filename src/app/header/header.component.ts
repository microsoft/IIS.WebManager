import { Component, OnDestroy, Optional } from '@angular/core';
import { LoadingService } from '../notification/loading.service';
import { OptionsService } from '../main/options.service';
import { Angulartics2GoogleAnalytics } from 'angulartics2/src/providers/angulartics2-ga';
import { environment } from 'environments/environment';

@Component({
    selector: 'header',
    template: `
        <div *ngIf="!isWAC" class="nav background-active">
                <button class="fa fa-bars nav-item nav-options hover-primary2" [attr.title]="this.options.active ? 'Hide Sidebar' : 'Show Sidebar'" (click)="this.options.toggle()" [class.background-primary2]="this.options.active"></button>
                <a [routerLink]="['/']" title="Home" class="nav-brand nav-item background-active hover-primary2 nav-height">
                    <span class="v-center hidden-xs">Microsoft IIS</span>
                    <span class="v-center visible-xs">IIS</span>
                </a>
                <div class="separator"></div>
                <connection-picker class="nav-item"></connection-picker>
            
            <div class="abs-right background-active">
                <notification-indicator></notification-indicator>
                <settings></settings>
            </div>
        </div>
        <div class="progress background-normal" [class.animation]='_inProgress'></div>
        <notifications></notifications>
        <modal class="color-normal"></modal>
    `,
    styles: [`
        .nav {
            height:35px; 
            position:absolute; 
            top:0px;
            left:0px;
            right:0px;
            width:100%; 
            z-index:1030;
            white-space: nowrap;
        }

        >>> .nav-height {
            height:35px; 
        }

        .nav-item {
            display: inline-block;
            cursor: pointer;
            vertical-align: top;
        }

        .nav-options {
            padding: 10px;
            height: 35px;
            border: none;
        }

        .nav-options::before {
            line-height: 17px;
        }

        .nav-brand {
            padding: 0px 5px;
            font-size: 14px;
            padding: 0 10px;
        }

        .separator {
            width:1px;
            display: inline-block;
            vertical-align: middle;
            border-left:1px solid white;
            height:20px;
            margin-top: 7px;
            margin-right: 2px;
            margin-left: 2px;
        }

        .abs-right {
            display:inline-block;
            position: absolute;
            right: 0;
        }

        .progress {
            height:3px; 
            position:absolute; 
            top:0;
            left:0%;
            width:100%;
            z-index:1040;
            visibility: hidden; 
        }

        .animation {
            animation-name: progress;
            animation-duration: 15s;
            visibility: visible !important;
        }

        @keyframes progress {
            from {left: 0%;}
            to {left: 100%;}
        }

        .v-center {
            vertical-align: middle;
            height: 35px;
        }

        >>> .nav-button {
            display: inline-block;
            vertical-align: top;
            min-width: 25px;
            cursor: pointer;
            padding: 0 15px;
        }

        >>> .nav-button i,
        .nav-brand span {
            line-height: 35px;
        }

        connection-picker {
            font-size: 12px;
        }
    `]
})
export class HeaderComponent implements OnDestroy {
    private _inProgress: boolean;
    private _subs = [];
    private _timeout: NodeJS.Timer;
    private _window: Window = window;

    constructor(loadingSvc: LoadingService,
        private _options: OptionsService,
        @Optional() private _angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics) {
        this._subs.push(loadingSvc.active.subscribe(active => {
            if (active) {
                this._timeout = setTimeout(_ => {
                    this._inProgress = true;
                }, 200);
            }
            else {
                if (this._timeout) {
                    clearTimeout(this._timeout);
                    this._timeout = null;
                    setTimeout(_ => this._inProgress = false, 300);
                }
            }
        }));
    }

    get isWAC() {
        return environment.WAC;
    }

    private get options() {
        return this._options;
    }

    public ngOnDestroy() {
        this._subs.forEach(s => s.unsubscribe());
    }
}
