import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  fetchCustomers,
  deleteCustomer,
  selectCustomers,
  selectCustomersStatus,
  selectCustomersError
} from './customersSlice';
import type { Customer } from '../../types/customer';
import styles from './CustomerList.module.css';

/**
 * Shows every customer in a table. This component demonstrates the full Redux
 * read/write loop:
 *   - READ state with useAppSelector(selector)
 *   - WRITE by dispatching a thunk: dispatch(fetchCustomers())
 */
export function CustomerList() {
  const dispatch = useAppDispatch();

  // Each selector subscribes the component to that slice of state. When the
  // value changes, React re-renders this component.
  const customers = useAppSelector(selectCustomers);
  const status = useAppSelector(selectCustomersStatus);
  const error = useAppSelector(selectCustomersError);

  // useEffect runs after render. With an empty dependency array `[]` it runs
  // ONCE when the component mounts — the right place to kick off data loading.
  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  function handleDelete(customer: Customer) {
    const ok = confirm(`Delete ${customer.fullName}? This is a soft delete.`);
    if (!ok) return;
    // The thunk removes the row from the store on success (see the slice).
    dispatch(deleteCustomer(customer.id));
  }

  return (
    <section>
      <header className={styles.header}>
        <h1>Customers</h1>
        {/* <Link> navigates without a full page reload (SPA behaviour). */}
        <Link className="btn btn--primary" to="/customers/new">
          + New customer
        </Link>
      </header>

      {/* In JSX we use plain JS expressions for conditional rendering. */}
      {status === 'loading' && <p className="muted">Loading…</p>}

      {status === 'failed' && <p className="alert alert--error">{error}</p>}

      {status === 'succeeded' && customers.length === 0 && (
        <p className="muted">No customers yet. Create the first one!</p>
      )}

      {status === 'succeeded' && customers.length > 0 && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th className={styles.actions}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* .map() turns each customer into a <tr>. React needs a stable
                `key` on list items to track them efficiently. */}
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.fullName}</td>
                <td>{customer.email}</td>
                <td>{customer.phone}</td>
                <td className={styles.actions}>
                  <Link className="btn btn--ghost" to={`/customers/${customer.id}`}>
                    View
                  </Link>
                  <Link className="btn btn--ghost" to={`/customers/${customer.id}/edit`}>
                    Edit
                  </Link>
                  <button className="btn btn--danger" onClick={() => handleDelete(customer)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
