<template>
     <v-container fluid>        
        <v-toolbar height="40px" background-color="primary" dark>
            <v-toolbar-title>납기내역</v-toolbar-title>
            <v-spacer/>
            
            <tooltip-btn label="조회" @click="view"><v-icon>mdi-magnify</v-icon></tooltip-btn>
           
        </v-toolbar> 
        <v-card style="display: flex; height: 34px; " class="my-card text-input-blue my-text-fontsize  "> 
            <div style="display: flex;">
                <div style="width: 70px;"><v-text-field value="  수주납기일 : " readonly dense hide-details class="no-padding"/></div>                
                <input-dateft v-model="form.sDate1" :value2.sync="form.sDate2"/>                
                <div style="width: 56px;"><v-text-field value="    발주처 : " readonly dense hide-details class="no-padding"/></div>
                <div style="width: 100px;"><v-text-field v-model="form.sVend" dense hide-detail class="text-input-blue no-padding" /></div>
            </div>
        </v-card>
        <v-row >
            <v-col col="12" sm="4" md="4">
                <v-data-table ref="table" :headers="masterHead" :items="masters" @click:row="rowSelectMaster" 
                    item-key="c_vend" single-select v-model="selectedM"
                    :items-per-page="-1" hide-default-footer :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" 
                    :item-class= "row_classes"  class="elevation-1 text-no-wrap" height="400px" max-height="400px" > 
                    <template v-slot:[`item.p_per`]="{ item }">                        
                        <v-progress-linear :value="calPer(item)"  color="blue" height="18">                        
                            <strong>{{ calPer(item) }}%</strong>                        
                        </v-progress-linear>
                    </template>
                </v-data-table>      
            </v-col>

            <v-col col="12" sm="8" md="8">
                <v-data-table ref="table" :headers="itemHead" :items="itemListFilter" @click:row="rowSelectDetail" 
                    item-key="i_orderser" single-select v-model="selectedD"
                    :items-per-page="-1" hide-default-footer :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" 
                    class="elevation-1 text-no-wrap" height="400px" max-height="400px" > 
                    <template v-slot:item="{ item }">
                        <tr :class="{ 'row_select': item === itemInfo }" class="center-align" @click="selectItem(item)" v-if="shouldMergeRow(item) ">
                            <td :rowspan="getRowspan(item)">{{ item.i_orderno }}</td> 
                            <td :rowspan="getRowspan(item)">{{ item.s_date2 }}</td> 
                            <td> {{ item.n_item }} </td>
                            <td> {{ item.t_size }} </td>
                            <td> {{ item.m_cnt }} </td>
                            <td> {{ item.s_duedate }} </td>
                            <td> {{ item.m_shipcnt }} </td>
                            <td> {{ item.d_ship }} </td>
                            <td> {{ item.m_ordshipcnt }} </td>
                            <td> {{ item.n_status }} </td>
                        </tr>
                        <tr :class="{ 'row_select': item === itemInfo }" class="center-align" @click="selectItem(item)" v-else>
                            <td> {{ item.n_item }} </td>
                            <td> {{ item.t_size }} </td>
                            <td> {{ item.m_cnt }} </td>
                            <td> {{ item.s_duedate }} </td>
                            <td> {{ item.m_shipcnt }} </td>
                            <td> {{ item.d_ship }} </td>
                            <td> {{ item.m_ordshipcnt }} </td>
                            <td> {{ item.n_status }} </td>
                        </tr>
                    </template>
                </v-data-table>               
            </v-col>
        </v-row>
        <v-toolbar height="30px" background-color="primary" dark>
            <v-toolbar-title>항목(품목)별 평균출하 소요일 </v-toolbar-title>
            <v-spacer/>            
        </v-toolbar>
        <v-data-table ref="item-makeavg" :headers="dayMakeAvgHead" :items="dayMakeList"                     
                    item-key="c_item" single-select hide-default-footer  @click:row="rowSelectmake"
                    :item-class= "row_classes" :items-per-page="-1" 
                    class="elevation-1 text-no-wrap"  :height=iframeHeight
                    >

        </v-data-table>
    </v-container>  
</template>

<script>
import TooltipBtn from '../../components/etc/TooltipBtn.vue';
import InputDateft from '../../components/InputForms/InputDateft.vue';
import { comma, getDate, dateToKorean, numberToKorean, amtToKorean } from '../../../util/lib';

export default {
    components: { InputDateft, TooltipBtn },
    name: "Derliverrate",
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
            comma, 
            form : {sDate1:"", sDate2:"", sVend:"",},
            iframeHeight: 200, // 초기 높이 설정 (원하는 높이로 초기화)
            masterHead: [
                {text: '거래처',      value: 'n_vend', sortable: false, align:'center', width: "80px"},                
                {text: '수주건수',    value: 'm_ordcnt', sortable: false, align:'center', width: "50px"},
                {text: '준수',        value: 'm_ok', sortable: false, align:'center', width: "50px"},
                {text: '미준수',      value: 'm_no', sortable: false, align:'center', width: "50px" },
                {text: '진행',        value: 'm_ing', sortable: false, align:'center', width: "50px"},
                {text: '준수율',      value: 'p_per', sortable: false, align:'center', width: "50px"},
            ],
            masters:[], masterinfo:[], selectedM: [],
            itemHead: [
                {text: '발주번호',    value: 'i_orderno', sortable: false, align:'center', width: "80px"},
                {text: '발주납기',    value: 's_date2', sortable: false, align:'center', width: "60px"},     
                {text: '항목(품목)',  value: 'n_item', sortable: false, align:'center', width: "130px"},
                {text: '규격(사양)',  value: 't_size', sortable: false, align:'center', width: "100px"},                
                {text: '수량',        value: 'm_cnt', sortable: false, align:'center', width: "60px"},
                {text: '납기일',      value: 's_duedate', sortable: false, align:'center', width: "60px"},     
                {text: '출하수량',    value: 'm_shipcnt', sortable: false, align:'center', width: "60px"},
                {text: '출하일',      value: 'd_ship', sortable: false, align:'center', width: "60px"},
                {text: '출하소요일',  value: 'm_ordshipcnt', sortable: false, align:'center', width: "60px"},
                {text: '납기상태',    value: 'n_status', sortable: false, align:'center', width: "60px"},
                
            ],
            itemLists: [], itemInfo: [], itemListFilter: [], selectedD: [],
            itemLists: [],
            dayMakeAvgHead:[
                {text: '품번',          value: 'c_item', sortable: false, align:'center', width: "100"},
                {text: '항목(품목)',    value: 'n_item', sortable: false, align:'center', width: "150"},
                {text: '규격(사양)',    value: 't_size', sortable: false, align:'center', width: "150"},
                {text: '출하건수',      value: 'm_shicnt', sortable: false, align:'center', width: "80px"},
                {text: '출하일수',      value: 'm_ordshipcnt', sortable: false, align:'center', width: "80px"},
                {text: '평균출하 소요일', value: 'm_avgship', sortable: false, align:'center', width: "80px"},
            ],
            dayMakeList:[], dayMakeInfo:[] , selectMake:[],
        }
    },
    methods: {
        adjustIframeHeight() {
        // 브라우저 창의 높이를 iframe의 높이로 설정
            const windowHeight = window.innerHeight;
            this.iframeHeight = windowHeight - 200 - 450;
        },
        async init() {
            this.form.sDate1 = getDate(-365, 1);
            await this.view();
        },
        async view() {
            this.masters = [];
            this.masterinfo = [], this.selectedM = [],
            this.itemListFilter = [], this.itemInfo = [], this.selectedD = [],
            // this.masters = await this.$axios.post(`/api/metrics/getDerliverrate`, this.form); 
            this.masters = await  this.GetDerliver();
            this.itemLists = await this.$axios.post(`/api/metrics/getDerliverratedt`, this.form); 
            this.dayMakeList = await this.$axios.post(`/api/metrics/getDerliverrateAvg`, this.form); 

        },
        async GetDerliver() {
            const data = await this.$axios.post(`/api/metrics/getDerliverrate`, this.form); 
            if (!!data.length) {
                const obj = {};
                obj.c_com   = this.masterinfo.c_com; 
                obj.c_vend  = '전체'; 
                obj.n_vend  = '전체';
                obj.m_ordcnt = this.sumFilder(data, 'm_ordcnt');
                obj.m_no     = this.sumFilder(data, 'm_no');
                obj.m_ing    = this.sumFilder(data, 'm_ing');
                obj.m_ok     = this.sumFilder(data, 'm_ok');
                const idx = data.unshift(obj); 
            }
            
            return data;
        },
        sumFilder(data, object) {
            return data.reduce((sum, item) => {return sum + (Number(item[object]) || 0);}, 0 );
        },
        row_classes(item) {
            if (item.c_vend == "전체") {
                return "orange";
            } 
        },

        rowSelectMaster :function (item, row) {                  
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
                    return item.c_vend == "전체" || r.c_vend == item.c_vend && r.c_com == item.c_com;
                }); 
            } else {
                this.itemListFilter = [];
            }
        },
        rowSelectDetail :function (item, row) {                  
            this.itemInfo = item;  
            if (row) {
                row.select(true) 
            } else {
                this.selectedD = [item]
            }
        },
        calPer(item) {            
            let p_per = 0 ; 
            if ( (Number(item.m_ordcnt) - Number(item.m_ing)) > 0) {
                p_per =  Number(item.m_ok) / (Number(item.m_ordcnt) - Number(item.m_ing));
                p_per = (p_per * 100).toFixed(2);
            }            
            return p_per;            
        },
        shouldMergeRow(item) {
            const index = this.itemListFilter.findIndex((i) => i.i_orderno === item.i_orderno);
            return index === this.itemListFilter.indexOf(item);
        },
        getRowspan(item) {
            const count = this.itemListFilter.filter((i) => i.i_orderno === item.i_orderno).length;
            return count;
        },
        async selectItem(item) {
            if (this.itemInfo == item) return;
            this.itemInfo = item;
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