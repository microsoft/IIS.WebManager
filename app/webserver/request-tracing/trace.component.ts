/// <reference path="../../../node_modules/@angular/core/src/core.d.ts" />

import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Provider, Trace} from './request-tracing';

@Component({
    selector: 'trace',
    template: `
        <div *ngIf="model">
            <fieldset class="inline-block pull-left">
                <label>Verbosity</label>
                <div>
                    <select id="s" class="form-control" [(ngModel)]="model.verbosity">
                        <option value="general">General</option>
                        <option value="criticalerror">Critical Error</option>
                        <option value="error">Error</option>
                        <option value="warning">Warning</option>
                        <option value="information">Information</option>
                        <option value="verbose">Verbose</option>
                    </select>
                </div>
            </fieldset>
            <fieldset class="inline-block" *ngIf="getKeys(model.allowed_areas).length > 0">
                <label>Areas</label>
                <ul>
                    <li *ngFor="let area of getKeys(model.allowed_areas)">                        
                        <checkbox2 [(model)]="model.allowed_areas[area]"><span>{{area}}</span></checkbox2>
                    </li>
                </ul>
            </fieldset>
        </div>
    `,
    styles: [`
        li {
            margin-top: 4px;
        }
        
        li:first-of-type {
            margin-top: 0;
        }

        li span {
            font-weight: normal;
        }
    
        fieldset {
            
        }

        fieldset div {
            max-width: 180px;
            display: block;
        }
    `],
})
export class TraceComponent {
    @Input() model: Trace;

    private getKeys(o) {
        return Object.keys(o);
    }
}