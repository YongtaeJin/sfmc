<template>
    <v-container fluid>
        <v-toolbar height="40px" background-color="primary" dark>
            <v-toolbar-title>생산실적조회</v-toolbar-title>
            <v-spacer/>
            <tooltip-btn label="조회" @click="view"><v-icon>mdi-magnify</v-icon></tooltip-btn>
            <!-- <tooltip-btn label="작성" @click="add"><v-icon>mdi-plus</v-icon></tooltip-btn>
            <tooltip-btn label="삭제" @click="del"><v-icon>mdi-minus</v-icon></tooltip-btn> -->
            <tooltip-btn label="저장" @click="save"><v-icon>mdi-content-save-outline</v-icon></tooltip-btn>            
        </v-toolbar> 
        <v-card style="display: flex; height: 34px; " class="my-card text-input-blue my-text-fontsize  "> 
            <div style="display: flex;">
                <div style="width: 70px;"><v-text-field value="  계획완료일 : " readonly dense hide-details class="no-padding"/></div>                
                <input-dateft v-model="form.sDate1" :value2.sync="form.sDate2"/>                
                <div style="width: 56px;"><v-text-field value="    발주처 : " readonly dense hide-details class="no-padding"/></div>
                <div style="width: 100px;"><v-text-field v-model="form.sVend" dense hide-detail class="text-input-blue no-padding" /></div>
            </div>
        </v-card>
        <v-data-table ref="item-table" :headers="itemHead" :items="itemLists"                     
                    item-key="i_orderser" single-select hide-default-footer
                    :item-class= "row_classes" :items-per-page="-1" 
                    class="elevation-1 text-no-wrap" max-height="350px" height="350px" 
                    >
            <template v-slot:item="{ item,index }">
                <tr :class="{ 'row_select': item === selected }" class="center-align" @click="selectItem(item)" v-if="shouldMergeRow(item) ">
                    <td> {{ index + 1 }}</td>
                    <td :rowspan="getRowspan(item)">{{ item.i_orderno }}</td>
                    <td :rowspan="getRowspan(item)">{{ item.s_date }}</td>
                    <td :rowspan="getRowspan(item)">{{ item.n_vend }}</td> 
                    <td class="left-align"> {{ item.n_item }}</td>
                    <td> {{ item.t_size }}</td>
                    <td> {{ item.m_ocnt }}</td>
                    <td> {{ item.s_duedate }}</td>
                    <td> {{ item.m_yescnt }}</td>
                    <td> {{ item.m_nocnt }}</td>
                    <td> {{ item.d_plan2 }}</td>
                    <td> {{ item.s_works }}</td>
                    <td> {{ item.s_worke }}</td>                    
                    <td> {{ item.w_workcnt }}</td>
                    <td> <v-progress-linear :value="getPer(item)"  color="blue" height="18">                        
                            <strong>{{ getPer(item) }}%</strong>                        
                        </v-progress-linear></td>
                    <td><v-chip x-small :color="getColor(item.f_work)" dark>{{getStatus(item.f_work)}}</v-chip></td>

                </tr>   
                <tr :class="{ 'row_select': item === selected }" class="center-align" @click="selectItem(item)" v-else>
                    <td> {{ index + 1 }}</td>
                    <td class="left-align"> {{ item.n_item }}</td>
                    <td> {{ item.t_size }}</td>
                    <td> {{ item.m_ocnt }}</td>
                    <td> {{ item.s_duedate }}</td>
                    <td> {{ item.m_yescnt }}</td>
                    <td> {{ item.m_nocnt }}</td>
                    <td> {{ item.d_plan2 }}</td>
                    <td> {{ item.s_works }}</td>
                    <td> {{ item.s_worke }}</td>
                    <td> {{ item.w_workcnt }}</td>
                    <td> <v-progress-linear :value="getPer(item)"  color="blue" height="18">                        
                            <strong>{{ getPer(item) }}%</strong>                        
                        </v-progress-linear></td>
                    <td><v-chip x-small :color="getColor(item.f_work)" dark>{{getStatus(item.f_work)}}</v-chip></td>
                </tr>
            </template> 
        </v-data-table> 
        <v-toolbar height="30px" background-color="primary" dark>
            <v-toolbar-title>항목(품목)별 일 평균 생산량</v-toolbar-title>
            <v-spacer/>            
        </v-toolbar>
        <v-data-table ref="item-makeavg" :headers="dayMakeAvgHead" :items="dayMakeList"                     
                    item-key="c_item" single-select hide-default-footer  @click:row="rowSelectmake"
                    :item-class= "row_classes" :items-per-page="-1" 
                    class="elevation-1 text-no-wrap"  :height="iframeHeight"
                    >

        </v-data-table>

    </v-container>
</template>

<script>
import { mapActions } from "vuex";
import InputDateft from '../../components/InputForms/InputDateft.vue'
import EzDialog from '../../components/etc/EzDialog.vue';
import TooltipBtn from '../../components/etc/TooltipBtn.vue';
import InputDate2 from '../../components/InputForms/InputDate2.vue';
import { PROD001 } from '../../../util/constval';
import { getDate, previousMonth } from '../../../util/lib';
import DatesDialog from '../../components/etc/DatesDialog.vue';

export default {
    components: { InputDateft, TooltipBtn, EzDialog, InputDate2, DatesDialog},
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
            form : {
                sDate1:"", sDate2:"", sVend:"",
            },
            iframeHeight: 200, // 초기 높이 설정 (원하는 높이로 초기화)
            itemHead: [
                {text: 'No',       sortable: false, align:'center', width: "25"},
                {text: '수주번호',   value: 'i_orderno', sortable: false, align:'center', width: "75"},
                {text: '수주일',     value: 's_date', sortable: false, align:'center', width: "60px"},
                {text: '발주처',     value: 'n_vend', sortable: false, align:'center', width: "120px"},
                {text: '항목(품목)', value: 'n_item', sortable: false, align:'center', width: "130px"},
                {text: '규격(사양)', value: 't_size', sortable: false, align:'center', width: "100px"},
                // {text: '단위',      value: 'i_unit', sortable: false, align:'center', width: "50px"},
                {text: '수량',      value: 'm_ocnt', sortable: false, align:'center', width: "30px"},
                {text: '납기일',    value: 's_duedate', sortable: false, align:'center', width: "60px"},
                {text: '양품',      value: 'm_yescnt', sortable: false, align:'center', width: "30px"},
                {text: '불량',      value: 'm_nocnt', sortable: false, align:'center', width: "30px"},
                {text: '계획완료',    value: 'd_plan2', sortable: false, align:'center', width: "60px"},
                {text: '생산시작',    value: 's_works', sortable: false, align:'center', width: "60px"},
                {text: '생산완료',    value: 's_worke', sortable: false, align:'center', width: "60px"},
                {text: '생산일수',    value: 'w_workcnt', sortable: false, align:'center', width: "30px"},
                {text: '진행률',    value: 'p_per', sortable: false, align:'center', width: "50px"},
                {text: '상태',    value: 'f_work', sortable: false, align:'center', width: "30px"},
            ],
            itemLists:[], itemInfo:[], selected:[],
            dayMakeAvgHead:[
                {text: '품번',          value: 'c_item', sortable: false, align:'center', width: "100"},
                {text: '항목(품목)',    value: 'n_item', sortable: false, align:'center', width: "150"},
                {text: '규격(사양)',    value: 't_size', sortable: false, align:'center', width: "150"},
                {text: '생산량',        value: 'm_yescnt', sortable: false, align:'center', width: "80px"},
                {text: '생산일수',      value: 'w_workcnt', sortable: false, align:'center', width: "80px"},
                {text: '일 평균생산량', value: 'm_dayavgcnt', sortable: false, align:'center', width: "80px"},
            ],
            dayMakeList:[], dayMakeInfo:[] , selectMake:[],
        }
    },
    watch: {
    },
    computed: {
    },
    methods: {     
        ...mapActions("prod", ["iuProdPlanlist"]), 
        adjustIframeHeight() {
        // 브라우저 창의 높이를 iframe의 높이로 설정
            const windowHeight = window.innerHeight;
            this.iframeHeight = windowHeight - 200 - 400;
        },
        async init() {
            this.form.sDate1=getDate(-100, 1);
            this.view();
        },  
        async view() {
            // this.itemInfo = [];
            // this.itemProd = []; this.itemMake = []; this.itemErr = []; this.makeRow =[]; this.errRow = [];
            this.itemLists = await this.$axios.post(`/api/prod/getProdWorkview`, this.form); 
            this.dayMakeList = await this.$axios.post(`/api/prod/getProdWorkDayAvg`, this.form); 
        },
        async add() {

        },
        async del() {

        },
        async save() {
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
        shouldMergeRow(item) {
            const index = this.itemLists.findIndex((i) => i.i_orderno === item.i_orderno);
            return index === this.itemLists.indexOf(item);
        },
        getRowspan(item) {
            const count = this.itemLists.filter((i) => i.i_orderno === item.i_orderno).length;
            return count;
        },
        async selectItem(item) {
            if (this.selected == item) return;
            this.selected = item;
        },
        getPer(item) {
            return item.m_ocnt < 1 ? 0 : (item.m_yescnt / item.m_ocnt * 100).toFixed(2);
        },        
        rowSelectmake:function (item, row) {
            if (this.dayMakeInfo.c_item == item.c_item) return;
            this.dayMakeInfo = item;
            if (row) { row.select(true) } else { this.selectMake = [item] }
        },

    },
}
</script>

<style>

</style>