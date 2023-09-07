<template>
    <v-container fluid> 
        <v-toolbar height="40px" background-color="primary" dark>
            <v-toolbar-title>KPI 핵심성과지표 레벨1</v-toolbar-title>
            <v-spacer/>
            조회년월 :             
            <tooltip-btn label="전월"   @click="prevMon"><v-icon>mdi-chevron-left</v-icon></tooltip-btn> 
            {{ cleandarYM }}
            <tooltip-btn label="다음월" @click="nextMon"><v-icon>mdi-chevron-right</v-icon></tooltip-btn> 
            <tooltip-btn label="조회"   @click="view"><v-icon>mdi-magnify</v-icon></tooltip-btn> 
        </v-toolbar>
        <v-row>
            <v-col>
                <v-toolbar height="30px" color="accent">
                    <!-- <v-toolbar-title>사업자번호:{{ this.siteKpiifno.i_company }} / 인증키값: {{ this.siteKpiifno.i_kpikey }}</v-toolbar-title> -->
                    <v-toolbar-title>KPI인증상호: {{ this.siteKpiifno.n_kpiconm }}</v-toolbar-title>
                </v-toolbar>
                <v-data-table ref="table" :headers="masterHead" :items="masters" @click:row="rowSelectMaster" 
                    item-key="s_day" single-select v-model="selectedM"                    
                    hide-default-footer :items-per-page="-1" :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" 
                    class="elevation-1 text-no-wrap" height="550px" max-height="550px" > 
                </v-data-table>
            </v-col>
            <v-col>
                
                <v-toolbar height="30px" color="accent">                
                <v-toolbar-title>선택날짜: {{ this.selectdata.ocrDttm }}</v-toolbar-title>
                </v-toolbar>

                <v-toolbar height="100px" color="grey lighten-4">
                    <v-switch v-model="systmOprYn" :label="`시스템가동 : ${this.selectdata.systmOprYn}`"></v-switch>
                    <v-spacer/>
                    <v-btn small :color="systmOprYn ? 'success':'error'" @click="kpi1Test1">KPI 전송</v-btn>
                </v-toolbar>

                
                
                <v-data-table ref="item-table" :headers="itemHead" :items="itemListsselect"                     
                    item-key="t_no" v-model="selectedD" @click:row="rowSelectDetail" single-select hide-default-footer
                    :items-per-page="-1" 
                    class="elevation-1 text-no-wrap"  max-height="140px" height="140px" 
                    >
                </v-data-table>
                <v-textarea v-model="itemInfo.t_req" readonly label="전송내용" hide-details="false"/>
                <v-textarea v-model="itemInfo.t_res" readonly label="전송결과" hide-details="false"/>
                
            </v-col>
        </v-row>    
    </v-container>
    
</template>

<script>
import TooltipBtn from '../../components/etc/TooltipBtn.vue';
import { getDate } from '../../../util/lib';
export default {
    components: { TooltipBtn },
    mounted() {        
        this.init();
    }, 
    data() {
        return {
            ym : {y:0, m:0}, 
            siteKpiifno : {i_company:"",  i_kpikey:"", f_kpichk:"", n_kpiconm:""},
            form : {s_ym:"", f_tst:"Y"},
            systmOprYn: true,
            selectdata : {t_no: 0, c_com: "", kpiCertKey: "", ocrDttm: "", systmOprYn: "Y", trsDttm: "", f_tst: "Y", t_req: "", t_res: "", f_err: ""},
            masterHead: [
                {text: '날자',   value: 's_day',  sortable: false, align:'center', width: "55px"},                
                {text: '처리',   value: 'm_cnt',  sortable: false, align:'center', width: "40px"},                
                {text: '성공',   value: 'm_ok',   sortable: false, align:'center', width: "40px" },
                {text: '실패',   value: 'm_no',   sortable: false, align:'center', width: "40px" },
            ],
            masters:[], masterinfo:[], selectedM: [],
            itemHead: [
                {text: 'kpiCertKey', value: 'kpiCertKey',  sortable: false, align:'center', width: "55px"},
                {text: 'ocrDttm',    value: 'ocrDttm',  sortable: false, align:'center', width: "55px"},
                {text: 'systmOprYn', value: 'systmOprYn',  sortable: false, align:'center', width: "55px"},
                {text: 'trsDttm',    value: 'trsDttm',  sortable: false, align:'center', width: "55px"},
                {text: 'error',       value: 'f_err',  sortable: false, align:'center', width: "55px"},
                
            ],
            itemLists: [], itemListsselect: [],  itemInfo: [], selectedD: [],
        }
    },
    computed: {
        cleandarYM() {
            return `${this.ym.y}년 ${String(this.ym.m + 1).padStart(2, '0')}월`;
        } 
    },
    watch: {
        ym: {
            deep: true,
            handler(newItems, oldItems) {this.form.s_ym = this.yyyymm(); },            
        },
        systmOprYn: {
            handler(newItems, oldItems) {this.selectdata.systmOprYn = newItems ? 'Y' : 'N'}
        },

    },
    methods: {
        async init() {
            const now = new Date(Date.now());
            this.ym.y = now.getFullYear();
            this.ym.m = now.getMonth();
            this.siteKpiifno = await this.$axios.get(`/api/system/getSiteKpiInfo`); 
            this.selectdata.c_com = this.$store.state.user.member.c_com;             
            this.selectdata.kpiCertKey = this.siteKpiifno.i_kpikey;
            
        },
        yyyymm() {
            return `${this.ym.y}${String(this.ym.m + 1).padStart(2, '0')}`;
        },
        prevMon() {
            if (this.ym.m == 0) {
                this.ym.m = 11;
                this.ym.y = this.ym.y - 1;
            } else {
                this.ym.m = this.ym.m  - 1;
            }            
        },
        nextMon(){
            if (this.ym.m == 11) {
                this.ym.m = 0;
                this.ym.y = this.ym.y + 1;
            } else {
                this.ym.m = this.ym.m  + 1;
            }
        },
        async view() {   
            this.masterinfo = []; this.selectedM = []; this.itemLists = []; this.itemListsselect = [] ,this.itemInfo = [];         
            this.masters = await this.$axios.post(`/api/kpi/getKpi1`,  this.form);      
            this.itemLists = await this.$axios.post(`/api/kpi/getKpi1dt`, this.form);       
        },


        async kpi1Test1() {
            
            if(this.masterinfo.s_day == undefined) return;
            if(this.siteKpiifno.f_kpichk !== "Y") return;
            const res = await this.$ezNotify.confirm(`날짜 : ${this.masterinfo.s_day}, 시스템 가동 상태 : ${this.systmOprYn ? 'Y':'N'}`, "KPI전송", {icon: "mdi-message-bulleted-off", width: 350,});
            if(!res) return;
            const rv = await this.$axios.post(`/api/kpi/sendKpi1`, this.selectdata);
            const idx = this.itemListsselect.push(rv);
            if (idx >=0 ) {
                this.itemLists.push(rv);
                this.masterinfo.m_cnt = this.masterinfo.m_cnt + 1;
                if (rv.f_err == "N") { this.masterinfo.m_ok = this.masterinfo.m_ok + 1 } else { this.masterinfo.m_no =  this.masterinfo.m_no + 1 }

            }
        },
        async kpi1Test2() {
            const rv = await this.$axios.post(`/api/kpi/loadKpi1`);
            
        },
        async rowSelectMaster(item, row) {
            if(this.masterinfo.s_day == item.s_day) return;
            
            this.masterinfo = item;
            if (row) { row.select(true) } else { this.selectedM = [item] }; 
            
            this.selectdata.ocrDttm = item.s_date;            
            this.selectedD = []; 
            this.itemInfo = [];
            if (this.itemLists.length > 0) {
                this.itemListsselect = this.itemLists.filter((r) => {
                    return r.ocrDttm == item.ocrDttm && r.c_com == item.c_com;
                }); 
            } else {
                this.itemListsselect = [];
            }
        },    
        rowSelectDetail(item, row) {
            this.itemInfo = item;            
            if (row) { row.select(true) } else { this.selectedD = [item] };
        },
    }

}
</script>

<style>

</style>