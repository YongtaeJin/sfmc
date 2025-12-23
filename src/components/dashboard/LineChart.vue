<template>
  <div style="height:220px">
    <canvas ref="chart"></canvas>
  </div>
</template>

<script>
import Chart from 'chart.js/auto'   // v3+
import {getYYYYmmdd} from '../../../util/lib';
const MONTH_KEYS = ['M01','M02','M03','M04','M05','M06','M07','M08','M09','M10','M11','M12',];
const MONTHA_KEYS = ['A01','A02','A03','A04','A05','A06','A07','A08','A09','A10','A11','A12',];


export default {
  name: 'BarChart',
  
  data () {
    return {
      chart: null,
      data : {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            type: 'bar' ,
            label: '월 매출액',
            data: [10, 20, 30, 40],
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgb(255, 99, 132)',
            borderWidth: 1,
          },
          {
            type: 'line',
            label: '월 누적 매출액',
            data: [10, 30, 60, 100],
            borderColor: 'rgb(54, 162, 235)',
            borderWidth: 2,
            fill: false,
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
      const yy = getYYYYmmdd().substring(0, 4);
      
      const ctx = this.$refs.chart.getContext('2d');
      const res = await this.$axios.post(`/api/maindashboard/getLineChart`, {today: yy});
      console.log(res.length)

      if (res.length) {
        this.data.datasets[0].data = this.mapMonthlyData(res[0]);
        this.data.datasets[1].data = this.mapMonthlyAData(res[0]);;
      } else {
        this.data.datasets[0].data = Array(12).fill(0);
        this.data.datasets[1].data = Array(12).fill(0);
      }

      this.chart = new Chart(ctx, {
        type: 'bar',
        data: this.data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true },
          },
          plugins: {
            title: { display: true, text:`${yy}년 매출액`, 
                     font: {size: 24, weight: 'bold', family: 'Arial'},
                   },
            datalabels: { display: false }, // ✅ 이 차트에서는 표시 안 함
          },
        },
      })
      
    },
    //
    mapMonthlyData(row) {
      return MONTH_KEYS.map((k) => Number(String(row[k] ?? 0).replace(/,/g, '')));
    },
    mapMonthlyAData(row) {
      return MONTHA_KEYS.map((k) => Number(String(row[k] ?? 0).replace(/,/g, '')));
    }
  }
}
</script>
