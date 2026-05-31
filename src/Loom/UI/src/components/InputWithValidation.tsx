import React, { useState, type ComponentProps } from 'react';

import { Input } from '@shadcn/components/ui/input';

interface InputWithValidationProps extends ComponentProps<typeof Input> {
  validate?: (val: string) => boolean;
}

export const InputWithValidation = ({ validate, onChange, ...props }: InputWithValidationProps) => {
  const [invalid, setInvalid] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (validate) {
      setInvalid(!validate(e.target.value));
    }
    onChange?.(e);
  };

  const handleBlur = () => {
    if (validate) {
      setInvalid(!validate(props.value as string ?? ''));
    }
  };

  return <Input aria-invalid={invalid} onChange={handleChange} onBlur={handleBlur} {...props} />;
};