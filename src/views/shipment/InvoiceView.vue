<template>
    <v-container fluid>        
        <v-toolbar height="40px" background-color="primary" dark>
            <v-toolbar-title>세금계산서등록(거래명세서)</v-toolbar-title>
            <v-spacer/>
            
            <tooltip-btn label="계산서 조회" @click="viewInvoice"><v-icon>mdi-magnify</v-icon></tooltip-btn>
            <tooltip-btn label="계산서 작성" @click="addInvoice"><v-icon>mdi-plus</v-icon></tooltip-btn>
            <tooltip-btn label="계산서 삭제" @click="delInvoice"><v-icon>mdi-minus</v-icon></tooltip-btn>
            <tooltip-btn label="계산서 저장" @click="saveInvoice"><v-icon>mdi-content-save-outline</v-icon></tooltip-btn>
            <tooltip-btn label="거래명세서출력" @click="printInvoce"><v-icon>mdi-printer</v-icon></tooltip-btn>
        </v-toolbar> 
        <v-card style="display: flex; height: 34px; " class="my-card text-input-blue my-text-fontsize  "> 
            <div style="display: flex;">
                <div style="width: 70px;"><v-text-field value="   발행일자 : " readonly dense hide-details class="no-padding"/></div>                
                <input-dateft v-model="form.sDate1" :value2.sync="form.sDate2"/>
                <div style="width: 56px;"><v-text-field value="    고객사 : " readonly dense hide-details class="no-padding"/></div>
                <div style="width: 100px;"><v-text-field v-model="form.sVend" dense hide-detail class="text-input-blue no-padding" /></div>
                <!-- {{ invoceend }} / {{ masterinfo.f_status }} / {{ masterinfo.a_amt }} / {{ masterinfo.a_vat }} // {{editJob }} -->
            </div>
        </v-card>
        <v-row>
            <v-col col="12" sm="4" md="4">
                <v-data-table ref="table" :headers="masterHead" :items="masters" @click:row="rowSelectMaster" 
                    item-key="i_invoiceser" single-select v-model="selectedM"
                    :items-per-page="-1"  hide-default-footer :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" 
                    class="elevation-1 text-no-wrap" :height=iframeHeight > 
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
                        <v-col col="8" sm="4" md="4"></v-col>
                        <v-col col="8" sm="1" md="1">
                            <v-chip x-small v-if="getStatus" :color="getColor(this.masterinfo.f_status)" dark @dblclick="invoceEndjob">
                            {{ getStatus }}</v-chip>
                        </v-col>
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
                        <v-col col="8" sm="2" md="2"></v-col>
                        <v-col col="8" sm="1" md="1"><v-text-field value="공급가액" readonly dense hide-details class="text-input-redbrg no-padding"/></v-col>
                        <v-col col="8" sm="2" md="2"><v-text-field :value="comma(masterinfo.a_amt)+'원'" readonly dense hide-details class="text-input-redbrg inputPrice no-padding"/></v-col>
                    </v-row>
                    <v-row no-gutters class="my-text-field">
                        <v-col col="8" sm="1" md="1"><v-text-field value="사업자번호" readonly dense hide-details class="text-input-bluebrg no-padding"/> </v-col>
                        <v-col col="8" sm="2" md="2"><v-text-field v-model="masterinfo.i_company" readonly @input="onChangeMaster" dense hide-details class="no-padding" /></v-col>
                        <v-col col="8" sm="1" md="1"><v-text-field value="대표자" readonly dense hide-details class="text-input-bluebrg no-padding"/> </v-col>
                        <v-col col="8" sm="2" md="2"><v-text-field v-model="masterinfo.n_ceo" readonly @input="onChangeMaster" dense hide-details class="no-padding" /></v-col>
                        <v-col col="8" sm="1" md="1"><v-text-field value="VAT" readonly dense hide-details class="text-input-redbrg no-padding"/></v-col>
                        <v-col col="8" sm="2" md="2"><v-text-field :value="comma(masterinfo.a_vat)+'원'" readonly dense hide-details class="text-input-redbrg inputPrice no-padding"/></v-col>
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
                <v-data-table ref="tabledt" :headers="itemHead" :items="itemLists" 
                    @click:row="rowSelectDetail" 
                    item-key="i_invoiceserno" 
                    single-select v-model="selectedD"                    
                    :items-per-page="-1"  hide-default-footer :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" 
                    :item-class= "row_classes" 
                    class="elevation-1 text-no-wrap no-padding" :height="iframeHeight - 220"> 

                    <template v-slot:[`item.m_cnt`]="{ item }">
                        <input-number v-model="item.m_cnt" :maxlength="4" @input="onChangeAmt('cnt')" v-if="!invoceend && changVend && item.i_invoiceserno === itemInfo.i_invoiceserno" ></input-number>                        
                        <span v-else>{{comma(item.m_cnt)}}</span>                                
                    </template>
                    <template v-slot:[`item.a_unit`]="{ item }">                        
                        <input-amt v-model="item.a_unit" @input="onChangeAmt('unit')" v-if="!invoceend && item.i_invoiceserno === itemInfo.i_invoiceserno" ></input-amt>                        
                        <span v-else><div class="right2-align"> {{  comma(item.a_unit) }}</div></span>
                    </template>
                    <template v-slot:[`item.a_inamt`]="{ item }">                        
                        <input-amt v-model="item.a_inamt" @input="onChangeAmt('amt')" v-if="!invoceend && item.i_invoiceserno === itemInfo.i_invoiceserno" ></input-amt>                        
                        <span v-else><div class="right2-align"> {{  comma(item.a_inamt) }}</div></span>
                    </template>
                    <template v-slot:[`item.a_invat`]="{ item }">                        
                        <input-amt v-model="item.a_invat" @input="onChangeAmt2('vat')" v-if="!invoceend && item.i_invoiceserno === itemInfo.i_invoiceserno" ></input-amt>                        
                        <span v-else><div class="right2-align"> {{  comma(item.a_invat) }}</div></span>
                    </template>
                    <template v-slot:[`item.t_remark`]="{ item }">
                        <v-text-field v-model="item.t_remark" @input="onChangeDetail" v-if="!invoceend && item.i_invoiceserno === itemInfo.i_invoiceserno" dense hide-details class="my-text-field" />
                        <span v-else><div class="left-align">{{item.t_remark}}</div></span>
                    </template>
                </v-data-table>
            </v-col>
        </v-row>
        <ez-dialog ref="dialog_Vend" label="거래처" persistent @onClose="close_item" width="460px" >
            <vend-pop @onSelect="selectVend"></vend-pop>
        </ez-dialog>

        <ez-dialog ref="dialog_Item" label="항목/품목" persistent @onClose="close_item" width="460px" >            
            <item-pop @onSelect="selectItem"></item-pop>
        </ez-dialog>
        <ez-dialog ref="dialog_Insert" label="출하(출고) 선택" width="650px" >
            <invoice-derliveritem :data="invoicedata" :newInvoce="newInvoce" @onEnter="newAdd1" ></invoice-derliveritem>
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
import { comma, previousMonth, getDate, dateToKorean, numberToKorean, amtToKorean } from '../../../util/lib';
import { IVCOICE01 } from '../../../util/constval';
import ItemPop from '../codelist/ItemPop.vue';
import VendPop from '../codelist/VendPop.vue';
import InvoiceDerliveritem from './InvoiceDerliveritem.vue';
import qs from "qs";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { _fonts }  from'../../font/fonts.js';

export default {
    components: { EzDialog, InputDateft, TooltipBtn, InputAmt, InputNumber, InputDate3, ItemPop, VendPop, InvoiceDerliveritem },
    name: "Invoice",
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
    data() {
        return {
            valid: true,
            comma, IVCOICE01,
            iframeHeight: 500, // 초기 높이 설정 (원하는 높이로 초기화)
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
                {text: '비고',  value: 't_remark', sortable: false, align:'center', width: "150px"}, 
                {text: '출하번호',    value: 'i_shipno', sortable: false, align:'center', width: "60px"},
            ],
            itemLists: [], itemInfo: [], selectedD: [], item: [],
            invoicedata:[], derliverlist:[],
            comImageLog: "",
        }
    },

    computed: {
        rules: () => validateRules, 
        invoceend() {return ( !this.masterinfo.f_status || this.masterinfo.f_status == "1") ? true : false}, // 수정 가능여부  
        //editJob() {return ( this.masterinfo.f_edit == "1" || this.itemInfo.f_edit == "1" || this.itemInfo.f_edit == "2" ) ? true : false}, // 현재 수정 여부
        editJob() {
            if (this.masterinfo.f_edit == "1") return true;
            let mod = 0;
            this.itemLists.forEach((row) => {
                if (row.f_edit == '1' || row.f_edit == '2') mod ++; 
            });            
            return mod == 0 ? false : true;
        },
        changVend() {return ( this.masterinfo.f_witre == "0") ? true : false}, 
        // getStatus() {return this.masterinfo.f_status == "1" ? "확정" : this.masterinfo.f_status == "0" ? "작성" : "" },
        getStatus() {
            var find = this.IVCOICE01.find(e => e.value == this.masterinfo.f_status);
            return find !== undefined ? find.label : ''; 
        },
        siteImglog() {
            if (this.comImageLog.t_worklog) {
                return this.comImageLog.t_worklog
            } else {
                return false
            }
        } 
        
    },
    methods: {
        ...mapActions("shipment", ["iuInvoicelist", "invoiceNochk"]),

        getColor(f_status) {
            return f_status == "1" ? 'green' : this.masterinfo.f_status == '0' ? 'red' : 'green' ;
        },
        adjustIframeHeight() {
        // 브라우저 창의 높이를 iframe의 높이로 설정
            const windowHeight = window.innerHeight;
            this.iframeHeight = windowHeight - 200 ;
        },

        async init() {
            this.form.sDate1 = getDate(-100, 1);
            this.viewInvoice();
            this.comImageLog = await this.$axios.post(`/api/system/getSiteImage`);
        },
      
        async rowSelectMaster(item, row) {
            if(this.masterinfo.i_invoiceno == item.i_invoiceno) return;
            this.invoiceVend.c_vend = item.c_vend;
            if (this.editJob) { 
                const res = await this.$ezNotify.confirm(`수정내용이 존재 합니다.<br><br>수정 내용을 취소 하시게습니까 ?`, "자료확인", {icon: "mdi-message-bulleted-off", width: 350,});
                if(!res) return;
                
                const idx = this.masters.indexOf(this.masterinfo);
                if (idx >= 0) {                    
                    if(this.masterinfo.f_editold !== "1") {
                        const data = await this.$axios.post(`/api/shipment/getInvoicelistInfo`, this.masterinfo); 
                        data.length ? this.masters.splice(idx, 1, data[0]) : this.masters.splice(idx, 1);
                    } else {
                        this.masters.splice(idx, 1);
                    }
                }
            }
            this.masterinfo = item;
            if (row) { row.select(true) } else { this.selectedM = [item] };
            if (item.f_edit == "1" && item.f_editold == "1") return;
            this.selectedD = []; 
            this.itemInfo = [];
            this.itemLists =  await this.$axios.post(`/api/shipment/getInvoicelistdt`, this.masterinfo);
            
        },
        
        onChangeMaster() {
            const idx = this.masters.indexOf(this.masterinfo);
            if (idx > -1) this.masters[idx].f_edit = '1';
        },
        async viewInvoice() {
            this.masterinfo = []; this.selectedM = []; this.itemLists = []; this.itemInfo = [];
            this.masters = await this.$axios.post(`/api/shipment/getInvoicelist`, this.form);           
        },

        async addInvoice() {
            if (this.editJob) return;
            this.invoiceVend.c_vend = "";

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
            if (this.invoceend) {
                await this.$ezNotify.alert("확정 자료입니다.", "삭제불가", {icon: "mdi-message-bulleted-off", width: 250,});
                return
            };
            // DB 삭제 작업 ....
            // 신규 입력 삭제 (저장전 자료)
            if (this.masterinfo.f_editold != '1') {
                if( this.masterinfo.f_witre == '1' && this.itemLists.length ) {
                    await this.$ezNotify.alert("계산서 품록 List 삭제 후 삭제 가능 !", "삭제불가", {icon: "mdi-message-bulleted-off", width: 400,});
                    return;
                }
                // 저장 후 삭제 
                const res = await this.$ezNotify.confirm("삭제 하시겠습니까 ?", "삭제", {icon: "mdi-message-bulleted-off", width: 350,});
                if(!res) return;
                const data = await this.$axios.delete(`/api/shipment/delInvoic/${this.masterinfo.c_com}/${this.masterinfo.i_invoiceser}`);

                if (!data) {
                    return;
                }
            }
            this.itemInfo = [];
            const idx = this.masters.indexOf(this.masterinfo) ;
            if (idx >= 0) this.masters.splice(idx, 1);
            this.masterinfo = [];
            this.itemLists = [];
            this.$toast.info(`삭제 하였습니다.`);
        },

        async saveInvoice() {
            
            if (this.invoceend) return;
            if (!this.editJob) return;            

            if (this.masterinfo.i_invoiceno == null || this.masterinfo.i_invoiceno.length < 1 || this.masterinfo.i_invoiceno.toUpperCase().trim() == "TEMP") {
                this.$toast.error("계산서번호 입력 필수 입니다.");
                return;
            }

            // 계산서번호 중복 체크
            const chk = await this.invoiceNochk(this.masterinfo)
            if (chk) {
                this.$toast.error("계산서번호 중복 입니다.");
                return;
            }

            let s_sort = 0; 
            this.itemLists.forEach((row) => {                    
                if (row.f_edit !== "2" ) {                    
                    s_sort = s_sort + 1;
                    row.s_sort = s_sort;
                }
            });
            const invoce = Object.assign({}, this.masterinfo, this.itemLists);    // 계산서마스트 + 계산서항목 합하여 전달
            const data = await this.iuInvoicelist(invoce);            
            if (data) {
                for (let i = this.itemLists.length - 1; i >= 0; i--) {
                    if (this.itemLists[i].f_edit == "2" ) {
                        this.itemLists.splice(i, 1);
                    }
                };
                this.itemLists.forEach((row) => { 
                    row.f_edit = "0";
                    row.f_editold = "0";
                });
                this.masterinfo.f_edit = "0";
                this.masterinfo.f_editold = "0";
                // if (this.masterinfo.f_status == "I") this.masterinfo.f_status = "S";  
                this.$toast.info(`저장 하였습니다.`);
            }
            else {
                
                await this.$ezNotify.alert("저장 중 오류가 발생 하였습니다...", "오류", {icon: "mdi-message-bulleted",});
            }
         
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
        selectItem(item) {
            this.$refs.dialog_Item.close();   
            if (!item) return;

            const obj = {};
            obj.c_com          = this.masterinfo.c_com;
            obj.i_invoiceser   = this.masterinfo.i_invoiceser; 
            obj.i_invoiceserno = Date.now(); 
            obj.s_sort         = this.itemLists.length + 1; 
            obj.a_inamt        = item.a_sell;
            obj.a_invat        = item.a_sell / 10, 
            obj.i_order        = "";
            obj.i_orderser     = "";
            obj.i_shipser      = "";
            obj.i_shipno       = "";
            obj.c_item         = item.c_item; 
            obj.n_item         = item.n_item;
            obj.t_size         = item.t_size;
            obj.i_unit         = item.i_unit;
            obj.i_type         = item.i_type;
            obj.m_cnt          = 1;
            obj.a_unit         = item.a_sell;;
            obj.a_amt          = item.a_sell;;
            obj.t_remark       = "";
            obj.n_crnm         = "";
            obj.d_create_at    = "";
            obj.n_upnm         = "";
            obj.d_update_at    = "";
            obj.f_edit         = "1";
            obj.f_editold      = "1";
            const idx = this.itemLists.push(obj); 
            
            const dataTable = this.$refs.tabledt;
            if (dataTable) {
                const item = this.itemLists[idx -1];               
                dataTable.$emit("click:row", item);
            } 
            this.onChangeAmt2();
        },
        close_item() { },

        rowSelectDetail:function (item, row) {
            //row.select(true);
            if (row) { row.select(true) } else { this.selectedD = [item] };
            this.itemInfo = item;
        },
        
        onChangeDetail() {            
            const idx = this.itemLists.indexOf(this.itemInfo);
            if (idx > -1) {
                if (this.itemInfo.f_edit == "0" ) this.itemLists[idx].f_edit = '1';                
            };            
        },
        onChangeAmt(gubun) {            
            //금액 계산 작업
            this.onChangeDetail();
            const idx = this.itemLists.indexOf(this.itemInfo);
            if (idx > -1) {                
                if(gubun !== "amt") this.itemLists[idx].a_inamt = this.itemLists[idx].a_unit * this.itemLists[idx].m_cnt;
                if(gubun !== "vat") this.itemLists[idx].a_invat = Math.floor(this.itemLists[idx].a_inamt / 10);
            };
            // 계산서 총 금액, Vat
            let a_amt = 0;
            let a_vat = 0;
            this.itemLists.forEach((row) => {
                if (row.f_edit !== "2" ) {
                    a_amt = a_amt + (row.a_inamt * 1);
                    a_vat = a_vat + (row.a_invat * 1);
                }
            });
            
            this.masterinfo.a_amt = a_amt;
            this.masterinfo.a_vat = a_vat;
            this.masterinfo.f_edit = "1";
        },
        onChangeAmt2(gubun) {            
            this.onChangeDetail();
            
            // 계산서 총 금액, Vat
            let a_amt = 0;
            let a_vat = 0;
            this.itemLists.forEach((row) => {                 
                if (row.f_edit !== "2" ) {
                    a_amt = a_amt + (row.a_inamt * 1);
                    a_vat = a_vat + (row.a_invat * 1);
                }
            });            
            this.masterinfo.a_amt = a_amt;
            this.masterinfo.a_vat = gubun == "vat" ? a_vat : Math.floor(a_amt / 10);
            this.masterinfo.f_edit = "1";
        },
        async addItem() {            
            if (this.invoceend) return;

            this.newInvoce = false;             
            if (this.masterinfo.f_witre == "1") {
                this.invoiceVend.c_vend = this.masterinfo.c_vend;
                await this.addInvoiceJob();
            } else {
                await this.$refs.dialog_Item.open();
            }

        },
        async delItem() {
            if (this.invoceend) return;
            const idx = this.itemLists.indexOf(this.itemInfo);
            if (idx > -1) {
                if (this.itemLists[idx].f_editold == "0") {
                    this.itemLists[idx].f_edit = this.itemInfo.f_edit === "2" ? "0": "2";
                } else {
                    this.itemLists.splice(idx, 1)
                    const idx1 = this.itemLists.indexOf(this.itemInfo)
                    if (idx1 > -1) this.itemLists.splice(idx1, 1);
                }
            }
            this.onChangeAmt2();
        },

        row_classes(item) {
            if (item.f_edit == "2") {return "orange";} 
        },
        async newAdd1(item) {
            this.$refs.dialog_Insert.close();            
            
            if (!item.length) {                
                this.newAdd2();
                return
            }
            const ms = Date.now(); 
            // Master 작성
            if (this.newInvoce) {
                this.itemLists = [];

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
                obj.i_invoiceser   = this.newInvoce ? ms : this.masterinfo.i_invoiceser; 
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
            });
            this.onChangeAmt2();


        },
        async newAdd2() {            
            if (this.newInvoce) {
                const objm = {};
                objm.c_com        = this.$store.state.user.member.c_com;
                objm.i_invoiceser = Date.now();  
                objm.i_invoiceno  = "Temp";
                objm.d_invoice    = getDate(); 
                objm.f_status     = "0";
                objm.f_witre      = "0";
                objm.a_amt        = 0; 
                objm.a_vat        = 0;
                objm.c_vend       = "";
                objm.n_vend       = "";
                objm.n_compnay    = "";
                objm.n_ceo        = "";
                objm.i_company    = "";
                objm.t_job1       = "";
                objm.t_job2       = "";
                objm.t_tel        = "";
                objm.t_fax        = "";
                objm.e_mail       = "";
                objm.t_addr       = "";
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
        },

        async invoceEndjob() {
            const idx = this.masters.indexOf(this.masterinfo);

            if (this.editJob) { 
                this.$toast.warning(`저장 후 상태 변경 가능 합니다.`);
                if(!res) return;
            }
            if (idx >= 0 ) {
                if ( parseInt(this.masterinfo.f_status) > 1) return;
                const res = await this.$ezNotify.confirm(`계산서 상태 ${this.masterinfo.f_status=="1"?'취소':'확정'} 처리 하시 겠습니까 ?`, `확정 ${this.masterinfo.f_status=="1"?'취소':'처리'}`, {icon: "mdi-message-bulleted-off", width: 350,});
                if(!res) return;
                const data = await this.$axios.post(`/api/shipment/iuInvoiceJobend`, this.masterinfo); 
                if (data) {
                    this.masterinfo.f_status = this.masterinfo.f_status == "1" ? "0" : "1";
                    this.$toast.info(`처리 하였습니다.`);
                }
            }
        },

        async printInvoce() {

            let query = qs.stringify({c_com: this.$store.state.user.member.c_com});
            const company = await this.$axios.get(`/api/system/getCompany?${query}`);
            
            const doc = new jsPDF('p', 'mm', 'a4');
            if (!!this.siteImglog) {
                const img = new Image();   // 이미지를 로드합니다.            
                img.src = this.siteImglog; // 이미지 파일 경로  
                // doc.addImage(img, 'JPEG', 150, 30, 50, 20); // 이미지를 PDF에 추가합니다.
                doc.addImage(img, 'JPEG', 150, 30, 50, 20); // 이미지를 PDF에 추가합니다.  
            }

            doc.addFileToVFS("malgun.ttf", _fonts);
            doc.addFont("malgun.ttf", "malgun", "normal");
            doc.setFont("malgun");
            
            // 텍스트 출력
            doc.setFontSize(30);
            doc.text('거 래 명 세 표', 60, 30);
            
            doc.setFontSize(9);            
            doc.setLineWidth(0.1); // 선 두께를 0.1로 설정합니다
            doc.rect(10, 50, 190, 230);
            doc.rect(10, 50, 8, 24);
            doc.text(13, 56, '공'); doc.text(13, 64, '급'); doc.text(13, 72, '자');        
            doc.rect(18, 50, 13, 24); 

            doc.rect(18, 50, 87, 6); this.doctext(doc, "등록번호", 18, 56, 6, 6, 0);  this.doctext(doc, company[0].c1, 31, 56, 6, 70, 1);
            doc.rect(18, 56, 87, 6); this.doctext(doc, "상 호 명", 18, 62, 6, 6, 0);  this.doctext(doc, company[0].c2, 31, 62, 6, 30, 1);
            doc.rect(63, 56, 13, 6); this.doctext(doc, "성     명", 63, 62, 6, 6, 0); this.doctext(doc, company[0].c3, 76, 62, 6, 28, 1);
            doc.rect(18, 62, 87, 6); this.doctext(doc, "주     소", 18, 68, 6, 6, 0); this.doctext(doc, company[0].c4, 31, 68, 6, 70, 1);
            doc.rect(18, 68, 87, 6); this.doctext(doc, "업     태", 18, 74, 6, 6, 0); this.doctext(doc, company[0].c5, 31, 74, 6, 30, 1);
            doc.rect(63, 68, 13, 6); this.doctext(doc, "업     종", 63, 74, 6, 6, 0); this.doctext(doc, company[0].c6, 76, 74, 6, 28, 1);
            

            doc.rect(105, 50, 8, 24);
            doc.text(108, 56, '공'); doc.text(108, 60, '급');  doc.text(108, 64, '받'); doc.text(108, 68, '는'); doc.text(108, 72, '자');
            doc.rect(113, 50, 13, 24); 
            doc.rect(113, 50, 87, 6); this.doctext(doc, "등록번호", 113, 56, 6, 6, 0);  this.doctext(doc, this.masterinfo.i_company, 126, 56, 6, 70, 1);
            doc.rect(113, 56, 87, 6); this.doctext(doc, "상 호 명", 113, 62, 6, 6, 0);  this.doctext(doc, this.masterinfo.n_compnay, 126, 62, 6, 30, 1);
            doc.rect(158, 56, 13, 6); this.doctext(doc, "성     명", 158, 62, 6, 6, 0); this.doctext(doc, this.masterinfo.n_ceo,     171, 62, 6, 28, 1);
            doc.rect(113, 62, 87, 6); this.doctext(doc, "주     소", 113, 68, 6, 6, 0); this.doctext(doc, this.masterinfo.t_addr,    126, 68, 6, 70, 1);
            doc.rect(113, 68, 87, 6); this.doctext(doc, "업     태", 113, 74, 6, 6, 0); this.doctext(doc, this.masterinfo.t_job1,    126, 74, 6, 30, 1);
            doc.rect(158, 68, 13, 6); this.doctext(doc, "업     종", 158, 74, 6, 6, 0); this.doctext(doc, this.masterinfo.t_job2,    171, 74, 6, 28, 1);
            
            for (let i = 0; i < 26; i++) {
                if ( i == 0 || i == 25 ) {
                    doc.setFillColor(192, 192, 192);   
                    doc.rect(10, 74 + (i * 7), 190, 7, 'FD');
                    doc.setFillColor(255, 255, 255); 
                } else {
                    doc.rect(10, 74 + (i * 7), 190, 7);
                }
            }
            doc.line(16, 74, 16, 256); doc.text(11,79, 'No');
            doc.line(60, 74, 60, 256); doc.text(35,79, '품명');
            doc.line(100, 74, 100, 256); doc.text(75,79, '규격');
            doc.line(120, 74, 120, 256); doc.text(106,79, '단위');
            doc.line(130, 74, 130, 256); doc.text(122,79, '수량');
            doc.line(150, 74, 150, 256); doc.text(137,79, '단가');
            doc.line(172, 74, 172, 256); doc.text(158,79, '금액');  doc.text(184,79, '비고');

            let y = 0;
            let amt = 0;
            this.itemLists.forEach((row, index) => {
                y = 73 + ((index + 2) * 7);
                this.doctext(doc, (index + 1).toString(), 10,y,7,6, 1)
                this.doctext(doc, row.n_item, 16,y,7,6, 0)
                this.doctext(doc, row.t_size, 60,y,7,6, 0)
                this.doctext(doc, row.i_unit, 100,y,7,20, 1)
                this.doctext(doc, row.m_cnt.toString(), 120,y,7,10, 1)
                this.doctext(doc, this.comma(row.a_unit), 130,y,7,20, 2)
                this.doctext(doc, this.comma(row.a_amt), 150,y,7,22, 2)
                this.doctext(doc, row.t_remark, 172,y,7,28, 0)
                if (row.a_amt) amt = amt + (row.a_amt * 1);
            });

            y = 73 + ((this.itemLists.length + 2) * 7);
           this.doctext(doc,'- 이 하 여 백 -', 60,y,7,40, 1);
           doc.setFontSize(10);
           y = 73 + (26 * 7) ;
           this.doctext(doc, '합 계', 100,y,7,20, 1);
           this.doctext(doc, this.comma(amt), 150,y,7,22, 2);
           doc.setFontSize(9);

           doc.text(12, 260, `비    고 : `);


            // PDF 저장            
            doc.save(`거래명세서_${this.masterinfo.i_invoiceno}.pdf`);
            this.$toast.success(`다운로드 폴더에 PDF문서생성 하였습니다.`);
        },
        doctext(doc, text, x, y, h, w, a) {
            // a => 0:왼쪽, 1:가운데, 2:오른쪽 정렬
            if (!text) return;
            let tx = x, ty = y, tw = 0;            
            tw = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
            ty = y + (h / 2) - (doc.internal.getFontSize() / 2);                    
            if (a == 1) {
                tx = x + (w - tw) / 2;                              
            } else if (a == 2) {
                tx = x + w - tw;
            }
            doc.text(tx, ty, text);
        },
    },
    
}
</script>

<style>

</style>