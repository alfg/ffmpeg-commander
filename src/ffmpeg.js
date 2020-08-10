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

  if (options.pass === '2') {
    // TODO: Generate -pass 1 and -pass 2 command.
  }

  if (options.crf !== '0' && options.pass === 'crf') {
    const arg = ['-crf', options.crf];
    str.push(...arg);
  }

  if (options.bitrate) {
    const arg = ['-b:v', options.bitrate];
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

  // Video Filters.
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

  // Only push -vf flag if there are video filter arguments.
  if (vf.length > 3) {
    str.push(...vf);
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
