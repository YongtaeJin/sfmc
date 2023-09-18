<template>
    <v-container fluid> 
        <v-toolbar height="40px" background-color="primary" dark>
            <v-toolbar-title>KPI 핵심성과지표 관리</v-toolbar-title>
            <v-spacer/>
            사업장 :
            
            조회년월 :             
            <tooltip-btn label="전월"   @click="prevMon"><v-icon>mdi-chevron-left</v-icon></tooltip-btn> 
            {{ cleandarYM }}
            <tooltip-btn label="다음월" @click="nextMon"><v-icon>mdi-chevron-right</v-icon></tooltip-btn> 
            <tooltip-btn label="조회"   @click="view"><v-icon>mdi-magnify</v-icon></tooltip-btn> 
        </v-toolbar>
    </v-container>
</template>

<script>
import TooltipBtn from '../../components/etc/TooltipBtn.vue';
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
            selectdata : {t_no: 0, c_com: "", kpiCertKey: "", ocrDttm: "", systmOprYn: "Y", trsDttm: "", f_tst: "Y", t_req: "", t_res: "", f_err: ""},
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
                
        },
    },
}
</script>

<style>

</style>