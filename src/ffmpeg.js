function build(opt) {
  const options = opt || {};

  const {
    input,
    output,
    container,
  } = options;

  const str = [
    'ffmpeg',
    '-v', '0',
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

  if (options.videoSpeed) {
    const arg = ['-preset', options.videoSpeed];
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
