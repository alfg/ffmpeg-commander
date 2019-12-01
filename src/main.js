import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import VueHighlightJS from 'vue-highlightjs';
import App from './App.vue';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import '@/assets/highlightjs.css';

Vue.use(BootstrapVue);
Vue.use(VueHighlightJS);

Vue.config.productionTip = false;

new Vue({
  render: h => h(App),
}).$mount('#app');
