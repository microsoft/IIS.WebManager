import { Component, OnInit } from '@angular/core';

import { UrlRewriteService } from './url-rewrite.service';

@Component({
    template: `
        <div>
            <tabs>
                <tab [name]="'Inbound'">
                    <inbound-rules></inbound-rules>
                </tab>
                <tab [name]="'Outbound'">
                    Outbound
                </tab>
                <tab [name]="'Server Variables'">
                    Server Variables
                </tab>
                <tab [name]="'Rewrite Maps'">
                    Rewrite Maps
                </tab>
                <tab [name]="'Providers'">
                    Providers
                </tab>
            </tabs>
        </div>
    `
})
export class UrlRewriteComponent implements OnInit {
    public id: string;

    constructor(private _svc: UrlRewriteService) {
    }

    public ngOnInit() {
        this._svc.initialize(this.id);
    }
}
