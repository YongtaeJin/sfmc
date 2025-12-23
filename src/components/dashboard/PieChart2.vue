<template>
  <div style="height:190px">
    <canvas ref="chart"></canvas>
  </div>
</template>

<script>
import Chart from 'chart.js/auto';   // v3+
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {getDay, dateToKoreanYM} from '../../../util/lib';
Chart.register(ChartDataLabels)

export default {
  name: 'PieChart2',
  
  data () {
    return {
      chart: null,
      data : {
        labels: [],
        datasets: [
          {
            type: 'pie' ,
            label: '공정불량율',
            data: [10, 20, 30, 40, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],           
            borderWidth: 1,
          },
      
        ],
      },
    }
  },
  mounted () {
    this.drawChart()
  },
  beforeDestroy () {
    if (this.chart) this.chart.destroy()
  },
  methods: {    
    async drawChart() {
      const yymm = getDay().substring(0, 7);      
      const ctx = this.$refs.chart.getContext('2d')
      const res = await this.$axios.post(`/api/maindashboard/getPieChart2`, {today: yymm});

      const items = res.map(item => item.n_process);
      const values = res.map(item => item.p_per);
      
      if (!res?.length) {
        this.data.datasets[0].data = [];
      } else {
        this.data.labels = items;
        this.data.datasets[0].data = values;
      }      
      this.chart = new Chart(ctx, {
        type: 'pie',
        data: this.data,
        options: {
          responsive: true,
          maintainAspectRatio: false,          
          plugins: {
               title: { display: true, text:`${dateToKoreanYM(getDay())} 공정별 불량율`, position: 'top', align: 'start',
                          font: {size: 20, weight: 'bold', family: 'Arial'},
                    },
               legend: {position: 'bottom', },
               datalabels: { display: (ctx) => {const value = Number(ctx.dataset.data[ctx.dataIndex] ?? 0); return value > 0; },
                             formatter: (value, context) => { const label = context.chart.data.labels?.[context.dataIndex] ?? ''; return `${label}\n${Number(value).toLocaleString()}`; },
                           },
          },
        },
      })
      
    },

  }
}
</script>
