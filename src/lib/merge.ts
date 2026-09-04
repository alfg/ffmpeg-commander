type Plain = Record<string, unknown>

const isPlainObject = (v: unknown): v is Plain =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

/**
 * Deep merge with scalars and arrays replacing wholesale.
 *
 * Saved presets are snapshots of the form, so a top-level spread would replace a
 * whole section rather than fill it in. Today every snapshot has every key, but
 * the first field added to the form makes older ones partial -- and ffmpeg.build
 * does not tolerate an undefined filter value, it emits eq=contrast=NaN.
 */
export function deepMerge<T extends Plain>(base: T, overrides: Plain): T {
  const out: Plain = { ...base }
  Object.entries(overrides).forEach(([key, value]) => {
    out[key] = isPlainObject(value) && isPlainObject(out[key])
      ? deepMerge(out[key] as Plain, value)
      : value
  })
  return out as T
}
