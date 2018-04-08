import * as types from "../mutation-type";

export default {
  actions: {
    openWallet({dispatch, commit}, formData) {
      let accountInfo = Wallet.GetAccountInfoFromPrivateKey(formData.privateKey)
      commit({
        type: types.GENERATE_ACCOUNT_INFO,
        info: accountInfo
      })
    }
  }
}
