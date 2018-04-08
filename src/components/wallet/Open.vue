<template>
  <div class="container-fluid container-open">
    <div class="row justify-content-center">
      <div class="col-lg-8 col-md-9 col-sm-10 col-xs-12">
        <form @submit.prevent="submitOpen">
          <fieldset>
            <legend class="open-title">{{ $t('open.name') }}</legend>

            <div class="form-group">
              <div class="input-group">
                <div class="input-group-prepend">
                  <span class="input-group-text"><i class="fa fa-key" aria-hidden="true"></i></span>
                </div>
                <input :type="[isPrivateKey ? 'text' : 'password']"
                       v-model="privateKey"
                       v-validate data-vv-rules="required|min:6" data-vv-as="password"
                       class="form-control" name="password" :placeholder="$t('open.privateKeyPlaceholder')">
                <div class="input-group-append" @click="viewPassword">
                  <span class="input-group-text">
                    <i class="fa" :class="[isPrivateKey ? 'fa-eye' : 'fa-eye-slash']" aria-hidden="true"></i>
                  </span>
                </div>
              </div>
              <small class="form-text text-muted err-message" v-show="errors.has('password')">{{ errors.first('password') }}</small>
            </div>
          </fieldset>
          <button class="btn btn-outline-success btn-submit">{{ $t('open.name') }}</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "open",
    data() {
      return {
        privateKey: '',
        isPrivateKey: false
      }
    },
    methods: {
      viewPassword() {
        this.isPrivateKey = !this.isPrivateKey
      },
      submitOpen() {
        this.$store.dispatch('hideNotification')

        this.$validator.validateAll().then(result => {
          if (result) {
            let formData = {
              privateKey: this.privateKey
            }
            this.$store.dispatch('openWallet', formData).then(response => {
              if (response !== false) {
                this.$router.push({name: 'Wallet'})
              }
            })
          }
        })
      }
    }
  }
</script>

<style scoped>
  .container-open {
    margin-top: 15%;
  }

  .open-title {
    margin: 30px 0;
  }

  .btn-submit {
    border-radius: 0;
    width: 120px;
  }

  .err-message {
    color: #ff0264 !important;
  }
</style>
