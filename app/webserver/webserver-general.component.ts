
import {Component, Input} from '@angular/core';
import {WebServer} from './webserver';


@Component({
    selector: 'webserver-general',
    template: `
        <fieldset>
            <label>Name</label>
            <span class="form-control">{{model.name}}</span>
        </fieldset>
        <fieldset>
            <label>Version</label>
            <span class="form-control">{{model.version}}</span>
        </fieldset>
    `
})
export class WebServerGeneralComponent {
    @Input() model: WebServer;
}
