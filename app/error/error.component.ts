
import {NgModule, Component, Input, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ApiError} from '../error/api-error';

@Component({
    selector: 'section-locked',
    styles: [`
        #container {
            font-size: 16px;
            margin-bottom: 35px;
        }

        #lockSymbol {
            padding:10px;
            display:inline-block;
        }

        p {
            margin-top: 10px;
            font-size: 14px;
            width: 100%;
        }
    `],
    template: `
        <div id="container">
            <div id="lockSymbol" class="background-warning">
                <i class="fa fa-lock large left-icon"></i> Locked
            </div>
            <p>
                The feature has been locked at the parent level and is not available for editing.
                To enable editing, change the override setting of the parent level to 'Allow'.
            </p>
            <p class="color-error">
                The feature's settings could not be loaded.
                This happens when the feature is locked at the current configuration level and the feature's settings have been modified.
                To fix this, manually remove any local changes to the feature or unlock the feature at the parent level.
            </p>
        </div>
    `
})
export class SectionLockErrorComponent {
}

@Component({
    selector: 'feature-not-installed',
    template: `
        <div id="container">
            <p>
                The feature '{{name}}' has not been installed.
            </p>
        </div>
    `
})
export class FeatureNotInstalledComponent {
    @Input() name: string;
}

@Component({
    selector: 'error',
    template: `
        <div *ngIf="error">
            <div *ngIf="error.type === 'SectionLocked'">
                <section-locked></section-locked>
            </div>
            <div *ngIf="notInstalled && error.type === 'FeatureNotInstalled'">
                <feature-not-installed [name]="error.name"></feature-not-installed>
            </div>
        </div>
    `
})
export class ErrorComponent {
    @Input() error: ApiError;
    @Input() notInstalled: boolean = false;
}

@NgModule({
    imports: [
        FormsModule,
        CommonModule
    ],
    exports: [
        SectionLockErrorComponent,
        FeatureNotInstalledComponent,
        ErrorComponent
    ],
    declarations: [
        SectionLockErrorComponent,
        FeatureNotInstalledComponent,
        ErrorComponent
    ]
})
export class Module { }
