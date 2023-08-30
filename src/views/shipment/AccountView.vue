<template>
    <v-container fluid>        
        <v-toolbar height="40px" background-color="primary" dark>
            <v-toolbar-title>대금수금등록</v-toolbar-title>
            <v-spacer/>
            
            <tooltip-btn label="계산서 조회" @click="viewAccout"><v-icon>mdi-magnify</v-icon></tooltip-btn>
            <tooltip-btn label="대금 등록" @click="addAccout"><v-icon>mdi-plus</v-icon></tooltip-btn>
            <tooltip-btn label="대금 삭제" @click="delAccout"><v-icon>mdi-minus</v-icon></tooltip-btn>
            <tooltip-btn label="대금 저장" @click="saveAccout"><v-icon>mdi-content-save-outline</v-icon></tooltip-btn>
            
        </v-toolbar> 
        <v-card style="display: flex; height: 34px; " class="my-card text-input-blue my-text-fontsize  "> 
            <div style="display: flex;">
                <div style="width: 70px;"><v-text-field value="계산서발행일:" readonly dense hide-details class="no-padding"/></div>                
                <input-dateft v-model="form.sDate1" :value2.sync="form.sDate2"/>
                <div style="width: 56px;"><v-text-field value="    고객사 : " readonly dense hide-details class="no-padding"/></div>
                <div style="width: 100px;"><v-text-field v-model="form.sVend" dense hide-detail class="text-input-blue no-padding" /></div>
                <!-- {{ invoceend }} / {{ masterinfo.f_status }} / {{ masterinfo.a_amt }} / {{ masterinfo.a_vat }} // {{editJob }} -->
            </div>
        </v-card>
        <v-data-table ref="item-table" :headers="masterHead" :items="masters"                     
                    item-key="i_invoiceno" v-model="selectedM" @click:row="rowSelectMaster" single-select hide-default-footer
                    :items-per-page="-1" 
                    class="elevation-1 text-no-wrap"  max-height="280px" height="280px" 
                    >
            <template v-slot:[`item.a_inamt`]="{ item }">                
                <div class="right2-align"> {{  comma(item.a_inamt) }}</div>
            </template>
            <template v-slot:[`item.a_accamt`]="{ item }">                
                <div class="right2-align"> {{  comma(item.a_accamt) }}</div>
            </template> 
            <template v-slot:[`item.p_per`]="{ item }">                
                {{  formattedPercentage(item.p_per) }}
            </template> 
            <template v-slot:[`item.a_dif`]="{ item }">                
                <div class="right2-align"> {{  comma(item.a_dif) }}</div>
            </template>
        </v-data-table>
        <v-toolbar height="25px" background-color="primary" dark >
            <v-toolbar-title>대금수금 등록 List</v-toolbar-title>
            <v-spacer/>
        </v-toolbar>
        <v-data-table ref="tabledt" :headers="itemHead" :items="itemLists" 
                    @click:row="rowSelectDetail" 
                    item-key="i_accountser" 
                    single-select v-model="selectedD"                    
                    :items-per-page="20" :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" 
                    :item-class= "row_classes" 
                    class="elevation-1 text-no-wrap no-padding" height="285px" max-height="285px"> 
        </v-data-table>
    </v-container>
</template>

<script>
import { mapActions } from "vuex";
import EzDialog from '../../components/etc/EzDialog.vue';
import TooltipBtn from '../../components/etc/TooltipBtn.vue';
import validateRules from "../../../util/validateRules";
import { comma, getDate, dateToKorean, numberToKorean, amtToKorean, previousMonth } from '../../../util/lib';
import InputDateft from '../../components/InputForms/InputDateft.vue';
export default {
    components: { EzDialog, TooltipBtn, InputDateft},
    name: "Account",
    mounted() {        
        this.init();
    },  
    data() {
        return {
            valid: true,
            comma,
            form : {sDate1:"", sDate2:"", sVend:"",},
            masterHead: [
                {text: '고객사',         value: 'n_vend',     sortable: false, align:'center', width: "100px" },
                {text: '계산서번호',     value: 'i_invoiceno', sortable: false, align:'center', width: "70px"},
                {text: '발행일자',       value: 'd_invoice', sortable: false, align:'center', width: "55px"}, 
                {text: '발행금액',       value: 'a_inamt', sortable: false, align:'center', width: "50px"}, 
                {text: '수금누계',       value: 'a_accamt', sortable: false, align:'center', width: "50px"}, 
                {text: '수금진행률',     value: 'p_per', sortable: false, align:'center', width: "50px"}, 
                {text: '수금잔액',       value: 'a_dif', sortable: false, align:'center', width: "50px"}, 
                {text: '수금회수',       value: 'm_cnt', sortable: false, align:'center', width: "50px"}, 
                {text: '수금일자',       value: 'd_account2', sortable: false, align:'center', width: "50px"}, 
            ],
            masters:[], masterinfo:[], selectedM: [],
            itemHead: [
                {text: '수금일자',    value: 'd_account', sortable: false, align:'center', width: "60px"},
                {text: '수금금액',    value: 'a_accamt', sortable: false, align:'center', width: "60px"},
                {text: '출하번호',    value: 'i_shipno', sortable: false, align:'center', width: "60px"},
                {text: '항목(품목)',  value: 'n_item', sortable: false, align:'center', width: "130px"},
                {text: '규격(사양)',  value: 't_size', sortable: false, align:'center', width: "100px"},
                {text: '단위',        value: 'i_unit', sortable: false, align:'center', width: "90px"},
                // {text: '수량',        value: 'm_cnt', sortable: false, align:'center', width: "60px"},
                // {text: '단가',        value: 'a_unit', sortable: false, align:'center', width: "60px"},
                // {text: '금액',        value: 'a_inamt', sortable: false, align:'center', width: "60px"},
                // {text: 'VAT',        value: 'a_invat', sortable: false, align:'center', width: "60px"},
                {text: '비고',  value: 't_remark', sortable: false, align:'center', width: "150px"}, 
                
            ],
            itemLists: [], itemInfo: [], selectedD: [],
        }
    },
    computed: {
        rules: () => validateRules,
    },
    methods: {
        ...mapActions("shipment", ["iuAccountlist"]),
        row_classes(item) {
            if (item.f_edit == "2") {
                return "orange";
            } 
        },
        async init() {
            this.form.sDate1=previousMonth();
            this.viewAccout();
        },
        async viewAccout() {
            this.masterinfo = []; this.selectedM = []; this.itemLists = []; this.itemInfo = [];
            this.masters = await this.$axios.post(`/api/shipment/getAccountInvoce`, this.form);             
        },
        async addAccout() {},
        async delAccout() {},
        async saveAccout() {},

        async rowSelectMaster(item, row) {
            this.masterinfo = item;
            if (row) { row.select(true) } else { this.selectedM = [item] };
            // if (item.f_edit == "1" && item.f_editold == "1") return;
            this.selectedD = []; 
            this.itemInfo = [];
            this.itemLists =  await this.$axios.post(`/api/shipment/getAccountlist`, this.masterinfo);
        },

        rowSelectDetail:function (item, row) {            
            if (row) { row.select(true) } else { this.selectedD = [item] };
            this.itemInfo = item;
        },
        formattedPercentage(data) {
            const percentage = data * 100;
            return percentage.toFixed(2) + '%';
        }, 
    },
}
</script>

<style>

</style>