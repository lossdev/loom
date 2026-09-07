import { useEffect, useState } from 'react';

import { FieldError, Label } from '@shadcn/components/ui';

import type { Container, ImageSearchResult, TagSearchResult } from '@/types';
import { InputWithValidation, PillInput } from "@/components";
import { useDebouncedValue } from "@/hooks";

interface ContainerFormProps {
  value: Partial<Container>;
  onChange: (updated: Partial<Container>) => void;
  takenNames: string[];
  onValidityChange: (valid: boolean) => void;
  error?: string;
}

export const ContainerForm = ({ value, onChange, takenNames, onValidityChange, error }: ContainerFormProps) => {
  const validatePort = (val: string): boolean => {
    const n = Number(val.trim());
    return Number.isInteger(n) && n > 0 && n <= 65535;
  };

  const validateKeyValuePair = (val: string): boolean => {
    const parts = val.split('=');
    return parts.length === 2 && parts[0].trim().length > 0 && parts[1].trim().length > 0;
  };

  const validateName = (val: string): boolean =>
    val.length > 0 && !takenNames.includes(val);

  const validateImage = (val: string): boolean => val.length > 0;

  const updateValidity = (name: string, image: string) => {
    onValidityChange(validateName(name) && validateImage(image));
  };

  const [imageSuggestions, setImageSuggestions] = useState<ImageSearchResult[]>([]);
  const [showImageSuggestions, setShowImageSuggestions] = useState(false);
  const debouncedImage = useDebouncedValue(value.image ?? '', 300);

  useEffect(() => {
    const query = debouncedImage.trim();
    if (query.length < 2) {
      setImageSuggestions([]);
      return;
    }

    const controller = new AbortController();

    (async () => {
      try {
        const response = await fetch(`/api/lookup/images?query=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`Failed to search images: ${response.status}`);
        const data = await response.json();
        setImageSuggestions(data.results ?? []);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setImageSuggestions([]);
        }
      }
    })();

    return () => controller.abort();
  }, [debouncedImage]);

  const [tagSuggestions, setTagSuggestions] = useState<TagSearchResult[]>([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const debouncedTag = useDebouncedValue(value.tag ?? '', 300);

  useEffect(() => {
    const image = debouncedImage.trim();
    if (image.length === 0) {
      setTagSuggestions([]);
      return;
    }

    const controller = new AbortController();

    (async () => {
      try {
        const response = await fetch(
          `/api/lookup/tags/search?image=${encodeURIComponent(image)}&query=${encodeURIComponent(debouncedTag.trim())}`,
          { signal: controller.signal }
        );
        if (!response.ok) throw new Error(`Failed to search tags: ${response.status}`);
        const data = await response.json();
        setTagSuggestions(data.results ?? []);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setTagSuggestions([]);
        }
      }
    })();

    return () => controller.abort();
  }, [debouncedImage, debouncedTag]);

  return (
    <div>
      <div className="grid flex-1 auto-rows-min gap-6 px-4">
        <div className="grid gap-3">
          <Label htmlFor="container-name" className="gap-1">Name<span className="text-destructive">*</span></Label>
          <InputWithValidation
            id="container-name"
            value={value.name ?? ''}
            onChange={e => {
              const updated = { ...value, name: e.target.value };
              onChange(updated);
              updateValidity(e.target.value, value.image ?? '');
            }}
            required
            validate={validateName}
          />
          <FieldError>{error}</FieldError>
        </div>
        <div className="grid gap-3">
          <Label htmlFor="container-image" className="gap-1">Image<span className="text-destructive">*</span></Label>
          <div
            className="relative"
            onFocus={() => setShowImageSuggestions(true)}
            onBlur={e => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setShowImageSuggestions(false);
              }
            }}
          >
            <InputWithValidation
              id="container-image"
              value={value.image ?? ''}
              onChange={e => {
                const updated = { ...value, image: e.target.value };
                onChange(updated);
                updateValidity(value.name ?? '', e.target.value);
              }}
              required
              validate={validateImage}
              autoComplete="off"
            />
            {showImageSuggestions && imageSuggestions.length > 0 && (
              <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-input bg-popover text-popover-foreground shadow-lg">
                {imageSuggestions.map(suggestion => (
                  <li key={suggestion.name}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                      onClick={() => {
                        onChange({ ...value, image: suggestion.name });
                        updateValidity(value.name ?? '', suggestion.name);
                        setShowImageSuggestions(false);
                      }}
                    >
                      <span>{suggestion.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {suggestion.isLocal ? 'Local' : suggestion.isOfficial ? 'Official' : ''}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="grid gap-3">
          <Label htmlFor="container-tag">Tag</Label>
          <div
            className="relative"
            onFocus={() => setShowTagSuggestions(true)}
            onBlur={e => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setShowTagSuggestions(false);
              }
            }}
          >
            <InputWithValidation
              id="container-tag"
              value={value.tag ?? ''}
              onChange={e => onChange({ ...value, tag: e.target.value })}
              placeholder="latest"
              autoComplete="off"
            />
            {showTagSuggestions && tagSuggestions.length > 0 && (
              <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-input bg-popover text-popover-foreground shadow-lg">
                {tagSuggestions.map(suggestion => (
                  <li key={suggestion.name}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                      onClick={() => {
                        onChange({ ...value, tag: suggestion.name });
                        setShowTagSuggestions(false);
                      }}
                    >
                      <span>{suggestion.name}</span>
                      {suggestion.isLocal && <span className="text-xs text-muted-foreground">Local</span>}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
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