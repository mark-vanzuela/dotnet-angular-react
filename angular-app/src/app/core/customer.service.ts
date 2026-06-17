import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Customer, CustomerPayload } from '../models/customer.model';

/**
 * A SERVICE is a reusable class that holds logic not tied to one screen — here,
 * all the HTTP calls to the customer API. Components inject this service instead
 * of talking to HttpClient directly, so the "how do we reach the server" detail
 * lives in exactly one place.
 *
 * `providedIn: 'root'` registers the service once for the whole app (a singleton).
 */
@Injectable({ providedIn: 'root' })
export class CustomerService {
  // `inject()` is the modern way to get a dependency (vs. constructor params).
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/customers`;

  /**
   * HttpClient returns an Observable — a stream you SUBSCRIBE to. The request is
   * not actually sent until something subscribes (the component, or the `async`
   * pipe in a template). The <Customer[]> tells TypeScript what to expect back.
   */
  getAll(): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.baseUrl);
  }

  getById(id: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.baseUrl}/${id}`);
  }

  create(payload: CustomerPayload): Observable<Customer> {
    return this.http.post<Customer>(this.baseUrl, payload);
  }

  update(id: string, payload: CustomerPayload): Observable<Customer> {
    return this.http.put<Customer>(`${this.baseUrl}/${id}`, payload);
  }

  // DELETE returns 204 No Content, so there is no body — hence Observable<void>.
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
