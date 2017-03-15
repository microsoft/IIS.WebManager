// - Routes instead of RouteConfig
// - RouterModule instead of provideRoutes
import {Routes, RouterModule} from '@angular/router';

//
// Components
import {AppPoolComponent} from './app-pool.component';

const routes: Routes = [
    { path: ':id', component: AppPoolComponent },
    { path: ':id/:section', component: AppPoolComponent }
];

// - Updated Export
export const Routing = RouterModule.forChild(routes);