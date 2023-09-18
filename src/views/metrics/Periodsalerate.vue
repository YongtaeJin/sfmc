<template>
    <v-container fluid>        
        <v-toolbar height="40px" background-color="primary" dark>
            <v-toolbar-title>기간별 매출 분석</v-toolbar-title>
            <v-spacer/>
           
            <tooltip-btn label="조회" @click="view"><v-icon>mdi-magnify</v-icon></tooltip-btn>
          
        </v-toolbar> 
        <v-card style="display: flex; height: 34px; " class="my-card text-input-blue my-text-fontsize  "> 
            <div style="display: flex;">
                <div style="width: 70px;"><v-text-field value="  수주일 : " readonly dense hide-details class="no-padding"/></div>                
                <input-dateft v-model="form.sDate1" :value2.sync="form.sDate2"/>                
                
            </div>
        </v-card>
        <v-row>
            <v-col col="12" sm="4" md="4">
                <v-data-table ref="table" :headers="Head1" :items="headItem1" @click:row="rowSelectHead1" 
                        item-key="s_ym" single-select v-model="selectedM1"
                        :items-per-page="-1" hide-default-footer :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" 
                        class="elevation-1 text-no-wrap" :height=iframeHeight > 
                    <template v-slot:[`item.s_ym`]="{ item }">                
                        {{ item.s_ym.substring(0,7) }}
                    </template>
                    <template v-slot:[`item.a_orderamt`]="{ item }">                
                        <div class="right2-align"> {{  comma(item.a_orderamt) }}</div>
                    </template>
                    <template v-slot:[`item.p_per`]="{ item }">                        
                        <v-progress-linear :value="calPer(item)"  color="blue" height="18">                        
                            <strong>{{ calPer(item) }}%</strong>                        
                        </v-progress-linear>
                    </template>
                </v-data-table>  
            </v-col>    
            <v-col col="12" sm="8" md="8">
                <v-data-table ref="table2" :headers="Head2" :items="headItem2Filter" @click:row="rowSelectHead2" 
                        item-key="i_orderser" single-select v-model="selectedM2"
                        :items-per-page="-1" hide-default-footer :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" 
                        class="elevation-1 text-no-wrap" :height=iframeHeight > 
                    <template v-slot:[`item.a_amt`]="{ item }">                
                        <div class="right2-align"> {{  comma(item.a_amt) }}</div>
                    </template>
                    
                </v-data-table>  
                
            </v-col>
        </v-row>
    </v-container>  
</template>

<script>
import TooltipBtn from '../../components/etc/TooltipBtn.vue';
import InputDateft from '../../components/InputForms/InputDateft.vue';
import { comma, getDate, dateToKorean, numberToKorean, amtToKorean } from '../../../util/lib';
export default {
    components: { InputDateft, TooltipBtn },
    name: "Periodsalerate",
    mounted() {
        // 창 크기가 변경될 때마다 iframe의 높이를 조정
        window.addEventListener('resize', this.adjustIframeHeight);
        this.adjustIframeHeight(); // 초기 조정 
        this.init();
    },
    beforeDestroy() {
        // 컴포넌트가 파기될 때 리스너 제거
        window.removeEventListener('resize', this.adjustIframeHeight);
    },
    data() {
       return {
           comma, 
           form : {sDate1:"", sDate2:"", sVend:"",},
           iframeHeight: 500, // 초기 높이 설정 (원하는 높이로 초기화)
           Head1: [
                {text: '년월',     value: 's_ym',     sortable: false, align:'center', width: "40px"},                
                {text: '매출액',   value: 'a_orderamt', sortable: false, align:'center', width: "60px"},
                {text: '매출률',   value: 'p_per', sortable: false, align:'center', width: "60px"},
            ],
            headItem1:[], headItem1Info:[], selectedM1: [],
            Head2: [
                {text: '수주번호',    value: 'i_orderno', sortable: false, align:'center', width: "80px"},                
                {text: '수주일',      value: 's_date', sortable: false, align:'center', width: "60px"},
                {text: '거래처',      value: 'n_vend', sortable: false, align:'center', width: "80px"},
                {text: '품목코드',    value: 'c_item', sortable: false, align:'center', width: "60px"},
                {text: '항목(품목)',  value: 'n_item', sortable: false, align:'center', width: "60px"},
                {text: '규격(사양)',  value: 't_size', sortable: false, align:'center', width: "130px"},
                {text: '수주수량',    value: 'm_cnt', sortable: false, align:'center', width: "50px"},
                {text: '수주금액',    value: 'a_amt', sortable: false, align:'center', width: "60px"},
            ],
            headItem2:[], headItem2Info:[], headItem2Filter:[],selectedM2: []
       }
    },
    computed: {
        sum() {
            return this.headItem1.reduce((total, item) => total + (parseInt(item.a_orderamt) || 0), 0);
        },
    },
    methods: {
        adjustIframeHeight() {
        // 브라우저 창의 높이를 iframe의 높이로 설정
            const windowHeight = window.innerHeight;
            this.iframeHeight = windowHeight - 200;
        },
        async init() {
            this.form.sDate1 = getDate(-365, 1);
            this.form.sDate2 = getDate();
            await this.view();
        },
        async view() {    
            this.headItem1Info = [], this.selectedM1 = [];      
            this.headItem2Info = []; this.headItem2Filter=[]; this.selectedM2 = [];
            this.headItem1 = await this.$axios.post(`/api/metrics/getPeriodsalerate`, this.form);
            this.headItem2 = await this.$axios.post(`/api/metrics/getPeriodsaleratedt`, this.form);
        },
        calPer(item) {
            return ((item.a_orderamt / this.sum * 100).toFixed(2))
        },
        rowSelectHead1 :function (item, row) {                              
            if ( this.headItem1Info.s_ym == item.s_ym ) return;
            this.headItem1Info = item;  
            if (row) { row.select(true) } else { this.selectedM1 = [item] } ;
            if (this.headItem2.length > 0) {
                this.headItem2Filter = this.headItem2.filter((r) => {
                    return r.s_ym == item.s_ym ;
                }); 
            } else {
                this.headItem2Filter = [];
            }
        },
        rowSelectHead2 :function (item, row) {                  
            if ( this.headItem2Info.i_orderser == item.i_orderser ) return;
            this.headItem2Info = item;  
            if (row) { row.select(true) } else { this.selectedM2 = [item] } ;
        },

   },

}
</script>

<style>

</style>