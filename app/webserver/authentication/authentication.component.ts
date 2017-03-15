import {Component, OnInit, DoCheck} from '@angular/core';

import {AuthenticationService} from './authentication.service';
import {Logger} from '../../common/logger';
import {NotificationService} from '../../notification/notification.service';

import {DiffUtil} from '../../utils/diff';

@Component({
    template: `
        <loading *ngIf="!settings"></loading>
        <div *ngIf="settings">
            <!-- Anonymous -->
            <section *ngIf="settings.anonymous || settings.anonymousError">
                <div class="collapse-heading" data-toggle="collapse" data-target="#anonAuthentication">
                    <h2>Anonymous Authentication</h2>
                </div>
                <div id="anonAuthentication" class="collapse in">
                    <anon-auth [model]="settings.anonymous" [error]="settings.anonymousError" (revert)="onRevertAnon()" (modelChange)="onAnonAuthChanged()"></anon-auth>
                </div>
            </section>
            <!-- Basic -->
            <section *ngIf="settings.basic || settings.basicError">
                <div class="collapse-heading" data-toggle="collapse" data-target="#basicAuthentication">
                    <h2>Basic Authentication</h2>
                </div>
                <div id="basicAuthentication" class="collapse in">
                    <basic-auth [model]="settings.basic" [error]="settings.basicError" (revert)="onRevertBasic()" (modelChange)="onBasicAuthChanged()"></basic-auth>
                </div>
            </section>
            <!-- Digest -->
            <section *ngIf="settings.digest || settings.digestError">
                <div class="collapse-heading" data-toggle="collapse" data-target="#digestAuthentication">
                    <h2>Digest Authentication</h2>
                </div>
                <div id="digestAuthentication" class="collapse in">
                    <digest-auth [model]="settings.digest" [error]="settings.digestError" (revert)="onRevertDigest()" (modelChange)="onDigestAuthChanged()"></digest-auth>
                </div>
            </section>
            <!-- Windows -->
            <section *ngIf="settings.windows || settings.windowsError">
                <div class="collapse-heading" data-toggle="collapse" data-target="#windowsAuthentication">
                    <h2>Windows Authentication</h2>
                </div>
                <div id="windowsAuthentication" class="collapse in">
                    <win-auth [model]="settings.windows" [error]="settings.windowsError" (revert)="onRevertWindows()" (modelChange)="onWindowsAuthChanged()"></win-auth>
                </div>        
            </section>
        </div>
    `,
    styles: [`
        h2:first-of-type {
            margin-top: 0;
        }
    `]
})
export class AuthenticationComponent implements OnInit {
    id: string;
    settings: any;

    private _original: any;

    constructor(private _service: AuthenticationService, private _notificationService: NotificationService) {
    }

    ngOnInit() {
        this._service.get(this.id)
            .then(s => {
                this.settings = s;

                if (this.settings.anonymous) {
                    this.settings.anonymous.password = "";
                }

                this._original = JSON.parse(JSON.stringify(s));
            })
    }

    onAnonAuthChanged() {

        if (this.settings.anonymous && this.settings.anonymous.metadata.is_locked) {
            this.settings.anonymous = JSON.parse(JSON.stringify(this._original.anonymous));
            this.settings.anonymous.password = "";
        }

        if (this.settings.anonymous) {

            var changes = DiffUtil.diff(this._original.anonymous, this.settings.anonymous);

            if (Object.keys(changes).length > 0) {

                this._service.patchFeature(this.settings.anonymous, changes)
                    .then(feature => {
                        this._notificationService.clearWarnings();

                        this.settings.anonymous = feature;
                        this.settings.anonymous.password = "";

                        this._original.anonymous = JSON.parse(JSON.stringify(feature));
                    });
            }
            else {
                this._notificationService.clearWarnings();
            }
        }
    }

    onRevertAnon() {
        this._service.revert(this.settings.anonymous)
            .then(anonAuth => {
                this.settings.anonymous = anonAuth;
                this.settings.anonymous.password = "";

                this._original.anonymous = JSON.parse(JSON.stringify(anonAuth));
            });
    }

    onBasicAuthChanged() {

        if (this.settings.basic && this.settings.basic.metadata.is_locked) {
            this.settings.basic = JSON.parse(JSON.stringify(this._original.basic));
        }

        if (this.settings.basic) {

            var changes = DiffUtil.diff(this._original.basic, this.settings.basic);

            if (Object.keys(changes).length > 0) {

                this._service.patchFeature(this.settings.basic, changes)
                    .then(feature => {
                        this._notificationService.clearWarnings();

                        this.settings.basic = feature;
                        this._original.basic = JSON.parse(JSON.stringify(feature));
                    })
            }
            else {
                this._notificationService.clearWarnings();
            }
        }
    }

    onRevertBasic() {
        this._service.revert(this.settings.basic)
            .then(basicAuth => {
                this.settings.basic = basicAuth;
                this._original.basic = JSON.parse(JSON.stringify(basicAuth));
            });
    }

    onDigestAuthChanged() {

        if (this.settings.digest && this.settings.digest.metadata.is_locked) {
            this.settings.digest = JSON.parse(JSON.stringify(this._original.digest));
        }

        if (this.settings.digest) {

            var changes = DiffUtil.diff(this._original.digest, this.settings.digest);

            if (Object.keys(changes).length > 0) {

                this._service.patchFeature(this.settings.digest, changes)
                    .then(feature => {
                        this._notificationService.clearWarnings();
                        this.settings.digest = feature;
                        this._original.digest = JSON.parse(JSON.stringify(feature));
                    });
            }
            else {
                this._notificationService.clearWarnings();
            }
        }
    }

    onRevertDigest() {
        this._service.revert(this.settings.digest)
            .then(digestAuth => {
                this.settings.digest = digestAuth;
                this._original.digest = JSON.parse(JSON.stringify(digestAuth));
            });
    }

    onWindowsAuthChanged() {

        if (this.settings.windows && this.settings.windows.metadata.is_locked) {
            this.settings.windows = JSON.parse(JSON.stringify(this._original.windows));
        }

        if (this.settings.windows) {

            var changes = DiffUtil.diff(this._original.windows, this.settings.windows);

            if (Object.keys(changes).length > 0) {

                this._service.patchFeature(this.settings.windows, changes)
                    .then(feature => {
                        this._notificationService.clearWarnings();
                        this.settings.windows = feature;
                        this._original.windows = JSON.parse(JSON.stringify(feature));
                    });
            }
            else {
                this._notificationService.clearWarnings();
            }
        }
    }

    onRevertWindows() {
        this._service.revert(this.settings.windows)
            .then(windowsAuth => {
                this.settings.windows = windowsAuth;

                this._original.windows = JSON.parse(JSON.stringify(windowsAuth));
            })
    }
}