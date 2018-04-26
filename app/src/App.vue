<template>
  <div id="app">
    <dashboard-nav-bar/>
    <div class="container">
      <router-view/>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import DashboardNavBar from '@/components/NavBar'

Vue.component('dashboard-nav-bar', DashboardNavBar)

export default {
  name: 'App'
}
</script>
