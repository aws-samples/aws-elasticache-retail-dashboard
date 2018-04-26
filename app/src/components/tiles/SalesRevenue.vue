<template>
  <div>
    <p class="is-uppercase has-text-weight-light">Weekly Sales Revenue</p>
    <div>
      <canvas id="chart"></canvas>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Chart from 'chart.js'
import Moment from 'moment'

export default {
  name: 'retail-dashboard-tile-sales-revenue',

  data () {
    return {
      chart: null
    }
  },

  computed: {
    ...mapGetters([
      'sales'
    ]),

    chartLabels: function () {
      return Object.keys(this.sales).map((d) => { return Moment(d).format('MMM-DD') })
    },

    chartData: function () {
      return Object.entries(this.sales).map((d) => { return d[1].total })
    },

    chartDataSet: function () {
      return {
        labels: this.chartLabels,
        datasets: [{
          label: 'Sales Revenue',
          data: this.chartData,
          fill: false,
          borderColor: 'hsl(171, 100%, 41%)',
          lineTension: 0.1
        }]
      }
    }
  },

  watch: {
    sales: function (val) {
      this.chart.data = this.chartDataSet
      this.chart.update()
    }
  },

  mounted () {
    let ctx = document.getElementById('chart')
    this.chart = new Chart(ctx, {
      type: 'line',
      data: this.chartDataSet,
      options: {
        scales: {
          yAxes: [{
            ticks: {
              callback: (val) => '$' + val
            }
          }]
        },
        tooltips: {
          callbacks: {
            label: (item, data) => '$' + item.yLabel.toFixed(2)
          }
        }
      }
    })
  }
}
</script>
