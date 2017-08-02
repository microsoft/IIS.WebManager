import { Component, Inject, Input } from '@angular/core';

import { OutboundRule, IIS_SERVER_VARIABLES } from '../url-rewrite';

@Component({
    selector: 'outbound-rule-settings',
    template: `
        <div class="row" *ngIf="rule">
            <div class="col-xs-12 col-lg-6">
                <fieldset>
                    <label>Name</label>
                    <input type="text" class="form-control" [(ngModel)]="rule.name" />
                </fieldset>
                <fieldset>
                    <div>
                        <label class="inline-block">Pattern</label>
                        <text-toggle onText="Matches" offText="Doesn't Match" [on]="false" [off]="true" [(model)]="rule.negate" (modelChanged)="testRegex()"></text-toggle>
                        <text-toggle onText="Case Insensitive" offText="Case Sensitive" [(model)]="rule.ignore_case" (modelChanged)="testRegex()"></text-toggle>
                    </div>
                    <input type="text" class="form-control" [(ngModel)]="rule.pattern" (modelChanged)="testRegex()" />
                </fieldset>
                <fieldset>
                    <label>Test Value</label>
                    <input placeholder="default.aspx?c=hiking&p=boots" type="text" class="form-control" [(ngModel)]="_testUrl" (modelChanged)="testRegex()" />
                </fieldset>
                <fieldset>
                    <label>Substitution Value</label>
                    <button class="right input" (click)="macros.toggle()" [class.background-active]="(macros && macros.opened) || false">Macros</button>
                    <div class="fill">
                        <input type="text" class="form-control" [(ngModel)]="rule.rewrite_value" (modelChanged)="testRegex()" />
                    </div>
                    <selector class="stretch" #macros>
                        <div class="table-scroll">
                            <table>
                                <tr *ngFor="let match of _matches; let i = index;" (dblclick)="addMatch(i)" (click)="select(i)" class="hover-editing" [class.background-selected]="_selected == i">
                                    <td class="back-ref border-color">{{ '{R:' + i + '}' }}</td>
                                    <td class="border-color">{{match}}</td>
                                </tr>
                                <tr *ngFor="let variable of _serverVariables; let i = index;" (dblclick)="addVariable(i)" (click)="select(i + _matches.length)" class="hover-editing" [class.background-selected]="_selected == (i + _matches.length)">
                                    <td class="back-ref border-color">{{ '{' + variable + '}' }}</td>
                                    <td class="border-color"></td>
                                </tr>
                            </table>
                        </div>
                        <p class="pull-right">
                            <button [attr.disabled]="_selected == -1 || null" (click)="addSelected()">Insert</button>
                        </p>
                    </selector>
                </fieldset>
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

        p {
            margin: 10px;
        }
    
        td {
            border-style: solid;
            border-width: 1px;
            padding: 5px;
            border-top: none;
        }

        .back-ref {
            width: 200px;
        }

        .inline-block,
        text-toggle {
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

    private _serverVariables: Array<string> = IIS_SERVER_VARIABLES;

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

        if (!this.isMatchingRule) {
            return;
        }

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

    private addVariable(i: number): void {
        if (!this.rule.rewrite_value) {
            this.rule.rewrite_value = "";
        }

        this.rule.rewrite_value += '{' + this._serverVariables[i] + '}';
        this.testRegex();
    }

    private addSelected() {
        if (this._selected < this._matches.length) {
            this.addMatch(this._selected);
        }
        else {
            this.addVariable(this._selected - this._matches.length);
        }
    }

    private select(i: number) {
        this._selected = i;
    }

    private get isMatchingRule(): boolean {
        return (this._matches.length > 0 && !this.rule.negate) ||
            (this._matches.length == 0 && this.rule.negate);
    }
}
