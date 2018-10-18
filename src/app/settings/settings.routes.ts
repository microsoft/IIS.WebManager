import { ModuleWithProviders } from '@angular/core'
import { Routes, RouterModule } from '@angular/router';

//
// Components
import { SettingsComponent } from './settings.component';

const routes: Routes = [
    { path: '', component: SettingsComponent },
    { path: ':section', component: SettingsComponent }
];

// - Updated Export
export const Routing: ModuleWithProviders = RouterModule.forChild(routes);
