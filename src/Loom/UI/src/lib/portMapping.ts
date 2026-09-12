const PROTOCOLS = ['tcp', 'udp', 'sctp'];

const isPort = (val: string): boolean =>
  /^\d{1,5}$/.test(val) && Number(val) > 0 && Number(val) <= 65535;

// A port range is inclusive and must ascend, e.g. 3000-3005.
const rangeWidth = (val: string): number | null => {
  if (isPort(val)) return 1;
  const [start, end, ...rest] = val.split('-');
  if (rest.length > 0 || !isPort(start) || !isPort(end)) return null;
  return Number(end) >= Number(start) ? Number(end) - Number(start) + 1 : null;
};

const isHostAddress = (val: string): boolean => {
  // IPv6 addresses are bracketed in compose files, e.g. [::1]:80:8080.
  if (val.startsWith('[') && val.endsWith(']')) return val.length > 2;
  const octets = val.split('.');
  return octets.length === 4 &&
    octets.every(o => /^\d{1,3}$/.test(o) && Number(o) <= 255);
};

/**
 * Validates a docker compose short-syntax port entry:
 *
 *   8080                  publish the container port on the same host port
 *   80:8080               HOST:CONTAINER
 *   127.0.0.1:80:8080     bind the host side to one interface
 *   3000-3005:3000-3005   equal-width ranges
 *   8080:8080/udp         any of the above with an explicit protocol
 */
export const isValidPortMapping = (val: string): boolean => {
  const trimmed = val.trim();
  if (trimmed.length === 0) return false;

  const slash = trimmed.lastIndexOf('/');
  const body = slash === -1 ? trimmed : trimmed.slice(0, slash);
  if (slash !== -1 && !PROTOCOLS.includes(trimmed.slice(slash + 1).toLowerCase())) {
    return false;
  }

  // A bracketed IPv6 address contains colons of its own, so lift it off before
  // splitting the rest of the entry.
  let address: string | null = null;
  let remainder = body;
  if (body.startsWith('[')) {
    const close = body.indexOf(']');
    if (close === -1 || body[close + 1] !== ':') return false;
    address = body.slice(0, close + 1);
    remainder = body.slice(close + 2);
  }

  const parts = remainder.split(':');
  if (address !== null) {
    if (!isHostAddress(address) || parts.length !== 2) return false;
  } else if (parts.length === 3 && !isHostAddress(parts[0])) {
    return false;
  }
  if (parts.length < 1 || parts.length > 3) return false;

  const [host, container] = parts.slice(-2);
  if (parts.length === 1) return rangeWidth(host) !== null;

  const hostWidth = rangeWidth(host);
  const containerWidth = rangeWidth(container);
  if (hostWidth === null || containerWidth === null) return false;

  // Docker maps ranges positionally, so a single container port may absorb a
  // host range but two ranges have to line up.
  return containerWidth === 1 || hostWidth === containerWidth;
};
