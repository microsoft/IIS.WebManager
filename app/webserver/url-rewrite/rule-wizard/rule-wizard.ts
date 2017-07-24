import { Component, OnDestroy, Inject } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';
import { WizardContext, IWizardContext, SlideType } from './WizardContext';

@Component({
    selector: 'rule-wizard',
    template: `
        <div>
            <h2>Create Rule</h2>
            <name-slide *ngIf="_current == 'name'"></name-slide>
            <pattern-slide *ngIf="_current == 'pattern'"></pattern-slide>
            <action-slide *ngIf="_current == 'action'"></action-slide>
            <div>
                <i class="fa" [ngClass]="isActive('name') ? 'fa-circle' : 'fa-circle-thin'"></i>
                <i class="fa" [ngClass]="isActive('pattern') ? 'fa-circle' : 'fa-circle-thin'"></i>
                <i class="fa" [ngClass]="isActive('action') ? 'fa-circle' : 'fa-circle-thin'"></i>
            </div>
        </div>
    `,
    providers: [
        { provide: 'IWizardContext', useClass: WizardContext }
    ]
})
export class RuleWizardComponent implements OnDestroy {
    private _current: SlideType = SlideType.Name;
    private _subscriptions: Array<Subscription> = [];

    constructor( @Inject('IWizardContext') private _context: IWizardContext) {
        this._subscriptions.push(this._context.current.subscribe(current => this._current = <SlideType>current));
    }

    public ngOnDestroy() {
        this._subscriptions.forEach(sub => sub.unsubscribe());
    }

    private isActive(slideType: SlideType): boolean {
        return this._current == slideType;
    }
}