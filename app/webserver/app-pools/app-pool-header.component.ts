
import {Component, Input, Inject} from '@angular/core';
import {Router} from '@angular/router';

import {ApplicationPool} from './app-pool';
import {AppPoolsService} from './app-pools.service';


@Component({
    selector: 'app-pool-header',
    styles: [`
        .feature-title:before {
            content: "\\f085";
        }
    `],
    template: `
        <div *ngIf="pool">
            <div class="feature-header">
                <div class="subject">
                    <h1 class="feature-title" [ngClass]="pool.status"><span>{{pool.name}}</span></h1>
                    <span class="status hidden-xs" *ngIf="pool.status == 'stopped'">({{pool.status}})</span>
                </div>
            </div>
            <button title="Recycle" class="no-border" [attr.disabled]="pool.status != 'started' ? true : null" (click)="onRecycle()">
                <i class="fa fa-refresh color-active"></i><span class="hidden-xs">Recycle</span>
            </button>
            <button title="Start" class="no-border" [attr.disabled]="pool.status != 'stopped' ? true : null" (click)="onStart()">
                <i class="fa fa-play green"></i><span class="hidden-xs">Start</span>
            </button>
            <button title="Stop" class="no-border" [attr.disabled]="pool.status != 'started' ? true : null" (click)="onStop()">
                <i class="fa fa-stop red"></i><span class="hidden-xs">Stop</span>
            </button>
            <button title="Delete" class="no-border" (click)="onDelete()">
                <i class="fa fa-trash-o red"></i><span class="hidden-xs">Delete</span>
            </button>
        </div>
    `
})
export class AppPoolHeaderComponent {
    @Input() pool: ApplicationPool;

    constructor(@Inject("AppPoolsService") private _service: AppPoolsService,
                private _router: Router) {
    }

    onStart() {
        this._service.start(this.pool);
    }

    onStop() {
        this._service.stop(this.pool);
    }

    onDelete() {
        if (confirm("Are you sure you would like to delete this application pool?\nName: " + this.pool.name)) {
            this._service.delete(this.pool)
                .then(() => {
                    this._router.navigate(["/WebServer"]);
                });
        }
    }

    onRecycle() {
        this._service.recycle(this.pool);
    }
}
