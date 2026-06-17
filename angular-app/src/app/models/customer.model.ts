// A TypeScript 'interface' describes the SHAPE of data — it has no runtime code,
// it only helps the compiler and editor catch mistakes. This mirrors the
// CustomerDto returned by the .NET API.
export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  fullName: string;
  createdAtUtc: string;
  updatedAtUtc: string;
}

// The payload we SEND when creating or updating. It is a subset of Customer:
// the server owns id/fullName/timestamps, so we never send those.
export interface CustomerPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}
