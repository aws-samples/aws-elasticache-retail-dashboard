<template>
  <div>
    <p class="is-uppercase has-text-weight-light">All-Time Most Popular</p>

    <ol>
      <li v-for="(item, index) in popularItems" :key="index">
        {{ item.name }} ({{ item.count }})
      </li>
    </ol>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'retail-dashboard-tile-popular-items',

  computed: {
    ...mapGetters([
      'popularItems'
    ])
  }
}
</script>

<style>
  ol {
    margin-left: 0.9rem;
    margin-top: 0.4rem;
  }
</style>
