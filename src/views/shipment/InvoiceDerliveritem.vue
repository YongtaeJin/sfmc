<template>
    <div>
        <v-toolbar height="40px" background-color="primary" dark >
        <v-spacer/>
        <v-btn small :color= "getCheck ? 'success' : 'warning'"  @click="addInvoice"> {{ !newInvoce ? '계산선 품목 추가' : getCheck ? "계산서 작성" : "미 출하계산서" }}</v-btn>
        </v-toolbar>
        <v-data-table :headers="Head" :items="data" item-key="i_shipser"           
            v-model="selected"  
            class="elevation-1 text-no-wrap" height="300px" max-height="300px">
            
            <template v-slot:item="{ item }">
                <tr  class="center-align">
                    <td><v-checkbox v-model="item.f_select" true-value="1"  false-value="0" @change="checkboxChanged(item)"  dense  hide-details="" style="margin: 0; padding: 0;"></v-checkbox> </td>
                    <td> {{ item.d_ship }} </td>
                    <td> {{ item.i_shipno }} </td>
                    <td> {{ item.n_vend }} </td>
                    <td> {{ item.n_item }} </td>
                    <td> {{ item.t_size }} </td>
                    <td> {{ item.m_shipcnt }} </td>                    
                </tr>
            </template>
        </v-data-table>
        
    </div>    
</template>

<script>
import { comma } from '../../../util/lib';
export default {
    name: "InvoiceDerliveritem",    
    props: {
        data: {
            type: Array,
            default: null,
        },   
        newInvoce: { type: Boolean, default: true},
    },
    data() {
        return {
            comma,
            Head: [
                // {text: '견적일',    value: 'f_select', sortable: false, align:'center', width: "65px"},                
                {text: '선택',       value: 'f_select', sortable: false, align:'center', width: "25px"},
                {text: '출하일자',    value: 'd_ship', sortable: false, align:'center', width: "65px"},
                {text: '출하번호',    value: 'i_shipno', sortable: false, align:'center', width: "65px" },
                {text: '거래처',      value: 'n_vend', sortable: false, align:'center', width: "70px"},
                
                {text: '항목(품목)',  value: 'n_item', sortable: false, align:'center', width: "130px"},
                {text: '규격(사양)',  value: 't_size', sortable: false, align:'center', width: "100px"},                
                {text: '수량',        value: 'm_shipcnt', sortable: false, align:'center', width: "60px"},                
                
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
            return this.data.filter(data => data.f_select === '1').length;
        }
    },
    methods: {
        rowSelect:function (item, row) {                
            row.select(true);
            this.selectest = item;            
        },
        async enterSelect(event, { item }) {            
            this.selectest = item;            
            this.$emit('onEnter', this.selectest); 
        },

        async addInvoice() {
            const item = this.data.filter(data => data.f_select === '1');
            if (item.length) {
                // 배열 내 모든 객체의 특정 필드 값들을 추출하여 중복 제거
                const values = Array.from(new Set(item.map(data => data['c_vend'])));
                if (values.length > 1) {
                    this.$ezNotify.alert(`${values} <br>`, "거래처 중복", {icon: "mdi-message-bulleted",})
                    return;
                } 
            } 
            if (!this.newInvoce && !item.length) { return; }

            this.$emit('onEnter', item);             
        },  
        checkboxChanged(item) {
            
            // const idx =  this.data.indexOf(item);
            // console.log(item.f_select, idx);
            // if (idx >= 0 ) {
            //     this.data[idx].f_select = item.f_select                
            // }

        }
    }
}
</script>

<style>

</style>
