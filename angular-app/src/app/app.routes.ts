import { Routes } from '@angular/router';

import { CustomerListComponent } from './features/customers/customer-list/customer-list.component';
import { CustomerDetailComponent } from './features/customers/customer-detail/customer-detail.component';
import { CustomerFormComponent } from './features/customers/customer-form/customer-form.component';

/**
 * The route table maps URL paths to components. The router renders the matching
 * component inside the <router-outlet> in app.component.html.
 *
 * Order matters: more specific paths ('customers/new') must come before the
 * parameter path ('customers/:id'), otherwise 'new' would be read as an id.
 */
export const routes: Routes = [
  // Default URL -> redirect to the list.
  { path: '', redirectTo: 'customers', pathMatch: 'full' },

  { path: 'customers', component: CustomerListComponent },
  { path: 'customers/new', component: CustomerFormComponent },
  { path: 'customers/:id', component: CustomerDetailComponent },
  { path: 'customers/:id/edit', component: CustomerFormComponent },

  // Anything unknown -> back to the list.
  { path: '**', redirectTo: 'customers' }
];
