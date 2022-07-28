interface IO {
  input: string;
  output: string;
}

interface Format {
  container: string | null;
  clip: boolean;
  startTime: string;
  stopTime: string;
}

interface Video {
  codec: string;
  preset: string;
  pass: string;
  crf: string;
  bitrate: string;
  minrate: string;
  maxrate: string;
  bufsize: string;
  gopsize: string;
  pixel_format: string;
  frame_rate: string;
  speed: string;
  tune: string;
  profile: string;
  level: string;
  faststart: boolean;
  size: string;
  width: string;
  height: string;
  format: string;
  aspect: string;
  scaling: string;
  codec_options: string;
}

interface Audio {
  codec: string;
  channel: string;
  quality: string;
  bitrate: string;
  sampleRate: string;
  volume: string;
}

interface Filters {
  deband: boolean;
  deshake: boolean;
  deflicker: boolean;
  dejudder: boolean;
  denoise: string;
  deinterlace: string;
  brightness: string;
  contrast: string;
  saturation: string;
  gamma: string;
  acontrast: string;
}

interface Options {
  extra: string;
  loglevel: string;
}

export interface IFFMpegOptionsForm {
  io: IO;
  format: Format;
  video: Video;
  audio: Audio;
  filters: Filters;
  options: Options;
}
