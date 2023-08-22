<template>
    <v-container fluid>
        <v-toolbar height="40px" background-color="primary" dark>
            <v-toolbar-title>출하등록</v-toolbar-title>
            <v-spacer/>
            <tooltip-btn label="조회" @click="view"><v-icon>mdi-magnify</v-icon></tooltip-btn>
            <!-- <tooltip-btn label="작성" @click="add"><v-icon>mdi-plus</v-icon></tooltip-btn>
            <tooltip-btn label="삭제" @click="del"><v-icon>mdi-minus</v-icon></tooltip-btn> -->
            <tooltip-btn label="저장" @click="save"><v-icon>mdi-content-save-outline</v-icon></tooltip-btn>            
        </v-toolbar> 
        <v-card style="display: flex; height: 34px; " class="my-card text-input-blue my-text-fontsize  "> 
            <div style="display: flex;">
                <div style="width: 70px;"><v-text-field value="    수주일 : " readonly dense hide-details class="no-padding"/></div>                
                <input-dateft v-model="form.sDate1" :value2.sync="form.sDate2"/>                
                <div style="width: 56px;"><v-text-field value="    발주처 : " readonly dense hide-details class="no-padding"/></div>
                <div style="width: 100px;"><v-text-field v-model="form.sVend" dense hide-detail class="text-input-blue no-padding" /></div>
            </div>
        </v-card>
        <v-toolbar height="30px" color="accent" >
            <v-toolbar-title>수주 내역 별 출하(출고)대상  List</v-toolbar-title>
            <v-spacer/>
        </v-toolbar>
        <v-data-table ref="item-table" :headers="itemHead" :items="itemLists"                     
                    item-key="i_orderser" single-select hide-default-footer
                    :item-class= "row_classes" :items-per-page="-1" 
                    class="elevation-1 text-no-wrap"  max-height="280px" height="280px" 
                    > 
            <template v-slot:item="{ item,index }">
                <tr :class="{ 'row_select': item === selected }" class="center-align" @click="selectItem(item)">
       
                    <td> {{ index + 1 }}</td>                    
                    <td> {{ item.i_orderno }}</td>
                    <td> {{ item.s_date }}</td>
                    <td> {{ item.n_vend }}</td>
                    <td> {{ item.c_item }}</td>
                    <td class="left-align"> {{ item.n_item }}</td>
                    <td> {{ item.t_size }}</td>
                    <td> {{ comma(item.m_ocnt) }}</td>
                    <td> {{ item.s_duedate }}</td>
                    <td> {{ comma(item.m_yescnt) }}</td>
                    <td> {{ comma(item.m_shipcnt) }}</td>
                    <td> {{ item.d_ship }}</td>
                </tr>
            </template> 
        </v-data-table> 
        <v-toolbar height="25px" background-color="primary" dark >
            <v-toolbar-title>출하(출고) List</v-toolbar-title>
            <v-spacer/> 
            <tooltip-btn label="추가" @click="addDetail"  x-small><v-icon>mdi-plus</v-icon></tooltip-btn>            
            <tooltip-btn label="삭제" @click="delDetail"  x-small><v-icon>mdi-minus</v-icon></tooltip-btn>            
        </v-toolbar>
        <v-data-table ref="tabledt" :headers="itemHeaddt" :items="itemdts"                     
                    item-key="i_shipser" single-select v-model="selectedItemIndex"  
                    :item-class= "row_classes" :items-per-page="-1"  hide-default-footer
                    
                    class="elevation-1 text-no-wrap"  max-height="160px" height="160px" 
                    >
            <template v-slot:item="{ item,index }">
                <tr :class="{ 'row_select': item === selectdt }" class="center-align"  @click="selectItemDt(item)">
                    <td> {{ index + 1 }} </td>
                    <td> <v-text-field v-model="item.i_shipno" @input="onChangeDetail" v-if="item.i_shipser === selectdt.i_shipser" dense hide-details class="my-text-field" />
                        <span v-else> {{ item.i_shipno }} </span> </td>
                    <td> <input-date-2 v-model="item.d_ship" @input="onChangeDetail" v-if="item.i_shipser === selectdt.i_shipser" :rules="rules.date({required: false})" />
                         <span v-else>{{item.d_ship}}</span>                        
                    </td>                    
                    <td> <input-amt v-model="item.m_shipcnt" @input="onChangeDetail" v-if="item.i_shipser === selectdt.i_shipser" ></input-amt>
                        <span v-else> {{comma(item.m_shipcnt)}} </span>
                    </td>   
                    <td> <v-text-field v-model="item.t_remark" @input="onChangeDetail" v-if="item.i_shipser === selectdt.i_shipser" dense hide-details class="my-text-field" />
                         <span v-else> {{ item.t_remark }} </span>
                    </td>                    
                </tr>  
            </template>
        </v-data-table>
    </v-container>  
</template>

<script>
import { mapActions } from "vuex";
import { PROD001 } from '../../../util/constval';
import { getDate, deepCopy, dateToKorean, numberToKorean, amtToKorean } from '../../../util/lib';
import TooltipBtn from '../../components/etc/TooltipBtn.vue';
import InputDateft from '../../components/InputForms/InputDateft.vue'
import validateRules from "../../../util/validateRules";
import InputDate2 from '../../components/InputForms/InputDate2.vue';
import InputAmt from '../../components/InputForms/InputAmt.vue';
    

export default {    
    components: { TooltipBtn,  InputDateft, InputDate2, InputAmt},
    name: "DerliverView",
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
            fromdt : {c_com: "", i_order: "", i_orderser: ""},
            itemHead: [
                {text: 'No',       sortable: false, align:'center', width: "25"},
                {text: '수주번호',   value: 'i_orderno', sortable: false, align:'center', width: "60"},
                {text: '수주일',     value: 's_date', sortable: false, align:'center', width: "50px"},
                {text: '발주처',     value: 'n_vend', sortable: false, align:'center', width: "100px"},
                {text: '품번',       value: 'c_item', sortable: false, align:'center', width: "50px"},
                {text: '항목(품목)', value: 'n_item', sortable: false, align:'center', width: "130px"},
                {text: '규격(사양)', value: 't_size', sortable: false, align:'center', width: "90px"},
                {text: '수주수량',   value: 'm_ocnt', sortable: false, align:'center', width: "30px"},
                // {text: '단위',      value: 'i_unit', sortable: false, align:'center', width: "50px"},
                {text: '납품예정일', value: 's_duedate', sortable: false, align:'center', width: "50px"},
                {text: '생산수량',   value: 'm_yescnt', sortable: false, align:'center', width: "30px"},
                {text: '출하수량',   value: 'm_nocnt', sortable: false, align:'center', width: "30px"},                
                {text: '출하일자',    value: 'd_ship', sortable: false, align:'center', width: "50px"},
                
            ],
            itemLists:[], selected:[],
            itemHeaddt: [
                {text: 'No',                           sortable: false, align:'center', width: "30"},
                {text: '출하번호',   value: 'i_shipno', sortable: false, align:'center', width: "100px"},
                {text: '출하일자',   value: 'd_ship', sortable: false, align:'center', width: "70px"},
                {text: '출하수량',   value: 'm_shipcnt', sortable: false, align:'center', width: "60px"},
                {text: '비고',       value: 't_remark', sortable: false, align:'center', width: "300px"},
            ],
            itemdts:[], selectdt:[],  selectedItemIndex: [],
           
        }
    },
    computed: {
        rules: () => validateRules,  
        editJob() {            
            const tmp = this.itemdts.filter((r) => {
                    return r.f_edit == '1' || r.f_edit == '2'
                });
            return tmp.length;
        },        
    },
    methods: {     
        ...mapActions("shipment", ["iuDerliverlist"]), 
        comma (value) {
            if (value !== null && value !== undefined) {
                return String(Math.trunc(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            } else {
                return String(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            }
        },
        
        async init() {
            this.view();
        },  
        async view() {
            this.itemdts = [];
            // this.itemProd = []; this.itemMake = []; this.itemErr = []; this.makeRow =[]; this.errRow = [];
            this.itemLists = await this.$axios.post(`/api/shipment/getDerliverlist`, this.form);    
        },
        row_classes(item) {
            if (item.f_edit == "2") {
                return "orange";
            } 
        },
        getColor (data) {
            if(data == "1") { return 'red'; } 
            else if (data == "2") {return 'blue';}
            else { return 'green';}
        },
        getStatus(item) {
            var find = this.PROD001.find(e => e.value === item);
            return find !== undefined ? find.label : '';
        },
        async save() {
            const data = await this.iuDerliverlist(this.itemdts);
            //console.log(data);
            if (data == 0) {
                for (let i = this.itemdts.length - 1; i >= 0; i--) {
                    if (this.itemdts[i].f_edit == "2" ) {
                        this.itemdts.splice(i, 1);
                    };
                }
                this.itemdts.forEach((row) => { 
                    row.f_edit = "0";
                    row.f_editold = "0";
                });
                this.$toast.info(`저장 하였습니다.`);                
            }

        },
        async selectItem(item) {
            if (this.editJob) {
                const res = await this.$ezNotify.confirm("수정 내용 취소 합니다. ", "수정 확인", {icon: "mdi-message-bulleted-off", width: 350,});
                if(!res) return;                
            }
            if (this.selected == item) return;
            this.selected = item;
            this.fromdt.c_com = item.c_com
            this.fromdt.i_order = item.i_order
            this.fromdt.i_orderser = item.i_orderser;

            this.selectdt = [];
            this.itemdts = await this.$axios.post(`/api/shipment/getDerliverlistdt`, this.fromdt);            
        },
        
        selectItemDt:function (item, row) {                
            row.select(true);
            this.selectdt = item;            
        },
        async selectItemDt(item)  {
            this.selectdt = item;           
        },
        async addDetail() {
            if(!this.selected || this.selected.i_order == undefined ) return;
            
            const ms = Date.now(); 
            const obj = {};            
            obj.c_com       = this.$store.state.user.member.c_com;
            obj.i_shipser   = ms;
            obj.i_shipno    = "temp";
            obj.d_ship      = getDate();
            obj.i_order     = this.selected.i_order;
            obj.i_orderser  = this.selected.i_orderser;
            obj.m_shipcnt   = this.selected.m_ocnt;
            obj.t_remark    = "";
            obj.f_edit      = "1";
            obj.f_editold   = "1";
            
            const idx = this.itemdts.push(obj);
            if (idx >=0 ) {
                this.selectItemDt(obj);
            }
            this.onChangeMaster();
        },
        async delDetail() {
            if(!this.selected || this.selected.i_order == undefined ) return;
            const idx = this.itemdts.indexOf(this.selectdt);
            if (idx > -1) {
                if (this.itemdts[idx].f_editold == "0") {
                    this.itemdts[idx].f_edit = this.selected.f_edit === "2" ? "0": "2";
                    this.itemdts[idx].f_edit = "2";
                } else {
                    this.itemdts.splice(idx, 1);                    
                }
                this.onChangeMaster();
            }
        },
        onChangeMaster() {
            const idx = this.itemLists.indexOf(this.selected);
            if (this.itemdts.length) {
                if (idx > -1) {
                    let m_shipcnt = 0;                
                    this.itemdts.forEach((row) => {                    
                        if (row.f_edit !== "2" ) m_shipcnt = m_shipcnt + (row.m_shipcnt * 1);
                    });
                    const maxship = this.itemdts.reduce( (prev, value) => { return prev.d_ship >= value.d_ship ? prev : value });
                    this.itemLists[idx].m_shipcnt = m_shipcnt;
                    this.itemLists[idx].d_ship = maxship.d_ship;
                    this.itemLists[idx].m_difcnt = this.itemLists[idx].m_yescnt - m_shipcnt;
                    this.itemLists[idx].f_edit = '1';
                }
            } else {
                this.itemLists[idx].m_shipcnt = 0;
                this.itemLists[idx].d_ship = '';''
                this.itemLists[idx].m_difcnt = this.itemLists[idx].m_yescnt - this.itemLists[idx].m_shipcnt;
                this.itemLists[idx].f_edit = '1';
            }
        },
        onChangeDetail() {            
            const idx = this.itemdts.indexOf(this.selectdt);
            if (idx > -1) {
                if (this.itemdts[idx].f_edit == "0" ) this.itemdts[idx].f_edit = '1';                
            };
            this.onChangeMaster();
        },
    }
}
</script>

<style>

</style>