import Vue from 'vue'
import Router from 'vue-router'
import TradeSubmit from '../components/TradeSubmit.vue'
import TradeConfirm from '../components/TradeConfirm.vue'
import TradeSend from '../components/TradeSend.vue'
import Login from '../components/Login.vue'
import Signup from '../components/Signup.vue'
import ResetPassword from '../components/ResetPassword.vue'
import storageAvailable from 'storage-available'
import currUser from '../stores/CurrUserStore'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/tradeSubmit',
      name: 'tradeSubmit',
      component: TradeSubmit,
      meta: { requiresLogin: true }
    },
    {
      path: '/confirm/:recipient',
      name: 'tradeConfirm',
      component: TradeConfirm
    },
    {
      path: '/send/:sender',
      name: 'tradeSend',
      component: TradeSend
    },
    {
      path: '/',
      name: 'login',
      component: Login
    },
    {
      path: '/register',
      name: 'register',
      component: Signup
    },
    {
      path: '/reset/:token',
      name: 'resetPassword',
      component: ResetPassword
    },
    {
      path: '/login',
      redirect: '/'
    }
  ]
});

function isLoggedIn() {
  if(storageAvailable('localStorage')) {
    return window.localStorage.length && window.localStorage.getItem('currUser');
  } else {
    return currUser.username;
  }
}

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresLogin)) {
    if(!isLoggedIn()) {
      next({
        path: '/login'
      })
    } else {
      next()
    }
  } else {
    next()
  }
});

export default router
