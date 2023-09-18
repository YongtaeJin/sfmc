<template>
    <v-container fluid>        
        <v-toolbar height="40px" background-color="primary" dark>
            <v-toolbar-title>견적제출현황</v-toolbar-title>
            <v-spacer/>
            
            <tooltip-btn label="조회" @click="view"><v-icon>mdi-magnify</v-icon></tooltip-btn>            
        </v-toolbar> 
        <v-card style="display: flex; height: 34px; " class="my-card text-input-blue my-text-fontsize  "> 
            <div style="display: flex;">
                <div style="width: 70px;"><v-text-field value="    수주일 : " readonly dense hide-details class="no-padding"/></div>                
                <input-dateft v-model="form.sDate1" :value2.sync="form.sDate2"/>
                <div style="width: 56px;"><v-text-field value="    고객사 : " readonly dense hide-details class="no-padding"/></div>
                <div style="width: 100px;"><v-text-field v-model="form.sVend" dense hide-detail class="text-input-blue no-padding" /></div>
            </div>
        </v-card>
        <v-data-table :headers="itemHead" :items="itemLists"
                    item-key="i_serno" single-select hide-default-footer
                    :items-per-page="-1" 
                    class="elevation-1 text-no-wrap"  :height=iframeHeight
                    > 
            <template v-slot:item="{ item,index }">
                <tr :class="{ 'row_select': item === selected }" class="center-align" @click="selectItem(item)" v-if="shouldMergeRow(item) ">
                    <td> {{ index + 1 }}</td> 
                    
                    <td :rowspan="getRowspan(item)">{{ item.n_vend }}</td>
                    <td :rowspan="getRowspan(item)">{{ item.i_orderno }}</td> 
                    <td :rowspan="getRowspan(item)">{{ getOrderStatus(item.f_status) }}</td>
                    <td :rowspan="getRowspan(item)">{{ item.s_date }}</td>                     
                    <td> {{ item.c_item }}</td>
                    <td class="left-align"> {{ item.n_item }}</td>
                    <td> {{ item.t_size }}</td>
                    <td> {{ comma(item.m_cnt) }}</td>
                    <td class="right2-align"> {{ comma(item.a_unit) }}</td>
                    <td class="right2-align"> {{ comma(item.a_amt) }}</td>
                    <td> {{ item.s_duedate }}</td>
                </tr>
                <tr :class="{ 'row_select': item === selected }" class="center-align" @click="selectItem(item)" v-else>
                    <td> {{ index + 1 }}</td>
                    <td> {{ item.c_item }}</td>
                    <td class="left-align"> {{ item.n_item }}</td>
                    <td> {{ item.t_size }}</td>
                    <td> {{ comma(item.m_cnt) }}</td>
                    <td class="right2-align"> {{ comma(item.a_unit) }}</td>
                    <td class="right2-align"> {{ comma(item.a_amt) }}</td>
                    <td> {{ item.s_duedate }}</td>
                </tr>
            </template> 
        </v-data-table>
    </v-container>      
</template>

<script>
import TooltipBtn from '../../components/etc/TooltipBtn.vue';
import InputDateft from '../../components/InputForms/InputDateft.vue';
import { ESTI001, ORDER001 } from '../../../util/constval';
import { getDate, previousMonth } from '../../../util/lib';
export default {
    name: "SalesordersList",
    components: { InputDateft, TooltipBtn },
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
            ESTI001, ORDER001,
            form : {sDate1:"", sDate2:"", sVend:"",},
            iframeHeight: 500, // 초기 높이 설정 (원하는 높이로 초기화)
            itemHead: [
                {text: 'No',            sortable: false, align:'center', width: "50px"},                
                {text: '고객사',     value: 'n_vend', sortable: false, align:'center', width: "60px"},                
                {text: '수주번호',   value: 'i_orderno', sortable: false, align:'center', width: "100px"},
                {text: '수주상태',   value: 'f_status', sortable: false, align:'center', width: "50px"},
                {text: '수주일',     value: 's_date', sortable: false, align:'center', width: "50px"},
                {text: '품번',       value: 'c_item', sortable: false, align:'center', width: "70px"},
                {text: '항목(품목)', value: 'n_item', sortable: false, align:'center', width: "130px"},
                {text: '규격(사양)', value: 't_size', sortable: false, align:'center', width: "90px"},
                {text: '수량',       value: 'm_cnt', sortable: false, align:'center', width: "30px"},
                {text: '단가',       value: 'a_unit', sortable: false, align:'center', width: "70px"},
                {text: '금액',       value: 'a_amt', sortable: false, align:'center', width: "70px"},
                {text: '납품예정일', value: 's_duedate', sortable: false, align:'center', width: "50px"},
            ],
            itemLists:[], selected:[],
        }
    },
    methods: {
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
    
        shouldMergeRow(item) {
            const index = this.itemLists.findIndex((i) => i.i_order === item.i_order);
            return index === this.itemLists.indexOf(item);
        },
        getRowspan(item) {
            const count = this.itemLists.filter((i) => i.i_order === item.i_order).length;
            return count;
        },
        getStatus(item) {
            var find = this.ESTI001.find(e => e.value === item);
            return find !== undefined ? find.label : '';
        },
        getOrderStatus(val) {
            const matchedItem = this.ORDER001.find((item) => item.value === val);
            return matchedItem ? matchedItem.label : "";
        },
        async init() {
            this.form.sDate1=getDate(-100, 1);
            this.view();
        },
        async view() {
            this.itemLists = await this.$axios.post(`/api/sales/getSaleOrderslist`, this.form); 
            
        },
        async selectItem(item) {
            if (this.selected == item) return;
            this.selected = item;
        },
    },
}
</script>

<style>

</style>