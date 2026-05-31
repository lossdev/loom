import type { Container, Network } from './';

export type AddTarget =
  | { type: 'network' }
  | { type: 'network-edit', network: Network }
  | { type: 'container' }
  | { type: 'container-edit', container: Container }
  | { type: 'networkContainer'; networkId: string }
  | { type: 'networkContainer-edit'; networkId: string, container: Container };