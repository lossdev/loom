import type { Container } from './Container';

export interface Network {
  id: string;
  name: string;
  driver: 'bridge' | 'host' | 'overlay' | 'none';
  attachable?: boolean;
  containers: Container[];
}