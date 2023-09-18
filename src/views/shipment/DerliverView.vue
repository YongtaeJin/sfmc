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
                    class="elevation-1 text-no-wrap"  max-height="350px" height="350px" 
                    > 
            <template v-slot:item="{ item,index }">
                <tr :class="{ 'row_select': item === selected }" class="center-align" @click="selectItem(item)">
       
                    <td> {{ index + 1 }}</td>                    
                    <td> {{ item.i_orderno }}</td>
                    <td> {{ item.s_date }}</td>
                    <td> {{ item.n_vend }}</td>
                    <td><v-chip x-small :color="getColor(item.f_work)" dark @dblclick="setStatus(item)">{{getStatus(item.f_work)}} </v-chip></td>
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
                    item-key="i_shipser" single-select v-model="selectedItemIndex"  @click:row="selectItemDt"  
                    :item-class= "row_classes" :items-per-page="-1"  hide-default-footer                    
                    class="elevation-1 text-no-wrap"  :height=iframeHeight
                    >
            <template v-slot:[`item.i_shipno`]="{ item }">
                <v-text-field v-model="item.i_shipno" @input="onChangeDetail" v-if=" edit && item.i_shipser === selectdt.i_shipser" dense hide-details class="my-text-field" />
                <span v-else>{{item.i_shipno}}</span>
            </template>
            <template v-slot:[`item.d_ship`]="{ item }">
                <input-date-2 v-model="item.d_ship" @input="onChangeDetail" v-if=" edit && item.i_shipser === selectdt.i_shipser" :rules="rules.date({required: false})" />
                <span v-else>{{item.d_ship}}</span>
            </template>
            <template v-slot:[`item.m_shipcnt`]="{ item }">                        
                <input-number v-model="item.m_shipcnt" :maxlength="4" @input="onChangeDetail" v-if=" edit && item.i_shipser === selectdt.i_shipser" ></input-number>                        
                <span v-else>{{comma(item.m_shipcnt)}}</span>                
            </template>
            <template v-slot:[`item.t_remark`]="{ item }">
                <v-text-field v-model="item.t_remark" @input="onChangeDetail" v-if=" edit && item.i_shipser === selectdt.i_shipser" dense hide-details class="my-text-field" />
                <span v-else>{{item.t_remark}}</span>
            </template>
        </v-data-table>
    </v-container>  
</template>

<script>
import { mapActions } from "vuex";
import { PROD001 } from '../../../util/constval';
import { getDate, previousMonth, deepCopy, dateToKorean, numberToKorean, amtToKorean } from '../../../util/lib';
import TooltipBtn from '../../components/etc/TooltipBtn.vue';
import InputDateft from '../../components/InputForms/InputDateft.vue'
import validateRules from "../../../util/validateRules";
import InputDate2 from '../../components/InputForms/InputDate2.vue';
import InputAmt from '../../components/InputForms/InputAmt.vue';
import InputNumber from '../../components/InputForms/InputNumber.vue';
    

export default {    
    components: { TooltipBtn,  InputDateft, InputDate2, InputAmt, InputNumber},
    name: "DerliverView",
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
            PROD001,
            valid: true,
            iframeHeight: 180, // 초기 높이 설정 (원하는 높이로 초기화)
            form : {
                sDate1:"", sDate2:"", sVend:"",
            },
            fromdt : {c_com: "", i_order: "", i_orderser: ""},
            itemHead: [
                {text: 'No',            sortable: false, align:'center', width: "25"},
                {text: '수주번호',   value: 'i_orderno', sortable: false, align:'center', width: "60"},
                {text: '수주일',     value: 's_date', sortable: false, align:'center', width: "50px"},
                {text: '발주처',     value: 'n_vend', sortable: false, align:'center', width: "100px"},                
                {text: '상태',       value: 'f_work', sortable: false, align:'center', width: "50px"},
                {text: '품번',       value: 'c_item', sortable: false, align:'center', width: "50px"},
                {text: '항목(품목)', value: 'n_item', sortable: false, align:'center', width: "130px"},
                {text: '규격(사양)', value: 't_size', sortable: false, align:'center', width: "90px"},
                {text: '수주수량',   value: 'm_ocnt', sortable: false, align:'center', width: "30px"},
                // {text: '단위',      value: 'i_unit', sortable: false, align:'center', width: "50px"},
                {text: '납품예정일', value: 's_duedate', sortable: false, align:'center', width: "50px"},
                {text: '생산수량',   value: 'm_yescnt', sortable: false, align:'center', width: "30px"},
                {text: '출하수량',   value: 'm_shipcnt', sortable: false, align:'center', width: "30px"},                
                {text: '출하일자',    value: 'd_ship', sortable: false, align:'center', width: "50px"},
                
            ],
            itemLists:[], selected:[],
            itemHeaddt: [
                {text: 'No',        value: 'm_sort', sortable: false, align:'center', width: "30"},
                {text: '출하번호',   value: 'i_shipno', sortable: false, align:'center', width: "100px"},
                {text: '출하일자',   value: 'd_ship', sortable: false, align:'center', width: "70px"},
                {text: '출하수량',   value: 'm_shipcnt', sortable: false, align:'center', width: "60px"},
                {text: '비고',       value: 't_remark', sortable: false, align:'center', width: "300px"},
            ],
            itemdts:[], selectdt:[],  selectedItemIndex:[],
            noshipcnt : 0,
           
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
        edit() {
            return this.selected.f_work == "3" || this.selected.f_work == "4" ? true : false;
        },
        workend() {
            return this.selected.f_work >= "6" ? true : false;
        }
    },
    methods: {     
        ...mapActions("shipment", ["iuDerliverlist", "iuShipWorkset"]),
        adjustIframeHeight() {
        // 브라우저 창의 높이를 iframe의 높이로 설정
            const windowHeight = window.innerHeight;
            this.iframeHeight = windowHeight - 200 - 410;
        },
        comma (value) {
            if (value !== null && value !== undefined) {
                return String(Math.trunc(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            } else {
                return String(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            }
        },
        getStatus(item) {
            return item == "3" ? "작업" : item == "4" ? "생산" : item == "5" ? "출고" : "완료";
        },
        
        // getStatus(item) {
        //     var find = this.PROD001.find(e => e.value === item);
        //     return find !== undefined ? find.label : '';
        // },
        async init() {
            this.form.sDate1 = getDate(-100, 1);            
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
            return data == "3" ? 'red' : data == "4" ? 'blue' : 'green';
        },
        async setStatus(item) {
            if (this.workend) return;
            // if (item.f_work >= '6') return;
            if (this.editJob) {
                this.$toast.warning(`저장 후 상태 변경 가능 합니다.`);
                return;
            };            
            // 출하수량 확인 
            if (this.selected.m_shipcnt == "0") {
                this.$toast.warning(`출하 수량이 없습니다.`);
                return;
            }            
            if (parseInt(this.selected.m_shipcnt) < parseInt(this.selected.m_ocnt) && this.selected.f_work == "4" && this.noshipcnt < 2) {
                this.$toast.warning(`출하 수량이 수주수량보다 부족 합니다.`);
                this.noshipcnt ++;
                return;
            }
            const res = await this.$ezNotify.confirm(`출고 ${this.selected.f_work == "5" ? '취소':'처리'} 합니다.`, `출고  ${this.selected.f_work == "5" ? '취소':'처리'}`, {icon: "mdi-message-bulleted-off", width: 350,});
            if(!res) return;
            this.noshipcnt = 0;

            this.selected.f_work = this.selected.f_work == "5" ? "4" : "5";
            const rv = this.iuShipWorkset(this.selected);
            if(rv) this.$toast.info(`출하 상태 처리 하였습니다...`);
        },  
        
        async save() {
            const data = await this.iuDerliverlist(this.itemdts);            
            if (data) {
                for (let i = this.itemdts.length - 1; i >= 0; i--) {
                    if (this.itemdts[i].f_edit == "2" ) {
                        this.itemdts.splice(i, 1);
                    };
                }
                this.itemdts.forEach((row, index) => { 
                    row.m_sort = index + 1;
                    row.f_edit = "0";
                    row.f_editold = "0";
                });
                this.$toast.info(`저장 하였습니다.`);                
            }

        },
        async selectItem(item) {
            if (this.selected == item) return;    
            if (this.editJob) {
                const res = await this.$ezNotify.confirm("수정 내용 취소 합니다. ", "수정 확인", {icon: "mdi-message-bulleted-off", width: 350,});
                if(!res) return;                
            }
            
            this.selected = item;
            this.fromdt.c_com = item.c_com
            this.fromdt.i_order = item.i_order
            this.fromdt.i_orderser = item.i_orderser;

            this.selectdt = [];
            this.selectedItemIndex = [];
            this.itemdts = await this.$axios.post(`/api/shipment/getDerliverlistdt`, this.fromdt);            
        },
        
        selectItemDt:function (item, row) {
            row.select(true);
            this.selectdt = item;            
        },
        
        async addDetail() {
            if(!this.edit) return;
            if(!this.selected || this.selected.i_order == undefined ) return;
            
            let ordercnt = parseInt(this.selected.m_ocnt);
            let shipcnt  = parseInt(this.selected.m_shipcnt);
            let yescnt   = parseInt(this.selected.m_yescnt);
            let difcnt   = parseInt(this.selected.m_difcnt);

            const ms = Date.now(); 
            const obj = {};            
            obj.c_com       = this.$store.state.user.member.c_com;
            obj.i_shipser   = ms;
            obj.i_shipno    = "temp";
            obj.d_ship      = getDate();
            obj.i_order     = this.selected.i_order;
            obj.i_orderser  = this.selected.i_orderser;
            obj.i_makeser   = this.selected.i_makeser;
            obj.m_shipcnt   = shipcnt == 0 ? ordercnt : ordercnt > shipcnt ? (ordercnt - shipcnt) : difcnt <= shipcnt ? 1 : yescnt - shipcnt;
            obj.t_remark    = "";
            obj.f_edit      = "1";
            obj.f_editold   = "1";
            obj.m_sort      = this.itemdts.length + 1;
            
            const idx = this.itemdts.push(obj);
            if (idx >=0 ) {                
                this.selectedItemIndex = [];
                this.selectedItemIndex.push(obj)
            }
            this.onChangeMaster();
        },
        async delDetail() {
            if(!this.edit) return;
            if(!this.selected || this.selected.i_order == undefined ) return;
            const idx = this.itemdts.indexOf(this.selectdt);
            if (idx > -1) {                
                if (this.itemdts[idx].f_editold == "0") {
                    this.itemdts[idx].f_edit = this.itemdts[idx].f_edit === "2" ? "1": "2";                    
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
                this.itemLists[idx].d_ship = '';
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