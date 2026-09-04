/**
 * The option lists in lib/form.ts mark entries with a `supported` array: video
 * codecs supported by a container, encoder presets supported by a codec. Entries
 * with no `supported` key, or an explicit null, are always available.
 */
export interface SupportedOption {
  name: string
  value: string
  supported?: string[] | null
}

export function filterSupported<T extends SupportedOption>(options: T[], against: string): T[] {
  return options.filter((o) => !o.supported || o.supported.includes(against))
}
