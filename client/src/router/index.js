import Vue from 'vue'
import Router from 'vue-router'
import TradeSubmit from '../components/TradeSubmit.vue'
import TradeConfirm from '../components/TradeConfirm.vue'
import TradeSend from '../components/TradeSend.vue'
import Login from '../components/Login.vue'
import Signup from '../components/Signup.vue'
import ResetPassword from '../components/ResetPassword.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/tradeSubmit',
      name: 'tradeSubmit',
      component: TradeSubmit
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
    }
  ]
})
