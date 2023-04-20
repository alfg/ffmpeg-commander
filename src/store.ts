import Vue from 'vue';

export default {
  state: Vue.observable({
    wsConnected: false,
    isEncoding: false,
    ffmpegdEnabled: false,
  }),

  setWSAction(newValue: boolean) {
    this.state.wsConnected = newValue;
  },

  setIsEncoding(newValue: boolean) {
    this.state.isEncoding = newValue;
  },

  setFfmpegdEnabled(newValue: boolean) {
    this.state.ffmpegdEnabled = newValue;
  },
};
