import Vue from 'vue';

export default {
  state: Vue.observable({
    wsConnected: false,
    isEncoding: false,
    ffmpegdEnabled: false,
  }),

  setWSAction(newValue) {
    this.state.wsConnected = newValue;
  },

  setIsEncoding(newValue) {
    this.state.isEncoding = newValue;
  },

  setFfmpegdEnabled(newValue) {
    this.state.ffmpegdEnabled = newValue;
  },
};
