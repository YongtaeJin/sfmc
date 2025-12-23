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
  name: 'PieChart1',
  
  data () {
    return {
      chart: null,
      data : {
        labels: [],
        datasets: [
          {
            type: 'doughnut' ,
            label: '일 평균생산량',
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
      const res = await this.$axios.post(`/api/maindashboard/getPieChart1`, {today: yymm});

      const items = res.map(item => item.n_item);
      const values = res.map(item => item.m_dayavgcnt);
      if (!res?.length) {
        this.data.datasets[0].data = [];
      } else {
        this.data.labels = items;
        this.data.datasets[0].data = values;
      }      
      this.chart = new Chart(ctx, {
        type: 'doughnut',
        data: this.data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '45%', // 도넛 두께
          plugins: {
               title: { display: true, text:`${dateToKoreanYM(getDay())} 일평균 생산량`, position: 'top', align: 'start',
                          font: {size: 20, weight: 'bold', family: 'Arial'},
                    },
               legend: {position: 'bottom', },
               datalabels: { display: true, color: '#fff', formatter: (v) => String(v),}, // ✅ 이 차트에서는 표시 안 함
          },
        },
      })
      
    },

  }
}
</script>
