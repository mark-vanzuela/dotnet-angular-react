// TypeScript types describe the SHAPE of data at compile time only — they vanish
// at runtime. This Customer mirrors the CustomerDto the .NET API returns.
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

// What we SEND when creating/updating. The server owns id/fullName/timestamps,
// so we never include those.
export interface CustomerPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}
