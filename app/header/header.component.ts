import { Component, OnDestroy } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { LoadingService } from '../notification/loading.service';
import { OptionsService } from '../main/options.service';

@Component({
    selector: 'header',
    template: `
        <div class="nav background-active">
            <button class="fa fa-bars nav-item nav-options hover-primary2" (click)="this._options.toggle()" [class.active]="this._options.active"></button>
            <a [routerLink]="['/']" class="nav-brand nav-item hover-primary2 background-active">
                <span class="v-center"><span class="hidden-xs">Microsoft</span> IIS</span>
            </a>
            <div class="separator"></div>
            <connection-picker class="nav-item"></connection-picker>

            <notifications></notifications>
            <modal class="color-normal"></modal>
            
            <div class="right">
                <settings></settings>
            </div>
            <div class="right">
                <notification-indicator></notification-indicator>
            </div>
        </div>
        <div class="progress background-normal" [class.animation]='_inProgress'></div>
    `,
    styles: [`
        .nav {
            height:55px; 
            position:absolute; 
            top:0px;
            left:0px;
            right:0px;
            width:100%; 
            z-index:1030;
        }

        .nav-item {
            display: inline-block;
            cursor: pointer;
            vertical-align: middle;
        }

        .nav-options {
            padding: 10px;
            height: 55px;
            border: none;
        }

        .nav-options:not(.active) {
            opacity: .6;
        }

        .nav-brand {
            padding: 0px 5px;
            font-size: 20px;
            padding: 0 10px;
        }

        .separator {
            width:1px;
            display: inline-block;
            vertical-align: middle;
            border-left:1px solid white;
            height:23px;
            margin-right: 2px;
            margin-left: 2px;
        }

        .right {
            display:inline-block;
            float:right;
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
            height: 55px;
            display: table-cell;
        }
    `]
})
export class HeaderComponent implements OnDestroy {
    private _subs = [];
    private _inProgress: boolean;
    private _timeout: number;

    constructor(loadingSvc: LoadingService, private _options: OptionsService) {
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
}
