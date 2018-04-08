import axios from 'axios'

export default {
  actions: {
    newAccount({dispatch}, formData) {
      return Wallet.generateRandomPrivateKey()
    }
  }
}
