import { Routes, Route, Navigate, Link } from 'react-router-dom';

import { CustomerList } from './features/customers/CustomerList';
import { CustomerDetail } from './features/customers/CustomerDetail';
import { CustomerForm } from './features/customers/CustomerForm';
import styles from './App.module.css';

/**
 * The app shell: a header shown on every page, plus the <Routes> table that
 * swaps in the component matching the current URL.
 *
 * Route order/specificity matters: "/customers/new" is listed before
 * "/customers/:id" so "new" is not captured as an :id.
 */
function App() {
  return (
    <>
      <header className={styles.header}>
        <Link className={styles.brand} to="/customers">
          Customer Manager
        </Link>
      </header>

      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<Navigate to="/customers" replace />} />
          <Route path="/customers" element={<CustomerList />} />
          <Route path="/customers/new" element={<CustomerForm />} />
          <Route path="/customers/:id" element={<CustomerDetail />} />
          <Route path="/customers/:id/edit" element={<CustomerForm />} />
          {/* Catch-all: any unknown URL redirects back to the list. */}
          <Route path="*" element={<Navigate to="/customers" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
