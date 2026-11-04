// The backend reports errors in three shapes depending on the endpoint:
//   { error: "message" }            register
//   { detail: "message" }           token endpoints, auth failures
//   { field: ["message", ...] }     validation, e.g. { minutes: ["..."] }
// errorMessage() turns any of them into one readable string.

const FIELD_LABELS = { username: 'Username', email: 'Email', password: 'Password', minutes: 'Minutes' };

const flatten = (value) => (Array.isArray(value) ? value.map(flatten).join(' ') : String(value));

export function errorMessage(data, fallback = 'Something went wrong. Please try again.') {
  if (!data || typeof data !== 'object') return fallback;
  if (typeof data.error === 'string' && data.error) return data.error;
  if (typeof data.detail === 'string' && data.detail) return data.detail;

  const parts = Object.entries(data)
    .filter(([key, value]) => key !== 'code' && (Array.isArray(value) || typeof value === 'string'))
    .map(([key, value]) => {
      const text = flatten(value);
      // Field-level messages read better with the field name in front.
      return key === 'non_field_errors' ? text : `${FIELD_LABELS[key] || key}: ${text}`;
    });
  return parts.length ? parts.join(' ') : fallback;
}

export class ApiError extends Error {
  constructor(message, { status = 0, data = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}
