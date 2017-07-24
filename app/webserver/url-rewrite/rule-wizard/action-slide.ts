import { Component, Inject } from '@angular/core';

import { IWizardContext } from './WizardContext';

@Component({
    selector: 'action-slide',
    template: `
        <div>
            <fieldset>
                <label>Action</label>
                <enum>
                    <field name="None" value="none"></field>
                    <field name="Rewrite" value="rewrite"></field>
                    <field name="Redirect" value="redirect"></field>
                    <field name="Custom" value="custom_response"></field>
                    <field name="Abort" value="abort_request"></field>
                </enum>
            </fieldset>
            <fieldset> <!-- if rewrite type -->
                <label>Rewrite Url</label>
                <input type="text" class="form-control name" />
            </fieldset>
            <button (click)="_context.previous()">Previous</button>
            <button (click)="_context.next()">Next</button>
        </div>
    `
})
export class ActionSlideComponent {
    constructor( @Inject('IWizardContext') private _context: IWizardContext) {

    }
}
