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
                    class="elevation-1 text-no-wrap"  max-height="350px" height="350px" 
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
            <template v-slot:[`item.f_status`]="{ item }">                
                <div> <v-chip x-small :color="getColor(item.f_status)" dark @dblclick="accountEndjob">{{ getStatus(item.f_status) }}</v-chip></div>
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
                    :items-per-page="-1" hide-default-footer
                    :item-class= "row_classes" 
                    class="elevation-1 text-no-wrap no-padding" :height=iframeHeight> 

            <template v-slot:[`item.d_account`]="{ item }">
                <input-date-2 v-model="item.d_account" @input="onChange(item)" v-if="!accEnd && item.i_accountser === itemInfo.i_accountser" :rules="rules.date({required: false})" class="my-text-table"/>
                <div v-else> {{  item.d_account }}</div>   
            </template>

            <template v-slot:[`item.a_accamt`]="{ item }">
                <input-amt v-model="item.a_accamt" @input="onChange(item)" v-if="!accEnd && item.i_accountser === itemInfo.i_accountser" ></input-amt>
                <div class="right2-align" v-else> {{  comma(item.a_accamt) }}</div>            
            </template> 

            <template v-slot:[`item.t_remark`]="{ item }">
                <v-text-field v-model="item.t_remark" @input="onChange(item)" v-if="!accEnd && item.i_accountser === itemInfo.i_accountser" dense hide-details class="my-text-field no-padding" />
                <span v-else>{{item.t_remark}}</span>
            </template>
        </v-data-table>
        

        <ez-dialog ref="dialog_Insert" label="출하(출고) 선택" width="650px" >
            <account-invoiceitem :data="invoicedata" @onEnter="invoiceAdd"></account-invoiceitem>
        </ez-dialog>
    </v-container>
</template>

<script>
import { mapActions } from "vuex";
import EzDialog from '../../components/etc/EzDialog.vue';
import TooltipBtn from '../../components/etc/TooltipBtn.vue';
import validateRules from "../../../util/validateRules";
import { comma, getDate, dateToKorean, numberToKorean, amtToKorean, previousMonth } from '../../../util/lib';
import { IVCOICE01 } from '../../../util/constval';
import InputDateft from '../../components/InputForms/InputDateft.vue';
import AccountInvoiceitem from './AccountInvoiceitem.vue';
import InputAmt from '../../components/InputForms/InputAmt.vue';
import InputDate2 from '../../components/InputForms/InputDate2.vue';
export default {
    components: { EzDialog, TooltipBtn, InputDateft, AccountInvoiceitem, InputAmt, InputDate2},
    name: "Account",
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
            form : {sDate1:"", sDate2:"", sVend:"",},
            iframeHeight: 250, // 초기 높이 설정 (원하는 높이로 초기화)
            masterHead: [
                {text: '고객사',         value: 'n_vend',     sortable: false, align:'center', width: "100px" },
                {text: '계산서번호',     value: 'i_invoiceno', sortable: false, align:'center', width: "70px"},
                {text: '발행일자',       value: 'd_invoice', sortable: false, align:'center', width: "55px"}, 
                {text: '발행금액',       value: 'a_inamt', sortable: false, align:'center', width: "50px"}, 
                {text: '수금누계',       value: 'a_accamt', sortable: false, align:'center', width: "50px"}, 
                {text: '수금진행률',     value: 'p_per', sortable: false, align:'center', width: "50px"}, 
                {text: '수금잔액',       value: 'a_dif', sortable: false, align:'center', width: "50px"},                 
                {text: '수금일자',       value: 'd_account2', sortable: false, align:'center', width: "50px"}, 
                {text: '상태',           value: 'f_status', sortable: false, align:'center', width: "20px"}, 
            ],
            masters:[], masterinfo:[], selectedM: [],
            itemHead: [
                {text: '수금일자',    value: 'd_account', sortable: false, align:'center', width: "70px"},
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
            invoicedata: [],
        }
    },
    computed: {
        rules: () => validateRules,
        
        editJob() {    
            return this.itemLists.reduce((sum, item) => {
                    if (item.f_edit !== "0") {
                        return sum + (1 || 0);
                    }
                    return sum;
                }, 0 ) > 0 ? true : false ;
        },
        accEnd() {
            return this.masterinfo.f_status == "9" ? true : false;
        }, 

    },
    methods: {
        ...mapActions("shipment", ["iuAccountlist"]),
        adjustIframeHeight() {
        // 브라우저 창의 높이를 iframe의 높이로 설정
            const windowHeight = window.innerHeight;
            this.iframeHeight = windowHeight - 200 - 400;
        },
        row_classes(item) {
            if (item.f_edit == "2") {
                return "orange";
            } 
        },
        getStatus(f_status) {
            var find = this.IVCOICE01.find(e => e.value == f_status);
            return find !== undefined ? find.label : ''; 
        },
        getColor(f_status) {
            return f_status == "0" ? 'red' : 'green';
        },
        async init() {
            this.form.sDate1 = getDate(-100, 1);
            this.viewAccout();
        },
        async viewAccout() {
            this.masterinfo = []; this.selectedM = []; this.itemLists = []; this.itemInfo = [];
            this.masters = await this.$axios.post(`/api/shipment/getAccountInvoce`, this.form);             
        },
        async addAccout() {
            if( this.masterinfo.i_invoiceser == undefined) {                
                return;
            }
            this.invoicedata = await this.$axios.post(`/api/shipment/getInvoiceNotAccount`, this.masterinfo); 
            
            const otherList = this.invoicedata.filter(sourceItem => {
                // 다른 배열에 해당 객체가 없는지 확인
                return !this.itemLists.some(otherItem => otherItem.i_invoiceserno == sourceItem.i_invoiceserno && otherItem.f_editold !== '0');
                });
            if (!otherList.length) {
                this.$toast.warning(`등록 가능한 출하List 없습니다.`);
                return;
            }
            this.invoicedata = Array.from(new Set(otherList.map(obj => 
                    JSON.stringify({ c_com:         obj.c_com, 
                                     f_select:      '0',
                                     i_invoiceno:    obj.i_invoiceno ,
                                     i_invoiceser:   obj.i_invoiceser ,
                                     i_invoiceserno: obj.i_invoiceserno ,
                                     f_witre:        obj.f_witre, 
                                     c_vend:         obj.c_vend,
                                     n_vend:         obj.n_vend,
                                     i_shipno:       obj.i_shipno,
                                     i_shipser:      obj.i_shipser,
                                     i_order:        obj.i_order,
                                     i_orderser:     obj.i_orderser,
                                     a_invoice:      obj.a_invoice,
                                     a_invatamt:     obj.a_invatamt,   
                                     a_inamt:        obj.a_inamt,
                                     a_invat:        obj.a_invat,
                                     c_item:         obj.c_item,
                                     n_item:         obj.n_item,
                                     t_size:         obj.t_size,
                                     i_unit:         obj.i_unit,
                                     i_type:         obj.i_type,
                                     m_cnt:          obj.m_cnt,
                                     a_unit:         obj.a_unit,
                                     a_accamt:       obj.a_accamt,
                                     }))), 
                    JSON.parse);
            this.$refs.dialog_Insert.open();
        },
        async delAccout() {
            if( this.masterinfo.i_invoiceser == undefined || this.itemInfo.i_accountser  == undefined ) {                
                return;
            }

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
            this.sumField();
        },
        async saveAccout() {
            const data = await this.iuAccountlist(this.itemLists); 
            if (data) {
                for (let i = this.itemLists.length - 1; i >= 0; i--) {
                    const item = this.itemLists[i];   // 역방향시 사용
                    if(item.f_edit == '0') continue;
                    if(item.f_edit == '2') {
                        this.itemLists.splice(i, 1);
                    } else {
                        item.f_edit = '0';
                        item.f_editold = '0';
                    }
                }                
                this.$toast.info(`저장 하였습니다.`);
            }
        },

        async rowSelectMaster(item, row) {
            if(this.masterinfo.i_invoiceno == item.i_invoiceno) return;

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
        invoiceAdd(item) {
            this.$refs.dialog_Insert.close();
            if (!item) return;
            const ms = Date.now();
            
            item.forEach((row, i) => {
                const obj = {};
                obj.c_com          = this.masterinfo.c_com; 
                obj.i_accountser   = ms + i;
                obj.d_account      = getDate(); 
                obj.a_accamt       = row.a_invatamt;
                obj.f_del          = "N";
                obj.c_vend         = row.c_vend; 
                obj.n_vend         = row.n_vend; 
                obj.i_invoiceser   = row.i_invoiceser; 
                obj.i_invoiceserno = row.i_invoiceserno; 
                obj.i_invoiceno    = row.i_invoiceno; 
                obj.i_order        = row.i_order; 
                obj.i_orderser     = row.i_orderser; 
                obj.i_orderno      = row.i_orderno; 
                obj.i_shipser      = row.i_shipser; 
                obj.i_shipno       = row.i_shipno; 
                obj.c_item         = row.c_item; 
                obj.n_item         = row.n_item; 
                obj.t_size         = row.t_size; 
                obj.i_unit         = row.i_unit; 
                obj.i_type         = row.i_type; 
                obj.m_cnt          = row.m_cnt; 
                obj.a_unit         = row.a_unit; 
                obj.a_amt          = row.a_inamt; 
                obj.a_vat          = row.a_invat; 
                obj.t_remark       = ""; 
                obj.n_crnm         = ""; 
                obj.d_create_at    = ""; 
                obj.n_upnm         = ""; 
                obj.d_update_at    = "";
                obj.f_edit         = "1";
                obj.f_editold      = "1";
                const idx = this.itemLists.push(obj); 
            });

            this.sumField();
            
        },
        sumField() {
            // sum data in give key (property)
            const data = this.itemLists.reduce((sum, item) => {
                    if (item.f_edit !== "2") {
                        return sum + (Number(item['a_accamt']) || 0);
                    }
                    return sum;
                }, 0 );
            
            if (data) {
                this.masterinfo.a_accamt = data;
                this.masterinfo.a_dif = parseInt(this.masterinfo.a_inamt) - parseInt(data);
                this.masterinfo.p_per = parseInt(data) / parseInt(this.masterinfo.a_inamt);
            } else {
                this.masterinfo.a_accamt = 0;
                this.masterinfo.a_dif = parseInt(this.masterinfo.a_inamt) ;
                this.masterinfo.p_per = 0;
            }
            const filteredValues = this.itemLists.filter(item => item.f_edit !== "2").map(item => item.d_account);            
            this.masterinfo.d_account1 = filteredValues.reduce((min, current) => { return current < min ? current : min;}, "");
            this.masterinfo.d_account2 = filteredValues.reduce((max, current) => { return current > max ? current : max;}, "");            
        },
        onChange(item) {
            item.f_edit = "1";
            this.sumField();
        },
        async accountEndjob() {            
            const idx = this.masters.indexOf(this.masterinfo);            
            
            if (this.editJob) { 
                this.$toast.warning(`저장 후 상태 변경 가능 합니다.`);
                if(!res) return;
            }
            if (idx >= 0 ) {
                // if ( parseInt(this.masterinfo.f_status)  1) return;
                const res = await this.$ezNotify.confirm(`대금수금 상태 ${this.masterinfo.f_status=="9"?'완료 취소':'완료'} 처리 하시 겠습니까 ?`, `완료 ${this.masterinfo.f_status=="1"?'취소':'처리'}`, {icon: "mdi-message-bulleted-off", width: 400,});
                if(!res) return;
                const data = await this.$axios.post(`/api/shipment/iuAccountJobend`, this.masterinfo); 
                if (data) {
                    this.masterinfo.f_status = this.masterinfo.f_status == "9" ? "2" : "9";
                    this.$toast.info(`처리 하였습니다.`);
                }
            }

        },
    },
}
</script>

<style>

</style>