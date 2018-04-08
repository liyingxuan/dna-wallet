<template>
  <nav class="navbar navbar-expand-xl navbar-expand-lg navbar-expand-md navbar-expand-sm fixed-top navbar-light">

    <router-link class="navbar-brand" :to="{path: '/'}">
      <!--<img class="navbar-logo" src="./../../assets/logo.png" alt="">-->
      {{ $t('navbar.logo') }}
    </router-link>

    <div class="collapse navbar-collapse" id="navbarColor03">
      <ul class="navbar-nav mr-auto"></ul>

      <ul class="navbar-nav">
        <li class="nav-item">
          <a class="nav-link change-locale" @click.prevent="changeLocale">{{ $t('language.name') }}</a>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" :to="{name: 'Create'}">{{ $t('navbar.create') }}</router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" :to="{name: 'Open'}">{{ $t('navbar.open') }}</router-link>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script>
  import LangStorage from './../../helpers/lang'

  export default {
    name: 'TopNav',
    methods: {
      changeLocale() {
        let locale = this.$i18n.locale
        locale === 'zh' ? this.$i18n.locale = 'en' : this.$i18n.locale = 'zh'
        LangStorage.setLang(this.$i18n.locale)
        this.$validator.localize(this.$i18n.locale)
      }
    }
  }
</script>

<style>
  .navbar-logo {
    height: 50px;
    margin-right: 5px;
    padding-bottom: 3px;
  }

  .change-locale:hover {
    cursor: pointer;
  }
</style>
