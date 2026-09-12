import { useState, type KeyboardEvent } from 'react';
import {Badge, FieldDescription, Input} from '@shadcn/components/ui';
import { X } from 'lucide-react';

interface PillInputProps {
  id: string;
  value: string[];
  onChange: (updated: string[]) => void;
  placeholder?: string;
  validate?: (val: string) => boolean;
  // Set for ordered argument lists (entrypoint/command), where the same token
  // may legitimately appear more than once.
  allowDuplicates?: boolean;
  // Splits one submission into several pills, e.g. a command line into argv.
  tokenize?: (val: string) => string[];
}

export const PillInput = ({ id, value, onChange, placeholder, validate, allowDuplicates, tokenize }: PillInputProps) => {
  const [input, setInput] = useState('');
  const [inputError, setInputError] = useState(false);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      if (validate && !validate(input.trim())) {
        setInputError(true);
        return;
      }
      const entries = tokenize ? tokenize(input.trim()) : [input.trim()];
      const additions = allowDuplicates
        ? entries
        : entries.filter((entry, i) => !value.includes(entry) && entries.indexOf(entry) === i);
      if (additions.length > 0) {
        onChange([...value, ...additions]);
      }
      setInputError(false);
      setInput('');
    }
    if (e.key === 'Backspace' && !input && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Input
        id={id}
        value={input}
        aria-invalid={inputError}
        onChange={e => {
          setInput(e.target.value);
          if (inputError) setInputError(false);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder ?? 'Type and press Enter'}
      />
      { inputError &&
        <FieldDescription>
          This field contains validation errors.
        </FieldDescription>
      }
      {value.length > 0 && (
        <div className="flex flex-row flex-wrap gap-2">
          {value.map((item, index) => (
            <Badge key={`${index}-${item}`} variant="secondary" className="flex items-center gap-1">
              {item}
              <span
                className="cursor-pointer"
                onClick={e => {
                  e.stopPropagation();
                  onChange(value.filter((_, i) => i !== index));
                }}
              >
                <X className="h-3 w-3 pointer-events-none" />
              </span>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
