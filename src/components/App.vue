<template>
  <div>
    <top-nav></top-nav>
    <div class="container-div"></div>
    <notification></notification>
    <router-view></router-view>
    <input-pwd-modal></input-pwd-modal>
  </div>
</template>

<script>
  import TopNav from './common/TopNav'
  import Notification from './common/Notification'
  import InputPwdModal from './modals/InputPwd'
  import {mapActions} from 'vuex'

  export default {
    name: 'app',
    watch: {
      '$route': 'hideNotification'
    },
    methods: {
      ...mapActions([
        'hideNotification'
      ])
    },
    components: {
      TopNav,
      Notification,
      InputPwdModal
    }
  }
</script>

<style>
  @import url("https://fonts.googleapis.com/css?family=Montserrat:300,400,500,700,900");

  body {
    font-family: "PingFang SC", Verdana, "Microsoft YaHei", "微软雅黑", sans-serif;
    background-color: #fcfcfc;
  }
</style>

