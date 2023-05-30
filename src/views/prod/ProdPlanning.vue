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
        <v-card style="display: flex; height: 34px; " class="my-card text-input-blue my-text-fontsize "> 
            <div style="display: flex;">
                <div style="width: 70px;"><v-text-field value="  납품예정일 : " readonly dense hide-details /></div>                
                <input-dateft v-model="form.sDate1" :value2.sync="form.sDate2"/>                
                <div style="width: 56px;"><v-text-field value="    발주처 : " readonly dense hide-details /></div>
                <div style="width: 100px;"><v-text-field v-model="form.sVend" dense hide-detail sclass="text-input-blue" /></div>
            </div>
        </v-card>
        <v-data-table ref="data-table" :headers="itemHead" :items="itemList"                     
                    item-key="i_prodser" single-select v-model="selected" @click:row="rowSelect" 
                    :items-per-page="20" :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" 
                    class="elevation-1 text-no-wrap" height="500px" max-height="500px" 
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
            
        </v-data-table>
    </v-container>
</template>

<script>
import InputDateft from '../../components/InputForms/InputDateft.vue'
import EzDialog from '../../components/etc/EzDialog.vue';
import TooltipBtn from '../../components/etc/TooltipBtn.vue';

export default {
    // components: { TooltipBtn, EzDialog, InputDate2, InputAmt, InputNumber, ItemPop, VendPop, SalesNotestimate },
    components: { InputDateft, TooltipBtn, EzDialog },
    data() {
        return {
            valid: true,
            form : {
                sDate1:"", sDate2:"", sVend:"",
            },
            itemHead: [
                {text: '수주번호',  value: 'i_orderno', sortable: false, align:'center', width: "75"},
                {text: '수주일',    value: 's_orddate', sortable: false, align:'center', width: "60px"},                
                {text: '발주처',    value: 'n_vend', sortable: false, align:'center', width: "120px"},
                {text: '항목(품목)', value: 'n_item', sortable: false, align:'left', width: "130px"},
                {text: '규격(사양)', value: 't_size', sortable: false, align:'left', width: "100px"},
                {text: '단위',      value: 'i_unit', sortable: false, align:'center', width: "90px"},
                {text: '수량',      value: 'm_cnt', sortable: false, align:'center', width: "60px"},
                {text: '납기일',    value: 's_duedate', sortable: false, align:'center', width: "60px"},
                {text: '상태',      value: 'f_status', sortable: false, align:'center', width: "60px"},
                {text: '시작일',    value: 's_date1', sortable: false, align:'center', width: "60px"},
                {text: '종료일',    value: 's_date2', sortable: false, align:'center', width: "60px"},
                {text: '비고',      value: 't_remark', sortable: false, align:'center', width: "300px"},
            ],


            itemList:[], itemInfo:[], selected:[],
           
        }
    },
    methods: {        
        async view() {

        },
        async add() {

        },
        async del() {

        },
        async save() {

        },
        rowSelectMaster :function (item, row) {       
            this.itemInfo = item;  
            this.rowFilter(item);
            if (row) {
                row.select(true) 
            } else {
                this.selected = [item]
            }
        },
    }

}
</script>

<style>

</style>
