<template>
    <v-container fluid>
        <v-toolbar height="40px" background-color="primary" dark>
            <v-toolbar-title>작업실적</v-toolbar-title>
            <v-spacer/>
            <tooltip-btn label="조회" @click="view"><v-icon>mdi-magnify</v-icon></tooltip-btn>
            <!-- <tooltip-btn label="작성" @click="add"><v-icon>mdi-plus</v-icon></tooltip-btn>
            <tooltip-btn label="삭제" @click="del"><v-icon>mdi-minus</v-icon></tooltip-btn> -->
            <tooltip-btn label="저장" @click="save"><v-icon>mdi-content-save-outline</v-icon></tooltip-btn>            
        </v-toolbar> 
        <v-card style="display: flex; height: 34px; " class="my-card text-input-blue my-text-fontsize  "> 
            <div style="display: flex;">
                <div style="width: 70px;"><v-text-field value="  생산예정일 : " readonly dense hide-details class="no-padding"/></div>                
                <input-dateft v-model="form.sDate1" :value2.sync="form.sDate2"/>                
                <div style="width: 56px;"><v-text-field value="    발주처 : " readonly dense hide-details class="no-padding"/></div>
                <div style="width: 100px;"><v-text-field v-model="form.sVend" dense hide-detail class="text-input-blue no-padding" /></div>
            </div>
        </v-card>
        <v-data-table ref="item-table" :headers="itemHead" :items="itemList"                     
                    item-key="i_orderser" single-select hide-default-footer
                    :item-class= "row_classes" :items-per-page="-1" 
                    class="elevation-1 text-no-wrap"  max-height="250px" height="250px" 
                    >
        </v-data-table>
        <p></p>
        <div>
            <v-row>
                <v-col>
                    <v-toolbar height="25px" background-color="primary" dark>
                        <v-toolbar-title class="v-subtitle">작업실적 등록</v-toolbar-title>
                        <v-spacer/>            
                        <tooltip-btn x-small label="행추가" @click="makeAdd"><v-icon>mdi-plus</v-icon></tooltip-btn>
                        <tooltip-btn x-small label="행삭제" @click="MakeDel"><v-icon>mdi-minus</v-icon></tooltip-btn>            
                    </v-toolbar>
                    <v-data-table ref="make-table" :headers="itemMakeHead" :items="itemMake"                     
                        item-key="i_orderser" single-select hide-default-footer
                        :item-class= "row_classes" :items-per-page="-1" 
                        class="elevation-1 text-no-wrap"  max-height="200px" height="200px" 
                        >
                    </v-data-table>
                </v-col>
                <v-col>
                    <v-toolbar height="25px" background-color="primary" dark>
                        <v-toolbar-title class="v-subtitle">불량 등록</v-toolbar-title>
                        <v-spacer/>            
                        <tooltip-btn x-small label="행추가" @click="errAdd"><v-icon>mdi-plus</v-icon></tooltip-btn>
                        <tooltip-btn x-small label="행삭제" @click="ErrDel"><v-icon>mdi-minus</v-icon></tooltip-btn>            
                    </v-toolbar>
                    <v-data-table ref="err-table" :headers="itemErrHead" :items="itemErr"                     
                        item-key="i_orderser" single-select hide-default-footer
                        :item-class= "row_classes" :items-per-page="-1" 
                        class="elevation-1 text-no-wrap"  max-height="200px" height="200px" 
                        >
                    </v-data-table>
                </v-col>
            </v-row>
        </div>

    </v-container>
</template>

<script>
import { mapActions } from "vuex";
import InputDateft from '../../components/InputForms/InputDateft.vue'
import EzDialog from '../../components/etc/EzDialog.vue';
import TooltipBtn from '../../components/etc/TooltipBtn.vue';
import InputDate2 from '../../components/InputForms/InputDate2.vue';
import { PROD001 } from '../../../util/constval';
import DatesDialog from '../../components/etc/DatesDialog.vue';

export default {
    components: { InputDateft, TooltipBtn, EzDialog, InputDate2, DatesDialog},
    mounted() {
        this.init();
    },
    data() {
        return {
            PROD001,
            valid: true,
            form : {
                sDate1:"", sDate2:"", sVend:"",
            },
            itemHead: [
                {text: 'No',       sortable: false, align:'center', width: "40"},
                {text: '수주번호',  value: 'i_orderno', sortable: false, align:'center', width: "75"},                
                {text: '발주처',     value: 'n_vend', sortable: false, align:'center', width: "120px"},
                {text: '항목(품목)', value: 'n_item', sortable: false, align:'center', width: "130px"},                
                
                {text: '상태',      value: 'f_work', sortable: false, align:'center', width: "50px"},
                {text: '시작일',    value: 'd_plan1', sortable: false, align:'center', width: "60px"},
                {text: '종료일',    value: 'd_plan2', sortable: false, align:'center', width: "60px"},
                {text: '지시수량',   value: 'm_cnt', sortable: false, align:'center', width: "55px"},
                {text: '생산수량',    value: 'd_plan2', sortable: false, align:'center', width: "55px"},
                {text: '불량수량',    value: 'd_plan2', sortable: false, align:'center', width: "55px"},

                {text: '비고',      value: 't_remark', sortable: false, align:'center', width: "300px"},
            ],
            itemList:[], itemInfo:[], selected:[],
            itemMakeHead: [
                {text: '작업일',    value: 'd_plan1', sortable: false, align:'center', width: "60px"},
                {text: '작업자',    value: 'd_plan1', sortable: false, align:'center', width: "60px"},
                {text: '생산수량',  value: 'd_plan1', sortable: false, align:'center', width: "60px"},
                {text: '비고',     value: 'd_plan1', sortable: false, align:'center', width: "60px"},
            ],
            itemErrHead: [
                {text: '작업일',    value: 'd_plan1', sortable: false, align:'center', width: "60px"},
                {text: '작업자',    value: 'd_plan1', sortable: false, align:'center', width: "60px"},
                {text: '불량수량',  value: 'd_plan1', sortable: false, align:'center', width: "60px"},
                {text: '불량원인',  value: 'd_plan1', sortable: false, align:'center', width: "60px"},
                {text: '비고',     value: 'd_plan1', sortable: false, align:'center', width: "60px"},
            ],
            itemMake:[], itemErr:[], makeRow:[], errRow:[],
           
        }
    },
    watch: {
    },
    computed: {
    },
    methods: {     
        ...mapActions("prod", ["iuProdPlanlist"]), 
        async init() {
            this.view();
        },  
        async view() {
            
        },
        async add() {

        },
        async del() {

        },
        async save() {
        },
        getColor (data) {
            if(data == "1") { return 'red'; } 
            else if (data == "2") {return 'blue';}
            else { return 'green';}
        },
    },
}
</script>

<style>

</style>