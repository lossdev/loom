import type { Container } from './Container';
import type { Network } from './Network';

export interface Compose {
  containers?: Container[];
  networks?: Network[];
}