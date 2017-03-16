import { Component, Input, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { Status } from '../common/status';
import { WebServerService } from './webserver.service';
import { WebServer } from './webserver';


@Component({
    selector: 'webserver-header',
    styles: [`
        .feature-title:before {
            content: "\\f233";
        }
    `],
    template: `
        <div>
            <div class="feature-header">
                <div class="subject">
                    <h1 class="feature-title" [ngClass]="model.status"><span>Web Server</span></h1>
                    <span class="status" *ngIf="model.status.startsWith('stop')">({{model.status}})</span>
                </div>
            </div>
            <div *ngIf="model.status">
                <button title="Restart" class="no-border" (click)="restart()">
                    <i class="fa fa-refresh color-active"></i><span class="hidden-xs">Restart</span>
                </button>
                <button class="no-border" title="Start" [attr.disabled]="model.status != 'stopped' || null" (click)="start()">
                    <i class="fa fa-play green"></i><span class="hidden-xs">Start</span>
                </button>
                <button class="no-border" title="Stop" [attr.disabled]="model.status != 'started' || null" (click)="stop()">
                    <i class="fa fa-stop red"></i><span class="hidden-xs">Stop</span>
                </button>
            </div>
        </div>
    `
})
export class WebServerHeaderComponent {
    @Input() model: WebServer;

    private _subs: Array<Subscription> = [];


    constructor(@Inject('WebServerService') private _service: WebServerService) {
    }

    ngOnInit() {
        this._subs.push(this._service.status.subscribe(status => this.model.status = status));
    }

    ngOnDestroy() {
        this._subs.forEach(s => s.unsubscribe());
    }

    start() {
        this._service.start();
    }

    stop() {
        this._service.stop();
    }

    restart() {
        this._service.restart();
    }
}
