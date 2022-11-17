
import {NgModule, Component, ElementRef, Input, Output, EventEmitter} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Module as Switch} from './switch.component';

@Component({
    selector: 'override-mode',
    styles: [`
        #root {
            position: relative;
        }

        #menu {
            position: absolute;
            top: 32px;
            left: -100px;
            padding: 5px;
            border-style: solid;
            border-width: 1px;
            z-index: 11;
            right: 0;
        }

        span {
            text-transform: capitalize;
        }

        #menu button {
            font-size: 100%;
        }

        fieldset:last-of-type {
            padding-bottom: 0;
        }
    `],
    template: `
        <div id="root">
            <!-- Override mode -->
            <button class="no-border" *ngIf="!metadata.is_locked" [class.active]="_focused" (click)="onClick()">
                <span>{{metadata.override_mode_effective}} Override </span>
                <i aria-hidden="true" class="sme-icon sme-icon-chevronDownSmall"></i>
            </button>
            <!-- Locked -->
            <button enabled class="no-border background-warning hover-warning" *ngIf="metadata.is_locked" [class.active]="_focused" (click)="onClick()">
                <i aria-hidden="true" class="sme-icon sme-icon-lock large left-icon"></i> Locked
            </button>
            <div id="menu" class="background-normal" [ngClass]="menuClasses()" [hidden]="!_focused && !(metadata.is_locked && _entered)">
                <!-- Override mode -->
                <div *ngIf="!metadata.is_locked">
                    <fieldset>
                        <switch label="Permit changes at child level" class="block" [model]="metadata.override_mode_effective" (modelChange)="updateData($event)" [on]="'allow'" [off]="'deny'">
                            <span>{{metadata.override_mode_effective}}</span>
                        </switch>
                    </fieldset>
                    <fieldset>
                        <button *ngIf="scope" class="no-border" [disabled]="!metadata.is_local" title="Undo local settings" aria-label="Undo local settings" (click)="onRevert()">
                            <i aria-hidden="true" class="sme-icon sme-icon-undo red"></i> Reset to inherited
                        </button>
                    </fieldset>
                </div>
                <!-- Locked -->
                <div *ngIf="metadata.is_locked">
                    <p>
                        The feature has been locked at the parent level and is not available for editing.
                        To enable editing, change the override setting of the parent level to 'Allow'.
                    </p>
                </div>
            </div>
        </div>
    `,
    host: {
        '(document:click)': 'docClick($event)',
        '(click)': 'insideClick($event)',
        '(mouseenter)': 'enter()',
        '(mouseleave)': 'leave()'
    }
})
export class OverrideModeComponent {
    @Input()
    public metadata;
    @Input()
    public scope: string;
    
    @Output()
    public modelChanged: any = new EventEmitter();
    @Output()
    public revert: any = new EventEmitter();

    private _focused: boolean = false;
    private _entered: boolean = false;
    private _doubleClick: boolean = false;

    constructor(private _eRef: ElementRef) {
    }

    updateData(evt) {
        this.metadata.override_mode = evt;
        this.metadata.override_mode_effective = evt;

        this.modelChanged.emit();
    }

    enter() {
        this._entered = true;
    }

    leave() {
        this._entered = false;
    }

    onClick() {
        if (this._doubleClick) {
            this.reset();
        }
        else {
            this._focused = true;
            this._doubleClick = true;
        }
        return true;
    }

    onRevert() {
        this.revert.emit(null);
    }

    docClick(evt) {
        if (!this._focused) {
            return;
        }

        if (!evt || !evt._overrideMode) {
            this.reset();
        }
    }

    insideClick(evt) {
        evt._overrideMode = true;
    }

    blur() {
        this.reset();
    }

    menuClasses() {
        return {
            "border-warning": this.metadata.is_locked,
            "border-active": !(this.metadata.is_locked)
        };
    }

    reset() {
        this._focused = false;
        this._doubleClick = false;
    }
}

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        Switch
    ],
    exports: [
        OverrideModeComponent
    ],
    declarations: [
        OverrideModeComponent
    ]
})
export class Module { }
