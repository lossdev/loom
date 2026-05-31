import { useState, type KeyboardEvent } from 'react';
import {Badge, FieldDescription, Input} from '@shadcn/components/ui';
import { X } from 'lucide-react';

interface PillInputProps {
  id: string;
  value: string[];
  onChange: (updated: string[]) => void;
  placeholder?: string;
  validate?: (val: string) => boolean;
}

export const PillInput = ({ value, onChange, placeholder, validate }: PillInputProps) => {
  const [input, setInput] = useState('');
  const [inputError, setInputError] = useState(false);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      if (validate && !validate(input.trim())) {
        setInputError(true);
        return;
      }
      if (!value.includes(input.trim())) {
        onChange([...value, input.trim()]);
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
          {value.map((item) => (
            <Badge key={item} variant="secondary" className="flex items-center gap-1">
              {item}
              <span
                className="cursor-pointer"
                onClick={e => {
                  e.stopPropagation();
                  onChange(value.filter(v => v !== item));
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