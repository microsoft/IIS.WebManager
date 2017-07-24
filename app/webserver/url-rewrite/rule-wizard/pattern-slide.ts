import { Component, Inject } from '@angular/core';

import { IWizardContext } from './WizardContext';

@Component({
    selector: 'pattern-slide',
    template: `
        <div>
            <fieldset>
                <label>The Request Url</label>
                <enum>
                    <field name="Matches" value="match"></field>
                    <field name="Doesn't Match" value="not_match"></field>
                </enum>
            </fieldset>
            <fieldset class="name">
                <label>Pattern</label>
                <input type="text" class="form-control" />
            </fieldset>

            <section> <!-- Regex tester -->
                <div class="collapse-heading collapsed no-border" data-toggle="collapse" data-target="#test-pattern">
                    <label class="head">Test Pattern</label>
                </div>
                <div id="test-pattern" class="collapse inner">
                    <fieldset class="name">
                        <button class="anchor-right">Test</button>
                        <div class="fill">
                            <input type="text" class="form-control" />
                        </div>
                    </fieldset>
                </div>
            </section>


            <fieldset>
                <label>using</label>
                <enum>
                    <field name="Regex" value="regular_expression"></field>
                    <field name="Wildcard" value="wildcard"></field>
                    <field name="Exact Match" value="exact_match"></field>
                </enum>
            </fieldset>
            <fieldset>
                <button (click)="_context.previous()">Previous</button>
                <button (click)="_context.next()">Next</button>
            </fieldset>
        </div>
    `
})
export class PatternSlideComponent {
    constructor( @Inject('IWizardContext') private _context: IWizardContext) {
    }
}
