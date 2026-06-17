import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';

// app.config.ts is where a standalone Angular app registers its app-wide
// "providers" (services available everywhere). This replaces the old
// AppModule's `providers: []` array.
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    // Makes HttpClient injectable across the app so our CustomerService works.
    provideHttpClient()
  ]
};
