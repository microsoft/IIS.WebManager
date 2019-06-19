
import { Component, Input, Inject, OnInit } from '@angular/core';
import { WebServer } from './webserver';
import { WebServerService } from './webserver.service';
import { StatusController } from 'common/status-controller.component';

class WebServerStatusController extends StatusController {
    constructor(
        private srv: WebServerService,
        model: WebServer,
    ) { super(model); }

    startImpl(): Promise<any> {
        return this.srv.start();
    }

    stopImpl(): Promise<any> {
        return this.srv.stop();
    }
}

@Component({
    selector: 'webserver-general',
    template: `
<status-controller [controller]="controller"></status-controller>
<fieldset>
    <label>Name</label>
    <span class="form-control">{{model.name}}</span>
</fieldset>
<fieldset>
    <label>Version</label>
    <span class="form-control">{{model.version}}</span>
</fieldset>
`,
})
export class WebServerGeneralComponent implements OnInit {
    controller: StatusController;
    @Input() model: WebServer;

    constructor(
        @Inject('WebServerService') private srv: WebServerService,
    ) {}

    ngOnInit() {
        this.controller = new WebServerStatusController(this.srv, this.model);
    }
}
