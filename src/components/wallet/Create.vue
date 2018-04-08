<template>
  <div class="container-fluid container-create">
    <div class="row justify-content-center">
      <div class="col-lg-8 col-md-9 col-sm-10 col-xs-12">
        <form @submit.prevent="submitCreate" v-show="!isShowPrivateKey">
          <fieldset>
            <legend class="create-title">{{ $t('create.tit') }}</legend>

            <div class="form-group">
              <div class="input-group">
                <div class="input-group-prepend">
                  <span class="input-group-text"><i class="fa fa-key" aria-hidden="true"></i></span>
                </div>
                <input :type="[isShowPassword ? 'text' : 'password']"
                       v-model="password"
                       v-validate data-vv-rules="required|min:6" data-vv-as="password"
                       class="form-control" name="password" :placeholder="$t('create.passwordPlaceholder')">
                <div class="input-group-append" @click="viewPassword">
                  <span class="input-group-text">
                    <i class="fa" :class="[isShowPassword ? 'fa-eye' : 'fa-eye-slash']" aria-hidden="true"></i>
                  </span>
                </div>
              </div>
              <small class="form-text text-muted err-message" v-show="errors.has('password')">{{ errors.first('password') }}</small>
            </div>
          </fieldset>
          <button class="btn btn-outline-success btn-submit">{{ $t('create.submit') }}</button>
        </form>

        <div class="form-group" v-show="isShowPrivateKey">
          <label for="my-private-key">{{ $t('create.privateKey') }}</label>
          <textarea class="form-control" id="my-private-key" rows="3">{{ this.privateKey }}</textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
	export default {
    name: "create",
    data() {
      return {
        password: '',
        isShowPassword: false,
        isShowPrivateKey: false,
        privateKey: ''
      }
    },
    methods: {
      viewPassword() {
        this.isShowPassword = !this.isShowPassword
      },
      submitCreate() {
        this.$store.dispatch('hideNotification')

        this.$validator.validateAll().then(result => {
          if (result) {
            let formData = {
              password: this.password
            }

            this.$store.dispatch('newAccount', formData).then(response => {
              this.privateKey = response
              this.isShowPrivateKey = true
            })
          }
        })
      }
    }
  }
</script>

<style scoped>
  .container-create {
    margin-top: 15%;
  }

  .create-title {
    margin: 30px 0;
  }

  .btn-submit {
    border-radius: 0;
    min-width: 120px;
  }

  .err-message {
    color: #ff0264 !important;
  }
</style>
