import Vue from 'vue'
import Router from 'vue-router'
import Store from '../store/index'

import Home from '@/components/home/Index'
import Create from '@/components/wallet/Create'
import Open from '@/components/wallet/Open'
import Wallet from '@/components/wallet/Info'

Vue.use(Router)

let routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {requiresAuth: true}
  },
  {
    path: '/create',
    name: 'Create',
    component: Create
  },
  {
    path: '/open',
    name: 'Open',
    component: Open
  },
  {
    path: '/wallet',
    name: 'Wallet',
    component: Wallet,
    meta: {requiresAuth: true}
  }
]

const router = new Router({
  routes: routes
})

router.beforeEach((to, from, next)=> {
  // If open wallet
  if (to.meta.requiresAuth) {
    if (Store.state.BlockChain.AccountInfo.address === '') {
      return next({'name': 'Open'})
    }
  }

  next()
})

export default router
