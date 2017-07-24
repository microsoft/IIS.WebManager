import { Component, Inject } from '@angular/core';

import { IWizardContext } from './WizardContext';

@Component({
    selector: 'name-slide',
    template: `
        <div>
            <fieldset>
                <label>Name</label>
                <input type="text" class="form-control name" />
            </fieldset>
            <fieldset>
                <button (click)="_context.previous()">Previous</button>
                <button (click)="_context.next()">Next</button>
            </fieldset>
        </div>
    `
})
export class NameSlideComponent {
    constructor( @Inject('IWizardContext') private _context: IWizardContext) {
    }
}
