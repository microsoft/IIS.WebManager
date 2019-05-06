
import { Component, Input, ViewChild, Inject } from '@angular/core';
import { WebServer } from './webserver';
import { Selector } from 'common/selector';
import { WebServerService } from './webserver.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'webserver-general',
    template: `
        <div class="controller">
            <button class="refresh" title="Restart" (click)="restart()">Restart</button>
            <button class="start" title="Start" [attr.disabled]="model.status != 'stopped' || null" (click)="start()">Start</button>
            <button class="stop" title="Stop" [attr.disabled]="model.status != 'started' || null" (click)="stop()">Stop</button>
        </div>
        <fieldset>
            <label>Name</label>
            <span class="form-control">{{model.name}}</span>
        </fieldset>
        <fieldset>
            <label>Version</label>
            <span class="form-control">{{model.version}}</span>
        </fieldset>
`,
    styles: [`
    .controller {
        padding-bottom: 50px;
    }
`],
})
export class WebServerGeneralComponent {
    @Input() model: WebServer;
    @ViewChild(Selector) _selector: Selector;

    private _subs: Array<Subscription> = [];

    constructor(
        @Inject('WebServerService') private _service: WebServerService,
    ) {}

    ngOnInit() {
        this._subs.push(this._service.status.subscribe(status => this.model.status = status));
    }

    ngOnDestroy() {
        this._subs.forEach(s => s.unsubscribe());
    }

    start() {
        this._service.start();
        this._selector.close();
    }

    stop() {
        this._service.stop();
        this._selector.close();
    }

    restart() {
        this._service.restart();
        this._selector.close();
    }
}
