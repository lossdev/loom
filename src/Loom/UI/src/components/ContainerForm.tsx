import { useEffect, useState } from 'react';

import {
  Button,
  Field,
  FieldError,
  Label,
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@shadcn/components/ui';

import type { Container, ImageSearchResult, TagSearchResult } from '@/types';
import { InputWithValidation, PillInput } from "@/components";
import { useDebouncedValue } from "@/hooks";
import {
  describeRequestError,
  describeResponseError,
  isAbortError,
  isValidPortMapping,
  tokenizeArgs
} from "@/lib";

interface ContainerFormProps {
  value: Partial<Container>;
  onChange: (updated: Partial<Container>) => void;
  takenNames: string[];
  onValidityChange: (valid: boolean) => void;
  error?: string;
}

export const ContainerForm = ({ value, onChange, takenNames, onValidityChange, error }: ContainerFormProps) => {
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
  const [imageLookupError, setImageLookupError] = useState<string | null>(null);
  const [showImageSuggestions, setShowImageSuggestions] = useState(false);
  const debouncedImage = useDebouncedValue(value.image ?? '', 300);

  useEffect(() => {
    const query = debouncedImage.trim();
    if (query.length < 2) {
      // Clearing a stale dropdown, not deriving new state, so the cascading-render
      // concern behind this rule does not apply.
      /* eslint-disable react-hooks/set-state-in-effect */
      setImageSuggestions([]);
      setImageLookupError(null);
      /* eslint-enable react-hooks/set-state-in-effect */
      return;
    }

    const controller = new AbortController();

    (async () => {
      try {
        const response = await fetch(`/api/lookup/images?query=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          setImageSuggestions([]);
          setImageLookupError(await describeResponseError(response));
          return;
        }
        const data = await response.json();
        setImageSuggestions(data.results ?? []);
        setImageLookupError(null);
      } catch (err) {
        // An abort is this effect superseding itself, not a failure worth showing.
        if (isAbortError(err)) return;
        setImageSuggestions([]);
        setImageLookupError(describeRequestError(err));
      }
    })();

    return () => controller.abort();
  }, [debouncedImage]);

  const [tagSuggestions, setTagSuggestions] = useState<TagSearchResult[]>([]);
  const [tagLookupError, setTagLookupError] = useState<string | null>(null);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const debouncedTag = useDebouncedValue(value.tag ?? '', 300);

  useEffect(() => {
    const image = debouncedImage.trim();
    if (image.length === 0) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setTagSuggestions([]);
      setTagLookupError(null);
      /* eslint-enable react-hooks/set-state-in-effect */
      return;
    }

    const controller = new AbortController();

    (async () => {
      try {
        const response = await fetch(
          `/api/lookup/tags/search?image=${encodeURIComponent(image)}&query=${encodeURIComponent(debouncedTag.trim())}`,
          { signal: controller.signal }
        );
        if (!response.ok) {
          setTagSuggestions([]);
          setTagLookupError(await describeResponseError(response));
          return;
        }
        const data = await response.json();
        setTagSuggestions(data.results ?? []);
        setTagLookupError(null);
      } catch (err) {
        if (isAbortError(err)) return;
        setTagSuggestions([]);
        setTagLookupError(describeRequestError(err));
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
            {showImageSuggestions && (imageLookupError !== null || imageSuggestions.length > 0) && (
              <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-input bg-popover text-popover-foreground shadow-lg">
                {imageLookupError !== null && (
                  <li className="px-3 py-2 text-sm text-destructive">
                    Couldn't load image suggestions &mdash; {imageLookupError}
                  </li>
                )}
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
            {showTagSuggestions && (tagLookupError !== null || tagSuggestions.length > 0) && (
              <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-input bg-popover text-popover-foreground shadow-lg">
                {tagLookupError !== null && (
                  <li className="px-3 py-2 text-sm text-destructive">
                    Couldn't load tag suggestions &mdash; {tagLookupError}
                  </li>
                )}
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
          <Field orientation="horizontal">
            <Label htmlFor="container-entrypoint">Entrypoint</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="xs">?</Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Overrides the image's entrypoint. Type it as you would in a shell and press Enter &mdash; it is split into separate arguments. Quote a value to keep its spaces.</p>
              </TooltipContent>
            </Tooltip>
          </Field>
          <PillInput
            id="container-entrypoint"
            value={value.entrypoint ?? []}
            onChange={entrypoint => onChange({ ...value, entrypoint })}
            placeholder="e.g. /bin/sh -c"
            allowDuplicates
            tokenize={tokenizeArgs}
          />
        </div>
        <div className="grid gap-3">
          <Field orientation="horizontal">
            <Label htmlFor="container-command">Command</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="xs">?</Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Overrides the image's default command. Type it as you would in a shell and press Enter &mdash; it is split into separate arguments. Quote a value to keep its spaces.</p>
              </TooltipContent>
            </Tooltip>
          </Field>
          <PillInput
            id="container-command"
            value={value.command ?? []}
            onChange={command => onChange({ ...value, command })}
            placeholder="e.g. npm run start"
            allowDuplicates
            tokenize={tokenizeArgs}
          />
        </div>
        <div className="grid gap-3">
          <Field orientation="horizontal">
            <Label htmlFor="container-ports">Ports</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="xs">?</Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>A single port is published on the identical host port. Use <code>host:container</code> to map mismatched ports &mdash; <code>80:8080</code> reaches container port 8080 on host port 80. Ranges (<code>3000-3005:3000-3005</code>), an interface (<code>127.0.0.1:80:8080</code>) and a protocol (<code>53:53/udp</code>) are also accepted.</p>
              </TooltipContent>
            </Tooltip>
          </Field>
          <PillInput
            id="container-ports"
            value={value.ports ?? []}
            onChange={ports => onChange({ ...value, ports })}
            placeholder="e.g. 8080 or 80:8080"
            validate={isValidPortMapping}
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