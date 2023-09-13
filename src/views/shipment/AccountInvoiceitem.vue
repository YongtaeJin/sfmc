<template>
    <div>
        <v-toolbar height="40px" background-color="primary" dark >
            <div class="v-subheader">
            거래처 : {{ data[0].n_vend }} / 계산서번호 : {{ data[0].i_invoiceno }} / 선택금액 : {{ comma(getCheck) }}원            
            </div>
        <v-spacer/>
        <v-btn small color="primary" dark  @click="addInvoice"> 선택 </v-btn> 
        </v-toolbar>
        <v-data-table :headers="Head" :items="data" item-key="i_shipser" v-model="selected"            
            hide-default-footer :items-per-page="-1" 
            class="elevation-1 text-no-wrap" height="300px" max-height="300px">
            
            <template v-slot:item="{ item }">
                <tr  class="center-align">
                    <td><v-checkbox v-model="item.f_select" true-value="1"  false-value="0" dense  hide-details="" style="margin: 0; padding: 0;"></v-checkbox> </td>
                    <td> {{ item.i_shipno }} </td>
                    <td class="right2-align"> {{ comma(item.a_invoice) }} </td>
                    <td> {{ item.n_item }} </td>
                    <td> {{ item.t_size }} </td>
                    <td> {{ item.m_cnt }} </td>                    
                    <td class="right2-align"> {{ comma(item.a_accamt) }} </td>
                    <td class="right2-align"> {{ comma(item.a_invatamt) }} </td>
                </tr>
            </template>
           
        </v-data-table>
        
    </div>  
</template>

<script>
import { comma } from '../../../util/lib';
export default {
    name: "AccountInvoiceitem",    
    props: {
        data: {
            type: Array,
            default: null,   
        },
    },
    data() {
        return {
            comma,
            Head: [
                // {text: '견적일',    value: 'f_select', sortable: false, align:'center', width: "65px"},                
                {text: '선택',       value: 'f_select', sortable: false, align:'center', width: "25px"},
                {text: '출하번호',    value: 'i_shipno', sortable: false, align:'center', width: "65px" },
                {text: '납품가액',    value: 'a_invoice', sortable: false, align:'center', width: "65px" },
                {text: '항목(품목)',  value: 'n_item', sortable: false, align:'center', width: "130px"},
                {text: '규격(사양)',  value: 't_size', sortable: false, align:'center', width: "100px"},
                {text: '수량',        value: 'm_cnt', sortable: false, align:'center', width: "60px"},
                {text: '기입금액',    value: 'a_accamt', sortable: false, align:'center', width: "60px" },
                {text: '잔여금액',    value: 'a_invatamt', sortable: false, align:'center', width: "60px" },
                
            ],
            selected:[],
        }
    },
    watch: {
        data: {
            deep: true,
            handler(newItems, oldItems) {
            }
        }
    },

    computed: {        
        getCheck() {
            return this.data.reduce((sum, item) => {
                if (item.f_select === "1") {
                    return sum + item.a_invatamt;
                }
                return sum;
            }, 0);
        }
    },
    methods: {
        rowSelect:function (item, row) {                
            row.select(true);
            this.selectest = item;            
        },
        async addInvoice() {
            const item = this.data.filter(data => data.f_select === '1');
            this.$emit('onEnter', item);
        },
    }
}
</script>

<style>

</style>