
import { NgModule, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'warning',
    styles: [`
        .warning {
            padding-left: 2em;
            padding-right: 45px;
            background-color: #ffffcf;
        }
        .warning-text {
            text-align: left;
            line-height: normal;
            display: inline-block;
            vertical-align: middle;
            margin-top: 0.5em;
            margin-bottom: 0.5em;
            padding-left: 0.5em;
        }
        .symbol {
            display: inline-block;
            vertical-align: top;
            margin-top: 0.5em;
        }
    `],
    template: `
        <div class="warning" *ngIf="warning">
            <div class="symbol">
                <i aria-hidden="true" class="sme-icon sme-icon-criticalErrorSolid fa-lg"></i>
            </div>
            <span class="warning-text">
                <div *ngFor="let line of getLines(_warning)">
                    {{line}}
                </div>
            </span>
        </div>
    `
})
export class WarningComponent {
    @Input() public warning: string;

    getLines() {
        return this.warning.split("\n");
    }
}

@NgModule({
    imports: [
        FormsModule,
        CommonModule
    ],
    exports: [
        WarningComponent
    ],
    declarations: [
        WarningComponent
    ]
})
export class Module { }
