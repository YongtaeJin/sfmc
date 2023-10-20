<template>
    <div class="justify-center align-center" style="height: 100%">
        <!-- <v-label>{{ `기준일자 : ${data.s_day}` }}</v-label>   <v-btn> 조회</v-btn> -->
        <div class="d-flex justify-center align-center" style="height: 100%">
            <v-text-field label="기준일자" v-model="data.s_day" readonly style="max-width:150px;" />  <v-spacer></v-spacer>
            <v-btn @click="view" color="primary"> 조회</v-btn>
        </div>
        <v-data-table ref="kpi3" :headers="kpiHead"  :items="kpiData" 
                item-key="t_no" single-select v-model="kpiDataS"        
                hide-default-footer :items-per-page="-1" 
                class="elevation-1 text-no-wrap" height="500px" max-height="500px" > 
               
        </v-data-table>
    </div>
</template>

<script>
import { getYYYYmmdd, getHHmm, getDate } from '../../../util/lib'
import InputDate from '../../components/InputForms/InputDate.vue';
import InputDate4 from '../../components/InputForms/InputDate4.vue';
export default {
  components: { InputDate, InputDate4 },
    name: "kpiManagerForm",
    props: {
        tabindex: 0 || 0,
        data: { c_com: "", n_com: "", i_kpikey: "", s_day: "", ocrDttm: "",},
        resTime: "",
    },
    created() {
       this.init('create');       
    },
    watch: {
        tabindex: {
            deep: true,
            handler(newItems, oldItems) { },            
        },
        data: {
            deep: true,
            handler(newItems, oldItems) {                
                this.init()               
            }
        }
    },
    computed: {
        chkRes() {           
            return this.form.ocrDttm > getYYYYmmdd()
        },
        btnTitle() {
            return this.chkRes ? "예 약" : "전 송"
        }
    },
    data() {
        return {
            tab : this.tabindex || 0,
            row : null,
            form : { c_com: "",
                     kpiCertKey: "", 
                     ocrDttm: "", 
                     s_restime:"", 
                     systmOprYn: "Y",
                     kpiFldCd: "P", 
                     kpiDtlCd: "", 
                     kpiDtlNm: "", 
                     achrt: "",
                     msmtVl: "",
                     unt: "",
                     trsDttm: "",
                     f_tst: "N",
                     i_kpilevel: "",
                     s_day: "",
                     f_sned: "",
                   },
            kpifilds: [], kpifildfilter: [],
            kpi1ResTime: "", kpi2ResTime: "", kpi3ResTime: "",
            kpiHead:[
                {text: '날자',   value: 'ocrDttm',  sortable: false, align:'center', width: "80px"},
                {text: '예약시간',   value: 's_restime',  sortable: false, align:'center', width: "50px"},
                {text: '가동',   value: 'systmOprYn',  sortable: false, align:'center', width: "40px"},
                {text: '성과분야',   value: 'kpiFldCd',  sortable: false, align:'center', width: "80px"},
                {text: '성과지표',   value: 'kpiDtlCd',  sortable: false, align:'center', width: "160px"},                
                {text: '성치율',   value: 'achrt',  sortable: false, align:'center', width: "50px"},
                {text: '수치',   value: 'msmtVl',  sortable: false, align:'center', width: "50px"},
                {text: '단위',   value: 'unt',  sortable: false, align:'center', width: "50px"},
                {text: '결과',   value: 'f_err',  sortable: false, align:'center', width: "40px"},
            ],
            kpiData:[], kpiDataS:[]
             
        }
    },
    methods: {
        async init(chk) {
            if (chk == 'create') {                                
                this.kpifilds = await this.$axios.post(`/api/kpi/getKpiFild`); 
                this.kpifildfilter = this.kpifilds.filter(function(item) { return item.c_gcode == `KPIP`; });
                
            }
            this.form.ocrDttm  = this.data.ocrDttm;
            this.form.kpiCertKey = this.data.i_kpikey;             
            this.form.s_day    = this.data.s_day; 
            this.form.s_restime = this.resTime;
        
        },
        async view() {
            this.kpiData = await this.$axios.post(`/api/kpi/kpiJoblist`, this.data); 
            console.log(this.kpiData.length)
        },
      
        changeFild(Cd) {            
            this.kpifildfilter = this.kpifilds.filter(function(item) { return item.c_gcode == `KPI${Cd}`; });         
            this.form.kpiDtlCd = ""
            this.form.kpiDtlNm = ""
            this.form.achrt    = ""
            this.form.msmtVl   = ""
            this.form.unt      = ""
        },
        onChangeKPIDt(Dt) {
            const index = this.kpifildfilter.findIndex((i) => i.c_code == Dt);            
            if (index >= 0) {
                this.form.kpiDtlNm = this.kpifildfilter[index].n_code;
                this.form.unt      = this.kpifildfilter[index].s_buf1;
            } 

        }
    }
}
</script>

<style>

</style>
