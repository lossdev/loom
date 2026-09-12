/**
 * Pulls the most useful message out of a failed API response. The Loom API
 * surfaces unhandled exceptions as ProblemDetails JSON, but a failure can also
 * arrive as plain text or as a developer exception page, so fall back to the
 * status line rather than showing markup to the user.
 */
export const describeResponseError = async (response: Response): Promise<string> => {
  let body = '';
  try {
    body = await response.text();
  } catch {
    // The body was already consumed or the stream broke; the status still tells
    // us something useful.
  }

  const trimmed = body.trim();
  if (trimmed.length > 0 && !trimmed.startsWith('<')) {
    try {
      const parsed = JSON.parse(trimmed);
      const message = parsed?.detail ?? parsed?.title ?? parsed?.message ?? parsed?.error;
      if (typeof message === 'string' && message.trim().length > 0) {
        return message.trim();
      }
    } catch {
      // Not JSON, so treat a short body as the message itself.
      if (trimmed.length <= 200) return trimmed;
    }
  }

  return response.statusText.length > 0
    ? `${response.status} ${response.statusText}`
    : `Request failed with status ${response.status}`;
};

/** Message for a request that never produced a response at all. */
export const describeRequestError = (err: unknown): string =>
  // fetch rejects with a TypeError when the server is unreachable, which is the
  // common case while the backend is restarting.
  err instanceof TypeError
    ? 'Could not reach the Loom server.'
    : err instanceof Error && err.message.length > 0
      ? err.message
      : 'Something went wrong.';

export const isAbortError = (err: unknown): boolean =>
  err instanceof Error && err.name === 'AbortError';
