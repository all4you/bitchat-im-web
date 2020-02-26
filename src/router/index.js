import Vue from 'vue';
import Router from 'vue-router';

import Login from '@/components/login';
import Register from '@/components/register';
import Chat from '@/components/chat';

// 安装路由
Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      redirect : '/login'
    }, 
    {
      path: '/login',
      name: 'Login',
      component: Login
    }, 
    {
      path: '/register',
      name: 'Register',
      component: Register
    }, 
    {
      path: '/chat',
      name: 'Chat',
      component: Chat
    }
  ]
});
