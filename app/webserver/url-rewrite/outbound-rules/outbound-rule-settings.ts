import { Component, Inject, Input } from '@angular/core';

import { OutboundRule } from '../url-rewrite';

@Component({
    selector: 'outbound-rule-settings',
    template: `
        <div class="container-fluid" *ngIf="rule">
            <div class="row">
                <div class="col-xs-12 col-lg-6">
                    <fieldset>
                        <label>Name</label>
                        <input type="text" class="form-control" [(ngModel)]="rule.name" />
                    </fieldset>
                    <fieldset>
                        <div>
                            <label class="inline-block">Pattern</label>
                            <text-toggle onText="Matches" offText="Doesn't Match" [on]="false" [off]="true" [(model)]="rule.negate"></text-toggle>
                        </div>
                        <input type="text" class="form-control" [(ngModel)]="rule.pattern" (modelChanged)="testRegex()" />
                    </fieldset>
                    <fieldset>
                        <label>Test Value</label>
                        <input placeholder="default.aspx?c=hiking&p=boots" type="text" class="form-control" [(ngModel)]="_testUrl" (modelChanged)="testRegex()" />
                    </fieldset>
                    <fieldset>
                        <label>Substitution Value</label>
                        <input type="text" class="form-control" [(ngModel)]="rule.rewrite_value" (modelChanged)="testRegex()" />
                    </fieldset>
                    <fieldset *ngIf="_result">
                        <span>{{_result}}</span>
                    </fieldset>
                    <fieldset>
                        <label>Ignore Case</label>
                        <switch [(model)]="rule.ignore_case" (modelChanged)="testRegex()">{{rule.ignore_case ? "Yes": "No"}}</switch>
                    </fieldset>
                </div>
                <div class="col-xs-12 col-lg-6" *ngIf="_matches.length > 0">
                    <label class="field">Captures</label>
                    <div class="table-scroll">
                        <table>
                            <tr *ngFor="let match of _matches; let i = index;" (dblclick)="addMatch(i)" (click)="select(i)" class="hover-editing" [class.background-selected]="_selected == i">
                                <td class="back-ref border-color">{{'{'}}R:{{i}}{{'}'}}</td>
                                <td class="border-color">{{match}}</td>
                            </tr>
                        </table>
                    </div>
                    <button class="right" [attr.disabled]="_selected == -1 || null" (click)="addMatch(_selected)">Add</button>
                </div>
            </div>
        </div>
    `,
    styles: [`
        table {
            width: 100%;
        }

        .table-scroll {
            max-height: 295px;
            overflow-y: auto;
        }
    
        td {
            border-style: solid;
            border-width: 1px;
            padding: 5px;
        }

        .back-ref {
            width: 200px;
        }

        .inline-block {
            margin-right: 20px;
        }
    `]
})
export class OutboundRuleSettingsComponent {
    @Input() public rule: OutboundRule;

    private _result: string = "";
    private _testUrl: string = "";
    private _matches: Array<any> = [];
    private _selected: number = -1;

    private testRegex(): void {
        this.reset();

        if (!this.rule.pattern || !this._testUrl) {
            return;
        }

        let regex: RegExp;

        try {
            let ignoreCase = + this.rule.ignore_case ? 'i' : '';
            regex = new RegExp(this.rule.pattern, 'g' + ignoreCase);
        }
        catch (e) {
            this._matches = [];
            return;
        }

        this._matches = regex.exec(this._testUrl) || [];

        let result = this.rule.rewrite_value || "";

        for (let i = 0; i < this._matches.length; i++) {
            result = result.replace(new RegExp('{R:' + i + '}', 'g'), this._matches[i]);
        }

        this._result = result;
    }

    private reset() {
        this._result = "";
        this._selected = -1;
    }

    private addMatch(i: number): void {
        if (!this.rule.rewrite_value) {
            this.rule.rewrite_value = "";
        }

        this.rule.rewrite_value += '{R:' + i + '}';
        this.testRegex();
    }

    private select(i: number) {
        this._selected = i;
    }
}
