<template>
    <div>
        <v-data-table :headers="Head" :items="data" item-key="i_ser" single-select 
            @click:row="rowSelect" 
            @dblclick:row="enterSelect"  
            class="elevation-1 text-no-wrap" height="200px" max-height="200px">
        </v-data-table>
    </div>    
</template>

<script>
export default {
    name: "SalesNotestimate",    
    props: {
        data: {
            type: Array,
            default: null,
        },   
    },
    data() {
        return {
            Head: [
                // {text: '견적일',    value: 's_date', sortable: false, align:'center', width: "65px"},                
                {text: '견적번호',    value: 'i_estno', sortable: false, align:'center', width: "70px"},
                {text: '고객사',      value: 'n_vend', sortable: false, align:'left', width: "100px" },
                {text: '견적명',      value: 'n_estnm', sortable: false, align:'left', width: "250px"},
                {text: '견적금액',    value: 'a_estamt', sortable: false, align:'right', width: "65px"},                
                {text: '납기예정일',  value: 's_date3', sortable: false, align:'center', width: "65px"},
            ],
            selectest:[],
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
    }
}
</script>

<style>

</style>
