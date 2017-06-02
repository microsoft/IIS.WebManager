import { Routes, RouterModule } from '@angular/router';

//
// Components
import { SettingsComponent } from './settings.component';

const routes: Routes = [
    { path: '', component: SettingsComponent },
    { path: ':section', component: SettingsComponent }
];

// - Updated Export
export const Routing = RouterModule.forChild(routes);
