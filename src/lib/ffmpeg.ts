interface IFFmpegOptions {
  [key: string]: string;
}

const formatOptionsMap = {
  startTime: '-ss',
  stopTime: '-to',
};

const videoOptionsMap = {
  vcodec: '-c:v',
  preset: '-preset',
  bitrate: '-b:v',
  minrate: '-minrate',
  maxrate: '-maxrate',
  bufsize: '-bufsize',
  gopsize: '-g',
  pixelFormat: '-pix_fmt',
  frameRate: '-r',
  tune: '-tune',
  profile: '-profile:v',
  level: '-level',
  aspect: '-aspect',
};

const audioOptionsMap = {
  acodec: '-c:a',
  sampleRate: '-ar',
};

// An option is set if it has a value at all. Deliberately not a truthiness test:
// 0 is a legitimate value (VP9 profile 0, for one) and used to be dropped here.
function isSet(value: unknown): boolean {
  return value !== undefined && value !== null && value !== '';
}

// Characters that would split a path into several shell words or be read as
// shell syntax. Plain names and URLs are left alone so the command stays tidy.
const SHELL_UNSAFE = /[\s"'`$&|;<>()]/;

// Double-quotes a file path when it needs it. Double quotes work in POSIX
// shells, cmd.exe and PowerShell alike. A path the user already quoted is left
// as typed.
function quotePath(path: string): string {
  if (!path || !SHELL_UNSAFE.test(path) || /^(".*"|'.*')$/.test(path)) {
    return path;
  }
  return `"${path.replace(/(["\\$`])/g, '\\$1')}"`;
}

function setFlagsFromMap(map: IFFmpegOptions, options: IFFmpegOptions): string[] {
  const flags: string[] = [];
  // Set flags by adding provided options from the map parameter and adding the
  // value to the flags array.
  Object.keys(map).forEach((o) => {
    if (isSet(options[o]) && options[o] !== 'none' && options[o] !== 'auto') {
      const arg = [map[o], options[o]];
      flags.push(...arg);
    }
  });
  return flags;
}

// Builds an array of FFmpeg video filters (-vf).
function setVideoFilters(options: IFFmpegOptions) {
  const vf: string[] = [];

  if (options.speed && options.speed !== 'auto') {
    const arg = [`setpts=${options.speed}`];
    vf.push(...arg);
  }

  // Scale Filters.
  const scaleFilters = [];
  if (options.size && options.size !== 'source') {
    let arg;
    if (options.size === 'custom' && options.fit) {
      // Fit inside the box, keeping the source aspect ratio. Rounding to even
      // dimensions keeps encoders like x264 from rejecting the result.
      arg = [`scale=${options.width}:${options.height}:force_original_aspect_ratio=decrease:force_divisible_by=2`];
    } else if (options.size === 'custom') {
      arg = [`scale=${options.width}:${options.height}`];
    } else {
      arg = options.format === 'widescreen' ? [`scale=${options.size}:-1`] : [`scale=-1:${options.size}`];
    }
    scaleFilters.push(...arg);
  }

  // Only meaningful alongside a scale filter: `flags` is an option of scale, so
  // emitting it on its own produces a filter chain ffmpeg rejects.
  if (options.scaling && options.scaling !== 'auto' && scaleFilters.length > 0) {
    const arg = [`flags=${options.scaling}`];
    scaleFilters.push(...arg);
  }

  // Add Scale Filters to the vf flags
  if (scaleFilters.length > 0) {
    vf.push(scaleFilters.join(':'));
  }

  if (options.deband) {
    const arg = ['deband'];
    vf.push(...arg);
  }

  if (options.deshake) {
    const arg = ['deshake'];
    vf.push(...arg);
  }

  if (options.deflicker) {
    const arg = ['deflicker'];
    vf.push(...arg);
  }

  if (options.dejudder) {
    const arg = ['dejudder'];
    vf.push(...arg);
  }

  if (options.denoise !== 'none') {
    let arg: string[] = [];
    switch (options.denoise) {
      case 'light':
        arg = ['removegrain=22'];
        break;
      case 'medium':
        arg = ['vaguedenoiser=threshold=3:method=soft:nsteps=5'];
        break;
      case 'heavy':
        arg = ['vaguedenoiser=threshold=6:method=soft:nsteps=5'];
        break;
      default:
        arg = ['removegrain=0'];
        break;
    }
    vf.push(...arg);
  }

  if (options.deinterlace !== 'none') {
    let arg: string[] = [];
    switch (options.deinterlace) {
      case 'frame':
        arg = ['yadif=0:-1:0'];
        break;
      case 'field':
        arg = ['yadif=1:-1:0'];
        break;
      case 'frame_nospatial':
        arg = ['yadif=2:-1:0'];
        break;
      case 'field_nospatial':
        arg = ['yadif=3:-1:0'];
        break;
      default:
        break;
    }
    vf.push(...arg);
  }

  // EQ Filters.
  const eq = [];
  if (parseInt(options.contrast, 10) !== 0) {
    const arg = [`contrast=${(parseInt(options.contrast, 10) / 100) + 1}`];
    eq.push(...arg);
  }

  if (parseInt(options.brightness, 10) !== 0) {
    const arg = [`brightness=${parseInt(options.brightness, 10) / 100}`];
    eq.push(...arg);
  }

  if (parseInt(options.saturation, 10) !== 0) {
    const arg = [`saturation=${parseInt(options.saturation, 10)}`];
    eq.push(...arg);
  }

  if (parseInt(options.gamma, 10) !== 0) {
    const arg = [`gamma=${parseInt(options.gamma, 10) / 10}`];
    eq.push(...arg);
  }

  if (eq.length > 0) {
    const eqStr = eq.join(':');
    vf.push(`eq=${eqStr}`);
  }

  return vf.join(',');
}

// Builds an array of FFmpeg audio filters (-af).
function setAudioFilters(options: IFFmpegOptions): string {
  const af = [];

  if (options.volume && parseInt(options.volume, 10) !== 100) {
    const arg = [`volume=${parseInt(options.volume, 10) / 100}`];
    af.push(...arg);
  }

  if (options.acontrast && parseInt(options.acontrast, 10) !== 33) {
    const arg = [`acontrast=${parseInt(options.acontrast, 10) / 100}`];
    af.push(...arg);
  }

  // Delay every channel by the same amount, in milliseconds.
  if (options.adelay && parseInt(options.adelay, 10) > 0) {
    const arg = [`adelay=delays=${parseInt(options.adelay, 10)}:all=1`];
    af.push(...arg);
  }

  return af.join(',');
}

function set2Pass(flags: string[], options: IFFmpegOptions) {
  // Pass 1 only writes the stats log, so its output is discarded. ffmpeg cannot
  // infer a muxer from /dev/null, so name the null muxer explicitly, and skip
  // audio since it would be thrown away anyway. For Windows use `NUL`.
  const op = `${flags.includes('-an') ? '' : '-an '}-f null /dev/null &&`;
  const copy = flags.slice(); // Array clone for pass 2.

  // Rewrite command with 1 and 2 pass flags and append to flags array.
  if (options.vcodec === 'libx265' && options.codecOptions) {
    // Add pass param if the -x265-params flag is already present.
    const idx = flags.indexOf('-x265-params');
    // eslint-disable-next-line no-param-reassign
    flags[idx + 1] += ':pass=1';
    copy[idx + 1] += ':pass=2';
    flags.push(op);
  } else if (options.vcodec === 'libx265') {
    flags.push(...['-x265-params', 'pass=1', op]);
    copy.push(...['-x265-params', 'pass=2']);
  } else {
    flags.push(...['-pass', '1', op]);
    copy.push(...['-pass', '2']);
  }
  return copy;
}

function setFormatFlags(options: IFFmpegOptions) {
  return setFlagsFromMap(formatOptionsMap, options);
}

function setVideoFlags(options: IFFmpegOptions) {
  // "None" means no video track at all, so -vn replaces every other video flag.
  // Mirrors how acodec === 'none' is handled in setAudioFlags.
  if (options.vcodec === 'none') {
    return ['-vn'];
  }

  const flags = setFlagsFromMap(videoOptionsMap, options);

  //
  // Set more complex options that can't be set from the videoOptionsMap.
  //
  if (options.crf !== '0' && options.pass === 'crf') {
    const arg = ['-crf', options.crf];
    flags.push(...arg);
  }

  if (options.faststart) {
    const arg = ['-movflags', 'faststart'];
    flags.push(...arg);
  }

  if (options.codecOptions && ['libx264', 'libx265'].includes(options.vcodec)) {
    const arg = [`-${options.vcodec.replace('lib', '')}-params`, options.codecOptions];
    flags.push(...arg);
  }

  return flags;
}

function setAudioFlags(options: IFFmpegOptions) {
  // "None" means no audio track at all, so -an replaces every other audio flag.
  if (options.acodec === 'none') {
    return ['-an'];
  }

  const flags = setFlagsFromMap(audioOptionsMap, options);

  //
  // Set more complex options that can't be set from the audioOptionsMap.
  //
  if (options.channel && options.channel !== 'source') {
    const arg = ['-rematrix_maxval', '1.0', '-ac', options.channel];
    flags.push(...arg);
  }

  if (options.quality && options.quality !== 'auto') {
    const bitrate = options.quality === 'custom' ? options.audioBitrate : options.quality;
    // A blank custom bitrate would emit a bare -b:a, and ffmpeg would read the
    // output path as its argument.
    if (isSet(bitrate)) {
      flags.push(...['-b:a', bitrate]);
    }
  }
  return flags;
}

// Filters need decoded frames, so ffmpeg refuses to filter a stream it is only
// copying. Reports which streams have filters set while their codec is copy.
function copyConflicts(opt: IFFmpegOptions) {
  return {
    video: opt.vcodec === 'copy' && setVideoFilters(opt) !== '',
    audio: opt.acodec === 'copy' && setAudioFilters(opt) !== '',
  };
}

// Build an array of FFmpeg from options parameter.
function build(opt: IFFmpegOptions): string {
  const options = opt || {};

  const {
    input,
    output,
    container,
  } = options;

  const flags = [
    'ffmpeg',
    '-i', quotePath(`${input}`),
  ];

  // Set format flags if clip options are set.
  if (options.clip) {
    const formatFlags = setFormatFlags(options);
    flags.push(...formatFlags);
  }

  // Set video flags.
  const videoFlags = setVideoFlags(options);
  flags.push(...videoFlags);

  // Set video filters. Skipped when the video track is disabled.
  const vf = options.vcodec === 'none' ? '' : setVideoFilters(options);
  if (vf) {
    flags.push(`-vf "${vf}"`);
  }

  // Set audio flags.
  const audioFlags = setAudioFlags(options);
  flags.push(...audioFlags);

  // Set audio filters. Skipped when the audio track is disabled.
  const af = options.acodec === 'none' ? '' : setAudioFilters(options);
  if (af) {
    flags.push(`-af "${af}"`);
  }

  // Set 2 pass output if option is set.
  if (options.pass === '2') {
    const copy = set2Pass(flags, options);
    flags.push(...copy);
  }

  // Extra flags.
  const extra = [];

  if (options.extra.includes('f')) {
    const arg = ['-f', container];
    extra.push(...arg);
  }

  if (options.extra.includes('y')) {
    const arg = ['-y'];
    extra.push(...arg);
  }

  if (options.extra.includes('n')) {
    const arg = ['-n'];
    extra.push(...arg);
  }

  if (options.extra.includes('progress')) {
    const arg = ['-progress pipe:1'];
    extra.push(...arg);
  }

  if (options.extra.includes('hide_banner')) {
    const arg = ['-hide_banner'];
    extra.push(...arg);
  }

  if (options.extra.includes('report')) {
    const arg = ['-report'];
    extra.push(...arg);
  }

  if (options.loglevel !== 'none') {
    const arg = ['-loglevel', options.loglevel];
    extra.push(...arg);
  }

  // Set output.
  extra.push(quotePath(output));

  // Push all flags and join them as a space separated string.
  flags.push(...extra);
  return flags.join(' ');
}

export default {
  build,
  copyConflicts,
};
