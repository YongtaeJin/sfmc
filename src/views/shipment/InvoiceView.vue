<template>
    <v-container fluid>        
        <v-toolbar height="40px" background-color="primary" dark>
            <v-toolbar-title>세금계산서등록(거래명세서)</v-toolbar-title>
            <v-spacer/>
            
            <tooltip-btn label="계산서 조회" @click="viewInvoice"><v-icon>mdi-magnify</v-icon></tooltip-btn>
            <tooltip-btn label="계산서 작성" @click="addInvoice"><v-icon>mdi-plus</v-icon></tooltip-btn>
            <tooltip-btn label="계산서 삭제" @click="delInvoice"><v-icon>mdi-minus</v-icon></tooltip-btn>
            <tooltip-btn label="계산서 저장" @click="saveInvoice"><v-icon>mdi-content-save-outline</v-icon></tooltip-btn>
        </v-toolbar> 
        <v-card style="display: flex; height: 34px; " class="my-card text-input-blue my-text-fontsize  "> 
            <div style="display: flex;">
                <div style="width: 70px;"><v-text-field value="   발행일자 : " readonly dense hide-details class="no-padding"/></div>                
                <input-dateft v-model="form.sDate1" :value2.sync="form.sDate2"/>
                <div style="width: 56px;"><v-text-field value="    고객사 : " readonly dense hide-details class="no-padding"/></div>
                <div style="width: 100px;"><v-text-field v-model="form.sVend" dense hide-detail class="text-input-blue no-padding" /></div>
            </div>
        </v-card>
        <v-row>
            <v-col col="12" sm="4" md="4">
                <v-data-table ref="table" :headers="masterHead" :items="masters" @click:row="rowSelectMaster" 
                    item-key="i_invoiceser" single-select v-model="selectedM"
                    
                    :items-per-page="20" :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" 
                    class="elevation-1 text-no-wrap" height="500px" max-height="500px" > 

                    <template v-slot:[`item.a_orderamt`]="{ item }">
                        {{ comma(item.a_orderamt) }}
                    </template>
                </v-data-table>
            </v-col>
            <v-col col="12" sm="8" md="8">
                <v-form @submit.prevent="save" ref="form" v-model="valid" lazy-validation>
                <v-card color="grey lighten-4">
                    <v-row no-gutters class="my-text-field" >
                        <v-col col="8" sm="1" md="1"><v-text-field value="계산서번호" readonly dense hide-details class="text-input-redbrg no-padding"/></v-col>
                        <v-col col="8" sm="3" md="3"><v-text-field v-model="masterinfo.i_invoiceno" :readonly="!edit" @input="onChangeMaster" dense hide-details class="no-padding"/></v-col>
                    </v-row>
                    <v-row no-gutters class="my-text-field" >
                        <v-col col="8" sm="1" md="1"><v-text-field value="발행일자" readonly dense hide-details class="text-input-redbrg no-padding"/></v-col>
                        <v-col col="8" sm="3" md="3"><input-date-3 v-model="masterinfo.d_invoice" :readonly="!edit" @input="onChangeMaster" :rules="rules.date({required: false})" /></v-col>
                    </v-row>
                    <v-row no-gutters class="my-text-field">
                        <v-col col="8" sm="1" md="1"><v-text-field value="고객사" readonly dense hide-details class="text-input-redbrg no-padding"/> </v-col>
                        <v-col col="8" sm="3" md="3">
                            <v-text-field v-if="edit" readonly  v-model="masterinfo.n_vend" dense hide-details class="no-padding">
                                <template v-slot:append>
                                    <v-btn icon x-small tabindex="-1" @click="clickVend"><v-icon> mdi-dialpad </v-icon></v-btn>
                                </template>
                            </v-text-field>
                            <v-text-field v-else v-model="masterinfo.n_vend" readonly @input="onChangeMaster" dense hide-details class="no-padding" />
                        </v-col>
                        <v-col col="8" sm="1" md="1"></v-col>
                    </v-row>
                    <v-row no-gutters class="my-text-field">
                        <v-col col="8" sm="1" md="1"><v-text-field value="사업자번호" readonly dense hide-details class="text-input-bluebrg no-padding"/> </v-col>
                        <v-col col="8" sm="2" md="2"><v-text-field v-model="masterinfo.i_company" :readonly="!edit" @input="onChangeMaster" dense hide-details class="no-padding" /></v-col>
                        <v-col col="8" sm="1" md="1"><v-text-field value="대표자" readonly dense hide-details class="text-input-bluebrg no-padding"/> </v-col>
                        <v-col col="8" sm="2" md="2"><v-text-field v-model="masterinfo.n_ceo" :readonly="!edit" @input="onChangeMaster" dense hide-details class="no-padding" /></v-col>
                    </v-row>
                    <v-row no-gutters class="my-text-field">
                        <v-col col="8" sm="1" md="1"><v-text-field value="업태" readonly dense hide-details class="text-input-bluebrg no-padding"/> </v-col>
                        <v-col col="8" sm="2" md="2"><v-text-field v-model="masterinfo.t_job1" :readonly="!edit" @input="onChangeMaster" dense hide-details class="no-padding" /></v-col>
                        <v-col col="8" sm="1" md="1"><v-text-field value="업종" readonly dense hide-details class="text-input-bluebrg no-padding"/> </v-col>
                        <v-col col="8" sm="2" md="2"><v-text-field v-model="masterinfo.t_job2" :readonly="!edit" @input="onChangeMaster" dense hide-details class="no-padding" /></v-col>
                    </v-row>
                    <v-row no-gutters class="my-text-field">
                        <v-col col="8" sm="1" md="1"><v-text-field value="전화번호" readonly dense hide-details class="text-input-bluebrg no-padding"/> </v-col>
                        <v-col col="8" sm="2" md="2"><v-text-field v-model="masterinfo.t_tel" :readonly="!edit" @input="onChangeMaster" dense hide-details class="no-padding" /></v-col>
                        <v-col col="8" sm="1" md="1"><v-text-field value="FAX" readonly dense hide-details class="text-input-bluebrg no-padding"/> </v-col>
                        <v-col col="8" sm="2" md="2"><v-text-field v-model="masterinfo.t_fax" :readonly="!edit" @input="onChangeMaster" dense hide-details class="no-padding" /></v-col>
                        <v-col col="8" sm="1" md="1"><v-text-field value="이메일" readonly dense hide-details class="text-input-bluebrg no-padding"/> </v-col>
                        <v-col col="8" sm="2" md="2"><v-text-field v-model="masterinfo.e_mail" :readonly="!edit" @input="onChangeMaster" dense hide-details class="no-padding" /></v-col>
                    </v-row>
                    <v-row no-gutters class="my-text-field">
                        <v-col col="8" sm="1" md="1"><v-text-field value="주소" readonly dense hide-details class="text-input-bluebrg no-padding"/> </v-col>
                        <v-col col="8" sm="8" md="8"><v-text-field v-model="masterinfo.t_addr" :readonly="!edit" @input="onChangeMaster" dense hide-details class="no-padding" /></v-col>
                    </v-row>
                </v-card>
                </v-form>
                <v-toolbar height="35px" color="accent" >
                    <v-toolbar-title>계산서 품목 List</v-toolbar-title>
                    <v-spacer/>                       
                    <tooltip-btn label="추가" @click="addItem" fab x-small><v-icon>mdi-plus</v-icon></tooltip-btn>            
                    <tooltip-btn label="삭제" @click="delItem" fab x-small><v-icon>mdi-minus</v-icon></tooltip-btn>
                    
                </v-toolbar>
                <v-data-table :headers="itemHead" :items="itemListFilter" 
                    @click:row="rowSelectDetail" 
                    item-key="i_invoiceserno" 
                    single-select v-model="selectedD"                    
                    :items-per-page="20" :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" 
                    :item-class= "row_classes" 
                    class="elevation-1 text-no-wrap no-padding" height="285px" max-height="285px"> 
                </v-data-table>
            </v-col>
        </v-row>
        <ez-dialog ref="dialog_Vend" label="거래처" persistent @onClose="close_item" width="460px" >
            <vend-pop @onSelect="selectVend"></vend-pop>
        </ez-dialog>
    </v-container>  
</template>

<script>
import { mapActions } from "vuex";
import EzDialog from '../../components/etc/EzDialog.vue';
import TooltipBtn from '../../components/etc/TooltipBtn.vue';
import InputDateft from '../../components/InputForms/InputDateft.vue';
import InputAmt from '../../components/InputForms/InputAmt.vue';
import InputNumber from '../../components/InputForms/InputNumber.vue';
import InputDate3 from '../../components/InputForms/InputDate3.vue';
import validateRules from "../../../util/validateRules";
import { comma } from '../../../util/lib';
import ItemPop from '../codelist/ItemPop.vue';
import VendPop from '../codelist/VendPop.vue';

export default {
    components: { EzDialog, InputDateft, TooltipBtn, InputAmt, InputNumber, InputDate3, ItemPop, VendPop },
    name: "Invoice",
    mounted() {        
        this.init();
    },    
    data() {
        return {
            valid: true,
            comma,
            form : {sDate1:"", sDate2:"", sVend:"",},
            masterHead: [
                {text: '발행일자',   value: 'd_invoice', sortable: false, align:'center', width: "55px"},                
                {text: '계산서번호', value: 'i_invoiceno', sortable: false, align:'center', width: "70px"},
                {text: '고객사',     value: 'n_vend',     sortable: false, align:'center', width: "100px" },                
            ],
            masters:[], masterinfo:[], selectedM: [],
            itemHead: [
                {text: 'No',  value: 's_sort', sortable: false, align:'center', width: "35px"},
                {text: '항목(품목)',  value: 'n_item', sortable: false, align:'left', width: "130px"},
                {text: '규격(사양)',  value: 't_size', sortable: false, align:'left', width: "100px"},
                {text: '단위',        value: 'i_unit', sortable: false, align:'center', width: "90px"},
                {text: '수량',        value: 'm_cnt', sortable: false, align:'center', width: "60px"},
                {text: '단가',        value: 'a_unit', sortable: false, align:'right', width: "90px"},
                {text: '금액',        value: 'a_inamt', sortable: false, align:'right', width: "90px"},
                {text: 'VAT',        value: 'a_invat', sortable: false, align:'right', width: "90px"},
                {text: '출하번호',    value: 'i_shipno', sortable: false, align:'center', width: "60px"},                
                {text: '비고',  value: 't_remark', sortable: false, align:'center', width: "90px"}, 
            ],
            itemLists: [], itemInfo: [], itemListFilter: [], selectedD: [],
        }
    },

    computed: {
        rules: () => validateRules, 
        edit() {          
            // 수정 가능여 부  
            return ( this.masterinfo.f_status == "0" ) ? true : false;
        },
    },
    methods: {
        async init() {
            this.viewInvoice();
        },
        rowSelectMaster :function (item, row) {       
            if (this.editJob) return;
            this.masterinfo = item;  
            //this.rowFilter(item);
            if (row) { row.select(true) } else { this.selectedM = [item] };
        },
        onChangeMaster() {
            const idx = this.masters.indexOf(this.masterinfo);
            if (idx > -1) this.masters[idx].f_edit = '1';
        },
        async viewInvoice() {
            // this.itemLists = await this.$axios.post(`/api/shipment/getDerliverview`, this.form); 
        },
        async addInvoice() {

        },
        async delInvoice() {

        },
        async saveInvoice() {

        },
        async printInvoce() {

        },
        clickVend() {
            this.$refs.dialog_Vend.open();
        },
        selectVend(item) { 
            const idx = this.masters.indexOf(this.masterinfo);
            if (idx >=0 ) {
                this.masters[idx].c_vend     = item.c_vend;
                this.masters[idx].n_vend     = item.n_vend;
                this.masters[idx].n_compnay  = item.n_compnay;
                this.masters[idx].n_ceo      = item.n_ceo;
                this.masters[idx].i_company  = item.i_company;
                this.masters[idx].t_job1     = item.t_job1;
                this.masters[idx].t_job2     = item.t_job2;
                this.masters[idx].t_tel      = item.t_tel;
                this.masters[idx].t_fax      = item.t_fax;
                this.masters[idx].e_mail     = item.e_mail;
                this.masters[idx].t_addr     = item.t_addr;

                this.onChangeMaster();
            }
            this.$refs.dialog_Vend.close();
        },
        close_item() { },

        rowSelectDetail:function (item, row) {
            row.select(true);
            this.itemInfo = item;
        },
        onChangeDetail() {            
            const idx = this.itemLists.indexOf(this.itemInfo);
            if (idx > -1) {
                if (this.itemInfo.f_edit == "0" ) this.itemLists[idx].f_edit = '1';                
            };            
        },
        async addItem() {
        },
        async delItem() {

        },
        row_classes(item) {
            if (item.f_edit == "2") {return "orange";} 
        },
    },
}
</script>

<style>

</style>