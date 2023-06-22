<template>
    <v-container fluid>
        <v-toolbar height="40px" background-color="primary" dark>
            <v-toolbar-title>생산현황</v-toolbar-title>
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