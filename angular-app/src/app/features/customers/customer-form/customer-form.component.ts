import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { CustomerService } from '../../../core/customer.service';

/**
 * ONE component handles BOTH create and edit. We decide which mode we are in by
 * checking whether the URL contains an `:id` (edit) or not (create). Reusing the
 * form like this avoids duplicating the markup and validation rules.
 *
 * We use REACTIVE FORMS: the form is defined in TypeScript (a FormGroup), giving
 * us strong typing, easy validation, and simple access to values in code.
 */
@Component({
  selector: 'app-customer-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './customer-form.component.html',
  styleUrl: './customer-form.component.scss'
})
export class CustomerFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly customerService = inject(CustomerService);

  // null when creating; the customer id string when editing.
  private editingId: string | null = null;

  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  // The form definition. Each control gets an initial value and a list of
  // synchronous validators that mirror the backend's FluentValidation rules.
  // `nonNullable` means the controls are typed as `string` (not `string | null`)
  // and reset back to their initial value rather than null — which makes
  // getRawValue() line up cleanly with our CustomerPayload type.
  readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(50)]],
    lastName: ['', [Validators.required, Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.maxLength(30)]]
  });

  // A getter the template can read to switch labels/titles between modes.
  get isEditMode(): boolean {
    return this.editingId !== null;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editingId = id;
      // In edit mode, fetch the existing values and pre-fill the form.
      this.customerService.getById(id).subscribe({
        next: (customer) => {
          this.form.patchValue({
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
            phone: customer.phone
          });
        },
        error: () => this.error.set('Could not load the customer to edit.')
      });
    }
  }

  // Small helper so the template can ask "should I show an error for this field?"
  // True only when the control is invalid AND the user has interacted with it.
  showError(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  submit(): void {
    // If the form is invalid, mark everything as touched so all error messages
    // appear at once, then stop.
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    // getRawValue() returns a plain object matching CustomerPayload.
    const payload = this.form.getRawValue();

    const request$ = this.isEditMode
      ? this.customerService.update(this.editingId!, payload)
      : this.customerService.create(payload);

    request$.subscribe({
      next: () => {
        this.submitting.set(false);
        // On success, go back to the list.
        this.router.navigate(['/customers']);
      },
      error: () => {
        this.submitting.set(false);
        this.error.set('Save failed. Please check the fields and try again.');
      }
    });
  }
}
