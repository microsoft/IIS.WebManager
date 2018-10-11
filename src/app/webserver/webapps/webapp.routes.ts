// - Routes instead of RouteConfig
// - RouterModule instead of provideRoutes
import {ModuleWithProviders} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

//
// Components
import {WebAppComponent} from './webapp.component';

const routes: Routes = [
    { path: ':id', component: WebAppComponent },
    { path: ':id/:section', component: WebAppComponent }
];

// - Updated Export
export const Routing: ModuleWithProviders = RouterModule.forChild(routes);
