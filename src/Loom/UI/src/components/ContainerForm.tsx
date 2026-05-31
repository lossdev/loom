import { Label } from '@shadcn/components/ui';

import type { Container } from '@/types';
import { InputWithValidation, PillInput } from "@/components";

interface ContainerFormProps {
  value: Partial<Container>;
  onChange: (updated: Partial<Container>) => void;
}

export const ContainerForm = ({ value, onChange }: ContainerFormProps) => {
  const validatePort = (val: string): boolean => {
    const n = Number(val.trim());
    return Number.isInteger(n) && n > 0 && n <= 65535;
  };

  const validateKeyValuePair = (val: string): boolean => {
    const parts = val.split('=');
    return parts.length === 2 && parts[0].trim().length > 0 && parts[1].trim().length > 0;
  };
  
  const validateNotEmpty = (val: string): boolean => {
    return val.length > 0;
  }
  
  return (
    <div>
      <div className="grid flex-1 auto-rows-min gap-6 px-4">
        <div className="grid gap-3">
          <Label htmlFor="container-name" className="gap-1">Name<span className="text-destructive">*</span></Label>
          <InputWithValidation
            id="container-name"
            value={value.name ?? ''}
            onChange={e => onChange({ ...value, name: e.target.value })}
            required
            validate={validateNotEmpty}
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="container-image" className="gap-1">Image<span className="text-destructive">*</span></Label>
          <InputWithValidation
            id="container-image"
            value={value.image ?? ''}
            onChange={e => onChange({ ...value, image: e.target.value })}
            required
            validate={validateNotEmpty}
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="container-ports">Ports</Label>
          <PillInput
            id="container-ports"
            value={value.ports?.map(String) ?? []}
            onChange={ports => {
              onChange({ ...value, ports: ports.map(Number) });
            }}
            placeholder="e.g. 8080"
            validate={validatePort}
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="container-env">Environment Variables</Label>
          <PillInput
            id="container-env"
            value={Object.entries(value.env ?? {}).map(([k, v]) => `${k}=${v}`)}
            onChange={env => {
              onChange({ ...value, env: Object.fromEntries(env.map(i => i.split('='))) });
            }}
            placeholder="e.g. key=value"
            validate={validateKeyValuePair}
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="container-annotations">Annotations</Label>
          <PillInput
            id="container-annotations"
            value={Object.entries(value.annotations ?? {}).map(([k, v]) => `${k}=${v}`)}
            onChange={items => onChange({
              ...value,
              annotations: Object.fromEntries(items.map(i => i.split('=')))
            })}
            placeholder="e.g. key=value"
            validate={validateKeyValuePair}
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="container-labels">Labels</Label>
          <PillInput
            id="container-labels"
            value={Object.entries(value.labels ?? {}).map(([k, v]) => `${k}=${v}`)}
            onChange={items => onChange({
              ...value,
              labels: Object.fromEntries(items.map(i => i.split('=')))
            })}
            placeholder="e.g. key=value"
            validate={validateKeyValuePair}
          />
        </div>
      </div>
    </div>
  );
}