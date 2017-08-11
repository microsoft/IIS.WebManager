import { Component, Input, ViewChild, OnDestroy, Optional } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';

import { Angulartics2GoogleAnalytics } from 'angulartics2/src/providers/angulartics2-ga';
import { Subscription } from 'rxjs/Subscription';

import { Selector } from '../common/selector';

@Component({
    selector: 'settings',
    template: `
        <div title="Options" class="s-container hover-primary2" [class.background-primary2]="settingsMenu && settingsMenu.isOpen()" (click)="onClickSettings()">
            <i class="fa fa-cog"></i>
        </div>
        <selector #settingsMenu class="color-normal" [right]="true">
            <ul>
                <li class="hover-editing">
                    <a class="color-normal server" [routerLink]="['/settings/servers']" (click)="_settingsMenu.close()">Add or Remove Servers</a>
                </li>
                <li class="hover-editing">
                    <a class="color-normal download" [routerLink]="['/get']" (click)="_settingsMenu.close()">Download Microsoft IIS Administration</a>
                </li>
                <li *ngIf="_window.usabilla_live" class="hover-editing">
                    <button class="no-border hover-editing hover-color-normal comment" (click)="provideFeedback()">Provide Feedback</button>
                </li>
                <li class="hover-editing">
                    <a class="color-normal dev" href="https://github.com/microsoft/iis.administration">Developers</a>
                </li>
            </ul>
        </selector>
    `,
    styles: [`
        .s-container {
            display: inline-block;
            vertical-align: middle;
            min-width: 25px;
            cursor: pointer;
            padding: 0 15px;
            font-size: 120%;
            height: 55px;
        }

        .s-container i {
            line-height: 55px;
        }

        selector {
            position: absolute;
            right: 0;
            top: 54px;
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

    private provideFeedback(): void {
        if (this._angulartics2GoogleAnalytics) {
            this._angulartics2GoogleAnalytics.eventTrack('OpenFeedback', {
                category: 'Feedback',
                label: 'Feedback from the settings menu'
            });
        }

        // usabilla API
        (<any>window).usabilla_live("click");
        this._settingsMenu.close();
    }
}
