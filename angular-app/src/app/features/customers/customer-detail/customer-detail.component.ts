import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { CustomerService } from '../../../core/customer.service';
import { Customer } from '../../../models/customer.model';

/**
 * Shows a single customer. The id comes from the URL (/customers/:id), which we
 * read from the ActivatedRoute.
 */
@Component({
  selector: 'app-customer-detail',
  imports: [RouterLink],
  templateUrl: './customer-detail.component.html',
  styleUrl: './customer-detail.component.scss'
})
export class CustomerDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly customerService = inject(CustomerService);

  readonly customer = signal<Customer | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    // snapshot reads the route params once, at load time — fine here because we
    // navigate to a fresh component instance per customer.
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('No customer id in the URL.');
      this.loading.set(false);
      return;
    }

    this.customerService.getById(id).subscribe({
      next: (data) => {
        this.customer.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Customer not found.');
        this.loading.set(false);
      }
    });
  }
}
