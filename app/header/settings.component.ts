import { Component, Input, ViewChild, OnDestroy } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';

import { Subscription } from 'rxjs/Subscription';

import { Selector } from '../common/selector';

@Component({
    selector: 'settings',
    template: `
        <div class="s-container" (click)="onClickSettings()">
            <i class="fa fa-cog"></i>
        </div>
        <selector #settingsMenu class="color-normal" [right]="true">
            <ul>
                <li>
                    <a href="https://github.com/microsoft/iis.administration/issues">Report an issue</a>
                </li>
                <li>
                    <a href="https://docs.microsoft.com/iis-administration">Help</a>
                </li>
                <li>
                    <a [routerLink]="['/get']">Download Microsoft IIS Administration</a>
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
    `]
})
export class SettingsComponent implements OnDestroy {
    @ViewChild('settingsMenu')
    private _settingsMenu: Selector;
    private _subscriptions: Array<Subscription> = [];

    constructor(private _router: Router) {
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
