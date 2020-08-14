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

// Build an array of FFmpeg from options parameter.
function build(opt) {
  const options = opt || {};

  const {
    input,
    output,
    container,
  } = options;

  const str = [
    'ffmpeg',
    '-i', `${input}`,
  ];

  if (options.vcodec) {
    const arg = ['-c:v', options.vcodec];
    str.push(...arg);
  }

  if (options.acodec) {
    const arg = ['-c:a', options.acodec];
    str.push(...arg);
  }

  if (options.preset && options.preset !== 'none') {
    const arg = ['-preset', options.preset];
    str.push(...arg);
  }

  if (options.hardwareAccelerationOption === 'nvenc') {
    // Replace encoder with NVidia hardware accelerated encoder.
    // eslint-disable-next-line array-callback-return
    str.map((item, i) => {
      if (item === 'libx264') {
        str[i] = 'h264_nvenc';
      } else if (item === 'libx265') {
        str[i] = 'hevc_nvenc';
      }
    });
  } else if (options.hardwareAccelerationOption !== 'off') {
    const arg = ['-hwaccel', options.hardwareAccelerationOption];
    str.push(...arg);
  }

  if (options.crf !== '0' && options.pass === 'crf') {
    const arg = ['-crf', options.crf];
    str.push(...arg);
  }

  if (options.bitrate) {
    const vbr = options.vbr ? 'q' : 'b';
    const arg = [`-${vbr}:v`, options.bitrate];
    str.push(...arg);
  }

  if (options.minrate) {
    const arg = ['-minrate', options.minrate];
    str.push(...arg);
  }

  if (options.maxrate) {
    const arg = ['-maxrate', options.maxrate];
    str.push(...arg);
  }

  if (options.bufsize) {
    const arg = ['-bufsize', options.bufsize];
    str.push(...arg);
  }

  if (options.pixelFormat && options.pixelFormat !== 'auto') {
    const arg = ['-pix_fmt', options.pixelFormat];
    str.push(...arg);
  }

  if (options.frameRate && options.frameRate !== 'auto') {
    const arg = ['-r', options.frameRate];
    str.push(...arg);
  }

  if (options.tune && options.tune !== 'none') {
    const arg = ['-tune', options.tune];
    str.push(...arg);
  }

  if (options.profile && options.profile !== 'none') {
    const arg = ['-profile:v', options.profile];
    str.push(...arg);
  }

  if (options.level && options.level !== 'none') {
    const arg = ['-level', options.level];
    str.push(...arg);
  }

  if (options.optimize && options.optimize !== 'none') {
    const arg = ['-movflags', 'faststart'];
    str.push(...arg);
  }

  if (options.aspect && options.aspect !== 'auto') {
    const arg = ['-aspect', options.aspect];
    str.push(...arg);
  }

  // Set video filters.
  const vf = setVideoFilters(options);
  str.push(...vf);

  // Audio.
  if (options.channel && options.channel !== 'source') {
    const arg = ['-rematrix_maxval', '1.0', '-ac', options.channel];
    str.push(...arg);
  }

  if (options.quality && options.quality !== 'auto') {
    let arg;
    if (options.quality === 'custom') {
      arg = ['-b:a', options.audioBitrate];
    } else {
      arg = ['-b:a', options.quality];
    }
    str.push(...arg);
  }

  if (options.sampleRate && options.sampleRate !== 'auto') {
    const arg = ['-ar', options.sampleRate];
    str.push(...arg);
  }

  // Set audio filters.
  const af = setAudioFilters(options);
  str.push(...af);

  if (options.pass === '2') {
    const op = '/dev/null && \\ \n'; // For Windows use `NUL && \`
    const copy = str.slice(); // Array clone for pass 2.

    // Rewrite command with 1 and 2 pass flags and append to str array.
    str.push(...['-pass', '1', op]);
    copy.push(...['-pass', '2']);
    str.push(...copy);
  }

  // Extra flags.
  const extra = [
    '-sn',
    '-f', `${container}`,
    output,
  ];
  str.push(...extra);

  return str.join(' ');
}

export default {
  build,
};
