<template>
  <div class="has-text-centered">
    <p class="is-uppercase has-text-weight-light">Today's Revenue</p>
    <p class="has-text-weight-bold has-text-dark is-size-2">${{ revenue }}</p>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Moment from 'moment'

export default {
  name: 'retail-dashboard-tile-revenue',

  computed: {
    ...mapGetters([
      'sales'
    ]),

    revenue: function () {
      let today = Moment().format('YYYYMMDD')
      let rev = this.sales[today] ? this.sales[today].total : 0
      return Math.round(rev)
    }
  }
}
</script>
