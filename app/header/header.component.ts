import { Component, OnDestroy, Optional } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { LoadingService } from '../notification/loading.service';
import { OptionsService } from '../main/options.service';
import { Angulartics2GoogleAnalytics } from 'angulartics2/src/providers/angulartics2-ga';

@Component({
    selector: 'header',
    template: `
        <div class="nav background-active">
            <button class="fa fa-bars nav-item nav-options hover-primary2" [attr.title]="this._options.active ? 'Hide Sidebar' : 'Show Sidebar'" (click)="this._options.toggle()" [class.background-primary2]="this._options.active"></button>
            <a [routerLink]="['/']" title="Home" class="nav-brand nav-item background-active hover-primary2 nav-height">
                <span class="v-center hidden-xs">Microsoft IIS</span>
                <span class="v-center visible-xs">IIS</span>
            </a>
            <div class="separator"></div>
            <connection-picker class="nav-item"></connection-picker>

            <notifications></notifications>
            <modal class="color-normal"></modal>
            
            <div class="abs-right background-active">
                <notification-indicator></notification-indicator>
                <div class="hover-primary2 hidden-sm hidden-xs nav-button" title="Provide Feedback" *ngIf="_window.usabilla_live" (click)="provideFeedback()">
                    <i class="fa fa-comment-o"></i>
                </div>
                <settings></settings>
            </div>
        </div>
        <div class="progress background-normal" [class.animation]='_inProgress'></div>
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
    private _subs = [];
    private _inProgress: boolean;
    private _timeout: number;
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
                    this._timeout = 0;
                    setTimeout(_ => this._inProgress = false, 300);
                }
            }
        }));
    }

    public ngOnDestroy() {
        this._subs.forEach(s => s.unsubscribe());
    }

    private provideFeedback(): void {
        if (this._angulartics2GoogleAnalytics) {
            this._angulartics2GoogleAnalytics.eventTrack('OpenFeedback', {
                category: 'Feedback',
                label: 'Feedback from header button'
            });
        }

        // usabilla API
        (<any>window).usabilla_live("click");
    }
}
