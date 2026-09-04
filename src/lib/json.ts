import util from '@/lib/util'
import type { IFFMpegOptionsForm } from '@/lib/types'

/**
 * The payload sent to ffmpegd, formatted for reading.
 *
 * Nulls are dropped, as the Vue viewer did: the form carries a key for every
 * option whether or not it is set, and showing forty nulls buries the handful
 * of values that matter. Note `?? undefined` rather than a falsy check --
 * `false` and `0` are meaningful here and must survive.
 */
export function toJsonString(form: IFFMpegOptionsForm): string {
  return JSON.stringify(util.transformToJSON(form), (_key, value) => value ?? undefined, 2)
}
