// Initial state of the editor form.
//
// Exported as a factory, not a constant: the editor mutates the form in place
// (as does transformFromQueryParams), so every caller needs its own copy.
//
// NOTE for the React port: these runtime values do not match the shapes declared
// in src/types.ts. `crf`, `volume` and the five filter levels are numbers where
// the interface says string; the bitrate and clip-time fields default to null;
// and `options.extra` is a string[] declared as `string`. Nothing type-checks
// this today because Editor.vue is plain JS. Reconcile the two during the port
// rather than carrying the mismatch across -- the characterization tests in
// tests/unit pin the behavior either way.
export function createDefaultForm() {
  return {
    io: {
      input: 'input.mp4',
      output: 'output.mp4',
    },
    format: {
      container: 'mp4',
      clip: false,
      startTime: null,
      stopTime: null,
    },
    video: {
      codec: 'x264',
      preset: 'none',
      pass: '1',
      crf: 23,
      bitrate: null,
      minrate: null,
      maxrate: null,
      bufsize: null,
      gopsize: null,
      pixel_format: 'auto',
      frame_rate: 'auto',
      speed: 'auto',
      tune: 'none',
      profile: 'none',
      level: 'none',
      faststart: false,
      size: 'source',
      width: '1080',
      height: '1920',
      format: 'widescreen',
      aspect: 'auto',
      scaling: 'auto',
      codec_options: '',
    },
    audio: {
      codec: 'copy',
      channel: 'source',
      quality: 'auto',
      sampleRate: 'auto',
      volume: 100,
    },
    filters: {
      deband: false,
      deshake: false,
      deflicker: false,
      dejudder: false,
      denoise: 'none',
      deinterlace: 'none',
      brightness: 0,
      contrast: 0,
      saturation: 0,
      gamma: 0,
      acontrast: 33,
    },
    options: {
      extra: [],
      loglevel: 'none',
    },
  };
}

export type DefaultForm = ReturnType<typeof createDefaultForm>;

export default createDefaultForm;
