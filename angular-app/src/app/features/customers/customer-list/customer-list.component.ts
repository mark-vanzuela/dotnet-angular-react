import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CustomerService } from '../../../core/customer.service';
import { Customer } from '../../../models/customer.model';

/**
 * Shows every customer in a table, with links to view/edit and a delete button.
 *
 * This is a STANDALONE component (the modern Angular default): it declares its
 * own dependencies in `imports` instead of belonging to an NgModule.
 */
@Component({
  selector: 'app-customer-list',
  // RouterLink lets us use [routerLink] in the template for navigation.
  imports: [RouterLink],
  templateUrl: './customer-list.component.html',
  styleUrl: './customer-list.component.scss'
})
export class CustomerListComponent implements OnInit {
  private readonly customerService = inject(CustomerService);

  // SIGNALS hold reactive state. When a signal's value changes, the template
  // that reads it re-renders automatically. Call a signal like a function —
  // customers() — to read it, and .set()/.update() to change it.
  readonly customers = signal<Customer[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  // ngOnInit is a lifecycle hook: Angular calls it once, after the component is
  // created. It is the conventional place to load initial data.
  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading.set(true);
    this.error.set(null);

    // subscribe() actually fires the HTTP request. The object passed in handles
    // the two outcomes: `next` (success) and `error` (failure).
    this.customerService.getAll().subscribe({
      next: (data) => {
        this.customers.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load customers. Is the API running?');
        this.loading.set(false);
      }
    });
  }

  deleteCustomer(customer: Customer): void {
    // A simple browser confirm dialog — enough for a learning app.
    const ok = confirm(`Delete ${customer.fullName}? This is a soft delete.`);
    if (!ok) {
      return;
    }

    this.customerService.delete(customer.id).subscribe({
      // On success, just reload the list so the deleted row disappears.
      next: () => this.loadCustomers(),
      error: () => this.error.set('Delete failed. Please try again.')
    });
  }
}
