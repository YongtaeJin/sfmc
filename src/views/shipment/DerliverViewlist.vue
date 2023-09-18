<template>
    <v-container fluid>        
        <v-toolbar height="40px" background-color="primary" dark>
            <v-toolbar-title>출하현황</v-toolbar-title>
            <v-spacer/>
            
            <tooltip-btn label="조회" @click="view"><v-icon>mdi-magnify</v-icon></tooltip-btn>            
        </v-toolbar> 
        <v-card style="display: flex; height: 34px; " class="my-card text-input-blue my-text-fontsize  "> 
            <div style="display: flex;">
                <div style="width: 70px;"><v-text-field value="    출하일 : " readonly dense hide-details class="no-padding"/></div>                
                <input-dateft v-model="form.sDate1" :value2.sync="form.sDate2"/>
                <div style="width: 56px;"><v-text-field value="    고객사 : " readonly dense hide-details class="no-padding"/></div>
                <div style="width: 100px;"><v-text-field v-model="form.sVend" dense hide-detail class="text-input-blue no-padding" /></div>
            </div>
        </v-card>
        <v-data-table :headers="itemHead" :items="itemLists"
                    item-key="i_orderser" single-select hide-default-footer
                    :items-per-page="-1" 
                    class="elevation-1 text-no-wrap" :height=iframeHeight 
                    > 
            <template v-slot:item="{ item,index }">
                <tr :class="{ 'row_select': item === selected }" class="center-align" @click="selectItem(item)" v-if="shouldMergeRow(item) ">
                    <td> {{ index + 1 }}</td> 
                    
                    <td :rowspan="getRowspan(item)">{{ item.i_orderno }}</td>                     
                    <td :rowspan="getRowspan(item)">{{ getStatus(item.f_status) }}</td>
                    <td :rowspan="getRowspan(item)">{{ item.s_date }}</td>                     
                    <td :rowspan="getRowspan(item)">{{ item.n_vend }}</td>
                    <td> {{ item.c_item }}</td>
                    <td class="left-align"> {{ item.n_item }}</td>
                    <td> {{ item.t_size }}</td>
                    <td> {{ comma(item.m_cnt) }}</td>
                    <td> {{ item.s_duedate }}</td>
                    <td> {{ getProdStatus(item.f_work) }}</td>
                    <td> {{ comma(item.m_shipcnt) }}</td>
                    <td> {{ item.d_ship }}</td>
                    
                </tr>
                <tr :class="{ 'row_select': item === selected }" class="center-align" @click="selectItem(item)" v-else>
                    <td> {{ index + 1 }}</td>
                    <td> {{ item.c_item }}</td>
                    <td class="left-align"> {{ item.n_item }}</td>
                    <td> {{ item.t_size }}</td>
                    <td> {{ comma(item.m_cnt) }}</td>
                    <td> {{ item.s_duedate }}</td>
                    <td> {{ getProdStatus(item.f_work) }}</td>
                    <td> {{ comma(item.m_shipcnt) }}</td>                    
                    <td> {{ item.d_ship }}</td>
                </tr>
            </template> 
        </v-data-table>
    </v-container>      
</template>

<script>
import TooltipBtn from '../../components/etc/TooltipBtn.vue';
import InputDateft from '../../components/InputForms/InputDateft.vue';
import { ORDER001, PROD001 } from '../../../util/constval';
import { comma, getDate, previousMonth } from '../../../util/lib';
export default {
    components: { InputDateft, TooltipBtn },
    name: "DerliverViewList",
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
            ORDER001, PROD001, comma,
            form : {sDate1:"", sDate2:"", sVend:"",},
            iframeHeight: 500, // 초기 높이 설정 (원하는 높이로 초기화)
            itemHead: [
                {text: 'No',            sortable: false, align:'center', width: "25px"},
                {text: '수주번호',   value: 'i_orderno', sortable: false, align:'center', width: "60px"},
                {text: '수주상태',   value: 'f_status', sortable: false, align:'center', width: "50px"},
                {text: '수주일',     value: 's_date', sortable: false, align:'center', width: "50px"},
                {text: '발주처',     value: 'n_vend', sortable: false, align:'center', width: "80px"},
                {text: '품번',       value: 'c_item', sortable: false, align:'center', width: "50px"},
                {text: '항목(품목)', value: 'n_item', sortable: false, align:'center', width: "130px"},
                {text: '규격(사양)', value: 't_size', sortable: false, align:'center', width: "90px"},
                {text: '수주수량',   value: 'm_ocnt', sortable: false, align:'center', width: "30px"},
                // {text: '단위',      value: 'i_unit', sortable: false, align:'center', width: "50px"},
                {text: '납품예정일', value: 's_duedate', sortable: false, align:'center', width: "50px"},
                {text: '작업상태',   value: 'f_work', sortable: false, align:'center', width: "50px"},
                {text: '출하수량',   value: 'm_shipcnt', sortable: false, align:'center', width: "30px"},
                {text: '출하일자',    value: 'd_ship', sortable: false, align:'center', width: "50px"},
            ],
            itemLists:[], selected:[],
        }
    },
    computed: {
    },
    methods: {
        adjustIframeHeight() {
        // 브라우저 창의 높이를 iframe의 높이로 설정
            const windowHeight = window.innerHeight;
            this.iframeHeight = windowHeight - 200 ;
        },
        getStatus(item) {
            var find = this.ORDER001.find(e => e.value === item);
            return find !== undefined ? find.label : '';
        },
        getProdStatus(item) {
            // return item == "3" ? "작업" : item == "4" ? "생산" : "출고";
            var find = this.PROD001.find(e => e.value === item);
            return find !== undefined ? find.label : '';
        },
        shouldMergeRow(item) {
            const index = this.itemLists.findIndex((i) => i.i_order === item.i_order);
            return index === this.itemLists.indexOf(item);
        },
        getRowspan(item) {
            const count = this.itemLists.filter((i) => i.i_order === item.i_order).length;
            return count;
        },
        async init() {
            this.form.sDate1 = getDate(-100, 1);
            this.view();
        },
        async view() {
            this.itemLists = await this.$axios.post(`/api/shipment/getDerliverview`, this.form); 
            
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