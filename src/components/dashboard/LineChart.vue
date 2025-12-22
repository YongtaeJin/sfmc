<template>
  <div style="height:300px">
    <canvas ref="chart"></canvas>
  </div>
</template>

<script>
import Chart from 'chart.js/auto'   // v3+

export default {
  name: 'BarChart',
  props: {
    labels: {
      type: Array,
      default: () => []
    },
    values: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      chart: null
    }
  },
  mounted () {
    this.drawChart()
  },
  beforeDestroy () {
    if (this.chart) this.chart.destroy()
  },
  methods: {
    drawChart () {
      const ctx = this.$refs.chart.getContext('2d')

      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: this.labels,
          datasets: [
            {
              label: '매출',
              data: this.values,
              backgroundColor: '#42a5f5'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      })
    }
  }
}
</script>
