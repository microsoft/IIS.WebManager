import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ApplicationPoolIdentity } from './app-pool';


@Component({
    selector: 'identity',
    template: `
        <fieldset class='inline-block'>
            <label>Identity</label>
            <select class="form-control" [(ngModel)]="model.identity_type" (modelChanged)="onModelChanged()">
                <option value="ApplicationPoolIdentity">Application Pool Identity</option>
                <option value="LocalSystem">Local System</option>
                <option value="LocalService">Local Service</option>
                <option value="NetworkService">Network Service</option>
                <option value="SpecificUser">Custom</option>
            </select>
        </fieldset>
        <div *ngIf="model.identity_type == 'SpecificUser'" class='inline-block'>
            <fieldset class='inline-block'>
                <label>Username</label>
                <input class="form-control" type="text" [(ngModel)]="model.username" throttle (modelChanged)="onModelChanged()" />
            </fieldset>
            <div class='inline-block'>
                <fieldset class='inline-block'>
                    <label>Password</label>
                    <input class="form-control" type="password" [(ngModel)]="_password" (modelChanged)="onModelChanged()" />
                </fieldset>
                <fieldset *ngIf="!!(_password)" class='inline-block'>
                    <label>Confirm Password</label>
                    <input class="form-control" type="password" [(ngModel)]="_confirm" (ngModelChange)="onConfirmPassword($event)" [validateEqual]="_password" />
                    <div *ngIf="!!(_confirm) && _confirm !== _password" role="alert" class="error-message color-error">
                        Passwords do not match.
                    </div>
                </fieldset>
            </div>
        </div>
        <fieldset class='inline-block' *ngIf="useUserProfile">
            <switch label="Load User Profile" class="block" [(model)]="model.load_user_profile" (modelChanged)="onModelChanged()">
                {{model.load_user_profile ? "On" : "Off"}}
            </switch>
        </fieldset>
    `,
    styles: [`
.error-message {
    margin-top: 0px;
}
        `],
})
export class IdentityComponent {
    @Input()
    model: ApplicationPoolIdentity;

    @Input()
    public useUserProfile: boolean = true;

    @Output()
    modelChanged: EventEmitter<any> = new EventEmitter();

    private _password: string;

    onModelChanged() {
        this.modelChanged.emit(null);
    }

    onConfirmPassword(value: string) {
        if (value == this._password) {
            this.model.password = value;
        }

        this.onModelChanged();
    }
}
