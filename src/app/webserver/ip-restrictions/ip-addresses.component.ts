import { Component, Input, Output, EventEmitter } from '@angular/core';

import { IpRestrictions } from './ip-restrictions'

@Component({
    selector: 'ip-addresses',
    template: `
        <fieldset>
            <label>Response Status When Denied</label>
            <select class="form-control name" [(ngModel)]="model.deny_action" (modelChanged)="onModelChanged()">
                <option value="Abort">Abort Connection</option>
                <option value="Unauthorized">HTTP 401 Unauthorized</option>
                <option value="Forbidden">HTTP 403 Forbidden</option>
                <option value="NotFound">HTTP 404 Not Found</option>
            </select>
        </fieldset>
        <fieldset>
            <switch label="Proxy Mode" class="block" [(model)]="model.enable_proxy_mode" (modelChanged)="onModelChanged()">{{model.enable_proxy_mode ? "On" : "Off"}}</switch>
        </fieldset>
        <fieldset>
            <switch label="Use Reverse DNS Lookup" class="block" [(model)]="model.enable_reverse_dns" (modelChanged)="onModelChanged()">{{model.enable_reverse_dns ? "Yes" : "No"}}</switch>
        </fieldset>
    `,
    styles: [`
        li select,
        li input {
            display: inline;
        }

        .grid-list > li .actions {
            z-index: 1;
            position: absolute;
            right: 0;
        }
        .grid-list > li.background-editing .actions {
            top: 32px;
        }
    `]
})
export class IpAddressesComponent {
    @Input() model: IpRestrictions;
    @Output() modelChanged: any = new EventEmitter();

    onModelChanged() {
        this.modelChanged.emit();
    }
}
