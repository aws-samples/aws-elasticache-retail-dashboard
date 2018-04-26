<template>
  <section class="section">
    <div class="tile is-ancestor">
      <div class="tile is-4 is-parent">
        <div class="tile is-child box">
          <revenue-tile/>
        </div>
      </div>
      <div class="tile is-4 is-parent">
        <div class="tile is-child box">
          <order-count-tile/>
        </div>
      </div>
      <div class="tile is-parent">
        <div class="tile is-child box">
          <unique-items-count-tile/>
        </div>
      </div>
    </div>

    <!-- second row -->
    <div class="tile is-ancestor">
      <div class="tile is-8 is-parent">
        <div class="tile is-child box">
          <sales-revenue-tile/>
        </div>
      </div>
      <div class="tile is-4 is-vertical is-parent">
        <div class="tile is-child box">
          <latest-sales-tile/>
        </div>
        <div class="tile is-child box">
          <popular-items-tile/>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import Vue from 'vue'
import OrderCountTile from './tiles/OrderCount'
import UniqueItemsCountTile from './tiles/UniqueItemsCount'
import PopularItemsTile from './tiles/PopularItems'
import LatestSalesTile from './tiles/LatestSales'
import SalesRevenueTile from './tiles/SalesRevenue'
import RevenueTile from './tiles/Revenue'

Vue.component('order-count-tile', OrderCountTile)
Vue.component('unique-items-count-tile', UniqueItemsCountTile)
Vue.component('popular-items-tile', PopularItemsTile)
Vue.component('latest-sales-tile', LatestSalesTile)
Vue.component('sales-revenue-tile', SalesRevenueTile)
Vue.component('revenue-tile', RevenueTile)

export default {
}
</script>
