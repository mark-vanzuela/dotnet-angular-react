// Centralised configuration for the app. Keeping the API URL here (instead of
// hard-coding it in the service) means we change it in ONE place when the backend
// moves. In bigger apps you would also add an environment.production.ts and let
// the Angular build swap them; for this learning project one file is enough.
export const environment = {
  // The .NET API's HTTP profile (see api/.../launchSettings.json -> "http").
  apiBaseUrl: 'http://localhost:5147/api'
};
