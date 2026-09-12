export interface Container {
  id: string;
  name: string;
  image: string;
  tag?: string;
  ports?: string[];
  command?: string[];
  entrypoint?: string[];
  env?: Record<string, string>;
  annotations?: Record<string, string>;
  labels?: Record<string, string>;
}