import { NgModule, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoadingService } from "./loading.service"

@Component({
    selector: 'loading',
    template: `
        ﻿<div class="loader" [class.active]="_active">
            <div class="load-data">
                <span class="loading">Loading</span>
            </div>
        </div>
    `,
    styles: [`
        :host {
            position: absolute;
        }
    `]
})
export class LoadingComponent implements OnInit, OnDestroy {
    private _active: boolean;

    constructor(private _loadingSvc: LoadingService) {
    }

    ngOnInit() {
        this._loadingSvc.begin();
        setTimeout(_ => this.setActive(true), 10);
    }

    ngOnDestroy() {
        this.setActive(false);
        this._loadingSvc.end();
    }

    public setActive(val: boolean) {
        this._active = val;
    }
}

@NgModule({
    imports: [
        FormsModule,
        CommonModule
    ],
    exports: [
        LoadingComponent
    ],
    declarations: [
        LoadingComponent
    ]
})
export class Module { }
