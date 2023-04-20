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

function setFlagsFromMap(map: IFFmpegOptions, options: IFFmpegOptions): string[] {
  const flags: string[] = [];
  // Set flags by adding provided options from the map parameter and adding the
  // value to the flags array.
  Object.keys(map).forEach((o) => {
    if (options[o] && options[o] !== 'none' && options[o] !== 'auto') {
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
    if (options.size === 'custom') {
      arg = [`scale=${options.width}:${options.height}`];
    } else {
      arg = options.format === 'widescreen' ? [`scale=${options.size}:-1`] : [`scale=-1:${options.size}`];
    }
    scaleFilters.push(...arg);
  }

  if (options.scaling && options.scaling !== 'auto') {
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

  return af.join(',');
}

function set2Pass(flags: string[], options: IFFmpegOptions) {
  const op = '/dev/null &&'; // For Windows use `NUL && \`
  const copy = flags.slice(); // Array clone for pass 2.

  // Rewrite command with 1 and 2 pass flags and append to flags array.
  if (options.vcodec === 'libx265' && options.codecOptions) {
    // Add pass param if the -x265-params flag is already present.
    const idx = flags.indexOf('-x265-params');
    // eslint-disable-next-line no-param-reassign
    flags[idx + 1] += ':pass=1';
    copy[idx + 1] += ':pass=2';
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
  const flags = setFlagsFromMap(audioOptionsMap, options);

  //
  // Set more complex options that can't be set from the audioOptionsMap.
  //
  if (options.channel && options.channel !== 'source') {
    const arg = ['-rematrix_maxval', '1.0', '-ac', options.channel];
    flags.push(...arg);
  }

  if (options.quality && options.quality !== 'auto') {
    const arg = ['-b:a', options.quality === 'custom' ? options.audioBitrate : options.quality];
    flags.push(...arg);
  }
  return flags;
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
    '-i', `${input}`,
  ];

  // Set format flags if clip options are set.
  if (options.clip) {
    const formatFlags = setFormatFlags(options);
    flags.push(...formatFlags);
  }

  // Set video flags.
  const videoFlags = setVideoFlags(options);
  flags.push(...videoFlags);

  // Set video filters.
  const vf = setVideoFilters(options);
  if (vf) {
    flags.push(`-vf "${vf}"`);
  }

  // Set audio flags.
  const audioFlags = setAudioFlags(options);
  flags.push(...audioFlags);

  // Set audio filters.
  const af = setAudioFilters(options);
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
  extra.push(output);

  // Push all flags and join them as a space separated string.
  flags.push(...extra);
  return flags.join(' ');
}

export default {
  build,
};
