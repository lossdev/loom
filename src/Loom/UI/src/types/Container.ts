export interface Container {
  id: string;
  name: string;
  image: string;
  ports?: number[];
  env?: Record<string, string>;
  annotations?: Record<string, string>;
  labels?: Record<string, string>;
}