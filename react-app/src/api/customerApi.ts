import type { Customer, CustomerPayload } from '../types/customer';

// One place that knows the API URL. In a Vite app you could also read this from
// import.meta.env.VITE_API_BASE_URL; a constant keeps this learning project simple.
const API_BASE_URL = 'http://localhost:5147/api';
const CUSTOMERS_URL = `${API_BASE_URL}/customers`;

/**
 * A tiny wrapper around the browser's built-in `fetch`. It centralises:
 *   - turning a non-2xx response into a thrown Error (fetch does NOT throw on
 *     404/500 by itself), and
 *   - parsing JSON (or returning undefined for empty 204 responses).
 *
 * The <T> generic lets each caller say what type it expects back.
 */
async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  // 204 No Content (our DELETE) has no body to parse.
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

/**
 * The API "module": all customer HTTP calls in one object. The Redux thunks call
 * these, so components never touch fetch directly.
 */
export const customerApi = {
  getAll: () => request<Customer[]>(CUSTOMERS_URL),

  getById: (id: string) => request<Customer>(`${CUSTOMERS_URL}/${id}`),

  create: (payload: CustomerPayload) =>
    request<Customer>(CUSTOMERS_URL, { method: 'POST', body: JSON.stringify(payload) }),

  update: (id: string, payload: CustomerPayload) =>
    request<Customer>(`${CUSTOMERS_URL}/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),

  remove: (id: string) =>
    request<void>(`${CUSTOMERS_URL}/${id}`, { method: 'DELETE' })
};
