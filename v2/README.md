# ffmpeg-commander v2 (scaffold)

Vite + React + Tailwind 4 port of the Vue 2 app in the repo root. **Not yet
shipped** — the root app is still the one that builds and deploys.

    npm install
    npm run dev      # http://localhost:5173
    npm test         # vitest
    npm run build    # tsc -b && vite build -> dist/

## Layout

    src/lib/          framework-agnostic modules, ported from the Vue app
    src/lib/__tests__ the characterization suite, carried over from tests/unit
    src/components/   React components (ui/ primitives, sections/ form groups)
    src/hooks/        useFfmpegForm: form state, generated command, URL sync

## What is ported

`src/lib` came across essentially unchanged: `ffmpeg.ts`, `util.ts`, `form.ts`,
`defaults.ts`, `codecs.ts`, `storage.ts`, `types.ts`, `tooltips.ts` and the 12
preset JSON files. The characterization tests came with them and pass against
the copies, which is the evidence that the core logic survived the move.

Two things could not port as-is:

- **`presets/index.ts`** resolved preset files with a dynamic `require()`, which
  has no ESM equivalent. It now imports all 12 JSON files into an explicit map.
  A test asserts every file on disk is present in that map, since forgetting one
  would otherwise fail silently at runtime.
- **Vitest instead of Jest**, so `jest.spyOn` became `vi.spyOn` and the test that
  enumerated the presets directory with `fs` uses `import.meta.glob`.

## What is not done

- Filters, extra options, and the two-pass/codec-options fields have no UI yet.
- Per-token command tooltips (`Command.vue` + `CommandFragment.vue` + `tooltips.ts`).
- The ffmpegd queue and file browser. Whether to port these at all is still open.
- Saved presets: `storage.ts` and the preset save/load functions are ported, but
  nothing in the UI calls them.
- Deployment. The root app owns `gh-pages -d dist` and the CNAME.

## Notes

`src/lib/defaults.ts` carries a warning worth reading before wiring more
components: the runtime defaults do not match the shapes declared in
`src/lib/types.ts`. `useFfmpegForm` casts once, in one place, to stop that
spreading. Reconcile the two rather than widening the cast.
