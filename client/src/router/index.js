import Vue from 'vue'
import Router from 'vue-router'
import TradeSubmit from '../components/TradeSubmit.vue'
import TradeConfirm from '../components/TradeConfirm.vue'
import TradeSend from '../components/TradeSend.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
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
    }
  ]
})
