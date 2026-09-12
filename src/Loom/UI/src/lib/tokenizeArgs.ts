/**
 * Splits a command line into argv-style tokens the way a shell would: on
 * whitespace, but keeping quoted runs and backslash-escaped characters intact.
 * Quotes and escapes are consumed rather than emitted, so
 * `sh -c "echo hello world"` yields ['sh', '-c', 'echo hello world'].
 *
 * Empty tokens are dropped — a blank pill would be invisible in the UI, which
 * is a worse outcome than losing a deliberate empty argument.
 */
export const tokenizeArgs = (input: string): string[] => {
  const tokens: string[] = [];
  let current = '';
  let started = false;
  let quote: '"' | "'" | null = null;

  const flush = () => {
    if (started && current.length > 0) tokens.push(current);
    current = '';
    started = false;
  };

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    // A backslash escapes the next character everywhere but inside single
    // quotes, matching the shell rule closely enough for compose arguments.
    if (char === '\\' && quote !== "'" && i + 1 < input.length) {
      current += input[++i];
      started = true;
      continue;
    }

    if (quote) {
      if (char === quote) quote = null;
      else current += char;
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      started = true;
      continue;
    }

    if (/\s/.test(char)) {
      flush();
      continue;
    }

    current += char;
    started = true;
  }

  flush();
  return tokens;
};
