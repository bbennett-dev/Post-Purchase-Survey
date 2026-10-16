/** Checkout survey submit: per shop domain (after session token validation). */
export const SURVEY_RESPONSE_POST_LIMIT = {
  max: 60,
  windowMs: 60_000,
} as const;

/** CORS preflight on survey API: per client IP. */
export const SURVEY_RESPONSE_PREFLIGHT_LIMIT = {
  max: 120,
  windowMs: 60_000,
} as const;

/** OAuth login form: per client IP. */
export const AUTH_LOGIN_LIMIT = {
  max: 20,
  windowMs: 60_000,
} as const;

/** Admin file upload: per shop session (after authenticate.admin). */
export const SHOPIFY_FILE_UPLOAD_LIMIT = {
  max: 30,
  windowMs: 60_000,
} as const;

export const SURVEY_RESPONSE_MAX_BODY_BYTES = 1024 * 1024;

/** Admin survey document save (PUT /api/surveys/:uuid): per shop after authenticate.admin. */
export const ADMIN_SURVEY_SAVE_LIMIT = {
  max: 30,
  windowMs: 60_000,
} as const;

/** Max JSON body for admin survey save (~large editor documents). */
export const ADMIN_SURVEY_SAVE_MAX_BODY_BYTES = 5 * 1024 * 1024;
