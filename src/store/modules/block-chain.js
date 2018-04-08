import axios from 'axios'
import * as types from "../mutation-type"
import qs from 'qs'

export default {
  state: {
    AccountInfo: {
      privateKey: '',
      publicKeyEncoded: '',
      publicKey: '',
      programHash: '',
      address: ''
    },
    NodeInfo: {
      height: 0
    },
    Assets: {}
  },
  mutations: {
    [types.GENERATE_ACCOUNT_INFO](state, payload) {
      state.AccountInfo = payload.info
    },
    [types.SET_USER_INFO](state, payload) {
      state.UserInfo = payload.info
    },
    [types.SET_NODE_INFO](state, payload) {
      state.NodeInfo.height = payload.info
    },
    [types.SET_ASSETS](state, payload) {
      state.Assets = payload.info
    }
  },
  actions: {
    getHeight({dispatch, commit}) {
      return axios.get(process.env.BC_URL + 'block/height?auth_type=getblockheight').then(response => {
        if (response.data.Desc === 'SUCCESS') {
          commit({
            type: types.SET_NODE_INFO,
            info: response.data.Result
          })
        } else {
          console.log(response)
        }
      }).catch(error => {
        console.log(error)
      })
    },
    getUnspent({dispatch, commit}) {
      return axios.get(process.env.BC_URL + 'asset/utxos/' + this.state.BlockChain.AccountInfo.address).then(response => {
        if (response.data.Desc === 'SUCCESS') {
          commit({
            type: types.SET_ASSETS,
            info: Wallet.analyzeCoins(response.data.Result)
          })
        } else {
          console.log(response.data)
          return false
        }
      }).catch(error => {
        console.log(error)
        return false
      })
    },
    generateTransaction({dispatch}, transactionData) {
      let txRawData = Transaction.makeTransfer(transactionData.coins, transactionData.assetID, transactionData.amount, transactionData.toAddress, this.state.BlockChain.AccountInfo)
      return dispatch('axiosPost_inBC', txRawData).then(response => {
        if (response.Desc !== 'SUCCESS') {
          console.log(response)
        }
        return response
      })
    },
    /**
     * Ret format
     *
     * { "Action": "xxx",
     *   "Desc": "SUCCESS",
     *   "Error": 0,
     *   "Result": { },
     *   "Version": "1.0.0" }
     *
     * { "Action": "xxx",
     *   "Desc": "INVALID USER",
     *   "Error": 42004,
     *   "Result": "",
     *   "Version": "1.0.0" }
     *
     * @param {dispatch}
     * @param $txRawData
     * @return {Promise<AxiosResponse>}
     */
    axiosPost_inBC({dispatch}, $txRawData) {
      let formData = {
        Action: "sendrawtransaction",
        Version: "1.0.0",
        Type: "",
        Data: $txRawData
      }

      return axios.post(process.env.BC_URL + 'transaction', formData).then(response => {
        return response.data
      }).catch(error => {
        console.log(error)
        return false
      })
    }
  }
}
