<template>
  <nav class="navbar is-light">
    <div class="container">
      <div class="navbar-brand">
        <router-link to="/" class="navbar-item">
          <b-icon icon="database" size="is-medium"></b-icon>
          <span>ElastiCache Retail Sales</span>
        </router-link>

        <div class="navbar-burger burger">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <div class="navbar-menu">
        <div class="navbar-end">
          <div class="navbar-item">
            <b-icon icon="circle" size="is-small" :class="connectionClass"></b-icon>
            {{ isConnected ? 'Connected' : 'Not Connected' }}
          </div>
        </div>
      </div>

    </div>
  </nav>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'retail-dashboard-nav-bar',

  computed: {
    ...mapGetters([
      'isConnected'
    ]),

    connectionClass () {
      return this.isConnected ? 'green' : 'red'
    }
  }
}
</script>

<style>
  span.icon {
    margin-right: 0.5rem;
  }

  nav {
    border-top: 0.3rem solid hsl(217, 71%, 53%);
  }

  span.green {
    color: hsl(141, 71%, 48%);
  }

  span.red {
    color: hsl(348, 100%, 61%);
  }
</style>
