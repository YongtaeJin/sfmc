<template>
    <v-container fluid>
        <v-toolbar height="40px" background-color="primary" dark>
            <v-toolbar-title>수주 관리</v-toolbar-title>
            <v-spacer/>            
            <tooltip-btn label="수주 조회" @click="viewOrd"><v-icon>mdi-magnify</v-icon></tooltip-btn>
            <tooltip-btn label="수주 작성" @click="addOrd"><v-icon>mdi-plus</v-icon></tooltip-btn>
            <tooltip-btn label="수주 삭제" @click="delOrd"><v-icon>mdi-minus</v-icon></tooltip-btn>
            <tooltip-btn label="수주 저장" @click="saveOrd"><v-icon>mdi-content-save-outline</v-icon></tooltip-btn>
            
        </v-toolbar> 
        <v-card class="my-card">
            <v-row no-gutters class="my-text-field">
                <v-col col="12" sm="1" md="1"><v-text-field value="수주기간" readonly dense hide-details class="text-input-blue"/></v-col>
                <v-col col="12" sm="2" md="2"><input-date-2 v-model="form.sDate1" /></v-col>
                <v-col col="12" sm="2" md="2"><input-date-2 v-model="form.sDate2" /></v-col>
                <v-col col="12" sm="1" md="1"><v-text-field value="고객사" readonly dense hide-details class="text-input-blue"/></v-col>
                <v-col col="12" sm="3" md="3"><v-text-field v-model="form.sVend" dense hide-detailsclass="text-input-blue" /></v-col>
                <v-col col="12" sm="1" md="1"><v-text-field value="수주번호" readonly dense hide-details class="text-input-blue"/> </v-col>
                <v-col col="12" sm="2" md="2"><v-text-field v-model="form.sOrder" dense hide-detailsclass="text-input-blue" /></v-col>
            </v-row>
            <v-row/>
        </v-card>

        <v-row >
            <v-col col="12" sm="4" md="4">
                <v-data-table ref="table" :headers="masterHead" :items="masters" @click:row="rowSelectMaster" 
                    item-key="i_order" single-select v-model="selectedM"
                    
                    :items-per-page="20" :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" 
                    class="elevation-1 text-no-wrap" height="500px" max-height="500px" > 

                    <template v-slot:[`item.a_orderamt`]="{ item }">
                        {{numberToKorean(item.a_orderamt)}}
                    </template>
                </v-data-table>
            </v-col>
            <v-col col="12" sm="8" md="8">

                <v-toolbar height="35px" color="accent" >
                    <v-toolbar-title>수주 품목 List</v-toolbar-title>
                    <v-spacer/>                       
                    <tooltip-btn label="추가" @click="addItem" fab x-small><v-icon>mdi-plus</v-icon></tooltip-btn>            
                    <tooltip-btn label="삭제" @click="delItem" fab x-small><v-icon>mdi-minus</v-icon></tooltip-btn>
                </v-toolbar>
                <v-data-table :headers="itemHead" :items="itemListFilter"
                    @click:row="rowSelectDetail" 
                    item-key="i_orderser" 
                    single-select v-model="selectedD"                    
                    :items-per-page="20" :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" 
                    :item-class= "row_classes" 
                    class="elevation-1 text-no-wrap" height="290px" max-height="290px">

                </v-data-table>
            </v-col>
        </v-row>

    </v-container>
</template>

<script>
import qs from "qs";
import { mapActions } from "vuex";
import EzDialog from '../../components/etc/EzDialog.vue';
import TooltipBtn from '../../components/etc/TooltipBtn.vue';
import InputDate2 from '../../components/InputForms/InputDate2.vue';
import { getDate, deepCopy, dateToKorean, numberToKorean, amtToKorean } from '../../../util/lib';
import validateRules from "../../../util/validateRules";



export default {
    components: { TooltipBtn, EzDialog, InputDate2 },
    name: "Salesorders",
    mounted() {
        this.init();
    },
    data() {
        return {
            valid: true,
            masterHead: [
                {text: '수주일',    value: 's_date', sortable: false, align:'center', width: "65px"},                
                {text: '수주번호',  value: 'i_orderno', sortable: false, align:'center', width: "70px"},
                {text: '고객사',    value: 'n_vend', sortable: false, align:'left', width: "75px" },
                {text: '수주금액',  value: 'a_orderamt', sortable: false, align:'right', width: "65px"},
            ],
            masters:[], masterinfo:[], selectedM: [],
            itemHead: [
                {text: 'No',  value: 's_sort', sortable: false, align:'center', width: "25px"},
                {text: '항목(품목)',  value: 'n_item', sortable: false, align:'left', width: "130px"},
                {text: '규격(사양)',  value: 't_size', sortable: false, align:'left', width: "100px"},
                {text: '단위',  value: 'i_unit', sortable: false, align:'center', width: "90px"},
                {text: '수량',  value: 'm_cnt', sortable: false, align:'center', width: "60px"},
                {text: '단가',  value: 'a_unit', sortable: false, align:'right', width: "90px"},
                {text: '금액',  value: 'a_amt', sortable: false, align:'right', width: "90px"},                
                {text: '납기일',  value: 's_duedate', sortable: false, align:'center', width: "90px"},     
                {text: '비고',  value: 't_remark', sortable: false, align:'center', width: "90px"}, 
            ],
            itemLists: [], itemList: [], itemListFilter: [], selectedD: [],
            form : {
                sDate1:"", sDate2:"", sOrder:"", sVend:"", 
            },
        }
    },
    watch: {
    },
    computed: {
    },
    methods: {
        // ...mapActions("sales"),
        row_classes(item) {
            if (item.f_edit == "2") {
                return "orange";
            } 
        },
        async init() {
        },
        async viewOrd() {

        },
        async addOrd() {

        },
        async delOrd() {

        },
        async saveOrd() {

        },
        rowSelectMaster :function (item, row) {        
            if (this.editJob) return;
            
            row.select(true);            
            this.master = item;  
            this.rowFilter(item);                                
        },
        rowFilter(item) {      
            if (this.itemLists.length > 0) {
                this.itemListFilter = this.itemLists.filter((r) => {
                    return r.i_order == item.i_order && r.c_com == item.c_com;
                }); 
            } else {
                this.itemListFilter = [];
            }
        },
        rowSelectDetail:function (item, row) {                
            row.select(true);
            this.itemLis = item;
        },
        async addItem() {

        },
        async delItem() {

        },
    }

}
</script>

<style>

</style>