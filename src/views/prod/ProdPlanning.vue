<template>
    <v-container fluid>
        <v-toolbar height="40px" background-color="primary" dark>
            <v-toolbar-title>생산 계획</v-toolbar-title>
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
                    :item-class= "row_classes" :items-per-page="-1" hide-default-footer :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" 
                    class="elevation-1 text-no-wrap"  :height=iframeHeight
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
                    <td v-if="item.f_work == 'x' || item.f_work == '2'" @dblclick ="setWork(item)">
                        <v-chip x-small :color="getColor(item.f_work)" dark>{{getStatus(item.f_work)}}</v-chip></td>
                        <td align='center' v-else><v-chip x-small :color="getColor(item.f_work)" dark>{{getStatus(item.f_work)}}</v-chip></td>                        
                    <td v-if="item.f_work == '1'" @dblclick ="handleCellClick(item.d_plan1)">
                        <v-text-field v-model="item.d_plan1" readonly dense hide-details  class="my-text-field"/></td>
                        <td align='center' v-else>{{item.d_plan1}}</td>
                    <td v-if="item.f_work == '1'" @dblclick ="handleCellClick(item.d_plan2)">
                        <v-text-field v-model="item.d_plan2" readonly dense hide-details  class="my-text-field"/></td>
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
                    <td v-if="item.f_work == 'x' || item.f_work == '2'" @dblclick ="setWork(item)">
                       <v-chip x-small :color="getColor(item.f_work)" dark>{{getStatus(item.f_work)}}</v-chip> </td>
                       <td align='center' v-else><v-chip x-small :color="getColor(item.f_work)" dark>{{getStatus(item.f_work)}}</v-chip></td>
                    <td v-if="item.f_work == '1'" @dblclick ="handleCellClick(item.d_plan1)">
                        <v-text-field v-model="item.d_plan1" readonly dense hide-details class="my-text-field"/></td>
                        <td align='center' v-else>{{item.d_plan1}}</td>
                    <td v-if="item.f_work == '1'" @dblclick ="handleCellClick(item.d_plan2)">
                        <v-text-field v-model="item.d_plan2" readonly dense hide-details class="my-text-field"/></td>
                        <td align='center' v-else>{{item.d_plan2}}</td>
                    <td align="left"> 
                        <v-text-field v-if="item.f_work == '1'" v-model="item.t_remark" @input="setedit" dense hide-details class="my-text-field"/>
                        <span v-else>{{item.t_remark}}</span>
                    </td>
                </tr>
            </template>
           
        </v-data-table>

        <ez-dialog ref="dialog_plan" label="생산계획일" persistent @onClose="close_plan" width="350px" >
            <dates-dialog @onEnter="setplandate" :sDate="selected.d_plan1" :eDate="selected.d_plan2">
            </dates-dialog>
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
import DatesDialog from '../../components/etc/DatesDialog.vue';

export default {
    components: { InputDateft, TooltipBtn, EzDialog, InputDate2, InputDate3, DatesDialog},
    data() {
        return {
            PROD001,
            valid: true,
            iframeHeight: 500, // 초기 높이 설정 (원하는 높이로 초기화)
            form : {
                sDate1:"", sDate2:"", sVend:"", work:"plan",
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
           
        }
    },
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
            const index = this.itemList.findIndex((i) => i.i_orderno === item.i_orderno);
            return index === this.itemList.indexOf(item);
        },
        getRowspan(item) {
            const count = this.itemList.filter((i) => i.i_orderno === item.i_orderno).length;
            return count;
        },

        async init() {
            this.form.sDate1=getDate(-100, 1);
            this.view();
        },  
        async view() {
            this.itemList = await this.$axios.post(`/api/prod/getProdPlanlist`, this.form); 
        },
        async add() {

        },
        async del() {

        },
        async save() {
            // const data = await this.iuProdPlanlist(this.);
            const edititem = this.itemList.filter(obj => obj.f_edit === '1').map(obj => ({...obj}));
            if (edititem.length) {
                const data = await this.iuProdPlanlist(edititem);                
                data.forEach((row, index) => {
                    const idx = this.itemList.findIndex(obj => obj.i_orderser == row);
                    if (idx >= 0) {
                        this.itemList[idx].f_edit = "0";
                        this.itemList[idx].f_editold = "0";
                    }
                });
                if (data.length > 0) {
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
            this.itemInfo = item;              
            if (row) {
                row.select(true) 
            } else {
                this.selected = [item]
            }
        },
        selectItem(item) {
            this.selected = item;
            this.itemInfo = item;
            
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
            // this.setedit();
        },
        close_plan() {

        },
        setedit() {
           if (this.itemInfo) this.itemInfo.f_edit = "1";
        },
        setplandate(item) {            
            if (this.itemInfo) this.itemInfo.f_edit = "1";
            this.$refs.dialog_plan.close();
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

    }

}
</script>

<style>

</style>
