/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */

const presetOptions = {
  general: [
    { name: 'Very Fast 1080p', value: 'very-fast-1080p30' },
    { name: 'Very Fast 720p', value: 'very-fast-720p30' },
    { name: 'Fast 1080p', value: 'fast-1080p30' },
    { name: 'Fast 720p', value: 'fast-720p30' },
  ],
  custom: [
    { name: 'Custom', value: 'custom' },
  ],
};

function getPresetOptions() {
  return presetOptions;
}

function getPreset(preset) {
  const r = preset.replace('./', '').replace('.json', '');
  const item = require(`./${r}`);
  return item;
}

export default {
  getPresetOptions,
  getPreset,
};
