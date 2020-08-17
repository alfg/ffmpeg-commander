const tooltips = [
  { value: 'ffmpeg', tip: 'Command used to run FFmpeg.' },
  { value: '-i', tip: 'Input file.' },
  { value: '-c:v', tip: 'Selects a video codec.' },
  { value: '-c:a', tip: 'Selects an audio codec.' },
  { value: '-ss', tip: 'Specify a start timestamp.' },
  { value: '-to', tip: 'Specify a stop timestamp.' },
  { value: '-preset', tip: 'A preset is a collection of options that will provide a certain encoding speed to compression ratio.' },
  { value: '-tune', tip: 'Use -tune to change settings based upon the specifics of your input.' },
  { value: '-profile:v', tip: 'The -profile:v option limits the output to a specific H.264 profile. Some devices (mostly very old or obsolete) only support the more limited Constrained Baseline or Main profiles. You can set these profiles with -profile:v baseline or -profile:v main.' },
  { value: '-level', tip: 'Set the -profile:v level for h.264.' },
];

export default tooltips;
