<template>
    <v-container fluid>
        <v-toolbar height="40px" background-color="primary" dark>
            <v-toolbar-title>생산 계획</v-toolbar-title>
            <v-spacer/>
            <tooltip-btn label="조회" @click="view"><v-icon>mdi-magnify</v-icon></tooltip-btn>
            <tooltip-btn label="작성" @click="add"><v-icon>mdi-plus</v-icon></tooltip-btn>
            <tooltip-btn label="삭제" @click="del"><v-icon>mdi-minus</v-icon></tooltip-btn>
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
                    item-key="i_orderser" single-select v-model="selected" @click:row="rowSelect" 
                    :item-class= "row_classes" :items-per-page="20" :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" 
                    class="elevation-1 text-no-wrap"  max-height="500px" 
                    >
            <template v-slot:header="">
                <thead align='center'>
                    <tr>
                        <th colspan="3" class="text-center">수주정보</th>
                        <th colspan="5" class="text-center">제품정보</th>
                        <th colspan="4" class="text-center">생산계획</th>
                    </tr>
                </thead>
            </template>

            <template v-slot:[`item.f_work`]="{ item }">
                <!-- <v-chip v-if="item.f_work == '1' || item.f_work == '2'" @dblclick="setWork(item)" x-small class="no_padmar1">
                    {{ item.f_work == '1' ? '수주' : '계획'}}
                </v-chip>
                <v-chip v-else x-small class="no_padmar1"> {{getStatus(item.f_work)}} </v-chip>                 -->
                <td v-if="item.f_work == '1' || item.f_work == '2'" @dblclick ="setWork(item)" class="underline" align='center'>{{getStatus(item.f_work)}}</td>
                <span v-else>{{getStatus(item.f_work)}}</span>
            </template>
            <template v-slot:[`item.d_plan1`]="{ item }">                
                <td v-if="item.f_work == '1'" @dblclick ="handleCellClick(item.d_plan1)" class="underline" align='center'>{{item.d_plan1}}</td>
                <span v-else>{{item.d_plan1}}</span>
            </template>
            <template v-slot:[`item.d_plan2`]="{ item }">                
                <td v-if="item.f_work == '1'" @dblclick ="handleCellClick(item.d_plan2)" class="underline" align='center'>{{item.d_plan2}}</td>
                    
                <span v-else>{{item.d_plan2}}</span>
            </template>
         
            
        </v-data-table>
    </v-container>
</template>

<script>
import InputDateft from '../../components/InputForms/InputDateft.vue'
import EzDialog from '../../components/etc/EzDialog.vue';
import TooltipBtn from '../../components/etc/TooltipBtn.vue';
import InputDate2 from '../../components/InputForms/InputDate2.vue';
import { PROD001 } from '../../../util/constval';

export default {
    // components: { TooltipBtn, EzDialog, InputDate2, InputAmt, InputNumber, ItemPop, VendPop, SalesNotestimate },
    components: { InputDateft, TooltipBtn, EzDialog, InputDate2},
    data() {
        return {
            PROD001,
            valid: true,
            form : {
                sDate1:"", sDate2:"", sVend:"",
            },
            itemHead: [
                {text: '수주번호',  value: 'i_orderno', sortable: false, align:'center', width: "75"},
                {text: '수주일',    value: 's_date', sortable: false, align:'center', width: "60px"},                
                {text: '발주처',    value: 'n_vend', sortable: false, align:'center', width: "120px"},
                {text: '항목(품목)', value: 'n_item', sortable: false, align:'left', width: "130px"},
                {text: '규격(사양)', value: 't_size', sortable: false, align:'left', width: "100px"},
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
        this.init();
    },
    watch: {
    },
    computed: {
    },
    methods: {     
        async init() {
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
            console.log("handleCellClick")
        }

    }

}
</script>

<style>

</style>
