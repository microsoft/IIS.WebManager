import { Routes, RouterModule } from '@angular/router';

//
// Components
import { ServerListComponent } from './server-list';

const routes: Routes = [
    { path: '', component: ServerListComponent }
];

// - Updated Export
export const Routing = RouterModule.forChild(routes);
