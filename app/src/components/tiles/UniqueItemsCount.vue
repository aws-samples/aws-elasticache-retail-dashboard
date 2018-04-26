<template>
  <div class="has-text-centered">
    <p class="is-uppercase has-text-weight-light">Today's Unique Item Count</p>
    <p class="has-text-weight-bold has-text-dark is-size-2">{{ uniqueItemCount || 0 }}</p>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'retail-dashboard-tile-order-count',

  computed: {
    ...mapGetters([
      'uniqueItemCount'
    ])
  }
}
</script>
