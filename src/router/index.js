import Vue from 'vue';
import Router from 'vue-router';

import Login from '@/components/login';
import Chat from '@/components/chat';

// 安装路由
Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Login',
      component: Login
    }, 
    {
      path: '/chat',
      name: 'Chat',
      component: Chat
    }
  ]
});
