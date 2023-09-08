<template>
    <v-container fluid>
        <v-toolbar height="40px" background-color="primary" dark>
            <v-toolbar-title>생산실적</v-toolbar-title>
            <v-spacer/>
            <tooltip-btn label="조회" @click="view"><v-icon>mdi-magnify</v-icon></tooltip-btn>
            <!-- <tooltip-btn label="작성" @click="add"><v-icon>mdi-plus</v-icon></tooltip-btn>
            <tooltip-btn label="삭제" @click="del"><v-icon>mdi-minus</v-icon></tooltip-btn> -->
            <tooltip-btn label="저장" @click="save"><v-icon>mdi-content-save-outline</v-icon></tooltip-btn>            
        </v-toolbar> 
        <v-card style="display: flex; height: 34px; " class="my-card text-input-blue my-text-fontsize  "> 
            <div style="display: flex;">
                <div style="width: 70px;"><v-text-field value="  생산예정일 : " readonly dense hide-details class="no-padding"/></div>                
                <input-dateft v-model="form.sDate1" :value2.sync="form.sDate2"/>                
                <div style="width: 56px;"><v-text-field value="    발주처 : " readonly dense hide-details class="no-padding"/></div>
                <div style="width: 100px;"><v-text-field v-model="form.sVend" dense hide-detail class="text-input-blue no-padding" /></div>
            </div>
        </v-card>
        <v-data-table ref="item-table" :headers="itemHead" :items="itemList"                     
                    item-key="i_orderser" single-select hide-default-footer
                    :item-class= "row_classes" :items-per-page="-1" 
                    class="elevation-1 text-no-wrap"  max-height="250px" height="250px" 
                    >
             <template v-slot:item="{ item,index }">
                <tr :class="{ 'row_select': item === selected }" class="center-align" @click="selectItem(item)" v-if="shouldMergeRow(item) ">
                    <td> {{ index + 1 }}</td>
                    <td :rowspan="getRowspan(item)">{{ item.i_orderno }}</td>                    
                    <td :rowspan="getRowspan(item)">{{ item.n_vend }}</td> 
                    <td class="left-align"> {{ item.n_item }}</td>
                    <td><v-chip x-small :color="getColor(item.f_work)" dark @dblclick ="setWork(item)">{{getStatus(item.f_work)}}</v-chip></td>
                    <td>{{item.d_plan1}}</td>
                    <td>{{item.d_plan2}}</td>
                    <td>{{ item.m_cnt }}</td>
                    <td>{{item.m_makecnt}}</td>
                    <td>{{item.m_errcnt}}</td>
                    <td class="left-align">{{ item.t_remark }}</td>
                </tr>
                <tr :class="{ 'row_select': item === selected }" class="center-align" @click="selectItem(item)" v-else>
                    <td> {{ index + 1 }}</td>
                    <td class="left-align"> {{ item.n_item }}</td>
                    <td><v-chip x-small :color="getColor(item.f_work)" dark @dblclick ="setWork(item)">{{getStatus(item.f_work)}}</v-chip></td>
                    <td>{{item.d_plan1}}</td>
                    <td>{{item.d_plan2}}</td>
                    <td>{{ item.m_cnt }}</td>
                    <td>{{item.m_makecnt}}</td>
                    <td>{{item.m_errcnt}}</td>
                    <td class="left-align">{{ item.t_remark }}</td>
                </tr>
             </template>
        </v-data-table>
        <p></p>
        <div>
            <v-row>
                <v-col>
                    <v-toolbar height="25px" background-color="primary" dark>
                        <v-toolbar-title class="v-subtitle">작업실적 등록</v-toolbar-title>
                        <v-spacer/>            
                        <tooltip-btn x-small label="행추가" @click="makeAdd"><v-icon>mdi-plus</v-icon></tooltip-btn>
                        <tooltip-btn x-small label="행삭제" @click="makeDel"><v-icon>mdi-minus</v-icon></tooltip-btn>            
                    </v-toolbar>
                    <v-data-table ref="make-table" :headers="itemMakeHead" :items="itemMake"                     
                        item-key="i_makeser" v-model="makeRow" single-select @click:row="rowSelectMake"
                        hide-default-footer 
                        :item-class= "row_classes" :items-per-page="-1" 
                        class="elevation-1 text-no-wrap"  max-height="200px" height="200px" 
                        >
                        <template v-slot:[`item.s_workday`]="{ item }">
                            <input-date-2 v-model="item.s_workday" v-if="ordStatus"  @input="onChangeDetail" :rules="rules.date({required: false})" class="my-text-table"/>
                            <span v-else>{{item.s_workday}}</span>
                        </template>
                        <template v-slot:[`item.n_name`]="{ item }">
                            <v-text-field v-model="item.n_name" @input="onChangeDetail" v-if="ordStatus" dense hide-details class="my-text-field no-padding" />
                            <span v-else>{{item.n_name}}</span>
                        </template>
                        <template v-slot:[`item.m_cnt`]="{ item }">
                            <input-amt v-model="item.m_cnt" @input="onChangeDetail" v-if="ordStatus" ></input-amt>
                            <span v-else>{{item.m_cnt}}</span>
                        </template>
                        <template v-slot:[`item.t_remark`]="{ item }">
                            <v-text-field v-model="item.t_remark" @input="onChangeDetail" v-if="ordStatus" dense hide-details class="my-text-field no-padding" />
                            <span v-else>{{item.t_remark}}</span>
                        </template>
                    </v-data-table>
                </v-col>
                <v-col>
                    <v-toolbar height="25px" background-color="primary" dark>
                        <v-toolbar-title class="v-subtitle">불량 등록</v-toolbar-title>
                        <v-spacer/>            
                        <tooltip-btn x-small label="행추가" @click="errAdd"><v-icon>mdi-plus</v-icon></tooltip-btn>
                        <tooltip-btn x-small label="행삭제" @click="errDel"><v-icon>mdi-minus</v-icon></tooltip-btn>            
                    </v-toolbar>
                    <v-data-table ref="err-table" :headers="itemErrHead" :items="itemErr"                     
                        item-key="i_makeser" v-model="errRow" single-select @click:row="rowSelectErr"                        
                        hide-default-footer
                        :item-class= "row_classes" :items-per-page="-1" 
                        class="elevation-1 text-no-wrap"  max-height="200px" height="200px" 
                        >

                        <template v-slot:[`item.s_workday`]="{ item }">
                            <input-date-2 v-model="item.s_workday" v-if="ordStatus"  @input="onChangeDetail" :rules="rules.date({required: false})" class="my-text-table"/>
                            <span v-else>{{item.s_workday}}</span>
                        </template>
                        <template v-slot:[`item.n_name`]="{ item }">
                            <v-text-field v-model="item.n_name" @input="onChangeDetail" v-if="ordStatus" dense hide-details class="my-text-field no-padding" />
                            <span v-else>{{item.n_name}}</span>
                        </template>
                        <template v-slot:[`item.m_err`]="{ item }">
                            <input-amt v-model="item.m_err" @input="onChangeDetail" v-if="ordStatus" ></input-amt>
                            <span v-else>{{item.m_err}}</span>
                        </template>
                        <template v-slot:[`item.i_process`]="{ item }">
                            <v-text-field v-model="item.i_process" @input="onChangeDetail" v-if="ordStatus" dense hide-details class="my-text-field no-padding" />
                            <span v-else>{{item.i_process}}</span>
                        </template>
                        <template v-slot:[`item.f_cause`]="{ item }">
                            <v-text-field v-model="item.f_cause" @input="onChangeDetail" v-if="ordStatus" dense hide-details class="my-text-field no-padding" />
                            <span v-else>{{item.f_cause}}</span>
                        </template>
                        <template v-slot:[`item.t_remark`]="{ item }">
                            <v-text-field v-model="item.t_remark" @input="onChangeDetail" v-if="ordStatus" dense hide-details class="my-text-field no-padding" />
                            <span v-else>{{item.t_remark}}</span>
                        </template>
                    </v-data-table>
                </v-col>
            </v-row>
        </div>

    </v-container>
</template>

<script>
import { mapActions } from "vuex";
import InputDateft from '../../components/InputForms/InputDateft.vue'
import EzDialog from '../../components/etc/EzDialog.vue';
import TooltipBtn from '../../components/etc/TooltipBtn.vue';
import InputDate2 from '../../components/InputForms/InputDate2.vue';
import InputAmt from '../../components/InputForms/InputAmt.vue';
import { PROD001 } from '../../../util/constval';
import { getDate, previousMonth } from '../../../util/lib';
import DatesDialog from '../../components/etc/DatesDialog.vue';
import validateRules from "../../../util/validateRules";

export default {
    components: { InputDateft, TooltipBtn, EzDialog, InputDate2, InputAmt, DatesDialog},
    mounted() {
        this.init();
    },
    data() {
        return {
            PROD001,
            valid: true,
            form : {
                sDate1:"", sDate2:"", sVend:"",
            },
            prodselect : {c_com:"", i_order:"", i_orderser:""},
            itemHead: [
                {text: 'No',       sortable: false, align:'center', width: "40"},
                {text: '수주번호',  value: 'i_orderno', sortable: false, align:'center', width: "75"},                
                {text: '발주처',     value: 'n_vend', sortable: false, align:'center', width: "120px"},
                {text: '항목(품목)', value: 'n_item', sortable: false, align:'center', width: "130px"},                
                
                {text: '상태',      value: 'f_work', sortable: false, align:'center', width: "50px"},
                {text: '시작일',    value: 'd_plan1', sortable: false, align:'center', width: "60px"},
                {text: '종료일',    value: 'd_plan2', sortable: false, align:'center', width: "60px"},
                {text: '지시수량',   value: 'm_cnt', sortable: false, align:'center', width: "55px"},
                {text: '생산수량',    value: 'm_makecnt', sortable: false, align:'center', width: "55px"},
                {text: '불량수량',    value: 'm_errcnt', sortable: false, align:'center', width: "55px"},
                {text: '비고',      value: 't_remark', sortable: false, align:'center', width: "300px"},
            ],
            itemList:[], itemInfo:[], selected:[],
            itemMakeHead: [
                {text: '작업일',    value: 's_workday', sortable: false, align:'center', width: "60px"},
                {text: '작업자',    value: 'n_name', sortable: false, align:'center', width: "60px"},
                {text: '생산수량',  value: 'm_cnt', sortable: false, align:'center', width: "50px"},
                {text: '비고',     value: 't_remark', sortable: false, align:'center', width: "100px"},
            ],
            itemErrHead: [
                {text: '작업일',    value: 's_workday', sortable: false, align:'center', width: "60px"},
                {text: '작업자',    value: 'n_name', sortable: false, align:'center', width: "50px"},
                {text: '불량수량',  value: 'm_err', sortable: false, align:'center', width: "50px"},
                {text: '불량공정',  value: 'i_process', sortable: false, align:'center', width: "55px"},
                {text: '불량원인',  value: 'f_cause', sortable: false, align:'center', width: "55px"},
                {text: '비고',     value: 't_remark', sortable: false, align:'center', width: "100px"},
            ],
            itemProd:[], setItemProd:[],
            itemMake:[], itemErr:[], makeRow:[], errRow:[],
           
        }
    },
    watch: {
    },
    computed: {
        rules: () => validateRules,
        ordStatus() {
            return (this.itemInfo == undefined || this.itemInfo.f_work == undefined || this.itemInfo.f_work !== '2' && this.itemInfo.f_work !== '3' ) ? false : true;
        },
        editStatus() {
            for (var i = 0; i < this.itemProd.length; i++) {
                if (this.itemProd[i].f_edit === '1' || this.itemProd[i].f_edit === '2') {
                     return true; // 값이 존재하면 true 반환
                }
            }
            return false; // 값이 존재하지 않으면 false 반환
        }
    },
    methods: {     
        ...mapActions("prod", ["iuProdWorklist", "iuProdWorkset"]), 
        shouldMergeRow(item) {
            const index = this.itemList.findIndex((i) => i.i_orderno === item.i_orderno);
            return index === this.itemList.indexOf(item);
        },
        getRowspan(item) {
            const count = this.itemList.filter((i) => i.i_orderno === item.i_orderno).length;
            return count;
        },
        async init() {
            this.form.sDate1=getDate(-100, 1);
            this.view();
        },  
        async view() {
            this.itemInfo = [];
            this.itemProd = []; this.itemMake = []; this.itemErr = []; this.makeRow =[]; this.errRow = [];
            this.itemList = await this.$axios.post(`/api/prod/getProdWork`, this.form); 
        },
        async add() {

        },
        async del() {

        },
        async save() {          
            if (!this.ordStatus) return;

            const data = await this.iuProdWorklist(this.itemProd);     
            if (!data)  {
                return;
            }
            // for (const [idx, item] of this.itemProd.entries()) {   // 정방향
            for (let i = this.itemProd.length - 1; i >= 0; i--) {
                const item = this.itemProd[i];                        // 역방향시 사용
                if(item.f_edit == '0') continue;
                if(item.f_edit == '2') {
                    this.itemProd.splice(i, 1);
                } else {
                    item.f_edit = '0';
                    item.f_editold = '0';
                }
            }
            this.setProdList('Y');
            this.setProdList('N'); 
            this.$toast.info(`저장 하였습니다.`);
        },
        getColor (data) {
            if(data == "1") { return 'red'; } 
            else if (data == "2") {return 'orange';}
            else if (data == "3") {return 'blue';}
            else { return 'green';}
        },
        row_classes(item) {
            if (item.f_edit == "2") {
                return "orange";
            } 
        },
        async selectItem(item) {
            if (this.selected == item) return;
            this.itemProd = [];
            this.makeRow = [];
            this.errRow = [];

            this.selected = item;
            this.itemInfo = item; 
            this.prodselect.c_com = this.itemInfo.c_com; 
            this.prodselect.i_order = this.itemInfo.i_order;
            this.prodselect.i_orderser = this.itemInfo.i_orderser; 

            this.itemProd = await this.$axios.post(`/api/prod/getProdWorklist`, this.prodselect); 
            // this.setProdList('Y');
            // this.setProdList('N');            
        },
        getStatus(item) {
            var find = this.PROD001.find(e => e.value === item);
            return find !== undefined ? find.label : '';
        },
        async makeAdd() {
            const idx = this.addmake('N');            
        },
        async makeDel() {            
            if ( this.makeRow[0] == undefined ) return;
            const idx = this.delmake('N', this.makeRow[0].i_orderser, this.makeRow[0].i_makeser);
        },
        async errAdd() {
            const idx = this.addmake('Y');  
            
        },
        async errDel() {
            if ( this.errRow[0] == undefined ) return;
            const idx = this.delmake('Y', this.errRow[0].i_orderser, this.errRow[0].i_makeser);            
        },
        
        rowSelectMake:function (item, row) {                            
            row.select(true);
            this.setItemProd = item;
        },
        rowSelectErr:function (item, row) {                
            row.select(true);
            this.setItemProd = item;
        },
        setProdList(gubun) {
            if (gubun == 'N') {
                this.itemMake = this.itemProd.filter(function(item) { return item.f_err === 'N'; });
            } else {
                this.itemErr = this.itemProd.filter(function(item) { return item.f_err === 'Y'; });                
            }
        },

        addmake(gubun) {
            if (this.itemInfo.c_com == undefined) return -1;
            if (!this.ordStatus) return; // 지시 상태 추가처리
            const obj = {}
            obj.c_com = this.itemInfo.c_com;
            obj.i_order = this.itemInfo.i_order;
            obj.i_orderser = this.itemInfo.i_orderser;
            obj.i_makeser = Date.now();
            obj.s_workday = getDate();
            obj.f_err     = gubun;
            obj.m_cnt     = gubun == 'N' ? Number(this.itemInfo.m_cnt) - Number(this.itemInfo.m_makecnt) : 0;
            obj.m_err     = gubun == 'N' ? 0 : 1;
            obj.i_process = '';
            obj.f_cause   = '';
            obj.n_name    = '';
            obj.f_edit    = '1'; 
            obj.f_editold = '1';
            const idx = this.itemProd.push(obj)

            if (idx > -1) this.setProdList(gubun);
            
            return idx;
        },
        delmake(gubun, i_orderser, i_makeser) {
            if (this.itemInfo.i_orderser == undefined) return -1;
            if (i_orderser == undefined || this.itemInfo.c_com == undefined) return -1; 
            if (!this.ordStatus) return; // 지시 상태만 삭제처리         
            const idx = this.itemProd.findIndex(item => item.i_orderser == i_orderser && item.i_makeser == i_makeser);
            if (idx > -1 ) {
                if (this.itemProd[idx].f_editold == "0") {
                    this.itemProd[idx].f_edit = this.itemProd[idx].f_edit == "0" ? "2" : "1";
                } else {
                    this.itemProd.splice(idx, 1);
                    this.setProdList(gubun);
                }
            }
            this.calculateTotal();
            return idx;
        },
        calculateTotal() {
            let makecnt = 0, errcnt = 0;            
            let delcnt = 0
            for (const item of this.itemProd) {
                if (item.f_edit == '2') {
                    delcnt ++;
                    continue;
                }
                makecnt += Number(item.m_cnt);
                errcnt += Number(item.m_err);
            }            
            this.itemInfo.m_makecnt = makecnt;
            this.itemInfo.m_errcnt = errcnt;
            this.itemInfo.f_work = this.itemProd.length == delcnt ? '2' : '3';
        },
        onChangeDetail() {
            this.setItemProd.f_edit = "1";
            this.calculateTotal();
        },
        setWork(item) {
            if (this.editStatus) {
                this.$toast.info(`수정 내용이 존재 합니다...`);
                return;
            }
            if (item.f_work == '3' || item.f_work == '4') {                
                if(Number(item.m_cnt) > Number(item.m_makecnt) ) {
                    this.$toast.warning(`생산 수량이 부족 합니다...`)
                    return;
                }
                item.f_work = item.f_work == '3' ? '4' : '3';
                const rv = this.iuProdWorkset(item)
                if(rv) this.$toast.info(`작업 상태 처리 하였습니다...`);
            }
        }
  },
}
</script>

<style>

</style>