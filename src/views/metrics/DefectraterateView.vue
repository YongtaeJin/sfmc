<template>
    <v-container fluid>        
       <v-toolbar height="40px" background-color="primary" dark>
           <v-toolbar-title>불양율 분석</v-toolbar-title>
           <v-spacer/>
           
           <tooltip-btn label="조회" @click="view"><v-icon>mdi-magnify</v-icon></tooltip-btn>
          
       </v-toolbar> 
       <v-card style="display: flex; height: 34px; " class="my-card text-input-blue my-text-fontsize  "> 
           <div style="display: flex;">
               <div style="width: 70px;"><v-text-field value="  생산예정일 : " readonly dense hide-details class="no-padding"/></div>                
               <input-dateft v-model="form.sDate1" :value2.sync="form.sDate2"/>                
               <!-- <div style="width: 56px;"><v-text-field value="    발주처 : " readonly dense hide-details class="no-padding"/></div>
               <div style="width: 100px;"><v-text-field v-model="form.sVend" dense hide-detail class="text-input-blue no-padding" /></div> -->
           </div>
        </v-card>
        <v-row>
            <v-col>
                <v-toolbar height="25px" color="accent" >
                    <v-toolbar-title>공정별</v-toolbar-title>                    
                </v-toolbar>
                <v-data-table ref="table" :headers="Head1" :items="headItem1" 
                    item-key="c_process" single-select v-model="selectedM1" @click:row="rowSelectHead1" 
                    :items-per-page="-1" hide-default-footer :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" 
                    class="elevation-1 text-no-wrap" height="300px" max-height="300px" > 
                    <template v-slot:[`item.p_per`]="{ item }">                        
                        <v-progress-linear :value="item.p_per"  color="red" height="18">                        
                            <strong>{{ item.p_per }}%</strong>                        
                        </v-progress-linear>
                    </template>
                </v-data-table>   
            </v-col>
            <v-col>
                <v-toolbar height="25px" color="accent" >
                    <v-toolbar-title>품목별</v-toolbar-title>                    
                </v-toolbar>
                <v-data-table ref="table2" :headers="Head2" :items="headItem2" 
                    item-key="c_item" single-select v-model="selectedM2" @click:row="rowSelectHead2" 
                    :items-per-page="-1" hide-default-footer :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" 
                    class="elevation-1 text-no-wrap" height="300px" max-height="300px" > 
                    <template v-slot:[`item.p_per`]="{ item }">                        
                        <v-progress-linear :value="item.p_per"  color="red" height="18">                        
                            <strong>{{ item.p_per }}%</strong>                        
                        </v-progress-linear>
                    </template>
                </v-data-table>   
            </v-col>
            <v-col>
                <v-toolbar height="25px" color="accent" >
                    <v-toolbar-title>원인별</v-toolbar-title>                    
                </v-toolbar>
                <v-data-table ref="table3" :headers="Head3" :items="headItem3" 
                    item-key="f_cause" single-select v-model="selectedM3" @click:row="rowSelectHead3" 
                    :items-per-page="-1" hide-default-footer :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" 
                    class="elevation-1 text-no-wrap" height="300px" max-height="300px" > 
                    <template v-slot:[`item.p_per`]="{ item }">                        
                        <v-progress-linear :value="item.p_per"  color="red" height="18">                        
                            <strong>{{ getCasueper(item) }}%</strong>                        
                        </v-progress-linear>
                    </template>
                </v-data-table>  
            </v-col>
        </v-row>
        <v-row>
            <v-col v-if="tabIndex <= 1">
                <v-toolbar height="25px" color="accent" >
                    <v-toolbar-title>{{getProcName}}</v-toolbar-title>                    
                </v-toolbar>
                <v-data-table ref="table_proc" :headers="ProcHead" :items="procFilter" 
                    item-key="i_makeser" single-select v-model="procS" @click:row="rowSelectProc" 
                    :items-per-page="-1" hide-default-footer :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" 
                    class="elevation-1 text-no-wrap" :height=iframeHeight >

                    <template v-slot:[`item.f_cause`]="{ item }"> {{getErrtypename(item.f_cause)}} </template>
                </v-data-table> 
            </v-col>
            <v-col v-if="tabIndex == 2">
                <v-toolbar height="25px" color="accent" >
                    <v-toolbar-title>{{getItemName}}</v-toolbar-title>                    
                </v-toolbar>
                <v-data-table ref="table_item" :headers="ItemHead" :items="itemFilter" 
                    item-key="i_makeser" single-select v-model="itemS" @click:row="rowSelectItem" 
                    :items-per-page="-1" hide-default-footer :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" 
                    class="elevation-1 text-no-wrap" :height=iframeHeight >

                    <template v-slot:[`item.f_cause`]="{ item }"> {{getErrtypename(item.f_cause)}} </template>
                </v-data-table>
            </v-col>
            <v-col v-if="tabIndex == 3">
                <v-toolbar height="25px" color="accent" >
                    <v-toolbar-title>{{getCauseName}}</v-toolbar-title>                    
                </v-toolbar>
                <v-data-table ref="table_cause" :headers="CauseHead" :items="causeFilter" 
                    item-key="i_makeser" single-select v-model="itemS" @click:row="rowSelectCause" 
                    :items-per-page="-1" hide-default-footer :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" 
                    class="elevation-1 text-no-wrap" :height=iframeHeight >

                    <template v-slot:[`item.f_cause`]="{ item }"> {{getErrtypename(item.f_cause)}} </template>
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
   name: "DefectrateRate",
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
           itemSelect: false, tabIndex: 3,
           errType:[],
           Head1: [
                {text: '공정코드',  value: 'c_process', sortable: false, align:'center', width: "50px"},                
                {text: '공정명',    value: 'n_process', sortable: false, align:'center', width: "60px"},
                {text: '지시수량',  value: 'm_cnt', sortable: false, align:'center', width: "50px"},
                {text: '불량수량',  value: 'm_err', sortable: false, align:'center', width: "50px" },                
                {text: '불량률',    value: 'p_per', sortable: false, align:'center', width: "50px"},
            ],
            Head2: [
                {text: '품목코드',  value: 'c_item', sortable: false, align:'center', width: "50px"},                
                {text: '항목(폼목)',    value: 'n_item', sortable: false, align:'center', width: "100px"},
                {text: '지시수량',  value: 'm_ordcnt', sortable: false, align:'center', width: "50px"},
                {text: '불량수량',  value: 'm_err', sortable: false, align:'center', width: "50px" },                
                {text: '불량률',    value: 'p_per', sortable: false, align:'center', width: "50px"},
            ],            
            Head3:[
                {text: '불량원인',    value: 'n_cause', sortable: false, align:'center', width: "80px"},
                {text: '불량수량',    value: 'm_err', sortable: false, align:'center', width: "50px"},
                {text: '불량률',      value: 'p_per', sortable: false, align:'center', width: "50px"},
                
            ],
            headItem1:[], headItem1Info:[], selectedM1: [], headItem2:[], headItem2Info:[], selectedM2: [], headItem3:[], headItem3Info:[], selectedM3: [],

            ProcHead:[
                {text: '공정코드',  value: 'c_process', sortable: false, align:'center', width: "50px"},                
                {text: '공정명',    value: 'n_process', sortable: false, align:'center', width: "60px"},
                {text: '작업일',    value: 's_workday', sortable: false, align:'center', width: "60px"},
                {text: '발주번호',    value: 'i_orderno', sortable: false, align:'center', width: "60px"},
                {text: '거래처',     value: 'n_vend', sortable: false, align:'center', width: "80px"},
                {text: '항목(품목)', value: 'n_item', sortable: false, align:'center', width: "90px"},
                {text: '작업자',    value: 'n_empnm', sortable: false, align:'center', width: "60px"},
                {text: '불량수량',    value: 'm_err', sortable: false, align:'center', width: "50px"},
                {text: '불량원인',    value: 'f_cause', sortable: false, align:'center', width: "60px"},
            ],
            procItems:[], procFilter:[], procInfo:[], procS:[],
            ItemHead:[
                {text: '폼목코드',    value: 'c_item', sortable: false, align:'center', width: "50px"},
                {text: '항목(폼목)',  value: 'n_item', sortable: false, align:'center', width: "100px"},
                {text: '작업일',    value: 's_workday', sortable: false, align:'center', width: "60px"},
                {text: '공정코드',  value: 'c_process', sortable: false, align:'center', width: "50px"},
                {text: '공정명',    value: 'n_process', sortable: false, align:'center', width: "60px"},                
                {text: '발주번호',    value: 'i_orderno', sortable: false, align:'center', width: "60px"},
                {text: '거래처',     value: 'n_vend', sortable: false, align:'center', width: "80px"},                
                {text: '작업자',    value: 'n_empnm', sortable: false, align:'center', width: "60px"},
                {text: '불량수량',    value: 'm_err', sortable: false, align:'center', width: "50px"},
                {text: '불량원인',    value: 'f_cause', sortable: false, align:'center', width: "60px"},
            ],
            itemItems:[], itemFilter:[], itemInfo:[], itemS:[],
            CauseHead:[
                {text: '불량위인',    value: 'n_cause', sortable: false, align:'center', width: "80px"},
                {text: '작업일',     value: 's_workday', sortable: false, align:'center', width: "60px"},
                {text: '폼목코드',    value: 'c_item', sortable: false, align:'center', width: "50px"},
                {text: '항목(폼목)',  value: 'n_item', sortable: false, align:'center', width: "100px"},
                
                {text: '공정코드',  value: 'c_process', sortable: false, align:'center', width: "50px"},
                {text: '공정명',    value: 'n_process', sortable: false, align:'center', width: "60px"},                
                {text: '발주번호',    value: 'i_orderno', sortable: false, align:'center', width: "60px"},
                {text: '거래처',     value: 'n_vend', sortable: false, align:'center', width: "80px"},                
                {text: '작업자',    value: 'n_empnm', sortable: false, align:'center', width: "60px"},
                {text: '불량수량',    value: 'm_err', sortable: false, align:'center', width: "50px"},
               
            ],
            causeItems:[], causeFilter:[], causeInfo:[], causeS:[],
       }
    },
    watch: {
        headItem1Info() {
            // console.log(this.headItem1Info.n_process)
        }
    },
    computed: {
        getProcName() {
            return `불량 ${this.headItem1Info.n_process !== undefined ? this.headItem1Info.n_process : ''} 공정 List`
        },
        getItemName() {
            return `불량 ${this.headItem2Info.n_item !== undefined ? this.headItem2Info.n_item : ''} 폼목 List`
        },
        getCauseName() {
            return `${this.headItem3Info.n_cause !== undefined ? this.headItem3Info.n_cause : ''}별 불량 폼목 List`
        }
    },
    methods: {
        adjustIframeHeight() {
        // 브라우저 창의 높이를 iframe의 높이로 설정
            const windowHeight = window.innerHeight;
            this.iframeHeight = windowHeight - 200 - 400;
        },
        getErrtypename(val){
            const err = this.errType.find(obj => obj.c_code == val);
            return err ? err.n_code : '';
        },
        async init() {
            this.form.sDate1 = getDate(-365, 1);
            this.errType = await this.$axios.post(`/api/prod/getErrtype`);
            await this.view();
        },
        async view() {
            this.headItem1Info=[]; this.selectedM1=[]; this.headItem2Info=[]; this.selectedM2=[]; this.headItem3Info=[]; this.selectedM3=[];
            this.itemFilter=[]; this.itemInfo=[]; this.itemS=[];
            this.headItem1 = await this.$axios.post(`/api/metrics/getDefectraterate`, this.form); 
            this.procItems = await this.$axios.post(`/api/metrics/getDefectrateratedt`, this.form); 
            this.headItem2 = await this.$axios.post(`/api/metrics/getDefectraterate2`, this.form); 
            this.itemItems = await this.$axios.post(`/api/metrics/getDefectrateratedt2`, this.form); 
            this.headItem3 = await this.$axios.post(`/api/metrics/getDefectraterate3`, this.form); 
            this.causeItems = await this.$axios.post(`/api/metrics/getDefectrateratedt3`, this.form); 
        },
        rowSelectHead1 :function (item, row) {                  
            this.tabIndex = 1;
            if (this.headItem1Info.n_process == item.n_process) return;
            this.headItem1Info = item;  
            if (row) {row.select(true) } else {this.selectedM1 = [item]}

            if (this.procItems.length > 0) {
                this.procFilter = this.procItems.filter((r) => {
                    return r.c_process == item.c_process && r.c_com == item.c_com;
                }); 
            } else {
                this.procFilter = [];
            }

        },
        rowSelectHead2 :function (item, row) {       
            this.tabIndex = 2;
            this.headItem2Info = item;  
            if (row) {row.select(true) } else {this.selectedM2 = [item]};

            if (this.itemItems.length > 0) {
                this.itemFilter = this.itemItems.filter((r) => {
                    return r.c_item == item.c_item && r.c_com == item.c_com;
                }); 
            } else {
                this.itemFilter = [];
            }
        },
        rowSelectHead3 :function (item, row) {       
            this.tabIndex = 3;
            this.headItem3Info = item;  
            if (row) {row.select(true) } else {this.selectedM3 = [item]};

            if (this.causeItems.length > 0) {
                this.causeFilter = this.causeItems.filter((r) => {
                    return r.f_cause == item.f_cause && r.c_com == item.c_com;
                }); 
            } else {
                this.itemFilter = [];
            }
        },
        rowSelectProc :function (item, row) {       
            this.procInfo = item;  
            if (row) {row.select(true) } else {this.procS = [item]};
        },
        rowSelectItem :function (item, row) {       
            this.itemInfo = item;  
            if (row) {row.select(true) } else {this.itemS = [item]};
        },
        rowSelectCause :function (item, row) {       
            this.causeInfo = item;  
            if (row) {row.select(true) } else {this.causeS = [item]};
        },
        sumCause() {
            return this.causeItems.reduce((sum, item) => {return sum + (Number(item['m_err']) || 0);}, 0 );
        },
        getCasueper(item) {
            return (Number(item.m_err) / this.sumCause() * 100).toFixed(2);
        }
   },

}
</script>

<style>

</style>