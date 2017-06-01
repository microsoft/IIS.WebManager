import { Routes, RouterModule } from '@angular/router';

//
// Components
import { ServersComponent } from './servers.component';

const routes: Routes = [
    { path: '', component: ServersComponent }
];

// - Updated Export
export const Routing = RouterModule.forChild(routes);
