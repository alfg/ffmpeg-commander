/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */

const presetOptions = {
  general: [
    { name: 'Very Fast 1080p30', value: 'very-fast-1080p30' },
    { name: 'Very Fast 720p30', value: 'very-fast-720p30' },
    { name: 'Very Fast 480p30', value: 'very-fast-480p30' },
    { name: 'Fast 1080p30', value: 'fast-1080p30' },
    { name: 'Fast 720p30', value: 'fast-720p30' },
    { name: 'Fast 480p30', value: 'fast-480p30' },
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
