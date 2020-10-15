import codecMap from '@/codecs';

// Transforms the form options to ffmpeg build options.
function transform(formData) {
  const {
    protocol, input, output, format, video, audio, filters, options,
  } = formData;

  const opt = {
    protocol,
    input,
    output,

    // Format.
    container: format.container,
    clip: format.clip,
    startTime: format.startTime,
    stopTime: format.stopTime,

    // Video.
    vcodec: codecMap[video.codec],
    preset: video.preset,
    hardwareAccelerationOption: video.hardware_acceleration_option,
    pass: video.pass,
    crf: video.crf,
    bitrate: video.bitrate,
    minrate: video.minrate,
    maxrate: video.maxrate,
    bufsize: video.bufsize,
    gopsize: video.gopsize,
    pixelFormat: video.pixel_format,
    frameRate: video.frame_rate,
    speed: video.speed,
    tune: video.tune,
    profile: video.profile,
    level: video.level,
    faststart: video.faststart,
    size: video.size,
    width: video.width,
    height: video.height,
    format: video.format,
    aspect: video.aspect,
    scaling: video.scaling,
    codecOptions: video.codec_options,

    // Audio.
    acodec: codecMap[audio.codec],
    channel: audio.channel,
    quality: audio.quality,
    audioBitrate: audio.bitrate,
    sampleRate: audio.sampleRate,
    volume: audio.volume,

    // Filters.
    deband: filters.deband,
    deshake: filters.deshake,
    deflicker: filters.deflicker,
    dejudder: filters.dejudder,
    denoise: filters.denoise,
    deinterlace: filters.deinterlace,
    brightness: filters.brightness,
    contrast: filters.contrast,
    saturation: filters.saturation,
    gamma: filters.gamma,
    acontrast: filters.acontrast,

    // Options.
    extra: options.extra,
    loglevel: options.loglevel,
  };
  return opt;
}

function transformToJSON(formData) {
  const {
    format, video, audio, filters,
  } = formData;

  const json = {
    format: {
      container: format.container,
      clip: format.clip,
      startTime: format.startTime,
      stopTime: format.stopTime,
    },
    video: {
      codec: codecMap[video.codec],
      preset: video.preset,
      hardware_acceleration_option: video.hardware_acceleration_option,
      pass: video.pass,
      crf: video.crf,
      bitrate: video.bitrate,
      minrate: video.minrate,
      maxrate: video.maxrate,
      bufsize: video.bufsize,
      gopsize: video.gopsize,
      pixel_format: video.pixel_format,
      frame_rate: video.frame_rate,
      speed: video.speed,
      tune: video.tune,
      profile: video.profile,
      level: video.level,
      faststart: video.faststart,
      size: video.size,
      width: video.width,
      height: video.height,
      format: video.format,
      aspect: video.aspect,
      scaling: video.scaling,
      codec_options: video.codec_options,
    },
    audio: {
      codec: codecMap[audio.codec],
      channel: audio.channel,
      quality: audio.quality,
      bitrate: audio.bitrate,
      sampleRate: audio.sampleRate,
      volume: audio.volume,
    },
    filter: {
      deband: filters.deband,
      deshake: filters.deshake,
      deflicker: filters.deflicker,
      dejudder: filters.dejudder,
      denoise: filters.denoise,
      deinterlace: filters.deinterlace,
      brightness: filters.brightness,
      contrast: filters.contrast,
      saturation: filters.saturation,
      gamma: filters.gamma,
      acontrast: filters.acontrast,
    },
  };
  return json;
}

export default {
  transform,
  transformToJSON,
};
