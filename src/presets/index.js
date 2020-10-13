/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */

const presetOptions = {
  general: [
    { name: 'H264 Very Fast 1080p30', value: 'h264-very-fast-1080p30' },
    { name: 'H264 Very Fast 720p30', value: 'h264-very-fast-720p30' },
    { name: 'H264 Very Fast 480p30', value: 'h264-very-fast-480p30' },
    { name: 'H264 Fast 1080p30', value: 'h264-fast-1080p30' },
    { name: 'H264 Fast 720p30', value: 'h264-fast-720p30' },
    { name: 'H264 Fast 480p30', value: 'h264-fast-480p30' },
    { name: 'H264 High Profile Level 4.2 6000K 1080p', value: 'h264-high-profile-level-4.2-6000-1080p' },
    { name: 'H264 Main Profile Level 4.0 3000K 720p', value: 'h264-main-profile-level-4.0-3000-720p' },
    { name: 'H264 Main Profile Level 3.1 1000K 480p', value: 'h264-main-profile-level-3.1-1000-480p' },
    { name: 'H264 Baseline Profile Level 3.0 600K 360p', value: 'h264-baseline-profile-level-3.0-600-360p' },
    { name: 'VP9 3000K 1080p', value: 'vp9-3000-1080p' },
    { name: 'VP9 1500K 720p', value: 'vp9-1500-720p' },
  ],
  custom: [
    { name: 'Custom', value: 'custom' },
  ],
  saved: [],
};

function getPresetOptions() {
  presetOptions.saved = JSON.parse(window.localStorage.getItem('presets'));
  return presetOptions;
}

function getPreset(preset) {
  const r = preset.replace('./', '').replace('.json', '');
  const item = require(`./${r}`);
  return item;
}

function getPresetFromLocalStorage(preset) {
  const data = JSON.parse(window.localStorage.getItem('presets'));
  const item = data.find(o => o.name === preset).data;
  console.log(item);
  return item;
}


export default {
  getPresetOptions,
  getPreset,
  getPresetFromLocalStorage,
};
