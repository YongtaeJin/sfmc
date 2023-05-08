<template>
    <v-container fluid>
        <v-toolbar height="40px" background-color="primary" dark>
            <v-toolbar-title>견적 관리</v-toolbar-title>
            <v-spacer/>            
            <tooltip-btn label="견적 조회" @click="select"><v-icon>mdi-magnify</v-icon></tooltip-btn>
            <tooltip-btn label="견적 작성" @click="addEstimates"><v-icon>mdi-plus</v-icon></tooltip-btn>
            <tooltip-btn label="견적 삭제" @click="delEstimates"><v-icon>mdi-minus</v-icon></tooltip-btn>
            <tooltip-btn label="견적 저장" @click="saveEstimates"><v-icon>mdi-content-save-outline</v-icon></tooltip-btn>
            <tooltip-btn label="견적 저장" @click="printEstimates"><v-icon>mdi-printer</v-icon></tooltip-btn>
        </v-toolbar>      
        <v-card class="my-card">
            <v-row no-gutters class="my-text-field">
                <v-col col="12" sm="1" md="1"><v-text-field value="견적기간" readonly dense hide-details class="text-input-blue"/></v-col>
                <v-col col="12" sm="2" md="2"><input-date-2 v-model="form.sDate1" /></v-col>
                <v-col col="12" sm="2" md="2"><input-date-2 v-model="form.sDate2" /></v-col>
                <v-col col="12" sm="1" md="1"><v-text-field value="고객사" readonly dense hide-details class="text-input-blue"/></v-col>
                <v-col col="12" sm="3" md="3"><v-text-field v-model="form.sVend" dense hide-detailsclass="text-input-blue" /></v-col>
                <v-col col="12" sm="1" md="1"><v-text-field value="견적상태" readonly dense hide-details class="text-input-blue"/> </v-col>
                <v-col col="12" sm="2" md="2">
                    <v-select v-model="form.sStatus"
                        :items="ESTI001" item-text="label" item-value="value"                        
                        class="my-text-field" dense
                        @keydown.native="onKeyDownStatus"
                        >                       
                    </v-select></v-col>
            </v-row>
            <v-row no-gutters class="my-text-field">
                <v-col col="12" sm="1" md="1"><v-text-field value="견적번호" readonly dense hide-details class="text-input-blue"/></v-col>
                <v-col col="12" sm="4" md="4"><v-text-field v-model="form.sEsimate" dense hide-details class="my-text-field" /></v-col>
            </v-row>
            <v-row no-gutters class="my-text-fieldend"><v-col></v-col></v-row>
            <v-row no-gutters class="my-text-fieldend"><v-col></v-col></v-row>
        </v-card>  

        <v-row >
            <v-col col="12" sm="4" md="4">
                <v-data-table ref="table" :headers="master" :items="estimates" @click:row="rowSelectMaster" 
                    item-key="i_ser" single-select v-model="selectedM"
                    
                    :items-per-page="20" :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" 
                    class="elevation-1 text-no-wrap" height="500px" max-height="500px" > 

                    <template v-slot:[`item.f_status`]="{ item }">
                        {{getStatus(item.f_status)}} 
                    </template>
                    <template v-slot:[`item.a_estamt`]="{ item }">
                        {{comma(item.a_estamt)}}
                    </template>
                </v-data-table>
            </v-col>

            <v-col col="12" sm="8" md="8">
                <v-form @submit.prevent="save" ref="form" v-model="valid" lazy-validation>
                <v-card color="grey lighten-4">
                <v-row no-gutters class="my-text-field" >
                    <v-col col="8" sm="1" md="1"><v-text-field value="견적번호" readonly dense hide-details class="text-input-redbrg"/></v-col>
                    <v-col col="8" sm="2" md="2"><v-text-field v-model="estimate.i_estno" :readonly="!edit" @input="onChangeMaster" dense hide-details /></v-col>                    
                    <v-col col="8" sm="1" md="1"><v-text-field value="견적상태" readonly dense hide-details class="text-input-redbrg"/></v-col>
                    <v-col col="8" sm="2" md="2">
                        <v-select v-if="editStatus" v-model="estimate.f_status"
                            @input="onChangeMaster"
                            :items="ESTI001" item-text="label" item-value="value" 
                            :rules="[rules.require({ label: '견적상태' })]"     
                            :readonly="!editStatus"                    
                            class="my-text-field" dense >                       
                        </v-select>
                        <v-text-field v-else :value="getStatus(estimate.f_status)" readonly dense hide-details/>
                        </v-col>                    
                </v-row>
                <v-row no-gutters class="my-text-field">
                    <v-col col="8" sm="1" md="1"><v-text-field value="견적명" readonly dense hide-details class="text-input-redbrg"/> </v-col>
                    <v-col col="8" sm="6" md="6">
                        <v-text-field v-model="estimate.n_estnm" :readonly="!edit" @input="onChangeMaster" dense hide-details /> 
                    </v-col>
                </v-row>
                <v-row no-gutters class="my-text-field">
                    <v-col col="8" sm="1" md="1"><v-text-field value="고객사" readonly dense hide-details class="text-input-bluebrg"/> </v-col>
                    <v-col col="8" sm="4" md="4">
                        <v-text-field v-if="edit" v-model="estimate.n_vend" dense hide-details>
                            <template v-slot:append>
                                <v-btn icon x-small tabindex="-1" @click="clickVend"><v-icon> mdi-dialpad </v-icon></v-btn>
                            </template>
                        </v-text-field>
                        <v-text-field v-else v-model="estimate.n_vend" readonly @input="onChangeMaster" dense hide-details />
                    </v-col>
                    <v-col col="8" sm="1" md="1"></v-col>
                </v-row>
                <v-row no-gutters class="my-text-field">
                    <v-col col="8" sm="1" md="1"><v-text-field value="견적일" readonly dense hide-details class="text-input-bluebrg"/> </v-col>
                    <v-col col="8" sm="2" md="2"><input-date-2 v-model="estimate.s_date" :readonly="!edit" @input="onChangeMaster" :rules="rules.date({required: false})" /> </v-col>                    
                    <v-col col="8" sm="1" md="1"><v-text-field value="유효일" readonly dense hide-details class="text-input-bluebrg"/> </v-col>
                    <v-col col="8" sm="2" md="2"><input-date-2 v-model="estimate.s_date2" :readonly="!edit" @input="onChangeMaster" :rules="rules.date({required: false})" /> </v-col>
                    <v-col col="8" sm="1" md="1"><v-text-field value="납기일" readonly dense hide-details class="text-input-bluebrg"/> </v-col>
                    <v-col col="8" sm="2" md="2"><input-date-2 v-model="estimate.s_date3" :readonly="!edit" @input="onChangeMasterDate" :rules="rules.date({required: false})" /> </v-col>

                    <!-- :rules="[rules.require({ label: 'Code' }), rules.alphaNum()]" /> -->
                </v-row>
                <v-row no-gutters class="my-text-field">
                    <v-col col="8" sm="1" md="1"><v-text-field value="수신자" readonly dense hide-details class="text-input-bluebrg"/> </v-col>
                    <v-col col="8" sm="2" md="2"><v-text-field v-model="estimate.n_rname" :readonly="!edit" @input="onChangeMaster" dense hide-details /> </v-col>
                    <v-col col="8" sm="1" md="1"><v-text-field value="연락처" readonly dense hide-details class="text-input-bluebrg"/> </v-col>
                    <v-col col="8" sm="2" md="2"><v-text-field v-model="estimate.t_rtel" :readonly="!edit" @input="onChangeMaster" placeholder="전화번호" dense hide-details /> </v-col>
                    <v-col col="8" sm="1" md="1"><v-text-field value="E-Mail" readonly dense hide-details class="text-input-bluebrg"/> </v-col>
                    <v-col col="8" sm="3" md="3"><v-text-field v-model="estimate.t_remail" :readonly="!edit" @input="onChangeMaster" placeholder="E-Mail" dense hide-details /> </v-col>                    
                </v-row>
                <v-row no-gutters class="my-text-field">
                    <v-col col="8" sm="1" md="1"><v-text-field value="담당자" readonly dense hide-details class="text-input-bluebrg"/> </v-col>
                    <v-col col="8" sm="2" md="2"><v-text-field v-model="estimate.n_rname" @input="onChangeMaster" dense hide-details /> </v-col>
                    <v-col col="8" sm="3" md="3"></v-col>
                    <v-col col="8" sm="1" md="1"><v-text-field value="견적금액" readonly dense hide-details class="text-input-redbrg"/> </v-col>
                    <v-col col="8" sm="2" md="2"><v-text-field :value="comma(estimate.a_estamt)+'원'" readonly dense hide-details class="text-input-redbrg inputPrice"/> </v-col>
                    
                </v-row>
                <v-row no-gutters class="my-text-field">
                    <v-col col="8" sm="1" md="1"><v-text-field value="메모" readonly dense hide-details class="text-input-bluebrg"/> </v-col>
                    <v-col col="12" sm="8" md="8"><v-text-field v-model="estimate.t_remark" dense hide-details /> </v-col>
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
                    :items-per-page="20" :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" 
                    :item-class= "row_classes" 
                    class="elevation-1 text-no-wrap" height="290px" max-height="290px">
                    
                    <template v-slot:[`item.s_sort`]="{ item }">                        
                        <input-number v-model="item.s_sort" :maxlength="2" @input="onChangeDetail" v-if="edit && item.i_serno === itmelit.i_serno" ></input-number>                        
                        <span v-else>{{item.s_sort}}</span>
                    </template>
                    <template v-slot:[`item.n_item`]="{ item }">
                        <v-text-field v-model="item.n_item" hide-details dense single-line readonly v-if="edit && item.i_serno === itmelit.i_serno" class="my-text-field">
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
                        <span v-else>{{comma(item.a_unit)}}</span>
                    </template>
                    <template v-slot:[`item.a_amt`]="{ item }">
                        <input-amt v-model="item.a_amt" @input="onChangeAmt2" v-if="edit && item.i_serno === itmelit.i_serno" ></input-amt>
                        <span v-else>{{comma(item.a_amt)}}</span>
                    </template>
                    <template v-slot:[`item.s_duedate`]="{ item }">
                        <input-date-2 v-model="item.s_duedate" @input="onChangeDetail" v-if="edit && item.i_serno === itmelit.i_serno" :rules="rules.date({required: false})" />
                        <span v-else>{{item.s_duedate}}</span>
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
import { mapActions } from "vuex";
import { ESTI001 } from '../../../util/constval';
import { getDate, deepCopy } from '../../../util/lib';
import validateRules from "../../../util/validateRules";
import EzDialog from '../../components/etc/EzDialog.vue';
import TooltipBtn from '../../components/etc/TooltipBtn.vue';
import InputDate2 from '../../components/InputForms/InputDate2.vue';
import InputAmt from '../../components/InputForms/InputAmt.vue';
import InputNumber from '../../components/InputForms/InputNumber.vue';
import ItemPop from '../codelist/ItemPop.vue';
import VendPop from '../codelist/VendPop.vue';



export default {
    components: { TooltipBtn, EzDialog, InputDate2, ItemPop, InputAmt, InputNumber, VendPop },    
    
    name: "Salesestimate",
    mounted() {
        this.init();
    },
    data() {
        return {
            ESTI001,            
            valid: true,
            master: [
                {text: '견적번호',  value: 'i_estno', sortable: false, align:'center', width: "65px"},                
                {text: '상태',  value: 'f_status', sortable: false, align:'center', width: "25px"},
                {text: '고객사',    value: 'n_vend', sortable: false, align:'left', width: "75px" },
                {text: '견적금액',  value: 'a_estamt', sortable: false, align:'right', width: "65px"},
            ],
            estimates:[], estimate:[], selectedM: [],
            detail: [
                {text: 'No',  value: 's_sort', sortable: false, align:'center', width: "25px"},
                {text: '항목(품목)',  value: 'n_item', sortable: false, align:'left', width: "130px"},
                {text: '규격(사양)',  value: 't_size', sortable: false, align:'left', width: "100px"},
                {text: '단위',  value: 'i_unit', sortable: false, align:'center', width: "90px"},
                {text: '수량',  value: 'm_cnt', sortable: false, align:'center', width: "60px"},
                {text: '단가',  value: 'a_unit', sortable: false, align:'right', width: "90px"},
                {text: '금액',  value: 'a_amt', sortable: false, align:'right', width: "90px"},
                // {text: '통화',  value: 'f_status', sortable: false, align:'center'},
                {text: '납기일',  value: 's_duedate', sortable: false, align:'center', width: "90px"},
                // { text: 'Actions', value: 'actions', sortable: false , width: "50px"},
            ],
            itmelits: [], itmelit: [], itmelitFilter: [],selectedD: [],
            form : {
                sDate1:"", sDate2:"", sEsimate:"", sVend:"", sStatus:"",
            },
            estDayFt: 15,
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
            if (this.estimate.i_ser == undefined || this.estimate.f_status == "A" || this.estimate.f_status == "S") return false;
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
    },
    methods: {
        ...mapActions("sales", ["getSaleEstimate", "iuSaleEstimate"]), 
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
            // estDayFt = await this.$axios.post(`/api/sales/getSaleEstimate`);   
            var query = qs.stringify({c_com: this.$store.state.user.member.c_com, c_gcode: "BUSINESS", c_code: "ESTIMATE01", col: "m_buf1"});
            
            var data = await this.$axios.get(`/api/sales/getSaleEstimateInit?${query}`);
            this.estDayFt = parseFloat(data[0].m_buf1);
            this.select();
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
            // this.itmelitFilter = this.itmelits.filter((r) => {
            //     return r.i_ser == item.i_ser && r.c_com == item.c_com;
            // });                         
        },
        rowFilter(item) {            
            this.itmelitFilter = this.itmelits.filter((r) => {
                return r.i_ser == item.i_ser && r.c_com == item.c_com;
            }); 
        },
        async addEstimates() {   
             if (this.editJob) {
                await this.$ezNotify.alert("</br>수정내용이 존재 합니다. </br>저장 후 작업가능 합니다. ", "견적수정", {icon: "mdi-message-bulleted-off", width: 400,});
                return
            }
            const ms = Date.now();                     
            this.selectedM = [];
            this.estimate = {c_com:this.$store.state.user.member.c_com,  i_ser: ms, f_status: "I", s_date: getDate(), s_date2: getDate(this.estDayFt), f_edit: "1", f_editold:"1"};
            const idx = this.estimates.push(this.estimate) ;
            this.selectedM.push(this.estimate);  
            this.rowFilter(this.estimate);     
        },
        async delEstimates() {
            if (!this.edit) {
                await this.$ezNotify.alert("견적서 작성상태만 삭제 가능 합니다.", "삭제불가", {icon: "mdi-message-bulleted-off", width: 250,});
            }
            // DB 삭제 작업 ....
        },
        async saveEstimates() {
            if (!this.edit) return;
            
            this.$refs.form.validate();
            await this.$nextTick();
            if (!this.valid) return; 

            this.$refs.form2.validate();
            await this.$nextTick();
            if (!this.valid) return; 

            const est = Object.assign({}, this.estimate, this.itmelitFilter);
            const data = await this.iuSaleEstimate(est);
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

        },
        rowSelectDetail:function (item, row) {                
            row.select(true);
            this.itmelit = item;
        },

        async openVend(){

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
                // const obj = Object.assign({}, this.editedItem);
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
                a_estamt = a_estamt + (row.a_amt * 1);
            });            
            this.estimate.a_estamt = a_estamt;
            this.estimate.f_edit = "1";
        },
        onChangeAmt2() {            
            this.onChangeDetail();
            // 발주 총 금액
            let a_estamt = 0;
            this.itmelitFilter.forEach((row) => {                 
                a_estamt = a_estamt + (row.a_amt * 1)
            });            
            this.estimate.a_estamt = a_estamt;
            this.estimate.f_edit = "1";
        }


    }

}
</script>

<style>
    
</style>