import { Component, Input, Output, EventEmitter } from '@angular/core';

import { IpRestrictions } from './ip-restrictions'

@Component({
    selector: 'ip-addresses',
    template: `
        <fieldset>
            <label>Proxy Mode</label>
            <switch class="block" [(model)]="model.enable_proxy_mode" (modelChanged)="onModelChanged()">{{model.enable_proxy_mode ? "On" : "Off"}}</switch>
        </fieldset>
        <fieldset>
            <label>Use Reverse DNS Lookup</label>
            <switch class="block" [(model)]="model.enable_reverse_dns" (modelChanged)="onModelChanged()">{{model.enable_reverse_dns ? "On" : "Off"}}</switch>
        </fieldset>
        <fieldset>
            <label>Unlisted IP Addresses</label>
            <switch class="block" [(model)]="model.allow_unlisted" (modelChanged)="onModelChanged()">{{model.allow_unlisted ? "Allow" : "Deny"}}</switch>
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
