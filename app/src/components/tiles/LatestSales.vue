<template>
  <div>
    <p class="is-uppercase has-text-weight-light">Latest Sales</p>

    <ul>
      <li v-for="(item, index) in latestSales" :key="index">
        {{ item }}
      </li>
    </ul>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'retail-dashboard-tile-latest-sales',

  computed: {
    ...mapGetters([
      'latestSales'
    ])
  }
}
</script>

<style>
  ul {
    margin-top: 0.4rem;
  }
</style>
