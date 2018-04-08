<template>
  <div class="container-fluid container-wallet">
    <div class="container">
      <div>
        <label>{{ $t('wallet.height') }}</label>
        <span>{{ nodeInfo.height }}</span>
      </div>
      <div>
        <label>{{ $t('wallet.address') }}</label>
        <span>{{ accountInfo.address }}</span>
      </div>

      <table class="table table-hover table-margin">
        <thead>
        <tr>
          <th scope="col">{{ $t('wallet.assetName') }}</th>
          <th scope="col">{{ $t('wallet.assetID') }}</th>
          <th scope="col">{{ $t('wallet.balanceView') }}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(asset, index) in assets" :class="[index % 2 === 0 ? '' : 'table-primary']">
          <th scope="row">{{ asset.AssetName }}</th>
          <td>{{ asset.AssetID }}</td>
          <td>{{ asset.balanceViewFormat }}</td>
        </tr>
        </tbody>
      </table>

      <form @submit.prevent="generateTransaction" class="form-margin">
        <div class="form-group">
          <label for="select-asset">{{ $t('wallet.selectAsset') }}</label>
          <select class="form-control" id="select-asset" v-model="assetIndex">
            <option v-for="(asset, index) in assets" v-bind:value="index">{{ asset.AssetName }}</option>
          </select>
        </div>

        <div class="form-group">
          <div class="input-group">
            <div class="input-group-prepend">
              <span class="input-group-text"><i class="fa fa-paper-plane" aria-hidden="true"></i></span>
            </div>
            <input v-model="toAddress"
                   v-validate data-vv-rules="required" data-vv-as="to address"
                   :class="{'input': true, 'is-danger': errors.has('to-address') }"
                   type="text" class="form-control" name="to-address" :placeholder="$t('wallet.toAddressPlaceholder')">
          </div>
          <small class="form-text text-muted err-message" v-show="errors.has('to-address')">{{ errors.first('to-address') }}</small>
        </div>

        <div class="form-group">
          <div class="input-group">
            <div class="input-group-prepend">
              <span class="input-group-text"><i class="fa fa-btc" aria-hidden="true"></i></span>
            </div>
            <input v-model="amount"
                   v-validate data-vv-rules="required|decimal:8" data-vv-as="amount"
                   :class="{'input': true, 'is-danger': errors.has('amount') }"
                   type="text" class="form-control" name="amount" :placeholder="$t('wallet.amountPlaceholder')">
          </div>
          <small class="form-text text-muted err-message" v-show="errors.has('amount')">{{ errors.first('amount') }}</small>
        </div>

        <button class="btn btn-outline-success btn-submit">{{ $t('wallet.submit') }}</button>
      </form>
    </div>
  </div>
</template>

<script>
  import {mapState} from 'vuex'

  export default {
    name: "wallet",
    data() {
      return {
        assetID: '',
        toAddress: '',
        amount: 0,
        assetIndex: ''
      }
    },
    created() {
      this.$store.dispatch('getHeight')
      this.$store.dispatch('getUnspent')
    },
    computed: {
      ...mapState({
        accountInfo: state => state.BlockChain.AccountInfo,
        nodeInfo: state => state.BlockChain.NodeInfo,
        assets: state => state.BlockChain.Assets,
      })
    },
    methods: {
      generateTransaction() {
        if (this.accountInfo.address === '') {
          $("#inputPwdModal").modal("show")
        } else {
          this.$validator.validateAll().then(result => {
            if (result) {
              const transactionData = {
                assetID: this.assets[this.assetIndex].AssetID,
                amount: this.amount,
                toAddress: this.toAddress,
                coins: this.assets[this.assetIndex]
              }
              this.$store.dispatch('generateTransaction', transactionData).then(response => {
                console.log(response)
                // Do something ...
              })
            }
          })
        }
      }
    }
  }
</script>

<style scoped>
  .container-wallet {
    margin-top: 12%;
  }

  .form-margin{
    margin-top: 50px;
  }

  .table-margin {
    margin-top: 30px;
  }

  .btn-submit {
    border-radius: 0;
    min-width: 120px;
  }

  .err-message {
    color: #ff0264 !important;
  }
</style>
