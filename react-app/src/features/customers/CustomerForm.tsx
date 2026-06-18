import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  fetchCustomerById,
  createCustomer,
  updateCustomer,
  selectSelectedCustomer
} from './customersSlice';
import type { CustomerPayload } from '../../types/customer';
import styles from './CustomerForm.module.css';

// The form's field values. Same keys as CustomerPayload.
type FormValues = CustomerPayload;
type FormErrors = Partial<Record<keyof FormValues, string>>;

const EMPTY: FormValues = { firstName: '', lastName: '', email: '', phone: '' };

/**
 * ONE component for both create and edit (decided by whether the URL has an :id).
 *
 * React forms use CONTROLLED INPUTS: each <input>'s value comes from state, and
 * onChange writes back to state. State is the single source of truth, so the UI
 * always reflects it. This is React's equivalent of Angular's reactive forms.
 */
export function CustomerForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  // useState returns [value, setter]. Re-rendering happens when the setter runs.
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const selected = useAppSelector(selectSelectedCustomer);

  // In edit mode, fetch the existing customer into the store on mount.
  useEffect(() => {
    if (isEditMode && id) {
      dispatch(fetchCustomerById(id));
    }
  }, [dispatch, id, isEditMode]);

  // When the fetched customer arrives, copy its fields into the form once.
  useEffect(() => {
    if (isEditMode && selected && selected.id === id) {
      setValues({
        firstName: selected.firstName,
        lastName: selected.lastName,
        email: selected.email,
        phone: selected.phone
      });
    }
  }, [isEditMode, selected, id]);

  // A single change handler for every field, keyed by the input's `name`.
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    // Spread the old values, then overwrite the one that changed.
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  // Client-side validation that mirrors the backend's FluentValidation rules.
  function validate(v: FormValues): FormErrors {
    const next: FormErrors = {};
    if (!v.firstName.trim()) next.firstName = 'First name is required.';
    if (!v.lastName.trim()) next.lastName = 'Last name is required.';
    if (!v.email.trim()) next.email = 'Email is required.';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.email)) next.email = 'Enter a valid email address.';
    if (!v.phone.trim()) next.phone = 'Phone is required.';
    return next;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault(); // stop the browser's default full-page form submit
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      // .unwrap() makes a rejected thunk THROW here, so we can try/catch it.
      if (isEditMode && id) {
        await dispatch(updateCustomer({ id, payload: values })).unwrap();
      } else {
        await dispatch(createCustomer(values)).unwrap();
      }
      navigate('/customers'); // go back to the list on success
    } catch {
      setSubmitError('Save failed. Please check the fields and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section>
      <header className={styles.header}>
        <h1>{isEditMode ? 'Edit customer' : 'New customer'}</h1>
        <button className="btn btn--ghost" onClick={() => navigate('/customers')}>
          ← Back to list
        </button>
      </header>

      {submitError && <p className="alert alert--error">{submitError}</p>}

      {/* onSubmit fires on the submit button or Enter key. */}
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label htmlFor="firstName">First name</label>
          <input id="firstName" name="firstName" value={values.firstName} onChange={handleChange} />
          {errors.firstName && <small className={styles.error}>{errors.firstName}</small>}
        </div>

        <div className={styles.field}>
          <label htmlFor="lastName">Last name</label>
          <input id="lastName" name="lastName" value={values.lastName} onChange={handleChange} />
          {errors.lastName && <small className={styles.error}>{errors.lastName}</small>}
        </div>

        <div className={styles.field}>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" value={values.email} onChange={handleChange} />
          {errors.email && <small className={styles.error}>{errors.email}</small>}
        </div>

        <div className={styles.field}>
          <label htmlFor="phone">Phone</label>
          <input id="phone" name="phone" type="tel" value={values.phone} onChange={handleChange} />
          {errors.phone && <small className={styles.error}>{errors.phone}</small>}
        </div>

        <div className={styles.actions}>
          <button className="btn btn--primary" type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : isEditMode ? 'Save changes' : 'Create customer'}
          </button>
          <button className="btn btn--ghost" type="button" onClick={() => navigate('/customers')}>
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
