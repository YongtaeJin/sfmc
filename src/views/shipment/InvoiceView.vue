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
                {{ invoceend }} / {{ masterinfo.f_status }}

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
                        <v-col col="8" sm="3" md="3"><v-text-field v-model="masterinfo.i_invoiceno" :readonly="invoceend" @input="onChangeMaster" dense hide-details class="no-padding"/></v-col>
                    </v-row>
                    <v-row no-gutters class="my-text-field" >
                        <v-col col="8" sm="1" md="1"><v-text-field value="발행일자" readonly dense hide-details class="text-input-redbrg no-padding"/></v-col>
                        <v-col col="8" sm="3" md="3"><input-date-3 v-model="masterinfo.d_invoice" :readonly="invoceend" @input="onChangeMaster" :rules="rules.date({required: false})" /></v-col>
                    </v-row>
                    <v-row no-gutters class="my-text-field">
                        <v-col col="8" sm="1" md="1"><v-text-field value="고객사" readonly dense hide-details class="text-input-redbrg no-padding"/> </v-col>
                        <v-col col="8" sm="3" md="3">
                            <v-text-field v-if="!invoceend && changVend" readonly  v-model="masterinfo.n_vend" dense hide-details class="no-padding">
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
                        <v-col col="8" sm="2" md="2"><v-text-field v-model="masterinfo.i_company" readonly @input="onChangeMaster" dense hide-details class="no-padding" /></v-col>
                        <v-col col="8" sm="1" md="1"><v-text-field value="대표자" readonly dense hide-details class="text-input-bluebrg no-padding"/> </v-col>
                        <v-col col="8" sm="2" md="2"><v-text-field v-model="masterinfo.n_ceo" readonly @input="onChangeMaster" dense hide-details class="no-padding" /></v-col>
                    </v-row>
                    <v-row no-gutters class="my-text-field">
                        <v-col col="8" sm="1" md="1"><v-text-field value="업태" readonly dense hide-details class="text-input-bluebrg no-padding"/> </v-col>
                        <v-col col="8" sm="2" md="2"><v-text-field v-model="masterinfo.t_job1" readonly @input="onChangeMaster" dense hide-details class="no-padding" /></v-col>
                        <v-col col="8" sm="1" md="1"><v-text-field value="업종" readonly dense hide-details class="text-input-bluebrg no-padding"/> </v-col>
                        <v-col col="8" sm="2" md="2"><v-text-field v-model="masterinfo.t_job2" readonly @input="onChangeMaster" dense hide-details class="no-padding" /></v-col>
                    </v-row>
                    <v-row no-gutters class="my-text-field">
                        <v-col col="8" sm="1" md="1"><v-text-field value="전화번호" readonly dense hide-details class="text-input-bluebrg no-padding"/> </v-col>
                        <v-col col="8" sm="2" md="2"><v-text-field v-model="masterinfo.t_tel" readonly @input="onChangeMaster" dense hide-details class="no-padding" /></v-col>
                        <v-col col="8" sm="1" md="1"><v-text-field value="FAX" readonly dense hide-details class="text-input-bluebrg no-padding"/> </v-col>
                        <v-col col="8" sm="2" md="2"><v-text-field v-model="masterinfo.t_fax" readonly @input="onChangeMaster" dense hide-details class="no-padding" /></v-col>
                        <v-col col="8" sm="1" md="1"><v-text-field value="이메일" readonly dense hide-details class="text-input-bluebrg no-padding"/> </v-col>
                        <v-col col="8" sm="2" md="2"><v-text-field v-model="masterinfo.e_mail" readonly @input="onChangeMaster" dense hide-details class="no-padding" /></v-col>
                    </v-row>
                    <v-row no-gutters class="my-text-field">
                        <v-col col="8" sm="1" md="1"><v-text-field value="주소" readonly dense hide-details class="text-input-bluebrg no-padding"/> </v-col>
                        <v-col col="8" sm="8" md="8"><v-text-field v-model="masterinfo.t_addr" readonly @input="onChangeMaster" dense hide-details class="no-padding" /></v-col>
                    </v-row>
                </v-card>
                </v-form>
                <v-toolbar height="35px" color="accent" >
                    <v-toolbar-title>계산서 품목 List</v-toolbar-title>
                    <v-spacer/>                       
                    <tooltip-btn label="추가" @click="addItem" fab x-small><v-icon>mdi-plus</v-icon></tooltip-btn>            
                    <tooltip-btn label="삭제" @click="delItem" fab x-small><v-icon>mdi-minus</v-icon></tooltip-btn>
                    
                </v-toolbar>
                <v-data-table :headers="itemHead" :items="itemLists" 
                    @click:row="rowSelectDetail" 
                    item-key="i_invoiceserno" 
                    single-select v-model="selectedD"                    
                    :items-per-page="20" :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" 
                    :item-class= "row_classes" 
                    class="elevation-1 text-no-wrap no-padding" height="285px" max-height="285px"> 

                    <template v-slot:[`item.m_cnt`]="{ item }">
                        <input-number v-model="item.m_cnt" :maxlength="4" @input="onChangeDetail" v-if="!invoceend && changVend && item.i_invoiceserno === itemInfo.i_invoiceserno" ></input-number>                        
                        <span v-else>{{comma(item.m_cnt)}}</span>                                
                    </template>
                    <template v-slot:[`item.a_unit`]="{ item }">                        
                        <input-amt v-model="item.a_unit" @input="onChangeDetail" v-if="!invoceend && changVend && item.i_invoiceserno === itemInfo.i_invoiceserno" ></input-amt>                        
                        <span v-else><div class="right2-align"> {{  comma(item.a_unit) }}</div></span>
                    </template>
                    <template v-slot:[`item.a_inamt`]="{ item }">                        
                        <input-amt v-model="item.a_inamt" @input="onChangeDetail" v-if="!invoceend && changVend && item.i_invoiceserno === itemInfo.i_invoiceserno" ></input-amt>                        
                        <span v-else><div class="right2-align"> {{  comma(item.a_inamt) }}</div></span>
                    </template>
                    <template v-slot:[`item.a_invat`]="{ item }">                        
                        <input-amt v-model="item.a_invat" @input="onChangeDetail" v-if="!invoceend && changVend && item.i_invoiceserno === itemInfo.i_invoiceserno" ></input-amt>                        
                        <span v-else><div class="right2-align"> {{  comma(item.a_invat) }}</div></span>
                    </template>
                    <template v-slot:[`item.t_remark`]="{ item }">
                        <v-text-field v-model="item.t_remark" @input="onChangeDetail" v-if="!invoceend && changVend && item.i_invoiceserno === itemInfo.i_invoiceserno" dense hide-details class="my-text-field" />
                        <span v-else><div class="left-align">{{item.t_remark}}</div></span>
                    </template>
                </v-data-table>
            </v-col>
        </v-row>
        <ez-dialog ref="dialog_Vend" label="거래처" persistent @onClose="close_item" width="460px" >
            <vend-pop @onSelect="selectVend"></vend-pop>
        </ez-dialog>

        <!-- <ez-dialog ref="dialog_Item" label="항목/품목" persistent @onClose="close_item" width="460px" >            
            <item-pop @onSelect="selectItem"></item-pop>
        </ez-dialog> -->
        <ez-dialog ref="dialog_Insert" label="출하(출고) 선택" width="650px" >
            <invoice-derliveritem :data="invoicedata" @onEnter="newAdd1" ></invoice-derliveritem>
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
import { comma, getDate } from '../../../util/lib';
import ItemPop from '../codelist/ItemPop.vue';
import VendPop from '../codelist/VendPop.vue';
import InvoiceDerliveritem from './InvoiceDerliveritem.vue';

export default {
    components: { EzDialog, InputDateft, TooltipBtn, InputAmt, InputNumber, InputDate3, ItemPop, VendPop, InvoiceDerliveritem },
    name: "Invoice",
    mounted() {        
        this.init();
    },    
    data() {
        return {
            valid: true,
            comma,
            form : {sDate1:"", sDate2:"", sVend:"",},
            invoiceVend : {c_vend: "",},
            newInvoce : true,
            masterHead: [
                {text: '발행일자',   value: 'd_invoice', sortable: false, align:'center', width: "55px"},                
                {text: '계산서번호', value: 'i_invoiceno', sortable: false, align:'center', width: "70px"},
                {text: '고객사',     value: 'n_vend',     sortable: false, align:'center', width: "100px" },                
            ],
            masters:[], masterinfo:[], selectedM: [],
            itemHead: [
                {text: 'No',  value: 's_sort', sortable: false, align:'center', width: "35px"},
                {text: '항목(품목)',  value: 'n_item', sortable: false, align:'center', width: "130px"},
                {text: '규격(사양)',  value: 't_size', sortable: false, align:'center', width: "100px"},
                {text: '단위',        value: 'i_unit', sortable: false, align:'center', width: "90px"},
                {text: '수량',        value: 'm_cnt', sortable: false, align:'center', width: "60px"},
                {text: '단가',        value: 'a_unit', sortable: false, align:'center', width: "60px"},
                {text: '금액',        value: 'a_inamt', sortable: false, align:'center', width: "60px"},
                {text: 'VAT',        value: 'a_invat', sortable: false, align:'center', width: "60px"},
                {text: '출하번호',    value: 'i_shipno', sortable: false, align:'center', width: "60px"},                
                {text: '비고',  value: 't_remark', sortable: false, align:'center', width: "150px"}, 
            ],
            itemLists: [], itemInfo: [], itemListFilter: [], selectedD: [],
            invoicedata:[], derliverlist:[],
        }
    },

    computed: {
        rules: () => validateRules, 
        invoceend() {return ( !this.masterinfo.f_status || this.masterinfo.f_status == "1") ? true : false}, // 수정 가능여부  
        editJob() {return ( this.masterinfo.f_edit == "1" ) ? true : false}, // 현재 수정 부
        changVend() {return ( this.masterinfo.f_witre == "0") ? true : false}, 
    },
    methods: {
        ...mapActions("shipment", ["iuInvoicelist"]),

        async init() {
            this.viewInvoice();
        },
        rowSelectMaster :function (item, row) {       
            this.invoiceVend.c_vend = item.c_vend;
            if (this.editJob) return;
            this.masterinfo = item;  
            if (row) { row.select(true) } else { this.selectedM = [item] };
            if (item.f_edit == "1" && item.f_editold == "1") return;            
            this.$axios.post(`/api/shipment/getInvoicelistdt`, this.form);           
            
        },
        onChangeMaster() {
            const idx = this.masters.indexOf(this.masterinfo);
            if (idx > -1) this.masters[idx].f_edit = '1';
        },
        async viewInvoice() {
            this.masterinfo = []; this.itemLists = []; this.itemInfo = [];
            this.masters = await this.$axios.post(`/api/shipment/getInvoicelist`, this.form);           
        },

        async addInvoice() {
            if (this.editJob) return;

            this.newInvoce = true;
            await this.addInvoiceJob()
        },
        async addInvoiceJob() {
            this.derliverlist = await this.$axios.post(`/api/shipment/getDeliverNotInsert`, this.invoiceVend);
            const otherList = this.derliverlist.filter(sourceItem => {
                // 다른 배열에 해당 객체가 없는지 확인
                return !this.itemLists.some(otherItem => otherItem.i_shipser === sourceItem.i_shipser);
                });
            this.invoicedata = Array.from(new Set(otherList.map(obj => 
                    JSON.stringify({ c_com: obj.c_com, 
                                     f_select: '0',
                                     i_shipser: obj.i_shipser ,
                                     d_ship: obj.d_ship ,
                                     i_shipno: obj.i_shipno ,
                                     i_order: obj.i_order, 
                                     i_orderser: obj.i_orderser,
                                     m_shipcnt: obj.m_shipcnt,
                                     c_vend: obj.c_vend,
                                     n_vend: obj.n_vend,
                                     c_item: obj.c_item,
                                     n_item: obj.n_item,
                                     t_size: obj.t_size,
                                     i_unit: obj.i_unit,
                                     i_type: obj.i_type,
                                     a_unit: obj.a_unit,
                                     a_amt:  obj.a_amt,
                                     n_compnay    : obj.n_compnay, 
                                     n_ceo        : obj.n_ceo,  
                                     i_company    : obj.i_company, 
                                     t_job1       : obj.t_job1,  
                                     t_job2       : obj.t_job2,  
                                     t_tel        : obj.t_tel,  
                                     t_fax        : obj.t_fax,  
                                     e_mail       : obj.e_mail,  
                                     t_addr       : obj.t_addr,
                                     }))), 
                    JSON.parse);
            this.$refs.dialog_Insert.open();
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
            // if (idx >=0 ) {
            //     this.masters[idx].c_vend     = item.c_vend;
            //     this.masters[idx].n_vend     = item.n_vend;
            //     this.masters[idx].n_compnay  = item.n_compnay;
            //     this.masters[idx].n_ceo      = item.n_ceo;
            //     this.masters[idx].i_company  = item.i_company;
            //     this.masters[idx].t_job1     = item.t_job1;
            //     this.masters[idx].t_job2     = item.t_job2;
            //     this.masters[idx].t_tel      = item.t_tel;
            //     this.masters[idx].t_fax      = item.t_fax;
            //     this.masters[idx].e_mail     = item.e_mail;
            //     this.masters[idx].t_addr     = item.t_addr;

            //     this.onChangeMaster();
            // }
            this.$refs.dialog_Vend.close();
        },
        selectItem(item) {
        },
        close_item() { },

        rowSelectDetail:function (item, row) {
            row.select(true);
            this.itemInfo = item;
        },
        onChangeDetail() {            
            // const idx = this.itemLists.indexOf(this.itemInfo);
            // if (idx > -1) {
            //     if (this.itemInfo.f_edit == "0" ) this.itemLists[idx].f_edit = '1';                
            // };            
        },
        async addItem() {
            this.newInvoce = false; 
            if (!this.invoceend && this.masterinfo.f_witre == "1") {
                await this.addInvoiceJob();
            }
        },
        async delItem() {

        },
        row_classes(item) {
            if (item.f_edit == "2") {return "orange";} 
        },
        async newAdd1(item) {
            this.$refs.dialog_Insert.close();
            if (!item) {
                this.newAdd2();
                return
            }
            const ms = Date.now(); 
            // const vend =  await this.$axios.post(`/api/shipment/getVend`, item[0]);
            
            // Master 작성
            if (this.newInvoce) {
                const objm = {};
                objm.c_com        = item[0].c_com; 
                objm.i_invoiceser = ms; 
                objm.i_invoiceno  = "Temp";
                objm.d_invoice    = getDate(); 
                objm.f_status     = "0";
                objm.f_witre      = "1";
                objm.a_amt        = 0; 
                objm.a_vat        = 0;
                objm.c_vend       = item[0].c_vend; 
                objm.n_vend       = item[0].n_vend; 
                objm.n_compnay    = item[0].n_compnay; 
                objm.n_ceo        = item[0].n_ceo;  
                objm.i_company    = item[0].i_company; 
                objm.t_job1       = item[0].t_job1;  
                objm.t_job2       = item[0].t_job2;  
                objm.t_tel        = item[0].t_tel;  
                objm.t_fax        = item[0].t_fax;  
                objm.e_mail       = item[0].e_mail;  
                objm.t_addr       = item[0].t_addr;  
                objm.n_end        = "";
                objm.d_end        = "";
                objm.n_crnm       = "";
                objm.d_create_at  = ""; 
                objm.n_upnm       = ""; 
                objm.d_update_at  = "";
                objm.f_edit       = "1";
                objm.f_editold    = "1";
                
                const idx = this.masters.push(objm);
                const dataTable = this.$refs.table;
                if (dataTable) {
                    const item = this.masters[idx -1];               
                    dataTable.$emit("click:row", item);
                } 
            }
            // Detail 작성
            item.forEach((row, i) => {
                const obj = {};
                obj.c_com          = item[0].c_com;
                obj.i_invoiceser   = ms; 
                obj.i_invoiceserno = ms + i;
                obj.s_sort         = this.itemLists.length + 1; 
                obj.a_inamt        = row.a_amt;
                obj.a_invat        = row.a_amt / 10, 
                obj.i_order        = row.i_order; 
                obj.i_orderser     = row.i_orderser; 
                obj.i_shipser      = row.i_shipser; 
                obj.i_shipno       = row.i_shipno; 
                obj.c_item         = row.c_item; 
                obj.n_item         = row.n_item;
                obj.t_size         = row.t_size;
                obj.i_unit         = row.i_unit;
                obj.i_type         = row.i_type;
                obj.m_cnt          = row.m_shipcnt;
                obj.a_unit         = row.a_unit;
                obj.a_amt          = row.a_amt;
                obj.t_remark       = "";
                obj.n_crnm         = "";
                obj.d_create_at    = "";
                obj.n_upnm         = "";
                obj.d_update_at    = "";
                obj.f_edit         = "1";
                obj.f_editold      = "1";
                const idx = this.itemLists.push(obj); 
            })
        },
        async newAdd2() {

        },
    },
}
</script>

<style>

</style>