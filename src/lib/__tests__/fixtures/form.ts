import type { IFFMpegOptionsForm } from '@/lib/types';
import createDefaultForm from '@/lib/defaults';

// The form defaults now live in src/defaults.ts and are imported, not copied,
// so there is nothing here that can drift out of sync with the app.

type Plain = Record<string, unknown>;

const isPlainObject = (v: unknown): v is Plain => typeof v === 'object'
  && v !== null
  && !Array.isArray(v);

function deepClone<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(deepClone) as unknown as T;
  }
  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, deepClone(v)]),
    ) as unknown as T;
  }
  return value;
}

// Deep merge with scalars and arrays replacing wholesale. Kept dependency-free
// so the fixture can move into the React project as-is.
//
// The clone must be deep: transformFromQueryParams and the Vue form mutate
// nested sections in place, so a shallow copy would let one test scribble on
// the shared defaults and silently corrupt every test after it.
function deepMerge(base: Plain, overrides: Plain): Plain {
  const out = deepClone(base);
  Object.entries(overrides).forEach(([key, value]) => {
    out[key] = isPlainObject(value) && isPlainObject(out[key])
      ? deepMerge(out[key] as Plain, value)
      : deepClone(value);
  });
  return out;
}

// A fresh default form. Always rebuild: transformFromQueryParams mutates in place.
export function makeForm(overrides: Plain = {}): IFFMpegOptionsForm {
  return deepMerge(
    createDefaultForm() as unknown as Plain,
    overrides,
  ) as unknown as IFFMpegOptionsForm;
}

export default createDefaultForm;
