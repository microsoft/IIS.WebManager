import { Component, OnDestroy } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { LoadingService } from '../notification/loading.service';
import { OptionsService } from '../main/options.service';

@Component({
    selector: 'header',
    template: `
        <div class="nav background-active">
            <button class="fa fa-bars nav-item nav-options hover-active" (click)="this._options.toggle()" [class.active]="this._options.active"></button>
            <a [routerLink]="['/']" class="nav-brand nav-item background-active">
                <span class="v-center"><span class="hidden-xs">Microsoft</span> IIS</span>
            </a>
            <div class="separator padded"></div>
            <connection-picker class="nav-item"></connection-picker>

            <notifications></notifications>
            <modal class="color-normal"></modal>
            
            <div class="right">
                <notification-indicator class="v-center"></notification-indicator>
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
        }

        .nav-options:not(.active) {
            opacity: .6;
        }

        .nav-brand {
            padding: 0px 5px;
            font-size: 20px;
        }

        .separator {
            width:1px;
            display: inline-block;
            vertical-align:top;
            border-left:1px solid white;
            height:23px;
            margin-top:16px;
        }
 
        .separator.padded {
            margin-right: 12px;
            margin-left: 6px;
        }

        .right {
            display:inline-block;
            float:right;
        }

        .palette {
            width: 15px;
            height: 15px;
            display: inline-block;
            vertical-align: middle;
            margin-top: 19px;
            margin-right: 5px;
            border-style: solid;
            border-width: 1px;
            cursor: pointer;
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

        notification-indicator {
            padding: 0 10px;
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
