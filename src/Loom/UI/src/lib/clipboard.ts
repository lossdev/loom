/**
 * Copies text to the clipboard, answering with the reason it failed instead of
 * rejecting. Returns null when the copy succeeded.
 *
 * The Clipboard API is absent outside a secure context (HTTPS, or localhost), so
 * navigator.clipboard is undefined there rather than throwing something that
 * explains itself — worth checking before the call so the user gets told why.
 */
export const copyToClipboard = async (text: string): Promise<string | null> => {
  if (!navigator.clipboard) {
    return 'The clipboard is only available over HTTPS or on localhost.';
  }

  try {
    await navigator.clipboard.writeText(text);
    return null;
  } catch (err) {
    if (err instanceof DOMException && err.name === 'NotAllowedError') {
      return 'The browser denied clipboard permission.';
    }
    return err instanceof Error && err.message.length > 0 ? err.message : 'Copying failed.';
  }
};
