/**
 * Authenticated fetch for embedded admin `/api/*` routes (Bearer session token).
 */
export async function adminApiFetch(
  path: string,
  sessionToken: string,
  options: {
    method: string;
    body?: unknown;
  },
): Promise<Response> {
  const headers: HeadersInit = {
    Authorization: `Bearer ${sessionToken}`,
  };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  return fetch(path, {
    method: options.method,
    headers,
    body:
      options.body !== undefined
        ? JSON.stringify(options.body)
        : undefined,
    credentials: "include",
  });
}
