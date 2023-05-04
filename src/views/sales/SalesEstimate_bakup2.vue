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
                    class="elevation-1" height="500px" max-height="500px" > 

                    <template v-slot:[`item.f_status`]="{ item }">
                        {{getStatus(item.f_status)}} 
                    </template>
                </v-data-table>
            </v-col>

            <v-col col="12" sm="8" md="8">
                <v-form @submit.prevent="save" ref="form" v-model="valid" lazy-validation>
                <v-card color="grey lighten-4">
                <v-row no-gutters class="my-text-field" >
                    <v-col col="8" sm="1" md="1"><v-text-field value="견적번호" readonly dense hide-details class="text-input-redbrg"/></v-col>
                    <v-col col="8" sm="2" md="2"><v-text-field v-model="estimate.i_estno" @input="onChangeMaster" dense hide-details /></v-col>                    
                    <v-col col="8" sm="1" md="1"><v-text-field value="견적상태" readonly dense hide-details class="text-input-redbrg"/></v-col>
                    <v-col col="8" sm="2" md="2">
                        <v-select v-model="estimate.f_status"
                        @input="onChangeMaster"
                        :items="ESTI001" item-text="label" item-value="value" 
                        :rules="[rules.require({ label: '견적상태' })]"                         
                        class="my-text-field" dense >                       
                        </v-select></v-col>                    
                </v-row>
                <v-row no-gutters class="my-text-field">
                    <v-col col="8" sm="1" md="1"><v-text-field value="견적명" readonly dense hide-details class="text-input-redbrg"/> </v-col>
                    <v-col col="8" sm="6" md="6"><v-text-field v-model="estimate.n_estnm" @input="onChangeMaster" dense hide-details /> </v-col>
                </v-row>
                <v-row no-gutters class="my-text-field">
                    <v-col col="8" sm="1" md="1"><v-text-field value="고객사" readonly dense hide-details class="text-input-bluebrg"/> </v-col>
                    <v-col col="8" sm="4" md="4"><v-text-field v-model="estimate.c_vend" @input="onChangeMaster" dense hide-details /></v-col>
                    <v-col col="8" sm="1" md="1"></v-col>
                </v-row>
                <v-row no-gutters class="my-text-field">
                    <v-col col="8" sm="1" md="1"><v-text-field value="견적일" readonly dense hide-details class="text-input-bluebrg"/> </v-col>
                    <v-col col="8" sm="2" md="2"><input-date-2 v-model="estimate.s_date" @input="onChangeMaster" :rules="rules.date({required: false})" /> </v-col>                    
                    <v-col col="8" sm="1" md="1"><v-text-field value="유효일" readonly dense hide-details class="text-input-bluebrg"/> </v-col>
                    <v-col col="8" sm="2" md="2"><input-date-2 v-model="estimate.s_date2" @input="onChangeMaster" :rules="rules.date({required: false})" /> </v-col>
                    <v-col col="8" sm="1" md="1"><v-text-field value="납기일" readonly dense hide-details class="text-input-bluebrg"/> </v-col>
                    <v-col col="8" sm="2" md="2"><input-date-2 v-model="estimate.s_date3" @input="onChangeMaster" :rules="rules.date({required: false})" /> </v-col>

                    <!-- :rules="[rules.require({ label: 'Code' }), rules.alphaNum()]" /> -->
                </v-row>
                <v-row no-gutters class="my-text-field">
                    <v-col col="8" sm="1" md="1"><v-text-field value="수신자" readonly dense hide-details class="text-input-bluebrg"/> </v-col>
                    <v-col col="8" sm="2" md="2"><v-text-field v-model="estimate.n_rname" dense hide-details /> </v-col>
                    <v-col col="8" sm="1" md="1"><v-text-field value="연락처" readonly dense hide-details class="text-input-bluebrg"/> </v-col>
                    <v-col col="8" sm="2" md="2"><v-text-field v-model="estimate.t_rtel" placeholder="전화번호" dense hide-details /> </v-col>
                    <v-col col="8" sm="1" md="1"><v-text-field value="E-Mail" readonly dense hide-details class="text-input-bluebrg"/> </v-col>
                    <v-col col="8" sm="3" md="3"><v-text-field v-model="estimate.t_remail" placeholder="E-Mail" dense hide-details /> </v-col>                    
                </v-row>
                <v-row no-gutters class="my-text-field">
                    <v-col col="8" sm="1" md="1"><v-text-field value="담당자" readonly dense hide-details class="text-input-bluebrg"/> </v-col>
                    <v-col col="12" sm="2" md="2"><v-text-field v-model="estimate.n_rname" dense hide-details /> </v-col>
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
                    :custom-filter="filterSer"
                    @click:row="rowSelectDetail" 
                    item-key="i_serno" single-select v-model="selectedD"                    
                    :items-per-page="20" :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" 
                    class="elevation-1" height="290px" max-height="290px">
                    
                    <template v-slot:[`item.s_sort`]="{ item }">                        
                        <input-number v-model="item.s_sort" :maxlength="2" @input="onChangeDetail" v-if="item.i_serno === itmelit.i_serno" ></input-number>                        
                        <span v-else>{{item.s_sort}}</span>
                    </template>
                    <template v-slot:[`item.c_item`]="{ item }">
                        <v-text-field v-model="item.c_item" hide-details dense single-line readonly v-if="item.i_serno === itmelit.i_serno" class="my-text-field">
                            <template v-slot:append>
                                <v-btn icon x-small tabindex="-1" @click="clickItem">
                                    <v-icon> mdi-dialpad </v-icon>
                                </v-btn>
                            </template>
                        </v-text-field>
                        <span v-else>{{item.c_item}}</span>
                    </template>
                    <template v-slot:[`item.m_cnt`]="{ item }">
                        <input-amt v-model="item.m_cnt" @input="onChangeDetail" v-if="item.i_serno === itmelit.i_serno" ></input-amt>
                        <span v-else>{{comma(item.m_cnt)}}</span>
                    </template>
                    <template v-slot:[`item.a_unit`]="{ item }">
                        <input-amt v-model="item.a_unit" @input="onChangeDetail" v-if="item.i_serno === itmelit.i_serno" ></input-amt>
                        <span v-else>{{comma(item.a_unit)}}</span>
                    </template>
                    <template v-slot:[`item.a_amt`]="{ item }">
                        <input-amt v-model="item.a_amt" @input="onChangeDetail" v-if="item.i_serno === itmelit.i_serno" ></input-amt>
                        <span v-else>{{comma(item.a_amt)}}</span>
                    </template>
                    <template v-slot:[`item.s_duedate`]="{ item }">
                        <input-date-2 v-model="item.s_duedate" @input="onChangeDetail" v-if="item.i_serno === itmelit.i_serno" :rules="rules.date({required: false})" />
                        <span v-else>{{item.s_duedate}}</span>
                    </template>
                </v-data-table>
                </v-form>
            </v-col>           
            
            
        </v-row>
        <ez-dialog ref="dialog_Item" label="항목/품목" persistent @onClose="close_item" width="460px" >            
            <item-pop @onSelect="selectItem"></item-pop>
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



export default {
    components: { TooltipBtn, EzDialog, InputDate2, ItemPop, InputAmt, InputNumber },    
    
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
                {text: '상태',  value: 'f_status', sortable: false, align:'center', width: "15px"},
                {text: '고객사',    value: 'n_vend', sortable: false, align:'center', width: "75px" },
                {text: '견적금액',  value: 'a_estamt', sortable: false, align:'center', width: "65px"},
            ],
            estimates:[], estimate:[], selectedM: [],
            detail: [
                {text: 'No',  value: 's_sort', sortable: false, align:'center', width: "25px"},
                {text: '항목(품목)',  value: 'c_item', sortable: false, align:'left', width: "130px"},
                {text: '규격',  value: 't_size', sortable: false, align:'left', width: "100px"},
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

            editedIndex: -1,
            editedItem: {
                i_ser: '',
                i_serno: '',
                c_com: '',
                i_estno: '',
                s_sort: 1,
                c_item: '',
                n_item: '',
                t_size: '',
                i_unit: '',
                i_type: '',
                m_cnt: 1,
                a_unit: 0,
                a_amt: 0,
                s_duedate: '',
                f_edit: "1",
                },
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
       
    },
    methods: {
        ...mapActions("sales", ["getSaleEstimate", "iuSaleEstimate"]),        
        filterSer(item, search, filterKey) {
            if (filterKey === 'f_edit') {
                return item[filterKey].includes("1");
            }
        },
        comma (value) {
            if (value !== null && value !== undefined) {
                return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            } else {
                return String(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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
            if (this.itmelit) this.itmelit.splice(0);            
            if (this.itmelitFilter) this.itmelitFilter.splice(0);

            this.estimates = await this.$axios.post(`/api/sales/getSaleEstimate`, this.form); 
            this.itmelits =  await this.$axios.post(`/api/sales/getSaleEstimateli`, this.form); 
        },
        rowSelectMaster :function (item, row) {            
            row.select(true);            
            this.estimate = item;  
            this.itmelitFilter = this.itmelits.filter((r) => {
                return r.i_ser == item.i_ser && r.c_com == item.c_com;
            });                         
        },
        async addEstimates() {   
            const ms = Date.now();         
            this.selectedM = [];
            this.estimate = {i_ser: ms, f_status: "I", s_date: getDate(), s_date2: getDate(this.estDayFt)};
            const idx = this.estimates.push(this.estimate) ;
            
            
            // const selectedItems = this.$refs.table.getSelected();        this.$emit('select', selectedItems);
        },
        async delEstimates() {
            
        },
        async saveEstimates() {
            // this.$refs.form.validate();
            // await this.$nextTick();
            // if (!this.valid) return; 

            this.$refs.form2.validate();
            await this.$nextTick();
            if (!this.valid) return; 

            // const est = qs.stringify(this.estimate)
            const est = Object.assign({}, this.estimate, this.itmelitFilter);

            const data = await this.iuSaleEstimate(est);
            
            await this.$ezNotify.alert("테스트 내용입니다.", "저장", {icon: "mdi-video-4k-box",});
        },
        async printEstimates() {

        },
        rowSelectDetail:function (item, row) {            
            row.select(true);
            this.itmelit = item;
            
            // this.typeitem = item;
            // this.c_ptype = this.typeitem.c_ptype;
            // this.typeTitle = this.typeitem.c_ptype ? 'Code : ' + this.typeitem.c_ptype +'/' + this.typeitem.n_ptype : 'Code' ;
            // this.progresstypeli = this.progresstypelis.filter((item) => {
            //     return item.c_ptype == this.typeitem.c_ptype && item.c_com == this.typeitem.c_com;
            // });   
            // this.notProcSeletc();
        },
        async openVend(){

        },

        async addDetail() {
            this.selectedD = [];
            this.itmelit = [];

            this.$refs.dialog_Item.open();
        },
        clickItem() {
            this.$refs.dialog_Item.open();
        }, 
        async delDetail() {  
            this.itmelits.forEach((row) => {
                console.log(row.f_edit)

            })          
        },

        getStatus(item) {
            var find = this.ESTI001.find(e => e.value === item);
            return find !== undefined ? find.label : '';
        },

        async showRowInfo(event, { item }) {
                // window.open("../codelist/UnitPop.vue", "_blank")
        //     this.editedIndex = this.itmelits.indexOf(item);
        //     this.editedItem = Object.assign({}, item);
        //     console.log(this.editedItem)
        },
        selectItem(item) {            
            
            const idx1 = this.itmelitFilter.indexOf(this.itmelit);
            const idx2 = this.itmelits.indexOf(this.itmelit);

            this.editedItem.c_com = this.estimate.c_com; 
            this.editedItem.i_ser = this.estimate.i_ser;
            this.editedItem.i_estno = this.estimate.i_estno;
            this.editedItem.c_item  = item.c_item;
            this.editedItem.n_item  = item.n_item;
            this.editedItem.t_size  = item.t_size;
            this.editedItem.i_unit  = item.i_unit;
            this.editedItem.i_type  = item.i_type;
            this.editedItem.a_unit  = item.a_unit;
            this.editedItem.f_edit = "1";

            if (idx1 >=0 ) {
                this.editedItem.i_serno = this.itmelit.i_ser;
                this.editedItem.s_sort  = this.itmelit.s_sort;
                this.editedItem.m_cnt   = this.itmelit.m_cnt;
                this.editedItem.s_duedate = this.itmelit.s_duedate;

                this.itmelitFilter.splice(idx1, 1, this.editedItem);
                this.itmelits.splice(idx2, 1, this.editedItem);
                
            } else {this.editedItem.a_amt
                this.editedItem.i_serno = Date.now();
                this.editedItem.s_sort  = this.getMaxNo + 1;
                this.editedItem.m_cnt   = 1;
                this.editedItem.s_duedate = this.estimate.s_duedate;

                this.itmelitFilter.push(this.editedItem) ;
                this.itmelits.push(this.editedItem) ;                
            }
            
            this.$refs.dialog_Item.close();            
        },
        close_item() {

        },
        onChangeMaster() {
            const idx = this.estimates.indexOf(this.estimate2);
            if (idx > -1) this.estimates[idx].f_edit = '1';
        },
        onChangeDetail() {
            const idx1 = this.itmelitFilter.indexOf(this.itmelit);
            const idx2 = this.itmelits.indexOf(this.itmelit);
            if (idx1 > -1) this.itmelitFilter[idx1].f_edit = '1';
            if (idx2 > -1) this.itmelits[idx2].f_edit = '1';
        }

    }

}
</script>

<style>
    
</style>