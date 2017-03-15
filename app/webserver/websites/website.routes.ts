// - Routes instead of RouteConfig
// - RouterModule instead of provideRoutes
import { Routes, RouterModule } from '@angular/router';

//
// Components
import { WebSiteComponent } from './website.component';

const routes: Routes = [
    { path: ':id', component: WebSiteComponent },
    { path: ':id/:section', component: WebSiteComponent }
];

// - Updated Export
export const Routing = RouterModule.forChild(routes);