<template>
    <v-container fluid>
        <v-toolbar height="40px" background-color="primary" dark>
            <v-toolbar-title>견적 관리</v-toolbar-title>
            <v-spacer/>            
            <tooltip-btn label="견적 조회" @click="select"><v-icon>mdi-magnify</v-icon></tooltip-btn>
            <tooltip-btn label="견적 작성" @click="addEstimates"><v-icon>mdi-plus</v-icon></tooltip-btn>
            <tooltip-btn label="견적 삭제" @click="delEstimates"><v-icon>mdi-minus</v-icon></tooltip-btn>
            <tooltip-btn label="견적 저장" @click="saveEstimates"><v-icon>mdi-content-save-outline</v-icon></tooltip-btn>
            <tooltip-btn label="견적 출력" @click="printEstimates"><v-icon>mdi-printer</v-icon></tooltip-btn>
        </v-toolbar>      
        <v-card class="my-card">
            <v-row no-gutters class="my-text-field">
                <v-col col="12" sm="1" md="1"><v-text-field value="견적기간" readonly dense hide-details class="text-input-blue no-padding"/></v-col>
                <v-col col="12" sm="2" md="2"><input-date-3 v-model="form.sDate1" /></v-col>
                <v-col col="12" sm="2" md="2"><input-date-3 v-model="form.sDate2" /></v-col>
                <v-col col="12" sm="1" md="1"><v-text-field value="고객사" readonly dense hide-details class="text-input-blue no-padding"/></v-col>
                <v-col col="12" sm="3" md="3"><v-text-field v-model="form.sVend" dense hide-details class="text-input-blue no-padding" /></v-col>
                <v-col col="12" sm="1" md="1"><v-text-field value="견적상태" readonly dense hide-details class="text-input-blue no-padding"/> </v-col>
                <v-col col="12" sm="2" md="2">
                    <v-select v-model="form.sStatus"
                        :items="ESTI001" item-text="label" item-value="value"                        
                        class="my-text-field" dense
                        @keydown.native="onKeyDownStatus"
                        >                       
                    </v-select></v-col>
            </v-row>
            <v-row no-gutters class="my-text-field">
                <v-col col="12" sm="1" md="1"><v-text-field value="견적번호" readonly dense hide-details class="text-input-blue no-padding"/></v-col>
                <v-col col="12" sm="4" md="4"><v-text-field v-model="form.sEsimate" dense hide-details class="my-text-field no-padding" /></v-col>
            </v-row>
            <v-row no-gutters class="my-text-fieldend"><v-col></v-col></v-row>
           
        </v-card>  

        <v-row >
            <v-col col="12" sm="4" md="4">
                <v-data-table ref="table" :headers="master" :items="estimates" @click:row="rowSelectMaster" 
                    item-key="i_ser" single-select v-model="selectedM"
                    
                    :items-per-page="-1" hide-default-footer :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" 
                    class="elevation-1 text-no-wrap" :height="iframeHeight" > 

                    <template v-slot:[`item.f_status`]="{ item }">
                        {{getStatus(item.f_status)}} 
                    </template>
                    <template v-slot:[`item.a_estamt`]="{ item }">
                        <div class="right2-align">{{comma(item.a_estamt)}}</div>
                    </template>
                </v-data-table>
            </v-col>

            <v-col col="12" sm="8" md="8">
                <v-form @submit.prevent="save" ref="form" v-model="valid" lazy-validation>
                <v-card color="grey lighten-4">
                <v-row no-gutters class="my-text-field"  >
                    <v-col col="8" sm="1" md="1"><v-text-field value="견적번호" readonly dense hide-details class="text-input-redbrg no-padding"/></v-col>
                    <v-col col="8" sm="2" md="2"><v-text-field v-model="estimate.i_estno" :readonly="!edit" @input="onChangeEstno" dense hide-details class="no-padding" /></v-col>                    
                    <v-col col="8" sm="1" md="1"><v-text-field value="견적상태" readonly dense hide-details class="text-input-redbrg no-padding"/></v-col>
                    <v-col col="8" sm="2" md="2">
                        <v-select v-if="editStatus" v-model="estimate.f_status"
                            @input="onChangeMaster"
                            :items="ESTI001" item-text="label" item-value="value" 
                            :rules="[rules.require({ label: '견적상태' })]"     
                            :readonly="!editStatus"                    
                            class="my-text-field no-padding" dense >                       
                        </v-select>
                        <v-text-field v-else :value="getStatus(estimate.f_status)" readonly dense hide-details class="no-padding"/>
                        </v-col>                    
                </v-row>
                <v-row no-gutters class="my-text-field">
                    <v-col col="8" sm="1" md="1"><v-text-field value="견적명" readonly dense hide-details class="text-input-redbrg no-padding"/> </v-col>
                    <v-col col="8" sm="6" md="6">
                        <v-text-field v-model="estimate.n_estnm" :readonly="!edit" @input="onChangeMaster" dense hide-details class="no-padding"/> 
                    </v-col>
                </v-row>
                <v-row no-gutters class="my-text-field">
                    <v-col col="8" sm="1" md="1"><v-text-field value="고객사" readonly dense hide-details class="text-input-bluebrg no-padding"/> </v-col>
                    <v-col col="8" sm="4" md="4">
                        <v-text-field v-if="edit" readonly v-model="estimate.n_vend" dense hide-details class="no-padding">
                            <template v-slot:append>
                                <div class="no-padding">
                                <v-btn icon x-small tabindex="-1" @click="clickVend" ><v-icon> mdi-dialpad </v-icon></v-btn>
                                </div>
                            </template>
                        </v-text-field>
                        <v-text-field v-else v-model="estimate.n_vend" readonly @input="onChangeMaster" dense hide-details class="no-padding"/>
                    </v-col>
                    <v-col col="8" sm="1" md="1"></v-col>
                </v-row>
                <v-row no-gutters class="my-text-field">
                    <v-col col="8" sm="1" md="1"><v-text-field value="견적일" readonly dense hide-details class="text-input-bluebrg no-padding"/> </v-col>
                    <v-col col="8" sm="2" md="2"><input-date-3 v-model="estimate.s_date" :readonly="!edit" @input="onChangeMaster" :rules="rules.date({required: false})" /> </v-col>                    
                    <v-col col="8" sm="1" md="1"><v-text-field value="유효일" readonly dense hide-details class="text-input-bluebrg no-padding"/> </v-col>
                    <v-col col="8" sm="2" md="2"><input-date-3 v-model="estimate.s_date2" :readonly="!edit" @input="onChangeMaster" :rules="rules.date({required: false})" /> </v-col>
                    <v-col col="8" sm="1" md="1"><v-text-field value="납기일" readonly dense hide-details class="text-input-bluebrg no-padding"/> </v-col>
                    <v-col col="8" sm="2" md="2"><input-date-3 v-model="estimate.s_date3" :readonly="!edit" @input="onChangeMasterDate" :rules="rules.date({required: false})" /> </v-col>

                    <!-- :rules="[rules.require({ label: 'Code' }), rules.alphaNum()]" /> -->
                </v-row>
                <v-row no-gutters class="my-text-field">
                    <v-col col="8" sm="1" md="1"><v-text-field value="수신자" readonly dense hide-details class="text-input-bluebrg no-padding"/> </v-col>
                    <v-col col="8" sm="2" md="2"><v-text-field v-model="estimate.n_rname" :readonly="!edit" @input="onChangeMaster" dense hide-details class="no-padding"/> </v-col>
                    <v-col col="8" sm="1" md="1"><v-text-field value="연락처" readonly dense hide-details class="text-input-bluebrg no-padding"/> </v-col>
                    <v-col col="8" sm="2" md="2"><v-text-field v-model="estimate.t_rtel" :readonly="!edit" @input="onChangeMaster" placeholder="전화번호" dense hide-details class="no-padding"/> </v-col>
                    <v-col col="8" sm="1" md="1"><v-text-field value="E-Mail" readonly dense hide-details class="text-input-bluebrg no-padding"/> </v-col>
                    <v-col col="8" sm="3" md="3"><v-text-field v-model="estimate.t_remail" :readonly="!edit" @input="onChangeMaster" placeholder="E-Mail" dense hide-details class="no-padding"/> </v-col>                    
                </v-row>
                <v-row no-gutters class="my-text-field">
                    <v-col col="8" sm="1" md="1"><v-text-field value="담당자" readonly dense hide-details class="text-input-bluebrg no-padding"/> </v-col>
                    <v-col col="8" sm="2" md="2"><v-text-field v-model="estimate.n_magname" :readonly="!edit" @input="onChangeMaster" dense hide-details class="no-padding"/> </v-col>
                    <v-col col="8" sm="1" md="1"><v-text-field value="연락처" readonly dense hide-details class="text-input-bluebrg no-padding"/> </v-col>
                    <v-col col="8" sm="2" md="2"><v-text-field v-model="estimate.t_magtel" :readonly="!edit" placeholder="담당자 연락처" @input="onChangeMaster" dense hide-details class="no-padding"/> </v-col>
                    <v-col col="8" sm="1" md="1"><v-text-field value="견적금액" readonly dense hide-details class="text-input-redbrg no-padding"/> </v-col>
                    <v-col col="8" sm="2" md="2"><v-text-field :value="comma(estimate.a_estamt)+'원'" readonly dense hide-details class="text-input-redbrg inputPrice no-padding"/> </v-col>
                    
                </v-row>
                <v-row no-gutters class="my-text-field">
                    <v-col col="8" sm="1" md="1"><v-text-field value="메모" readonly dense hide-details class="text-input-bluebrg no-padding"/> </v-col>
                    <v-col col="12" sm="8" md="8"><v-text-field v-model="estimate.t_remark" dense hide-details class="no-padding"/> </v-col>
                </v-row>
                <v-row no-gutters class="my-text-fieldend"><v-col></v-col></v-row>
                </v-card>
                </v-form>

                <v-toolbar height="35px" color="accent" >
                    <v-toolbar-title>견적 품목 List</v-toolbar-title>
                    <v-spacer/>                       
                    <tooltip-btn label="추가" @click="addDetail" fab x-small><v-icon>mdi-plus</v-icon></tooltip-btn>            
                    <tooltip-btn label="삭제" @click="delDetail" fab x-small><v-icon>mdi-minus</v-icon></tooltip-btn>
                </v-toolbar>
                <v-form ref="form2" v-model="valid" lazy-validation>
                <v-data-table :headers="detail" :items="itmelitFilter"
                    @click:row="rowSelectDetail" 
                    item-key="i_serno" 
                    single-select v-model="selectedD"                    
                    :items-per-page="-1"  hide-default-footer :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" 
                    :item-class= "row_classes" 
                    class="elevation-1 text-no-wrap" :height="iframeHeight - 230">
                    
                    <template v-slot:[`item.s_sort`]="{ item }">                        
                        <input-number v-model="item.s_sort" :maxlength="2" @input="onChangeDetail" v-if="edit && item.i_serno === itmelit.i_serno" ></input-number>                        
                        <span v-else>{{item.s_sort}}</span>
                    </template>
                    <template v-slot:[`item.n_item`]="{ item }">
                        <v-text-field v-model="item.n_item" hide-details dense single-line readonly v-if="edit && item.i_serno === itmelit.i_serno" class="my-text-field no-padding">
                            <template v-slot:append>
                                <v-btn icon x-small tabindex="-1" @click="clickItem">
                                    <v-icon> mdi-dialpad </v-icon>
                                </v-btn>
                            </template>
                        </v-text-field>
                        <span v-else>{{item.n_item }}</span>
                    </template>
                    <template v-slot:[`item.m_cnt`]="{ item }">
                        <input-amt v-model="item.m_cnt" @input="onChangeAmt" v-if="edit && item.i_serno === itmelit.i_serno" ></input-amt>
                        <span v-else>{{comma(item.m_cnt)}}</span>
                    </template>
                    <template v-slot:[`item.a_unit`]="{ item }">
                        <input-amt v-model="item.a_unit" @input="onChangeAmt" v-if="edit && item.i_serno === itmelit.i_serno" ></input-amt>
                        <span v-else><div class="right2-align">{{comma(item.a_unit)}}</div></span>
                    </template>
                    <template v-slot:[`item.a_amt`]="{ item }">
                        <input-amt v-model="item.a_amt" @input="onChangeAmt2" v-if="edit && item.i_serno === itmelit.i_serno" ></input-amt>
                        <span v-else><div class="right2-align">{{comma(item.a_amt)}}</div></span>
                    </template>
                    <template v-slot:[`item.s_duedate`]="{ item }">
                        <input-date-2 v-model="item.s_duedate" @input="onChangeDetail" v-if="edit && item.i_serno === itmelit.i_serno" :rules="rules.date({required: false})" />
                        <span v-else>{{item.s_duedate}}</span>
                    </template>
                    <template v-slot:[`item.t_remark`]="{ item }">
                        <v-text-field v-model="item.t_remark" @input="onChangeDetail" v-if="edit && item.i_serno === itmelit.i_serno" dense hide-details class="my-text-field no-padding" />
                        <span v-else><div class="left-align">{{item.t_remark}}</div></span>
                    </template>
                </v-data-table>
                </v-form>
            </v-col>           
        </v-row>
        <ez-dialog ref="dialog_Item" label="항목/품목" persistent @onClose="close_item" width="460px" >            
            <item-pop @onSelect="selectItem"></item-pop>
        </ez-dialog>
        <ez-dialog ref="dialog_Vend" label="거래처" persistent @onClose="close_item" width="460px" >
            <vend-pop @onSelect="selectVend"></vend-pop>
        </ez-dialog>
    </v-container>
</template>

<script>
import qs from "qs";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { mapActions } from "vuex";
import { ESTI001 } from '../../../util/constval';
import { getDate, previousMonth, deepCopy, dateToKorean, numberToKorean, amtToKorean } from '../../../util/lib';
import validateRules from "../../../util/validateRules";
import EzDialog from '../../components/etc/EzDialog.vue';
import TooltipBtn from '../../components/etc/TooltipBtn.vue';
import InputDate2 from '../../components/InputForms/InputDate2.vue';
import InputDate3 from '../../components/InputForms/InputDate3.vue';
import InputAmt from '../../components/InputForms/InputAmt.vue';
import InputNumber from '../../components/InputForms/InputNumber.vue';
import ItemPop from '../codelist/ItemPop.vue';
import VendPop from '../codelist/VendPop.vue';
import { _fonts }  from'../../font/fonts.js';


export default {
    components: { TooltipBtn, EzDialog, InputDate2, InputDate3, ItemPop, InputAmt, InputNumber, VendPop },    
    
    name: "Salesestimate",
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
            ESTI001,            
            valid: true,
            iframeHeight: 500, // 초기 높이 설정 (원하는 높이로 초기화)
            master: [
                {text: '견적번호',  value: 'i_estno', sortable: false, align:'center', width: "65px"},                
                {text: '상태',  value: 'f_status', sortable: false, align:'center', width: "25px"},
                {text: '고객사',    value: 'n_vend', sortable: false, align:'center', width: "75px" },
                {text: '견적금액',  value: 'a_estamt', sortable: false, align:'center', width: "65px"},
            ],
            estimates:[], estimate:[], selectedM: [],
            detail: [
                {text: 'No',  value: 's_sort', sortable: false, align:'center', width: "35px"},
                {text: '항목(품목)',  value: 'n_item', sortable: false, align:'center', width: "130px"},
                {text: '규격(사양)',  value: 't_size', sortable: false, align:'center', width: "100px"},
                {text: '단위',  value: 'i_unit', sortable: false, align:'center', width: "90px"},
                {text: '수량',  value: 'm_cnt', sortable: false, align:'center', width: "60px"},
                {text: '단가',  value: 'a_unit', sortable: false, align:'center', width: "90px"},
                {text: '금액',  value: 'a_amt', sortable: false, align:'center', width: "90px"},
                // {text: '통화',  value: 'f_status', sortable: false, align:'center'},
                {text: '납기일',  value: 's_duedate', sortable: false, align:'center', width: "90px"},     
                {text: '비고',  value: 't_remark', sortable: false, align:'center', width: "90px"},                     
                
            ],
            itmelits: [], itmelit: [], itmelitFilter: [],selectedD: [],
            form : {
                sDate1:"", sDate2:"", sEsimate:"", sVend:"", sStatus:"",
            },
            estDayFt: 15,
            comImageLog: "",
        }
    },
    watch: {
        estimate() {
            this.$refs.form.resetValidation(); 
        }
    },
    computed: {
        rules: () => validateRules,
        getMaxNo() {            
            const max = Math.max(...this.itmelitFilter.map((item) => item.s_sort));
            return isFinite(max) ? max : 0;
        },
        edit() {            
            // if (this.estimate.i_ser == undefined || ((this.estimate.f_status == "S" || this.estimate.f_status == "A") && this.estimate.f_edit !== "1")) return false;
            if (this.estimate.i_ser == undefined || this.estimate.f_status == "A" || (this.estimate.f_status == "S"  && this.estimate.f_edit !== "1")) return false;
            return true;
        },
        editStatus() {
            if (this.estimate.i_ser == undefined) return false;
            if (this.estimate.f_status == "A" && this.estimate.f_editold == "0" && this.estimate.f_edit !== "1") return false;            
            return true;
        },
        editDetail() {
            if (!this.edit) return false;
            if (this.itmelit.i_serno == undefined) return false;            
            return true;
        },
        editJob() {
            if (this.estimate.f_edit == "1") return true;
            this.itmelitFilter.forEach((row) => {
                if (row.f_edit == "1" || row.f_edit == "2") return true
            });
            return false;
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
        ...mapActions("sales", ["getSaleEstimate", "iuSaleEstimate"]), 
        adjustIframeHeight() {
        // 브라우저 창의 높이를 iframe의 높이로 설정
            const windowHeight = window.innerHeight;
            this.iframeHeight = windowHeight - 230;           
        },
        comma (value) {
            if (value !== null && value !== undefined) {
                return String(Math.trunc(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            } else {
                return String(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            }
        },
        row_classes(item) {
            if (item.f_edit == "2") {
                return "orange";
            } 
        },
        onKeyDownStatus(event) {
            if (event.keyCode === 46) { // 46은 del 키의 keyCode입니다.
                this.form.sStatus = "";
            }
        },
        async init() {  
            this.form.sDate1=getDate(-100, 1);
            var query = qs.stringify({c_com: this.$store.state.user.member.c_com, c_gcode: "BUSINESS", c_code: "ESTIMATE01", col: "m_buf1"});
            
            var data = await this.$axios.get(`/api/sales/getSaleEstimateInit?${query}`);
            this.estDayFt = parseFloat(data[0].m_buf1);
            this.select();
            this.comImageLog = await this.$axios.post(`/api/system/getSiteImage`);            
        },
        async select() {
            this.selectedM = []; this.selectedD = [];
            this.estimate = [];            
            this.itmelit = [];
            this.itmelitFilter = [];
            
            if (this.itmelits) this.itmelits.splice(0);
            if (this.estimates) this.estimates.splice(0);

            this.estimates = await this.$axios.post(`/api/sales/getSaleEstimate`, this.form); 
            if (this.estimates.length > 0 ) {
                this.itmelits =  await this.$axios.post(`/api/sales/getSaleEstimateli`, this.form); 
            }
        },
        rowSelectMaster :function (item, row) {        
            if (this.editJob) return;
            
            row.select(true);            
            this.estimate = item;  
            this.rowFilter(item);                                
        },
        rowFilter(item) {
            // console.log(item);
            // if (this.itmelits.length > 0) {
            //     this.itmelitFilter = this.itmelits.filter((r) => {
            //         return r.i_ser == item.i_ser && r.c_com == item.c_com;
            //     }); 
            // } else {
            //     this.itmelitFilter = [];
            // }
            //this.itemRouterFilter = this.itemRouters.filter(obj => obj.c_com == item.c_com && obj.i_order == item.i_order && obj.i_orderser == item.i_orderser && obj.f_edit !== "2").map(obj => ({...obj}));
            this.itmelitFilter = this.itmelits.filter(obj => obj.i_ser == item.i_ser).map(obj => ({...obj}));

        },
        async addEstimates() {   
            if (this.editJob) {
                await this.$ezNotify.alert("</br>수정내용이 존재 합니다. </br>저장 후 작업가능 합니다. ", "견적수정", {icon: "mdi-message-bulleted-off", width: 400,});
                return
            }
            const ms = Date.now();                     
            this.selectedM = [];
            this.estimate = {c_com:this.$store.state.user.member.c_com,  i_ser: ms, f_status: "I", s_date: getDate(), s_date2: getDate(this.estDayFt), f_use: "Y", f_edit: "1", f_editold:"1"};
            const idx = this.estimates.push(this.estimate) ;
            this.selectedM.push(this.estimate);  
            this.rowFilter(this.estimate);     
        },
        async delEstimates() {
            if (!this.edit) {
                await this.$ezNotify.alert("견적서 작성상태만 삭제 가능 합니다.", "삭제불가", {icon: "mdi-message-bulleted-off", width: 250,});
                return
            }
            // DB 삭제 작업 ....
            // 신규 입력 삭제 (저장전 자료)
            if (this.estimate.f_editold != '1') {
                // 저장 후 삭제 
                const res = await this.$ezNotify.confirm("선택한 견적서를 삭제 하시겠습니까 ?", "삭제", {icon: "mdi-message-bulleted-off", width: 350,});
                if(!res) return;
                const data = await this.$axios.delete(`/api/sales/delSaleEstimate/${this.estimate.c_com}/${this.estimate.i_ser}`);
            }

            this.itmelitFilter = [];
            const idx = this.estimates.indexOf(this.estimate) ;
            if (idx >= 0) this.estimates.splice(idx, 1);
            this.estimate = [];

            this.$toast.info(`삭제 하였습니다.`);

        },
        async saveEstimates() {
            if (!this.edit && this.estimate.f_edit == '0' ) {
                return;
            }
            
            // this.$refs.form.validate();
            // await this.$nextTick();
            // if (!this.valid) return; 

            if (this.estimate.i_estno == null) {
                this.$toast.error("견적번호 입력 필수 입니다.");
                return
            }

            // this.$refs.form2.validate();!
            // await this.$nextTick();
            // if (!this.valid) return; 

            const est = Object.assign({}, this.estimate, this.itmelitFilter);
            const data = await this.iuSaleEstimate(est);
            for (let i = this.itmelitFilter.length - 1; i >= 0; i--) {
                if (this.itmelitFilter[i].f_edit == "2" ) {
                    this.itmelitFilter.splice(i, 1);
                }
            }
            if (data == 0) {                 
                this.itmelitFilter.forEach((row) => { 
                    row.f_edit = "0";
                    row.f_editold = "0";
                });
                this.estimate.f_edit = "0";
                this.estimate.f_editold = "0";
                this.$toast.info(`저장 하였습니다.`);
            }
            else {
                if (data > 0) {
                    this.estimate.f_edit = "0";
                    this.estimate.f_editold = "0";
                }
                for (let i = 0; i < (data - 1); i++) {
                    this.itmelitFilter[i].f_edit = "0";
                    this.itmelitFilter[i].f_editold = "0";
                }
                await this.$ezNotify.alert("저장 중 오류가 발생 하였습니다...", "오류", {icon: "mdi-message-bulleted",});
            }
        },
        async printEstimates() {            
            if(this.estimate.i_ser == undefined) return;

            if (this.editJob) {
                await this.$ezNotify.alert("</br>수정내용이 존재 합니다. </br>저장 후 작업가능 합니다. ", "견적수정", {icon: "mdi-message-bulleted-off", width: 400,});
                return
            }

            // 견적서 인쇄 ????
            let query = qs.stringify({c_com: this.$store.state.user.member.c_com});
            const company = await this.$axios.get(`/api/system/getCompany?${query}`);
            
            query = qs.stringify({c_com: this.$store.state.user.member.c_com, c_vend: this.estimate.c_vend});
            const vend = await this.$axios.get(`/api/basejob/getVendInfo?${query}`);
            
            
            // jsPDF 라이브러리를 가져옵니다.
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
            doc.text('견  적  서', 80, 30);
            
            doc.setFontSize(9);            
            doc.setLineWidth(0.1); // 선 두께를 0.1로 설정합니다
            doc.rect(10, 50, 190, 230);
            // doc.rect(10, 50, 80, 7);  
            // this.estimate.n_vend
            this.doctext(doc, dateToKorean(this.estimate.s_date), 10, 55, 7, 80, 1);  
            doc.setFontSize(15);
            this.doctext(doc, `${ vend.length > 0 ? vend[0].n_compnay : this.estimate.n_vend } 귀하`, 10, 75, 7, 80, 1);  
            doc.setFontSize(9);
            this.doctext(doc, `아래와 같이 견적합니다`, 10, 85, 7, 80, 1);

            doc.rect(90, 50, 10, 35);
            doc.text(93, 60, '공'); doc.text(93, 68, '급'); doc.text(93, 77, '자');
            doc.rect(100, 50, 16, 35); 
            doc.rect(100, 50, 100, 7); this.doctext(doc, "등록번호", 105, 56, 7, 7, 1);  this.doctext(doc, company[0].c1, 116, 56, 7, 84, 1);
            doc.rect(100, 57, 100, 7); this.doctext(doc, "상 호 명", 105, 63, 7, 7, 1);  this.doctext(doc, company[0].c2, 116, 63, 7, 33, 1);
            doc.rect(150, 57, 16, 7);  this.doctext(doc, "대 표 자", 155, 63, 7, 7, 1);  this.doctext(doc, company[0].c3, 167, 63, 7, 33, 1);
            doc.rect(100, 64, 100, 7); this.doctext(doc, "주    소", 105, 70, 7, 7, 1);  this.doctext(doc, company[0].c4, 116, 70, 7, 84, 1);
            doc.rect(100, 71, 100, 7); this.doctext(doc, "업    태", 105, 77, 7, 7, 1);  this.doctext(doc, company[0].c5, 116, 77, 7, 33, 1);
            doc.rect(150, 71, 16, 7);  this.doctext(doc, "업    종", 155, 77, 7, 7, 1);  this.doctext(doc, company[0].c6, 167, 77, 7, 33, 1);
            doc.rect(100, 78, 100, 7); this.doctext(doc, "전화번호", 105, 84, 7, 7, 1);  this.doctext(doc, company[0].c7, 116, 84, 7, 33, 1);
            doc.rect(150, 78, 16, 7);  this.doctext(doc, "FAX번호", 155, 84, 7, 7, 1);   this.doctext(doc, company[0].c8, 167, 84, 7, 33, 1);

            doc.rect(10, 85, 190, 7); doc.text( 32, 90, ` 견적금액 : 일금 ${numberToKorean(this.estimate.a_estamt)}(￦${amtToKorean(this.estimate.a_estamt)})원정 (부가세별도)`)

            for (let i = 0; i < 23; i++) {
                if ( i == 0 || i == 22 ) {
                    doc.setFillColor(192, 192, 192);   
                    doc.rect(10, 92 + (i * 7), 190, 7, 'FD');
                    doc.setFillColor(255, 255, 255); 
                } else {
                    doc.rect(10, 92 + (i * 7), 190, 7);
                }
            }
            
            doc.line(16, 92, 16, 253); doc.text(11,97, 'No');
            doc.line(60, 92, 60, 253); doc.text(35,97, '품명');
            doc.line(100, 92, 100, 253); doc.text(75,97, '규격');
            doc.line(120, 92, 120, 253); doc.text(106,97, '단위');
            doc.line(130, 92, 130, 253); doc.text(122,97, '수량');
            doc.line(150, 92, 150, 253); doc.text(137,97, '단가');
            doc.line(172, 92, 172, 253); doc.text(158,97, '금액');  doc.text(184,97, '비고');

            let y = 0;
            let amt = 0;
            this.itmelitFilter.forEach((row, index) => {
                y = 91 + ((index + 2) * 7);
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


           
           y = 91 + ((this.itmelitFilter.length + 2) * 7);
           this.doctext(doc,'- 이 하 여 백 -', 60,y,7,40, 1);
           doc.setFontSize(10);
           y = 91 + (23 * 7) ;
           this.doctext(doc, '합 계', 100,y,7,20, 1);
           this.doctext(doc, this.comma(amt), 150,y,7,22, 2);
           doc.setFontSize(9);
           
            y = y + 91
            doc.text(12, 260, `견적유효일 : ${dateToKorean(this.estimate.s_date2)} 까지` )   ;
            if (this.estimate.n_magname) doc.text(100, 260, `견적담당자 : ${this.estimate.n_magname}  ${this.estimate.t_magtel} ` )   ;            
            if (this.estimate.t_remark) doc.text(12, 267, `특 이 사 항 : ${this.estimate.t_remark}` )   ;

            // PDF 저장            
            doc.save(`견적서_${this.estimate.i_estno}.pdf`);
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
        rowSelectDetail:function (item, row) {                
            row.select(true);
            this.itmelit = item;
        },

        async addDetail() {
            if (! this.edit) return

            this.selectedD = [];
            this.itmelit = [];
            this.$refs.dialog_Item.open();
        },
        clickItem() {
            this.$refs.dialog_Item.open();
        }, 
        clickVend() {
            this.$refs.dialog_Vend.open();
        },
        async delDetail() {              
            if (!this.editDetail) return;            

            const idx = this.itmelits.indexOf(this.itmelit);
            if (idx > -1) {
                if (this.itmelits[idx].f_editold == "0") {
                    this.itmelits[idx].f_edit = this.itmelits[idx].f_edit === "2" ? "0": "2";
                } else {
                    this.itmelits.splice(idx, 1)
                    const idx1 = this.itmelitFilter.indexOf(this.itmelit)
                    if (idx1 > -1) this.itmelitFilter.splice(idx1, 1);
                }
            }
        },

        getStatus(item) {
            var find = this.ESTI001.find(e => e.value === item);
            return find !== undefined ? find.label : '';
        },

        selectItem(item) {            
            const idx = this.itmelits.indexOf(this.itmelit);
            const idx1 = this.itmelitFilter.indexOf(this.itmelit);

            if (idx1 >=0 ) {                
                this.itmelitFilter[idx1].c_item  = item.c_item;
                this.itmelitFilter[idx1].n_item  = item.n_item;
                this.itmelitFilter[idx1].t_size  = item.t_size;
                this.itmelitFilter[idx1].i_unit  = item.i_unit;
                this.itmelitFilter[idx1].a_unit  = item.a_sell;
                this.itmelitFilter[idx1].a_amt   = this.itmelitFilter[idx1].m_cnt * item.a_sell;

            } else {             
                const obj = {};                
                obj.c_com = this.estimate.c_com; 
                obj.i_ser = this.estimate.i_ser;
                obj.i_serno = Date.now();
                obj.s_sort  = this.getMaxNo + 1;
                obj.i_estno = this.estimate.i_estno;                
                obj.c_item  = item.c_item;
                obj.n_item  = item.n_item;
                obj.t_size  = item.t_size;
                obj.i_unit  = item.i_unit;
                obj.i_type  = item.i_type;                
                obj.m_cnt   = 1;
                obj.a_unit  = item.a_sell;
                obj.a_amt   = item.a_sell;
                obj.s_duedate = this.estimate.s_date3;                
                obj.f_edit    = "1";        
                obj.f_editold = "1";

                this.itmelitFilter.push(obj) ;
                this.itmelits.push(obj) ;                
                
                this.selectedD.push(obj);  
            }
            
            this.onChangeAmt();
            this.$refs.dialog_Item.close();            
        },
        close_item() {

        },
        selectVend(item) { 
            const idx = this.estimates.indexOf(this.estimate);
            if (idx >=0 ) {
                this.estimates[idx].c_vend    = item.c_vend;
                this.estimates[idx].n_vend    = item.n_vend;
                this.estimates[idx].n_rname   = item.n_mag;
                this.estimates[idx].t_rtel    = item.t_magtel;
                this.estimates[idx].t_remail  = item.t_magmail;

                this.onChangeMaster();
            }
            this.$refs.dialog_Vend.close();
        },

        onChangeMaster() {
            const idx = this.estimates.indexOf(this.estimate);
            if (idx > -1) this.estimates[idx].f_edit = '1';
        },
        onChangeMasterDate() {
            const idx = this.estimates.indexOf(this.estimate);
            if (idx > -1) this.estimates[idx].f_edit = '1';
            this.itmelitFilter.forEach((row) => {
                if (row.s_duedate < this.estimate.s_date3 || row.s_duedate == null ) {
                    row.s_duedate = this.estimate.s_date3;
                    row.f_edit = "1";
                }
            });
        },
        onChangeEstno() {
            const idx = this.estimates.indexOf(this.estimate);
            if (idx > -1) this.estimates[idx].f_edit = '1';
            this.itmelitFilter.forEach((row) => {               
                row.i_estno = this.estimate.i_estno;
                row.f_edit = "1";
            });
        },
        onChangeDetail() {            
            const idx = this.itmelits.indexOf(this.itmelit);
            if (idx > -1) {
                this.itmelits[idx].f_edit = '1';                
            };
            
        },
        onChangeAmt() {            
            //금액 계산 작업
            this.onChangeDetail();
            const idx = this.itmelits.indexOf(this.itmelit);
            if (idx > -1) {                
                this.itmelits[idx].a_amt = this.itmelits[idx].a_unit * this.itmelits[idx].m_cnt;
            };
            // 발주 총 금액
            let a_estamt = 0;
            this.itmelitFilter.forEach((row) => {                 
                if (row.f_edit !== "2" ) a_estamt = a_estamt + (row.a_amt * 1);
            });            
            this.estimate.a_estamt = a_estamt;
            this.estimate.f_edit = "1";
        },
        onChangeAmt2() {            
            this.onChangeDetail();
            // 발주 총 금액
            let a_estamt = 0;
            this.itmelitFilter.forEach((row) => {                 
                if (row.f_edit !== "2" ) a_estamt = a_estamt + (row.a_amt * 1)
            });            
            this.estimate.a_estamt = a_estamt;
            this.estimate.f_edit = "1";
        }
    }

}
</script>

<style>
    
</style>