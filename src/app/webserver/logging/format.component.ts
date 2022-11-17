
import {Component, Input, Output, EventEmitter} from '@angular/core';

import {Logging} from './logging'


@Component({
    selector: 'format',
    template: `
        <fieldset>
            <label>Format</label>
            <enum [disabled]="!model.log_per_site && model.website" [(model)]="model.log_file_format" (modelChanged)="onModelChanged()">
                <field name="W3C" value="w3c"></field>
                <field [hidden]="!model.log_per_site" name="NCSA" value="ncsa"></field>
                <field [hidden]="!model.log_per_site" name="IIS" value="iis"></field>
                <field [hidden]="!model.log_per_site" name="Custom" value="custom"></field>
                <field [hidden]="model.log_per_site"  name="Binary" value="binary"></field>
            </enum>
        </fieldset>

        <fieldset *ngIf="model.log_per_site && model.log_file_format == 'w3c' && model.log_target" class="flags">
            <label>Write logs into</label>
            <checkbox2 [(model)]="model.log_target.file" (modelChanged)="onModelChanged()">Log File(s)</checkbox2>
            <checkbox2 [(model)]="model.log_target.etw" (modelChanged)="onModelChanged()">Event Tracing for Windows (ETW)</checkbox2>
        </fieldset>

        <fieldset>
            <label>Encoding</label>
            <enum [disabled]="model.website" [(model)]="model.log_file_encoding" (modelChanged)="onModelChanged()">
                <field name="UTF-8" value="utf-8"></field>
                <field name="ANSI" value="ansi"></field>
            </enum>
        </fieldset>
    `,
    styles: [`
        fieldset {
            padding-bottom: 15px;
        }

        fieldset checkbox2 {
            margin-left: 10px;
        }
    `]
})
export class FormatComponent {
    @Input() model: Logging;
    @Input() 
    @Output() modelChange: any = new EventEmitter();

    onModelChanged() {
        this.modelChange.emit(this.model);
    }
}
