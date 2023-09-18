<template>
    <v-container fluid>
        <v-toolbar height="40px" background-color="primary" dark>
            <v-toolbar-title>작업 지시</v-toolbar-title>
            <v-spacer/>
            <tooltip-btn label="조회" @click="view"><v-icon>mdi-magnify</v-icon></tooltip-btn>
            <!-- <tooltip-btn label="작성" @click="add"><v-icon>mdi-plus</v-icon></tooltip-btn>
            <tooltip-btn label="삭제" @click="del"><v-icon>mdi-minus</v-icon></tooltip-btn> -->
            <tooltip-btn label="저장" @click="save"><v-icon>mdi-content-save-outline</v-icon></tooltip-btn>            
        </v-toolbar> 
        <v-card style="display: flex; height: 34px; " class="my-card text-input-blue my-text-fontsize  "> 
            <div style="display: flex;">
                <div style="width: 70px;"><v-text-field value="  납품예정일 : " readonly dense hide-details class="no-padding"/></div>                
                <input-dateft v-model="form.sDate1" :value2.sync="form.sDate2"/>                
                <div style="width: 56px;"><v-text-field value="    발주처 : " readonly dense hide-details class="no-padding"/></div>
                <div style="width: 100px;"><v-text-field v-model="form.sVend" dense hide-detail class="text-input-blue no-padding" /></div>
            </div>
        </v-card>
        <v-data-table ref="data-table" :headers="itemHead" :items="itemList"                     
                    item-key="i_orderser" single-select 
                    :item-class= "row_classes" :items-per-page="-1"  hide-default-footer :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" 
                    class="elevation-1 text-no-wrap"  max-height="350px"  height="350px" 
                    >
            <template v-slot:header="">
                <thead align='center'>
                    <tr>
                        <th colspan="4" class="text-center">수주정보</th>
                        <th colspan="5" class="text-center">제품정보</th>
                        <th colspan="4" class="text-center">생산계획</th>
                    </tr>
                </thead>
            </template>
            <!-- <tr :class="{ 'selected-row': item === selectedItem }" @click="selectItem(item)"> -->
            <template v-slot:item="{ item,index }">
                
                <tr :class="{ 'row_select': item === selected }" class="center-align" @click="selectItem(item)" v-if="shouldMergeRow(item) ">
                    <td> {{ index + 1 }}</td>
                    <td :rowspan="getRowspan(item)">{{ item.i_orderno }}</td>
                    <td :rowspan="getRowspan(item)">{{ item.s_date }}</td>
                    <td :rowspan="getRowspan(item)" >{{ item.n_vend }}</td>                    
                    <td class="left-align"> {{ item.n_item }}</td>
                    <td class="left-align"> {{ item.t_size }}</td>
                    <td> {{ item.i_unit }}</td>
                    <td> {{ item.m_cnt }}</td>
                    <td> {{ item.s_duedate }}</td>
                    <td v-if="item.f_work == '1' || item.f_work == '2'" @dblclick ="setWork(item)">
                        <v-chip x-small :color="getColor(item.f_work)" dark>{{getStatus(item.f_work)}}</v-chip></td>
                        <td align='center' v-else><v-chip x-small :color="getColor(item.f_work)" dark>{{getStatus(item.f_work)}}</v-chip></td>
                        
                    <td v-if="item.f_work == 'x'" @dblclick ="handleCellClick(item.d_plan1)">
                        <v-text-field v-model="item.d_plan1" readonly dense hide-details class="my-text-field"/></td>
                        <td align='center' v-else>{{item.d_plan1}}</td>
                    <td v-if="item.f_work == 'x'" @dblclick ="handleCellClick(item.d_plan2)">
                        <v-text-field v-model="item.d_plan2" readonly dense hide-details class="my-text-field"/></td>
                        <td align='center' v-else>{{item.d_plan2}}</td>
                    <td align="left"> 
                        <v-text-field v-if="item.f_work == '1'" v-model="item.t_remark" @input="setedit" dense hide-details class="my-text-field"/>
                        <span v-else>{{item.t_remark}}</span>
                    </td>
                </tr>
                <tr :class="{ 'row_select': item === selected }" class="center-align" @click="selectItem(item)" v-else>
                    <td> {{ index + 1 }}</td>
                    <td class="left-align"> {{ item.n_item }}</td>
                    <td class="left-align"> {{ item.t_size }}</td>
                    <td> {{ item.i_unit }}</td>
                    <td> {{ item.m_cnt }}</td>
                    <td> {{ item.s_duedate }}</td>
                    <td v-if="item.f_work == '1' || item.f_work == '2'" @dblclick ="setWork(item)">
                       <v-chip x-small :color="getColor(item.f_work)" dark>{{getStatus(item.f_work)}}</v-chip> </td>
                       <td align='center' v-else><v-chip x-small :color="getColor(item.f_work)" dark>{{getStatus(item.f_work)}}</v-chip></td>
                    <td v-if="item.f_work == 'x'" @dblclick ="handleCellClick(item.d_plan1)">
                        <v-text-field v-model="item.d_plan1" readonly dense hide-details class="my-text-field"/></td>
                        <td align='center' v-else>{{item.d_plan1}}</td>
                    <td v-if="item.f_work == 'x'" @dblclick ="handleCellClick(item.d_plan2)">
                        <v-text-field v-model="item.d_plan2" readonly dense hide-details class="my-text-field"/></td>
                        <td align='center' v-else>{{item.d_plan2}}</td>
                    <td align="left"> 
                        <v-text-field v-if="item.f_work == '1'" v-model="item.t_remark" @input="setedit" dense hide-details class="my-text-field"/>
                        <span v-else>{{item.t_remark}}</span>
                    </td>
                </tr>
            </template>
           
        </v-data-table>
        <v-toolbar height="25px" background-color="primary" dark >
            <v-toolbar-title>공정별 세부일정</v-toolbar-title>
            <v-spacer/>
            <tooltip-btn v-if="itemInfo.f_work == '1'" label="초기화" @click="proccdel" :height="20"><v-icon>mdi-notification-clear-all</v-icon></tooltip-btn>
        </v-toolbar>
        <v-data-table ref="table" :headers="routerHead" :items="itemRouterFilter" @click:row="rowSelectRouter" 
            item-key="i_ser" single-select v-model="selectR"
            hide-default-footer :items-per-page="-1" :item-class= "row_classes" 
            class="elevation-1 text-no-wrap" :height=iframeHeight > 

            <template v-slot:[`item.s_sort`]="{ item }">                
                <input-number v-model="item.s_sort" @input="onChange(item)" v-if="itemInfo.f_work == '1' && item.i_ser === routerInfo.i_ser"></input-number>
                <div v-else> {{  item.s_sort }}</div>            
            </template> 
            <template v-slot:[`item.f_jobs`]="{ item }">    
                <div @dblclick="handleDoubleClick(item, 'f_jobs')">
                <v-icon v-if="item.f_jobs=='Y'" small color=#008000> mdi-check </v-icon>
                <v-icon v-else x-small >mdi-minus</v-icon>
                </div>
            </template> 
            <template v-slot:[`item.f_jobf`]="{ item }">    
                <div @dblclick="handleDoubleClick(item, 'f_jobf')">
                <v-icon v-if="item.f_jobf=='Y'" small color=#008000> mdi-check </v-icon>
                <v-icon v-else x-small >mdi-minus</v-icon>
                </div>
            </template> 
            <template v-slot:[`item.f_jobo`]="{ item }">                
                <v-icon v-if="item.f_jobo=='Y'" small color=#008000> mdi-check </v-icon>
                <v-icon v-else x-small >mdi-minus</v-icon>
            </template>    


            <template v-slot:[`item.n_empnm`]="{ item }">
                <v-text-field v-model="item.n_empnm" @input="onChange(item)" v-if=" itemInfo.f_work == '1' && item.i_ser === routerInfo.i_ser " readonly dense hide-details class="my-text-field no-padding">
                    <template v-slot:append> <v-btn @click="getEmpno(item)" x-small icon ><v-icon>mdi-check</v-icon></v-btn> </template>
                </v-text-field>
                <div v-else> {{  item.n_empnm }}</div>            
            </template> 
            <template v-slot:[`item.m_cnt`]="{ item }">                
                <input-number v-model="item.m_cnt" @input="onChange(item)" v-if="itemInfo.f_work == '1' && item.i_ser === routerInfo.i_ser"></input-number>
                <div v-else> {{  item.m_cnt }}</div>            
            </template> 
            <template v-slot:[`item.s_date1`]="{ item }">
                <input-date-2 v-model="item.s_date1" @input="onChange(item)" v-if="itemInfo.f_work == '1' && item.i_ser === routerInfo.i_ser" :rules="rules.date({required: false})" class="my-text-table"/>
                <div v-else> {{  item.s_date1 }}</div>   
            </template>
            <template v-slot:[`item.s_date2`]="{ item }">
                <input-date-2 v-model="item.s_date2" @input="onChange(item)" v-if="itemInfo.f_work == '1' && item.i_ser === routerInfo.i_ser" :rules="rules.date({required: false})" class="my-text-table"/>
                <div v-else> {{  item.s_date2 }}</div>   
            </template>
            <template v-slot:[`item.m_whour`]="{ item }">                
                <input-number v-model="item.m_whour" @input="onChange(item)" v-if="itemInfo.f_work == '1' && item.i_ser === routerInfo.i_ser"></input-number>
                <div v-else> {{  item.m_whour }}</div>            
            </template>             
            <template v-slot:[`item.t_remark`]="{ item }">
                <v-text-field v-model="item.t_remark" @input="onChange(item)" v-if=" itemInfo.f_work == '1' && item.i_ser === routerInfo.i_ser " dense hide-details class="my-text-field no-padding" />
                <span v-else>{{item.t_remark}}</span>
            </template>
            
        </v-data-table>

        <ez-dialog ref="dialog_plan" label="생산계획일" persistent @onClose="close_plan" width="350px" >
            <dates-dialog @onEnter="setplandate" :sDate="selected.d_plan1" :eDate="selected.d_plan2">
            </dates-dialog>
        </ez-dialog>
        <ez-dialog ref="dialog_emp" label="작업자선택" persistent @onClose="close_plan" width="350px" >
            <prod-getemp @onEnter="onEmpEnter">

            </prod-getemp>
        </ez-dialog>
    </v-container>
</template>

<script>
import { mapActions } from "vuex";
import InputDateft from '../../components/InputForms/InputDateft.vue'
import EzDialog from '../../components/etc/EzDialog.vue';
import TooltipBtn from '../../components/etc/TooltipBtn.vue';
import InputDate2 from '../../components/InputForms/InputDate2.vue';
import InputDate3 from '../../components/InputForms/InputDate3.vue';
import { PROD001 } from '../../../util/constval';
import { getDate, previousMonth } from '../../../util/lib';
import validateRules from "../../../util/validateRules";
import DatesDialog from '../../components/etc/DatesDialog.vue';
import InputAmt from '../../components/InputForms/InputAmt.vue';
import InputNumber from '../../components/InputForms/InputNumber.vue';
import ProdGetemp from './ProdGetemp.vue';

export default {
    components: { InputDateft, TooltipBtn, EzDialog, InputDate2, InputDate3, DatesDialog, InputAmt, InputNumber, ProdGetemp},
    data() {
        return {
            PROD001,
            valid: true,
            iframeHeight: 200, // 초기 높이 설정 (원하는 높이로 초기화)
            form : {
                sDate1:"", sDate2:"", sVend:"", work:"order",
            },
            itemHead: [
                {text: 'No',       sortable: false, align:'center', width: "25"},
                {text: '수주번호',  value: 'i_orderno', sortable: false, align:'center', width: "75"},
                {text: '수주일',    value: 's_date', sortable: false, align:'center', width: "60px"},                
                {text: '발주처',    value: 'n_vend', sortable: false, align:'center', width: "120px"},
                {text: '항목(품목)', value: 'n_item', sortable: false, align:'center', width: "130px"},
                {text: '규격(사양)', value: 't_size', sortable: false, align:'center', width: "100px"},
                {text: '단위',      value: 'i_unit', sortable: false, align:'center', width: "50px"},
                {text: '수량',      value: 'm_cnt', sortable: false, align:'center', width: "30px"},
                {text: '납기일',    value: 's_duedate', sortable: false, align:'center', width: "60px"},
                {text: '상태',      value: 'f_work', sortable: false, align:'center', width: "30px"},
                {text: '시작일',    value: 'd_plan1', sortable: false, align:'center', width: "60px"},
                {text: '종료일',    value: 'd_plan2', sortable: false, align:'center', width: "60px"},
                {text: '비고',      value: 't_remark', sortable: false, align:'center', width: "300px"},
            ],
            itemList:[], itemInfo:[], selected:[],
            routerHead: [
                {text: 'No',  value: 's_sort', sortable: false, align:'center', width: "40"},
                {text: '첫공정',  value: 'f_jobs', sortable: false, align:'center', width: "40"},
                {text: '외주',  value: 'f_jobo', sortable: false, align:'center', width: "40"},
                {text: '마지막',  value: 'f_jobf', sortable: false, align:'center', width: "40"},
                {text: '공정코드',  value: 'c_process', sortable: false, align:'center', width: "75"},
                {text: '공정명',    value: 'n_process', sortable: false, align:'center', width: "130"},
                {text: '작업자',    value: 'n_empnm', sortable: false, align:'center', width: "100"},
                {text: '수량',      value: 'm_cnt', sortable: false, align:'center', width: "75"},
                {text: '시작일',    value: 's_date1', sortable: false, align:'center', width: "75"},
                {text: '종료일',    value: 's_date2', sortable: false, align:'center', width: "75"},
                {text: '작업일수',  value: 'm_whour', sortable: false, align:'center', width: "75"},
                {text: '비고',      value: 't_remark', sortable: false, align:'center', width: "120"},
            ],
            itemRouters:[], itemRouterFilter:[], routerInfo:[], selectR:[],
            emplist:[],
            edit: false,
           
        }
    },
    mounted() {
        // this.form.sDate1=previousMonth();
        // 창 크기가 변경될 때마다 iframe의 높이를 조정
        window.addEventListener('resize', this.adjustIframeHeight);
        this.adjustIframeHeight(); // 초기 조정      
        this.form.sDate1=getDate(-100, 1);
        this.init();
    },    
    beforeDestroy() {
        // 컴포넌트가 파기될 때 리스너 제거
        window.removeEventListener('resize', this.adjustIframeHeight);
    },
    watch: {
    },
    computed: {
        rules: () => validateRules,
    },
    methods: {     
        ...mapActions("prod", ["iuProdPlanlist2"]), 
        adjustIframeHeight() {
        // 브라우저 창의 높이를 iframe의 높이로 설정
            const windowHeight = window.innerHeight;
            this.iframeHeight = windowHeight - 200 - 400;           
        },
        shouldMergeRow(item) {
            const index = this.itemList.findIndex((i) => i.i_orderno === item.i_orderno);
            return index === this.itemList.indexOf(item);
        },
        getRowspan(item) {
            const count = this.itemList.filter((i) => i.i_orderno === item.i_orderno).length;
            return count;
        },
        async init() {
            this.emplist = await this.$axios.post(`/api/prod/getEmplist`); 
            this.view();            
        },  
        async view() {
            this.itemInfo=[];
            this.itemRouters=[]; this.routerInfo=[]; this.itemRouterFilter=[]; this.selectR=[];
            this.itemList = await this.$axios.post(`/api/prod/getProdPlanlist`, this.form);                      
        },
        async add() {},
        async del() {},
        async save() {
            const edititem = this.itemList.filter(obj => obj.f_edit === '1').map(obj => ({...obj}));
            const edititemdt = this.itemRouters.filter(obj => obj.f_edit === '1' || obj.f_edit === '2').map(obj => ({...obj}));

            if (edititem.length || edititemdt.length) {            
                const plandata = {master:edititem, detail: edititemdt }  // 수주정보 비고란 + 공정별세부일정\\   
                const data = await this.iuProdPlanlist2(plandata);                
                if (data) {
                    this.itemList.forEach((row, index) => {
                        row.f_edit = "0";
                        row.f_editold = "0";
                    })
                    this.itemRouters.forEach((row, index) => {
                        row.f_edit = "0";
                        row.f_editold = "0";
                    })
                    this.$toast.info(`저장 하였습니다.`);
                }
            }
        },
        row_classes(item) {
            if (item.f_edit == "2") {
                return "orange";
            } 
        },
        rowSelect :function (item, row) {            
            if (this.itemInfo.i_orderser == item.i_orderser) return;
            this.itemInfo = item;
            if (row) { row.select(true) } else { this.selected = [item] }            
        },
        async selectItem(item, chk) {
            
            if (this.itemInfo.i_orderser == item.i_orderser && !chk ) return;            
            this.selected = item;
            this.itemInfo = item;

            this.itemRouterFilter = this.itemRouters.filter(obj => obj.c_com == item.c_com && obj.i_order == item.i_order && obj.i_orderser == item.i_orderser && obj.f_edit !== "2").map(obj => ({...obj}));
            
            if (this.itemRouterFilter.length == 0) { 
                if (!chk ) { 
                    // console.log("조회")
                    this.itemRouterFilter = await this.$axios.post(`/api/prod/getProdplan`, item); 
                }
                if (this.itemRouterFilter.length) {                    
                    this.itemRouters = [...this.itemRouters, ...this.itemRouterFilter];
                } else {
                    if (parseInt(this.itemInfo.f_work) < 2 )  {
                        this.itemRouterFilter = await this.$axios.post(`/api/prod/getItemRouterProc`, item); 
                        // console.log("new")
                        this.itemRouterFilter.forEach((row) => {
                            row.i_order  = this.itemInfo.i_order;
                            row.i_orderser = this.itemInfo.i_orderser;
                            row.m_cnt = this.itemInfo.m_cnt;
                            row.s_date1 = this.itemInfo.d_plan1;
                            row.s_date2 = this.itemInfo.d_plan2;
                        })                    
                        this.itemRouters = [...this.itemRouters, ...this.itemRouterFilter];
                    }
                }
            }
        },
        getStatus(item) {
            var find = this.PROD001.find(e => e.value === item);
            return find !== undefined ? find.label : '';
        },
        setWork(item) {
            
            if (item.f_work == "1") {
                if (item.d_plan1 == null || item.d_plan1.length < 1 || item.d_plan2 == null || item.d_plan2.length < 1) {
                    this.$toast.error("생산계획일 미입력");
                    return;
                }
            }
            item.f_work = item.f_work == "1" ? "2" : "1";
            item.f_edit = "1";
        },
        handleCellClick() {            
            this.$refs.dialog_plan.open();
        },
        close_plan() {

        },
        setedit() {
            if (this.itemInfo) this.itemInfo.f_edit = "1";
        },
        setplandate(item) {
            this.$refs.dialog_plan.close();
            if (this.itemInfo) this.itemInfo.f_edit = "1";
            if (item[1]) {
                this.itemInfo.d_plan1 = item[0] > item[1] ? item[1] : item[0];
                this.itemInfo.d_plan2 = item[0] > item[1] ? item[0] : item[1];            
            } else {
                this.itemInfo.d_plan1 = item[0];
                this.itemInfo.d_plan2 = item[0];
            };
            item.f_edit = "1";
        },
        getColor (data) {
            if(data == "1") { return 'red'; } 
            else if (data == "2") {return 'blue';}
            else { return 'green';}
        },
        rowSelectRouter:function (item, row) {
            if (this.routerInfo.i_ser == item.i_ser) return;
            this.routerInfo = item;
            if (row) { row.select(true) } else { this.selectR = [item] }

        },
        onChange(item, col) {
            item.f_edit = "1";
            const idx = this.itemRouters.indexOf(item);
            
        },
        async getEmpno(item) {
            this.$refs.dialog_emp.open();
        },
        async onEmpEnter(item)   {            
            const idx = this.itemRouters.indexOf(this.routerInfo)
            this.routerInfo.i_empno = item.i_empno;
            this.routerInfo.n_empnm = item.n_empnm;
            this.routerInfo.f_edit = "1";
            if (idx >= 0 ) this.itemRouters.splice(idx, 1, this.routerInfo);            
            
            this.$refs.dialog_emp.close();
        },
        handleDoubleClick(item, col) {
            if (this.itemInfo.f_work !== '1') return;
            switch (col) {
                case 'f_jobs' :
                    item.f_jobs = item.f_jobs == 'Y' ? 'N' : 'Y';
                    break;
                case 'f_jobf' :
                    item.f_jobf = item.f_jobf == 'Y' ? 'N' : 'Y';
                    break;
                case 'f_jobo' :
                    item.f_jobo = item.f_jobo == 'Y' ? 'N' : 'Y';
                    break;
            } 
            item.f_edit = "1";
        },
        async proccdel() {
            if(this.itemInfo.f_work == '1') {                           
                for (let i = this.itemRouterFilter.length - 1; i >= 0; i --) {
                    if (this.itemRouterFilter[i].f_editold == "1") {
                        this.itemRouterFilter.splice(i, 1)
                    } else {
                        const idx = this.itemRouters.indexOf( this.itemRouterFilter[i]);
                        this.itemRouters[idx].f_edit = "2";
                        this.itemRouterFilter[i].f_edit = "2"
                    }
                }
                await this.selectItem(this.itemInfo, "del");
            }        
        }

    }

}
</script>

<style>

</style>
