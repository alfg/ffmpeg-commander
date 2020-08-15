const optionsMap = {
  vcodec: '-c:v',
  preset: '-preset',
  bitrate: '-b:v',
  minrate: '-minrate',
  maxrate: '-maxrate',
  bufsize: '-bufsize',
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

// Builds an array of FFmpeg video filters (-vf).
function setVideoFilters(options) {
  const vf = [
    '-vf', '"',
  ];

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

  vf.push('"'); // End of video filters.

  // Only return -vf flag if there are video filter arguments.
  if (vf.length > 3) {
    return vf;
  }
  return [];
}

// Builds an array of FFmpeg audio filters (-af).
function setAudioFilters(options) {
  const af = [
    '-af', '"',
  ];

  if (options.volume && parseInt(options.volume, 10) !== 100) {
    const arg = [`volume=${options.volume / 100}`];
    af.push(...arg);
  }

  af.push('"'); // End of audio filters.

  // Only return -af flag if there are audio filter arguments.
  if (af.length > 3) {
    return af;
  }
  return [];
}

function set2Pass(flags) {
  const op = '/dev/null && \\ \n'; // For Windows use `NUL && \`
  const copy = flags.slice(); // Array clone for pass 2.

  // Rewrite command with 1 and 2 pass flags and append to flags array.
  flags.push(...['-pass', '1', op]);
  copy.push(...['-pass', '2']);
  return copy;
}

function setVideoFlags(options) {
  const flags = [];

  // Set flags by adding provided options from the optionsMap and adding the
  // value to the flags array.
  Object.keys(optionsMap).forEach((o) => {
    if (options[o] && options[o] !== 'none' && options[o] !== 'auto') {
      const arg = [optionsMap[o], options[o]];
      flags.push(...arg);
    }
  });

  //
  // Set more complex options that can't be set from the optionsMap.
  //

  if (options.hardwareAccelerationOption === 'nvenc') {
    // Replace encoder with NVidia hardware accelerated encoder.
    // eslint-disable-next-line array-callback-return
    flags.map((item, i) => {
      if (item === 'libx264') {
        flags[i] = 'h264_nvenc';
      } else if (item === 'libx265') {
        flags[i] = 'hevc_nvenc';
      }
    });
  } else if (options.hardwareAccelerationOption !== 'off') {
    const arg = ['-hwaccel', options.hardwareAccelerationOption];
    flags.push(...arg);
  }

  if (options.crf !== '0' && options.pass === 'crf') {
    const arg = ['-crf', options.crf];
    flags.push(...arg);
  }

  if (options.optimize && options.optimize !== 'none') {
    const arg = ['-movflags', 'faststart'];
    flags.push(...arg);
  }
  return flags;
}

function setAudioFlags(options) {
  const flags = [];

  // Set flags by adding provided options from the audioOptionsMap and adding the
  // value to the flags array.
  Object.keys(audioOptionsMap).forEach((o) => {
    if (options[o] && options[o] !== 'none' && options[o] !== 'auto') {
      const arg = [audioOptionsMap[o], options[o]];
      flags.push(...arg);
    }
  });

  //
  // Set more complex options that can't be set from the optionsMap.
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
function build(opt) {
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

  // Set video flags.
  const videoFlags = setVideoFlags(options);
  flags.push(...videoFlags);

  // Set video filters.
  const vf = setVideoFilters(options);
  flags.push(...vf);

  // Set audio flags.
  const audioFlags = setAudioFlags(options);
  flags.push(...audioFlags);

  // Set audio filters.
  const af = setAudioFilters(options);
  flags.push(...af);

  // Set 2 pass output if option is set.
  if (options.pass === '2') {
    const copy = set2Pass(flags);
    flags.push(...copy);
  }

  // Extra flags.
  const extra = [
    '-sn',
    '-f', `${container}`,
    output,
  ];
  flags.push(...extra);

  return flags.join(' ');
}

export default {
  build,
};
