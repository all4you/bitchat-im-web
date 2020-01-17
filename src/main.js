// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import router from './router';
import axios from 'axios';
import App from './App';
// 通过CommonJS规范引入模块
import BitSocket from '@/ws/bitsocket.js';
const bs = new BitSocket({
  'host' : '127.0.0.1',
  'port' : 8864,
  'path' : '/ws'
});

// 导入 ElementUI
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

// 安装 ElementUI
Vue.use(ElementUI);

// 等待若干毫秒 
// 如：await sleep(2000);
var sleep = function(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// 设置axios
Vue.prototype.$axios = axios;
// 设置bitsocket
Vue.prototype.$bs = bs;
Vue.prototype.$sleep = sleep;
Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
});
