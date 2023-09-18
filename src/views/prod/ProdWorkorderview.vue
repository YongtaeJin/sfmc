<template>
    <v-container fluid>
        <v-toolbar height="40px" background-color="primary" dark>
            <v-toolbar-title>공정진행현황</v-toolbar-title>
            <v-spacer/>
            <tooltip-btn label="조회" @click="view"><v-icon>mdi-magnify</v-icon></tooltip-btn>
            <!-- <tooltip-btn label="작성" @click="add"><v-icon>mdi-plus</v-icon></tooltip-btn>
            <tooltip-btn label="삭제" @click="del"><v-icon>mdi-minus</v-icon></tooltip-btn> -->
            <tooltip-btn label="저장" @click="save"><v-icon>mdi-content-save-outline</v-icon></tooltip-btn>            
        </v-toolbar> 
        <v-card style="display: flex; height: 34px; " class="my-card text-input-blue my-text-fontsize  "> 
            <div style="display: flex;">
                <div style="width: 70px;"><v-text-field value="  계획완료일 : " readonly dense hide-details class="no-padding"/></div>                
                <input-dateft v-model="form.sDate1" :value2.sync="form.sDate2"/>                
                <div style="width: 56px;"><v-text-field value="    발주처 : " readonly dense hide-details class="no-padding"/></div>
                <div style="width: 100px;"><v-text-field v-model="form.sVend" dense hide-detail class="text-input-blue no-padding" /></div>
            </div>
        </v-card>
        <v-data-table ref="item-table" :headers="itemHead" :items="itemLists"                     
                    item-key="i_orderser" single-select hide-default-footer
                    :item-class= "row_classes" :items-per-page="-1" 
                    class="elevation-1 text-no-wrap"  :height=iframeHeight
                    >
            <template v-slot:header="">
                <thead align='center'>
                    <tr>
                        <th colspan="3" class="text-center">수주정보</th>
                        <th colspan="4" class="text-center">제품정보</th>
                        <th colspan="6" class="text-center">생산계획</th>
                        <th colspan="6" class="text-center">생산실적</th>
                    </tr>
                </thead>
                
            </template>
            <template v-slot:item="{ item }">
                <tr :class="{ 'row_select': item === selected }" class="center-align" @click="selectItem(item)" v-if="shouldMergeRow(item) ">
                    <td :rowspan="getRowspan(item)">{{ item.i_orderno }}</td>
                    <td :rowspan="getRowspan(item)">{{ item.s_date }}</td>
                    <td class="left-align" :rowspan="getRowspan(item)">{{ item.n_vend }}</td>  
                    <td> {{ item.c_item }}</td>  
                    <td> {{ item.n_item }}</td>  
                    <td> {{ item.t_size }}</td>  
                    <td> {{ item.m_cnt }}</td>
                    <td> {{ item.n_process }}</td>  
                    <td> <v-chip x-small :color="getColor(item)">{{ getStatus(item) }}</v-chip></td>  
                    <td> {{ item.s_dplan1 }}</td>
                    <td> {{ item.s_dplan2 }}</td>                    
                    <td> {{ item.m_planday }}</td>
                    <td> {{ item.m_plancnt }}</td>
                    <td> {{ item.m_yescnt }}</td>
                    <td> {{ item.m_nocnt }}</td>
                    <td> {{ item.s_workday1 }}</td>
                    <td> {{ item.s_workday2 }}</td>
                    <td> {{ item.m_workcnt }}</td>
                    <td> <v-progress-linear :value="getPer(item)"  color="blue" height="18">                        
                            <strong>{{ getPer(item) }}%</strong>                        
                        </v-progress-linear></td>
                </tr>


                <tr :class="{ 'row_select': item === selected }" class="center-align" @click="selectItem(item)" v-else>
                    <td> {{ item.c_item }}</td>  
                    <td> {{ item.n_item }}</td>  
                    <td> {{ item.t_size }}</td>  
                    <td> {{ item.m_cnt }}</td>
                    <td> {{ item.n_process }}</td> 
                    <td> <v-chip x-small :color="getColor(item)">{{ getStatus(item) }}</v-chip></td>  
                    <td> {{ item.s_dplan1 }}</td>
                    <td> {{ item.s_dplan2 }}</td>                    
                    <td> {{ item.m_planday }}</td>
                    <td> {{ item.m_plancnt }}</td>
                    <td> {{ item.m_yescnt }}</td>
                    <td> {{ item.m_nocnt }}</td>
                    <td> {{ item.s_workday1 }}</td>
                    <td> {{ item.s_workday2 }}</td>
                    <td> {{ item.m_workcnt }}</td>
                    <td> <v-progress-linear :value="getPer(item)"  color="blue" height="18">                        
                            <strong>{{ getPer(item) }}%</strong>                        
                        </v-progress-linear></td>                    
                </tr>
            </template>

        </v-data-table> 
    </v-container>
</template>

<script>
import { mapActions } from "vuex";
import InputDateft from '../../components/InputForms/InputDateft.vue'
import EzDialog from '../../components/etc/EzDialog.vue';
import TooltipBtn from '../../components/etc/TooltipBtn.vue';
import InputDate2 from '../../components/InputForms/InputDate2.vue';
import { PROD001 } from '../../../util/constval';
import { getDate, previousMonth } from '../../../util/lib';
import DatesDialog from '../../components/etc/DatesDialog.vue';

export default {
    components: { InputDateft, TooltipBtn, EzDialog, InputDate2, DatesDialog},
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
            PROD001,
            valid: true,
            iframeHeight: 500, // 초기 높이 설정 (원하는 높이로 초기화)
            form : {
                sDate1:"", sDate2:"", sVend:"",
            },
            itemHead: [
                {text: '수주번호',   value: 'i_orderno', sortable: false, align:'center', width: "75"},
                {text: '수주일',     value: 's_date', sortable: false, align:'center', width: "60px"},
                {text: '발주처',     value: 'n_vend', sortable: false, align:'center', width: "100px"},

                {text: '품번',       value: 'c_item', sortable: false, align:'center', width: "60px"},
                {text: '항목(품목)', value: 'n_item', sortable: false, align:'center', width: "90px"},
                {text: '규격(사양)', value: 't_size', sortable: false, align:'center', width: "80px"},                                
                {text: '수주수량',   value: 'm_cnt', sortable: false, align:'center', width: "30px"},

                {text: '공정',       value: 'n_process', sortable: false, align:'center', width: "60px"},
                {text: '상태',       value: 'f_work', sortable: false, align:'center', width: "30px"},
                {text: '계획시작일',  value: 'd_plan1', sortable: false, align:'center', width: "60px"},
                {text: '계획완료일',  value: 'd_plan2', sortable: false, align:'center', width: "60px"},
                {text: '계획일수',    value: 'm_planday', sortable: false, align:'center', width: "30px"},                
                {text: '계획수량',    value: 'm_plancnt', sortable: false, align:'center', width: "30px"},

                {text: '양품수량',    value: 'm_yescnt', sortable: false, align:'center', width: "30px"},
                {text: '불량수량',    value: 'm_nocnt', sortable: false, align:'center', width: "30px"},                
                {text: '생산시작일',  value: 's_workday1', sortable: false, align:'center', width: "60px"},
                {text: '생산종료일',  value: 's_workday2', sortable: false, align:'center', width: "60px"},
                {text: '생산일수',    value: 'm_workcnt', sortable: false, align:'center', width: "30px"},
                {text: '진행률',     value: 'p_per', sortable: false, align:'center', width: "60px"},
                
            ],
            itemLists:[], itemInfo:[], selected:[],
        }
    },
    watch: {
    },
    computed: {
    },
    methods: {     
        ...mapActions("prod", ["iuProdPlanlist"]), 
        adjustIframeHeight() {
        // 브라우저 창의 높이를 iframe의 높이로 설정
            const windowHeight = window.innerHeight;
            this.iframeHeight = windowHeight - 200;           
        },
        shouldMergeRow(item) {
            const index = this.itemLists.findIndex((i) => i.i_orderno === item.i_orderno);
            return index === this.itemLists.indexOf(item);
        },
        getRowspan(item) {
            const count = this.itemLists.filter((i) => i.i_orderno === item.i_orderno).length;
            return count;
        },        
        async init() {
            this.form.sDate1=getDate(-100, 1);
            this.view();
        },  
        async view() {            
            // this.itemInfo = [];
            // this.itemProd = []; this.itemMake = []; this.itemErr = []; this.makeRow =[]; this.errRow = [];
            this.itemLists = await this.$axios.post(`/api/prod/getProdWorkview2`, this.form); 
        },
        async add() {

        },
        async del() {

        },
        async save() {
        },
        row_classes(item) {
            if (item.f_edit == "2") {
                return "orange";
            } 
        },
        getColor (item) {
            const data = item.m_yescnt >= item.m_cnt ? '완료' : item.m_nocnt + item.m_yescnt == 0 ? '준비' : '생산';
            if(data == "준비") { return 'red'; } 
            else if (data == "생산") {return 'blue';}
            else { return 'green';}

        },
        getStatus(item) {
            // var find = this.PROD001.find(e => e.value === item);
            // return find !== undefined ? find.label : '';
            return item.m_yescnt >= item.m_cnt ? '완료' : item.m_nocnt + item.m_yescnt == 0 ? '준비' : '생산';
        },
        
        shouldMergeRow(item) {
            const index = this.itemLists.findIndex((i) => i.i_orderser === item.i_orderser);
            return index === this.itemLists.indexOf(item);
        },
        getRowspan(item) {
            const count = this.itemLists.filter((i) => i.i_orderser === item.i_orderser).length;
            return count;
        },
        async selectItem(item) {
            if (this.selected == item) return;
            this.selected = item;
        },
        getPer(item) {
            return item.m_cnt < 1 ? 0 : (item.m_yescnt / item.m_cnt * 100).toFixed(2);
        },

    },
}
</script>

<style>

</style>