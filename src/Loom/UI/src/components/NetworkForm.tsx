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
  Input,
  Label,
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@shadcn/components/ui';

import type { Network } from '@/types';

interface NetworkFormProps {
  value: Partial<Network>;
  onChange: (updated: Partial<Network>) => void;
}

const driverOpts = [
  'bridge',
  'overlay',
  'host',
  'none'
];

export const NetworkForm = ({ value, onChange }: NetworkFormProps) => {
  return (
    <div className="grid flex-1 auto-rows-min gap-6 px-4">
      <div className="grid gap-3">
        <Label htmlFor="network-name" className="gap-1">Name<span className="text-destructive">*</span></Label>
        <Input
          id="network-name"
          value={value.name ?? ''}
          onChange={e => onChange({ ...value, name: e.target.value })}
          required
        />
      </div>
      <div className="grid gap-3">
        <Label htmlFor="network-driver" className="gap-1">Driver<span className="text-destructive">*</span></Label>
        <Combobox items={driverOpts}>
          <ComboboxInput placeholder="Driver type ..." />
          <ComboboxContent>
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
        <Checkbox id="attachable-checkbox" name="attachable-checkbox" />
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