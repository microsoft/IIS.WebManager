import { Component, ViewChild, OnDestroy, Optional } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';
import { Subscription } from 'rxjs';
import { Selector } from '../common/selector';

@Component({
    selector: 'settings',
    template: `
        <div tabindex="0" title="Options" class="s-container nav-button hover-primary2" [class.background-primary2]="settingsMenu && settingsMenu.isOpen()" (keyup.space)="onClickSettings()" (keyup.enter)="onClickSettings()" (click)="onClickSettings()">
            <i aria-hidden="true" class="fa fa-cog"></i>
        </div>
        <div class="action-selector">
            <selector #settingsMenu class="color-normal" [right]="true"  [isQuickMenu]="true">
                <ul>
                    <li class="hover-editing">
                        <a class="color-normal server" [routerLink]="['/settings/servers']" (click)="_settingsMenu.close()">Add or Remove Servers</a>
                    </li>
                    <li class="hover-editing">
                        <a class="color-normal download" [routerLink]="['/get']" (click)="_settingsMenu.close()">Download Microsoft IIS Administration API</a>
                    </li>
                    <li class="hover-editing">
                        <a class="color-normal dev" href="https://github.com/microsoft/iis.administration" target="_blank">Developers</a>
                    </li>
                </ul>
            </selector>
        </div>
    `,
    styles: [`
        .s-container {
            font-size: 120%;
        }

        selector {
            position: absolute;
            right: 0;
            top: 34px;
        }

        ul {
            margin-bottom: 0;
        }

        li {
            white-space: nowrap;
        }

        a, button {
            padding: 7px 5px;
            display: block;
        }

        a:before,
        button:before {
            font-family: FontAwesome;
            font-size: 120%;
            line-height: 22px;
            width: 25px;
            display: inline-block;
        }

        li button {
            text-align: left;
            font-size: 14px;
        }

        .server:before {
            content: "\\f233";
        }

        .dev:before {
            content: "\\f121";
        }

        .download:before {
            content: "\\f019";
        }

        div:focus { 
            outline-style: dashed; 
            outline-color: #000; 
            outline-width: 2px; 
            outline-offset: -2px; 
            text-decoration: underline; 
    `]
})
export class SettingsMenuComponent implements OnDestroy {
    @ViewChild('settingsMenu')
    private _settingsMenu: Selector;
    private _subscriptions: Array<Subscription> = [];
    private _window: Window = window;

    constructor(private _router: Router,
        @Optional() private _angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics) {
        this._subscriptions.push(this._router.events.subscribe(e => {
            if (e instanceof NavigationStart) {
                this._settingsMenu.close();
            }
        }));
    }

    public ngOnDestroy() {
        this._subscriptions.forEach(sub => sub.unsubscribe());
    }

    private onClickSettings(): void {
        this._settingsMenu.toggle();
    }
}
