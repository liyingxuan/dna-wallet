import Vue from 'vue'
import Vuex from 'vuex'

import Notification from './modules/notification'
import Create from './modules/create'
import Open from './modules/open'
import BlockChain from './modules/block-chain'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    Notification,
    Create,
    Open,
    BlockChain
  }
})
