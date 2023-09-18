<template>
    <v-container fluid>        
        <v-toolbar height="40px" background-color="primary" dark>
            <v-toolbar-title>수금현황</v-toolbar-title>
            <v-spacer/>            
            <tooltip-btn label="계산서 조회" @click="viewInvoice"><v-icon>mdi-magnify</v-icon></tooltip-btn>           
        </v-toolbar> 

        <v-card style="display: flex; height: 34px; " class="my-card text-input-blue my-text-fontsize  "> 
            <div style="display: flex;">
                <div style="width: 70px;"><v-text-field value="   발행일자 : " readonly dense hide-details class="no-padding"/></div>                
                <input-dateft v-model="form.sDate1" :value2.sync="form.sDate2"/>
                <div style="width: 56px;"><v-text-field value="    고객사 : " readonly dense hide-details class="no-padding"/></div>
                <div style="width: 100px;"><v-text-field v-model="form.sVend" dense hide-detail class="text-input-blue no-padding" /></div>
                <!-- {{ invoceend }} / {{ masterinfo.f_status }} / {{ masterinfo.a_amt }} / {{ masterinfo.a_vat }} // {{editJob }} -->
            </div>
        </v-card>
        <v-row>
            <v-col>
                <v-data-table ref="table" :headers="masterHead" :items="masters" @click:row="rowSelectMaster" 
                    item-key="c_vend" single-select v-model="selectedM"                    
                    hide-default-footer :items-per-page="-1" :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" 
                    class="elevation-1 text-no-wrap" height="300px" max-height="300px" > 
                    <template v-slot:[`item.a_invoiceamt`]="{ item }">
                        {{ comma(item.a_invoiceamt) }}
                    </template>
                    <template v-slot:[`item.a_accamt`]="{ item }">
                        {{ comma(item.a_accamt) }}
                    </template>
                    <template v-slot:[`item.a_noaccamt`]="{ item }">
                        {{ comma(item.a_noaccamt) }}
                    </template>
                    <template v-slot:[`item.p_per`]="{ item }">
                        <v-progress-linear :value="item.p_per"  color="blue" height="18">                        
                            <strong>{{ item.p_per }}%</strong>                        
                        </v-progress-linear>
                    </template>
                </v-data-table>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-data-table ref="item-table" :headers="itemHead" :items="itemListsselect"                     
                    item-key="i_invoiceno" v-model="selectedD" @click:row="rowSelectDetail" single-select hide-default-footer
                    :items-per-page="-1" 
                    class="elevation-1 text-no-wrap" :height=iframeHeight
                    >
                    <template v-slot:[`item.a_invoiceamt`]="{ item }">                
                        <div class="right2-align"> {{  comma(item.a_invoiceamt) }}</div>
                    </template>
                    <template v-slot:[`item.a_accamt`]="{ item }">                  
                        <div class="right2-align"> {{  comma(item.a_accamt) }}</div>                
                    </template> 
                    <template v-slot:[`item.p_per`]="{ item }">
                        <v-progress-linear :value="item.p_per"  color="blue" height="18">                        
                            <strong>{{ item.p_per }}%</strong>                        
                        </v-progress-linear>
                    </template>
                    <template v-slot:[`item.a_noaccamt`]="{ item }">                
                        <div class="right2-align"> {{  comma(item.a_noaccamt) }}</div>
                    </template>
                    
                </v-data-table>
            </v-col>

        </v-row>
        

    </v-container>
</template>

<script>
import { mapActions } from "vuex";
import { comma, previousMonth, getDate, dateToKorean, numberToKorean, amtToKorean } from '../../../util/lib';
import TooltipBtn from '../../components/etc/TooltipBtn.vue';
import InputDateft from '../../components/InputForms/InputDateft.vue';
export default {
  components: { TooltipBtn, InputDateft },
    name: "InvoiceList",
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
            iframeHeight: 280, // 초기 높이 설정 (원하는 높이로 초기화)
            masterHead: [
                {text: '고객사',     value: 'n_vend',     sortable: false, align:'center', width: "150px" },
                {text: '발행건수',   value: 'm_invoicecnt',     sortable: false, align:'center', width: "50px" },
                {text: '발행금액',   value: 'a_invoiceamt',     sortable: false, align:'center', width: "100px" },
                {text: '수금금액',   value: 'a_accamt',     sortable: false, align:'center', width: "100px" },
                {text: '미수금액',   value: 'a_noaccamt',     sortable: false, align:'center', width: "100px" },
                {text: '수금율',     value: 'p_per',     sortable: false, align:'center', width: "100px" },
            ],

            masters:[], masterinfo:[], selectedM: [],
            itemHead: [
                {text: '계산서번호',     value: 'i_invoiceno', sortable: false, align:'center', width: "70px"},
                {text: '발행일자',       value: 'd_invoice', sortable: false, align:'center', width: "55px"}, 
                {text: '발행금액',       value: 'a_invoiceamt', sortable: false, align:'center', width: "50px"}, 
                {text: '수금금액',       value: 'a_accamt', sortable: false, align:'center', width: "50px"},                 
                {text: '미수금액',       value: 'a_invoiceamt', sortable: false, align:'center', width: "50px"},                 
                {text: '수금회수',       value: 'm_cnt', sortable: false, align:'center', width: "30px"}, 
                {text: '수금진행률',     value: 'p_per', sortable: false, align:'center', width: "30px"}, 
                {text: '수금시작일',     value: 'd_account1', sortable: false, align:'center', width: "50px"}, 
                {text: '수금종료일',     value: 'd_account2', sortable: false, align:'center', width: "50px"}, 
                
            ],

            itemLists: [], itemListsselect: [],  itemInfo: [], selectedD: [], item: [],
        }
    },
    computed: {
    },
    methods: {
        adjustIframeHeight() {
        // 브라우저 창의 높이를 iframe의 높이로 설정
            const windowHeight = window.innerHeight;
            this.iframeHeight = windowHeight - 200 - 330;
        },
        async init() {
            this.form.sDate1 = getDate(-100, 1);
            this.viewInvoice();
        },
        async viewInvoice() {
            this.masterinfo = []; this.selectedM = []; this.itemLists = []; this.itemListsselect = [] ,this.itemInfo = [];
            this.masters = await this.$axios.post(`/api/shipment/getInvoicelistView`, this.form); 
            this.itemLists = await this.$axios.post(`/api/shipment/getInvoicelistViewdt`, this.form); 
         
        },

        async rowSelectMaster(item, row) {
            if(this.masterinfo.c_vend == item.c_vend) return;
            // this.invoiceVend.c_vend = item.c_vend;
            
            this.masterinfo = item;
            if (row) { row.select(true) } else { this.selectedM = [item] };
            
            this.selectedD = []; 
            this.itemInfo = [];
            if (this.itemLists.length > 0) {
                this.itemListsselect = this.itemLists.filter((r) => {
                    return r.c_vend == item.c_vend && r.c_com == item.c_com;
                }); 
            } else {
                this.itemListsselect = [];
            }
            
        },

        getPer(value) {
            return value * 100;
        },

        objectSplit(data, f) {	
            const obj = {};
            if ( f === 'M' || f === 'm' ) {
                const objKeys = Object.keys(data).filter((key) => isNaN(key));
                const values = objKeys.map((key) => data[key]);
                for (let i = 0; i < objKeys.length; i++) {
                    obj[objKeys[i]] = values[i];
                }
                return obj;
            } else {        
                const objKeys = Object.keys(data).filter((key) => !isNaN(key));
                const objValues = objKeys.map((key) => data[key]);
                return objValues;
            }    
        },
        rowSelectDetail(item, row) {
            this.itemInfo = item;
            if (row) { row.select(true) } else { this.selectedD = [item] };
        }
        
    },

}
</script>

<style>

</style>