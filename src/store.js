import Vue from 'vue';

export default {
  state: Vue.observable({ wsConnected: false }),

  setWSAction(newValue) {
    this.state.wsConnected = newValue;
  },
};
