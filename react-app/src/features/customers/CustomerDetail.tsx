import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  fetchCustomerById,
  clearSelected,
  selectSelectedCustomer,
  selectSelectedStatus
} from './customersSlice';
import styles from './CustomerDetail.module.css';

/**
 * Shows one customer. The id comes from the URL (/customers/:id), read with the
 * router's useParams hook.
 */
export function CustomerDetail() {
  const dispatch = useAppDispatch();
  // useParams returns the dynamic segments of the matched route.
  const { id } = useParams<{ id: string }>();

  const customer = useAppSelector(selectSelectedCustomer);
  const status = useAppSelector(selectSelectedStatus);

  useEffect(() => {
    if (id) {
      dispatch(fetchCustomerById(id));
    }
    // The cleanup function returned from useEffect runs when the component
    // unmounts — here we clear the selected customer so it does not flash on
    // the next detail screen.
    return () => {
      dispatch(clearSelected());
    };
  }, [dispatch, id]);

  return (
    <section>
      <header className={styles.header}>
        <h1>Customer details</h1>
        <Link className="btn btn--ghost" to="/customers">
          ← Back to list
        </Link>
      </header>

      {status === 'loading' && <p className="muted">Loading…</p>}
      {status === 'failed' && <p className="alert alert--error">Customer not found.</p>}

      {status === 'succeeded' && customer && (
        <>
          {/* A <dl> (description list) is the semantic element for label/value pairs. */}
          <dl className={styles.details}>
            <dt>Full name</dt>
            <dd>{customer.fullName}</dd>

            <dt>Email</dt>
            <dd>{customer.email}</dd>

            <dt>Phone</dt>
            <dd>{customer.phone}</dd>

            <dt>Created</dt>
            <dd>{customer.createdAtUtc}</dd>

            <dt>Last updated</dt>
            <dd>{customer.updatedAtUtc}</dd>
          </dl>

          <Link className="btn btn--primary" to={`/customers/${customer.id}/edit`}>
            Edit
          </Link>
        </>
      )}
    </section>
  );
}
