import {
  Button,
  Checkbox,
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  Field,
  FieldError,
  Label,
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@shadcn/components/ui';

import type { Network } from '@/types';
import { InputWithValidation } from "@/components";

interface NetworkFormProps {
  value: Partial<Network>;
  onChange: (updated: Partial<Network>) => void;
  takenNames: string[];
  onValidityChange: (valid: boolean) => void;
  error?: string;
}

const driverOpts = [
  'bridge',
  'overlay',
  'host',
  'none'
];

export const NetworkForm = ({ value, onChange, takenNames, onValidityChange, error }: NetworkFormProps) => {
  const validateName = (val: string): boolean =>
    val.length > 0 && !takenNames.includes(val);
  
  return (
    <div className="grid flex-1 auto-rows-min gap-6 px-4">
      <div className="grid gap-3">
        <Label htmlFor="network-name" className="gap-1">Name<span className="text-destructive">*</span></Label>
        <InputWithValidation
          id="network-name"
          value={value.name ?? ''}
          onChange={e => {
            const updated = { ...value, name: e.target.value };
            onChange(updated);
            onValidityChange(validateName(e.target.value));
          }}
          required
          validate={validateName}
        />
        <FieldError>{error}</FieldError>
      </div>
      <div className="grid gap-3">
        <Label htmlFor="network-driver" className="gap-1">Driver<span className="text-destructive">*</span></Label>
        <Combobox
          items={driverOpts}
          value={value.driver ?? 'bridge'}
          onValueChange={driver => onChange({ ...value, driver: driver as Network['driver'] })}
        >
          <ComboboxInput placeholder="Driver type ..." />
          <ComboboxContent className="z-[200]">
            <ComboboxEmpty>No items found.</ComboboxEmpty>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
      <div className="flex flex-row justify-center items-center">
        <Checkbox
          id="attachable-checkbox"
          name="attachable-checkbox"
          checked={value.attachable ?? false}
          onCheckedChange={checked => onChange({ ...value, attachable: checked === true })}
        />
        <Field orientation="horizontal">
          <Label htmlFor="attachable-checkbox" className="ml-2">Attachable</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="xs">?</Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>This network can be attached to after creation by standalone containers.</p>
            </TooltipContent>
          </Tooltip>
        </Field>
      </div>
    </div>
  );
};