<template>
  <div class="has-text-centered">
    <p class="is-uppercase has-text-weight-light">Today's Order Count</p>
    <p class="has-text-weight-bold has-text-dark is-size-2">{{ orderCount || 0 }}</p>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'retail-dashboard-tile-order-count',

  computed: {
    ...mapGetters([
      'orderCount'
    ])
  }
}
</script>
