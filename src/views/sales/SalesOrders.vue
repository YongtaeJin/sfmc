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
                <v-col col="12" sm="1" md="1"><v-text-field value="수주기간" readonly dense hide-details class="text-input-blue no-padding"/></v-col>
                <v-col col="12" sm="2" md="2"><input-date-3 v-model="form.sDate1" /></v-col>
                <v-col col="12" sm="2" md="2"><input-date-3 v-model="form.sDate2" /></v-col>
                <v-col col="12" sm="1" md="1"><v-text-field value="고객사" readonly dense hide-details class="text-input-blue no-padding"/></v-col>
                <v-col col="12" sm="3" md="3"><v-text-field v-model="form.sVend" dense hide-details class="text-input-blue no-padding" /></v-col>
                <v-col col="12" sm="1" md="1"><v-text-field value="수주번호" readonly dense hide-details class="text-input-blue no-padding"/> </v-col>
                <v-col col="12" sm="2" md="2"><v-text-field v-model="form.sOrder" dense hide-details class="text-input-blue no-padding" /></v-col>
            </v-row>
            <v-row/>
        </v-card>

        <v-row >
            <v-col col="12" sm="4" md="4">
                <v-data-table ref="table" :headers="masterHead" :items="masters" @click:row="rowSelectMaster" 
                    item-key="i_order" single-select v-model="selectedM"                    
                    :items-per-page="-1"  hide-default-footer  :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" 
                    class="elevation-1 text-no-wrap" :height=iframeHeight > 
                    <template v-slot:[`item.a_orderamt`]="{ item }">
                        <div class="right2-align">{{ comma(item.a_orderamt) }}</div>
                    </template>
                </v-data-table>
            </v-col>
            <v-col col="12" sm="8" md="8">
                <v-form @submit.prevent="save" ref="form" v-model="valid" lazy-validation>
                <v-card color="grey lighten-4">
                <v-row no-gutters class="my-text-field" >
                    <v-col col="8" sm="1" md="1"><v-text-field value="수주번호" readonly dense hide-details class="text-input-redbrg no-padding"/></v-col>
                    <v-col col="8" sm="3" md="3"><v-text-field v-model="masterinfo.i_orderno" :readonly="!edit" @input="onChangeOrdno" dense hide-details class="no-padding"/></v-col>
                    <v-col col="8" sm="2" md="2"></v-col>
                    <v-col col="8" sm="1" md="1"><v-text-field value="수주상태" readonly dense hide-details class="text-input-bluebrg"/></v-col>
                    <v-col col="8" sm="2" md="2"><v-text-field :value="getOrderStatus(masterinfo.f_status)" readonly dense hide-details class="text-input-redbrg inputPrice"/></v-col>
                </v-row>
                <v-row no-gutters class="my-text-field">
                    <v-col col="8" sm="1" md="1"><v-text-field value="수 주 명" readonly dense hide-details class="text-input-bluebrg no-padding"/></v-col>
                    <v-col col="8" sm="5" md="5"><v-text-field v-model="masterinfo.n_order" :readonly="!edit" @input="onChangeMaster" dense hide-details class="no-padding" /></v-col>
                </v-row>
                <v-row no-gutters class="my-text-field">
                    <v-col col="8" sm="1" md="1"><v-text-field value="고객사" readonly dense hide-details class="text-input-bluebrg no-padding"/> </v-col>
                    <v-col col="8" sm="5" md="5">
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
                    <v-col col="8" sm="1" md="1"><v-text-field value="수주일" readonly dense hide-details class="text-input-bluebrg no-padding"/> </v-col>
                    <v-col col="8" sm="2" md="2"><input-date-3 v-model="masterinfo.s_date" :readonly="!edit" @input="onChangeMaster" :rules="rules.date({required: false})" /> </v-col>
                    <v-col col="8" sm="1" md="1"><v-text-field value="납기일" readonly dense hide-details class="text-input-bluebrg no-padding"/> </v-col>
                    <v-col col="8" sm="2" md="2"><input-date-3 v-model="masterinfo.s_date2"  @input="onChangeMasterDate" :rules="rules.date({required: false})" /> </v-col>
                    <v-col col="8" sm="1" md="1"><v-text-field value="수주금액" readonly dense hide-details class="text-input-redbrg no-padding "/> </v-col>
                    <v-col col="8" sm="2" md="2"><v-text-field :value="comma(masterinfo.a_orderamt)+'원'" readonly dense hide-details class="text-input-redbrg inputPrice no-padding"/> </v-col>
                </v-row>
                <v-row no-gutters class="my-text-field">
                    <v-col col="8" sm="1" md="1"><v-text-field value="메모" readonly dense hide-details class="text-input-bluebrg no-padding"/> </v-col>
                    <v-col col="12" sm="8" md="8"><v-text-field v-model="masterinfo.t_remark" :readonly="!edit" @input="onChangeMaster" dense hide-details class="no-padding"/> </v-col>
                </v-row>
                <v-row no-gutters class="my-text-fieldend" />
                </v-card>
                </v-form>

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
                    :items-per-page="-1"  hide-default-footer  :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" 
                    :item-class= "row_classes" 
                    class="elevation-1 text-no-wrap no-padding" :height="iframeHeight - 180" >                   
                    
                    <template v-slot:[`item.s_sort`]="{ item }">                        
                        <input-number v-model="item.s_sort" :maxlength="2" @input="onChangeDetail" v-if="edit && item.i_orderser === itemInfo.i_orderser" ></input-number>                        
                        <span v-else>{{item.s_sort}}</span>
                    </template>
                    <template v-slot:[`item.n_item`]="{ item }">
                        <v-text-field v-model="item.n_item" hide-details dense single-line readonly v-if="edit && item.i_orderser === itemInfo.i_orderser" class="my-text-field">
                            <template v-slot:append>
                                <v-btn icon x-small tabindex="-1" @click="clickItem">
                                    <v-icon> mdi-dialpad </v-icon>
                                </v-btn>
                            </template>
                        </v-text-field>
                        <span v-else>{{item.n_item }}</span>
                    </template>
                    <template v-slot:[`item.m_cnt`]="{ item }">
                        <input-amt v-model="item.m_cnt" @input="onChangeAmt" v-if="edit && item.i_orderser === itemInfo.i_orderser" ></input-amt>
                        <span v-else>{{comma(item.m_cnt)}}</span>
                    </template>
                    <template v-slot:[`item.a_unit`]="{ item }">
                        <input-amt v-model="item.a_unit" @input="onChangeAmt" v-if="edit && item.i_orderser === itemInfo.i_orderser" ></input-amt>
                        <span v-else><div class="right2-align">{{comma(item.a_unit)}}</div></span>
                    </template>
                    <template v-slot:[`item.a_amt`]="{ item }">
                        <input-amt v-model="item.a_amt" @input="onChangeAmt2" v-if="edit && item.i_orderser === itemInfo.i_orderser" ></input-amt>
                        <span v-else><div class="right2-align">{{comma(item.a_amt)}}</div></span>
                    </template>
                    <template v-slot:[`item.s_duedate`]="{ item }">
                        <input-date-2 v-model="item.s_duedate" @input="onChangeDetail" v-if="edit && item.i_orderser === itemInfo.i_orderser" :rules="rules.date({required: false})" />
                        <span v-else>{{item.s_duedate}}</span>
                    </template>
                    <template v-slot:[`item.t_remark`]="{ item }">
                        <v-text-field v-model="item.t_remark" @input="onChangeDetail" v-if="edit && item.i_orderser === itemInfo.i_orderser" dense hide-details class="my-text-field" />
                        <span v-else> <div class="left-align">{{item.t_remark}}</div></span>
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
        <ez-dialog ref="dialog_Insert" label="견적서 추가" obtn="미견적작성" persistent @onClose="close_item" @btnClick="newAdd2" width="500px" >
            <sales-notestimate :data="est" @onEnter="newAdd1" ></sales-notestimate>
        </ez-dialog>

    </v-container>
</template>

<script>
import qs from "qs";
import { mapActions } from "vuex";
import EzDialog from '../../components/etc/EzDialog.vue';
import TooltipBtn from '../../components/etc/TooltipBtn.vue';
import InputDate2 from '../../components/InputForms/InputDate2.vue';
import InputDate3 from '../../components/InputForms/InputDate3.vue';
import InputAmt from '../../components/InputForms/InputAmt.vue';
import InputNumber from '../../components/InputForms/InputNumber.vue';
import { getDate, previousMonth, deepCopy, dateToKorean, numberToKorean, amtToKorean } from '../../../util/lib';
import { ORDER001 } from '../../../util/constval';
import validateRules from "../../../util/validateRules";
import ItemPop from '../codelist/ItemPop.vue';
import VendPop from '../codelist/VendPop.vue';
import SalesNotestimate from './SalesNotestimate.vue'; 

export default {
    components: { TooltipBtn, EzDialog, InputDate2, InputDate3, InputAmt, InputNumber, ItemPop, VendPop, SalesNotestimate },
    name: "Salesorders",
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
            ORDER001,
            iframeHeight: 500, // 초기 높이 설정 (원하는 높이로 초기화)
            masterHead: [
                {text: '수주일',    value: 's_date', sortable: false, align:'center', width: "65px"},                
                {text: '수주번호',  value: 'i_orderno', sortable: false, align:'center', width: "70px"},
                {text: '고객사',    value: 'n_vend', sortable: false, align:'center', width: "100px" },
                {text: '수주금액',  value: 'a_orderamt', sortable: false, align:'center', width: "65px"},
            ],
            masters:[], masterinfo:[], selectedM: [],
            itemHead: [
                {text: 'No',  value: 's_sort', sortable: false, align:'center', width: "35px"},
                {text: '항목(품목)',  value: 'n_item', sortable: false, align:'center', width: "130px"},
                {text: '규격(사양)',  value: 't_size', sortable: false, align:'center', width: "100px"},
                {text: '단위',  value: 'i_unit', sortable: false, align:'center', width: "90px"},
                {text: '수량',  value: 'm_cnt', sortable: false, align:'center', width: "60px"},
                {text: '단가',  value: 'a_unit', sortable: false, align:'center', width: "90px"},
                {text: '금액',  value: 'a_amt', sortable: false, align:'center', width: "90px"},                
                {text: '납기일',  value: 's_duedate', sortable: false, align:'center', width: "90px"},     
                {text: '비고',  value: 't_remark', sortable: false, align:'center', width: "90px"}, 
            ],
            itemLists: [], itemInfo: [], itemListFilter: [], selectedD: [],
            form : {
                sDate1:"", sDate2:"", sOrder:"", sVend:"", 
            },
            estlist:[], est:[],
         
        }
    },
    watch: {
        // watchLabel(newVal) {
        //     const matchedItem = this.ORDER001.find((item) => item.value === newVal);
        //     this.selectedLabel = matchedItem ? matchedItem.label : "";
        // },
    },
    computed: {
        rules: () => validateRules,        
        getMaxNo() {            
            const max = Math.max(...this.itemListFilter.map((item) => item.s_sort));
            return isFinite(max) ? max : 0;
        },
        edit() {          
            // 수정 가능여 부  
            return (this.masterinfo.f_status == "I" || this.masterinfo.f_status == "S") ? true : false;
        },
        editDetail() {
            if (!this.edit) return false;
            if (this.itemInfo.i_orderser == undefined) return false;            
            return true;
        },
        editJob() {            
            if (this.masterinfo.f_edit == "1") return true;

            this.itemLists.forEach((row) => {
                if (row.f_edit == '1' || row.f_edit == '2') {
                    return true;
                }
            });
            return false;
        },       
    },
    methods: {
        ...mapActions("sales", ["iuSaleOrder"]), 
        comma (value) {
            if (value !== null && value !== undefined) {
                return String(Math.trunc(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            } else {
                return String(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            }
        },
        adjustIframeHeight() {
        // 브라우저 창의 높이를 iframe의 높이로 설정
            const windowHeight = window.innerHeight;
            this.iframeHeight = windowHeight - 200;           
        },
        
        row_classes(item) {
            if (item.f_edit == "2") {
                return "orange";
            } 
        },
        getOrderStatus(val) {
            const matchedItem = this.ORDER001.find((item) => item.value === val);
            return matchedItem ? matchedItem.label : "";
        },
        async init() {
            this.form.sDate1=getDate(-100, 1);
            this.viewOrd();
        },
        async viewOrd() {
            this.selectedM = []; this.selectedD = [];
            this.masterinfo = [];
            this.itemInfo = [];
            this.itemListFilter = [];
            
            if (this.itemInfo) this.itemInfo.splice(0);
            if (this.masters) this.masters.splice(0);
            this.masters = await this.$axios.post(`/api/sales/getSaleOrder`, this.form); 
            if (this.masters.length > 0 ) {
                this.itemLists =  await this.$axios.post(`/api/sales/getSaleOrderLi`, this.form); 
            }
        },
        async addOrd() {
            if (this.editJob) return;

            this.estlist = await this.$axios.post(`/api/sales/getSaleNotInsertOrder`);
            // const uniqueValues = [...new Set(this.estlist.map(obj => obj.i_ser))];
            this.est = Array.from(new Set(this.estlist.map(obj => 
                    JSON.stringify({ i_ser: obj.i_ser, 
                                     i_estno: obj.i_estno ,
                                     n_vend: obj.n_vend ,
                                     n_estnm: obj.n_estnm, 
                                     a_estamt: obj.a_estamt,
                                     s_date: obj.s_date,
                                     s_date3: obj.s_date3,
                                     }))), 
                    JSON.parse);

            this.$refs.dialog_Insert.open();

        },
        async newAdd1(item) {
            this.$refs.dialog_Insert.close();
            if (!item) {
                this.newAdd2();
                return
            }
            const data = this.estlist.filter(obj => obj.i_ser === item.i_ser);
            const ms = Date.now(); 
            let idx = 0;
            data.forEach((row, i) => {
                const obj = {};
                obj.i_order     = ms;
                obj.i_orderser  = row.i_serno;
                obj.c_com       = row.c_com;
                obj.s_sort      = i + 1;
                obj.i_orderno   = "";
                obj.c_item      = row.c_item
                obj.n_item      = row.n_item
                obj.t_size      = row.t_size
                obj.i_unit      = row.i_unit
                obj.i_type      = row.i_type
                obj.m_cnt       = row.m_cnt;
                obj.a_unit      = row.a_unit;
                obj.a_amt       = row.a_amt;
                obj.s_duedate   = row.s_duedate;
                obj.i_estno     = row.i_ser;
                obj.i_sernoser  = row.i_serno;
                obj.f_work      = "1";
                obj.f_edit      = "1";
                obj.f_editold   = "1";                
                this.itemLists.push(obj);

                if (i == 0 ) {                    
                    const objm = {};
                    objm.i_order     = ms;
                    objm.c_com       = row.c_com;
                    objm.i_orderno   = "";
                    objm.s_date      = getDate();
                    objm.f_use       = "Y";
                    objm.f_order     = "O";    // O:수주등록, P:생산계획(수주미등록)
                    objm.f_status    = "I";
                    objm.c_vend      = row.c_vend;
                    objm.n_order     = row.n_estnm;
                    objm.a_orderamt  = row.a_estamt;
                    objm.i_estno     = row.i_ser;
                    objm.n_magname   = "";
                    objm.s_date2     = "";
                    objm.t_remark    = "";
                    objm.n_vend      = row.n_vend;
                    objm.n_compnay   = row.n_compnay;
                    objm.n_ceo       = row.n_ceo;
                    objm.i_company   = row.i_company ;
                    objm.t_job1      = row.t_job1;
                    objm.t_job2      = row.t_job2;
                    objm.t_tel       = row.t_tel;
                    objm.t_fax       = row.t_fax;
                    objm.e_mail      = row.e_mail;
                    objm.t_addr      = row.t_addr;
                    objm.f_edit      = "1";
                    objm.f_editold   = "1";
                    
                    idx = this.masters.push(objm);                    
                }
            })

            const dataTable = this.$refs.table;
            if (dataTable) {
                const item = this.masters[idx -1];               
                dataTable.$emit("click:row", item);
            }
            
        },
        async newAdd2() {
            const ms = Date.now(); 
            let idx = 0;

            const objm = {};
            objm.i_order     = ms;
            objm.c_com       =  this.$store.state.user.member.c_com;
            objm.i_orderno   = "";
            objm.s_date      = getDate();
            objm.f_use       = "Y";
            objm.f_order     = "O";    // O:수주등록, P:생산계획(수주미등록)
            objm.f_status    = "I";
            // objm.c_vend      = row.c_vend;
            // objm.n_order     = row.n_estnm;
            // objm.a_orderamt  = row.a_estamt;
            // objm.i_estno     = row.i_ser;
            // objm.n_magname   = "";
            // objm.s_date2     = "";
            // objm.t_remark    = "";
            // objm.n_vend      = row.n_vend;
            // objm.n_compnay   = row.n_compnay;
            // objm.n_ceo       = row.n_ceo;
            // objm.i_company   = row.i_company ;
            // objm.t_job1      = row.t_job1;
            // objm.t_job2      = row.t_job2;
            // objm.t_tel       = row.t_tel;
            // objm.t_fax       = row.t_fax;
            // objm.e_mail      = row.e_mail;
            // objm.t_addr      = row.t_addr;
            objm.f_edit      = "1";
            objm.f_editold   = "1";
            
            idx = this.masters.push(objm);   
            
            const dataTable = this.$refs.table;
            if (dataTable && idx) {
                const item = this.masters[idx -1];               
                dataTable.$emit("click:row", item);
            }
        },


        async delOrd() {
            if (!this.edit) {
                await this.$ezNotify.alert("작성, 등록 상태만 삭제 가능 합니다.", "삭제불가", {icon: "mdi-message-bulleted-off", width: 250,});
                return
            }
            // DB 삭제 작업 ....
            // 신규 입력 삭제 (저장전 자료)
            if (this.masterinfo.f_editold != '1') {
                // 저장 후 삭제 
                const res = await this.$ezNotify.confirm("삭제 하시겠습니까 ?", "삭제", {icon: "mdi-message-bulleted-off", width: 350,});
                if(!res) return;
                const data = await this.$axios.delete(`/api/sales/delSaleOrder/${this.masterinfo.c_com}/${this.masterinfo.i_order}`);
            }

            this.itemInfo = [];
            const idx = this.masters.indexOf(this.masterinfo) ;
            if (idx >= 0) this.masters.splice(idx, 1);
            this.masterinfo = [];
            this.itemListFilter= [];

            this.$toast.info(`삭제 하였습니다.`);
        },
        async saveOrd() {
            // if (!this.edit) return;
            // if (!this.editJob) return;            
            if (this.masterinfo.i_orderno == null || this.masterinfo.i_orderno.length < 1) {
                this.$toast.error("수주번호 입력 필수 입니다.");
                return;
            }

            const order = Object.assign({}, this.masterinfo, this.itemListFilter);    // 발주마스트 + 발주세부 합하여 전달
            const data = await this.iuSaleOrder(order);
            for (let i = this.itemListFilter.length - 1; i >= 0; i--) {
                if (this.itemListFilter[i].f_edit == "2" ) {
                    this.itemListFilter.splice(i, 1);
                }
            }
            if (data == 0) {
                this.itemListFilter.forEach((row) => { 
                    row.f_edit = "0";
                    row.f_editold = "0";
                });
                this.masterinfo.f_edit = "0";
                this.masterinfo.f_editold = "0";
                if (this.masterinfo.f_status == "I") this.masterinfo.f_status = "S";  
                this.$toast.info(`저장 하였습니다.`);
            }
            else {
                if (data > 0) {
                    this.masterinfo.f_edit = "0";
                    this.masterinfo.f_editold = "0";
                }
                for (let i = 0; i < (data - 1); i++) {
                    this.itemListFilter[i].f_edit = "0";
                    this.itemListFilter[i].f_editold = "0";
                }
                await this.$ezNotify.alert("저장 중 오류가 발생 하였습니다...", "오류", {icon: "mdi-message-bulleted",});
            }

        },
        rowSelectMaster :function (item, row) {       
            if (this.editJob) return;
            this.masterinfo = item;  
            this.rowFilter(item);

            if (row) {
                row.select(true) 
            } else {
                this.selectedM = [item]
            }
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
        clickVend() {
            this.$refs.dialog_Vend.open();
        },
        close_item() {

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
        onChangeMaster() {
            const idx = this.masters.indexOf(this.masterinfo);
            if (idx > -1) this.masters[idx].f_edit = '1';
        },
        onChangeMasterDate() {
            const idx = this.masters.indexOf(this.masterinfo);
            if (idx > -1) this.masters[idx].f_edit = '1';
            this.itemListFilter.forEach((row) => {
                if (row.s_duedate < this.masterinfo.s_date2 || row.s_duedate == null ) {
                    row.s_duedate = this.masterinfo.s_date2;
                    row.f_edit = "1";
                }
            });
        },
        onChangeOrdno() {
            const idx = this.masters.indexOf(this.masterinfo);
            if (idx > -1) this.masters[idx].f_edit = '1';
            this.itemListFilter.forEach((row) => {
                row.i_orderno = this.masterinfo.i_orderno;
                row.f_edit = "1";
               
            });
        },

        rowSelectDetail:function (item, row) {
            row.select(true);
            this.itemInfo = item;
        },
        async addItem() {
            if (!this.edit) return

            this.selectedD = [];
            this.itemInfo = [];
            this.$refs.dialog_Item.open();
        },
        async delItem() {
            if (!this.editDetail) return;            

            const idx = this.itemLists.indexOf(this.itemInfo);
            if (idx > -1) {
                if (this.itemLists[idx].f_editold == "0") {
                    this.itemLists[idx].f_edit = this.itemInfo.f_edit === "2" ? "0": "2";
                } else {
                    this.itemLists.splice(idx, 1)
                    const idx1 = this.itemListFilter.indexOf(this.itemInfo)
                    if (idx1 > -1) this.itemListFilter.splice(idx1, 1);
                }
            }
            this.onChangeAmt2();
        },
        clickItem() {
            this.$refs.dialog_Item.open();
        }, 

        selectItem(item) {            
            const idx = this.itemLists.indexOf(this.itemInfo);
            const idx1 = this.itemListFilter.indexOf(this.itemInfo);

            if (idx1 >=0 ) {                
                this.itemListFilter[idx1].c_item  = item.c_item;
                this.itemListFilter[idx1].n_item  = item.n_item;
                this.itemListFilter[idx1].t_size  = item.t_size;
                this.itemListFilter[idx1].i_unit  = item.i_unit;
                this.itemListFilter[idx1].a_unit  = item.a_sell;
                this.itemListFilter[idx1].a_amt   = this.itemListFilter[idx1].m_cnt * item.a_sell;

            } else {             
                const obj = {};                
                obj.c_com      = this.masterinfo.c_com; 
                obj.i_order    = this.masterinfo.i_order;
                obj.i_orderser = Date.now();
                obj.s_sort     = this.getMaxNo + 1;
                obj.i_orderno  = this.masterinfo.i_orderno;                
                obj.c_item     = item.c_item;
                obj.n_item     = item.n_item;
                obj.t_size     = item.t_size;
                obj.i_unit     = item.i_unit;
                obj.i_type     = item.i_type;
                obj.m_cnt      = 1;
                obj.a_unit     = item.a_sell;
                obj.a_amt      = item.a_sell;
                obj.s_duedate  = this.masterinfo.s_date3;  
                obj.f_work     = "1";              
                obj.f_edit     = "1";        
                obj.f_editold  = "1";

                this.itemListFilter.push(obj) ;
                this.itemLists.push(obj) ;                
                
                this.selectedD.push(obj);  
            }
            
            this.onChangeAmt();
            this.$refs.dialog_Item.close();            
        },
        onChangeDetail() {            
            const idx = this.itemLists.indexOf(this.itemInfo);
            if (idx > -1) {
                if (this.itemInfo.f_edit == "0" ) this.itemLists[idx].f_edit = '1';                
            };            
        },
        onChangeAmt() {            
            //금액 계산 작업
            this.onChangeDetail();
            const idx = this.itemLists.indexOf(this.itemInfo);
            if (idx > -1) {                
                this.itemLists[idx].a_amt = this.itemLists[idx].a_unit * this.itemLists[idx].m_cnt;
            };
            // 수주 총 금액
            let a_amt = 0;
            this.itemListFilter.forEach((row) => {
                if (row.f_edit !== "2" ) a_amt = a_amt + (row.a_amt * 1);
            });            
            this.masterinfo.a_orderamt = a_amt;
            this.masterinfo.f_edit = "1";
        },
        onChangeAmt2() {            
            this.onChangeDetail();
            // 수주 총 금액
            let a_amt = 0;
            this.itemListFilter.forEach((row) => {                 
               if (row.f_edit !== "2" ) a_amt = a_amt + (row.a_amt * 1);
            });            
            this.masterinfo.a_orderamt = a_amt;
            this.masterinfo.f_edit = "1";
        }
    }

}
</script>

<style>

</style>