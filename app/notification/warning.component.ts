
import { NgModule, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'warning',
    styles: [`
        .warning {
            padding-left: 45px;
            padding-right: 45px;
            min-height: 80px;
            line-height: 80px;
            text-align: center;
            background-color: #ffff7f;
        }
        .v-center {
            text-align: center;
            line-height: normal;
            display: inline-block;
            vertical-align: middle;
        }
        .symbol {
            display: inline-block;
            font-size: 34px;
            position: absolute;
            left: 0;
            width: 45px;
            text-align: center;
        }
    `],
    template: `
        <div class="warning" *ngIf="warning">
            <div class="symbol">
                <i class="fa fa-exclamation" aria-hidden="true"></i>
            </div>
            <span class="v-center">
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
