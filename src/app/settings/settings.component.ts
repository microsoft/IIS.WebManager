import { Component } from '@angular/core';
import { OptionsService } from '../main/options.service';

@Component({
    template: `
        <div class="sidebar crumb" [class.nav]="options.active">
            <vtabs [markLocation]="true">
                <item [name]="'Servers'" [ico]="'sme-icon sme-icon-server'">
                    <server-list></server-list>
                </item>
            </vtabs>
        </div>
    `,
    styles: [`
        .sidebar .home::before {content: "\\f015";}
        .sidebar .settings::before {content: "\\f013";}

        :host >>> .sidebar > vtabs .vtabs > .items {
            top: 35px;
        }

        :host >>> .sidebar > vtabs .content {
            margin-top: 10px;
        }
    `]
})
export class SettingsComponent {
    constructor(private _options: OptionsService) {
    }

    get options() {
        return this._options;
    }
}
