<template>
    <v-container fluid> 
        <v-data-table ref="item-table" :headers="itemHead" :items="itemLists"                     
                    item-key="i_empno" v-model="itemS" @click:row="rowSelect"  @dblclick:row="rowEnter"  single-select hide-default-footer
                    :items-per-page="-1" 
                    class="elevation-1 text-no-wrap"  max-height="280px" height="280px" 
                    >
        </v-data-table>        
    </v-container>
</template>

<script>
import { init } from 'passport';

export default {
    props: {
       
    },
    created() { 
        this.init();
    },
    data() {
        return {
            itemHead : [
                {text: '사번',    value: 'i_empno', sortable: false, align:'center', width: "70px"},
                {text: '성명',    value: 'n_empnm', sortable: false, align:'center', width: "70px"},
                {text: '부서',    value: 'n_dept', sortable: false, align:'center', width: "70px"},
            ],
            itemLists :[], itemInfo:[], itemS:[]
        }
    },
    watch: {       
    },
    computed: {
    },
    methods: {
        async rowSelect(item, row) {
            if(this.itemInfo.i_empno == item.i_empno) return;
            this.itemInfo = item;
            if (row) { row.select(true) } else { this.itemS = [item] };
        },
        async init() {
            this.itemLists = await this.$axios.post(`/api/prod/getEmplist`);            
        },
        rowEnter() {
            this.$emit('onEnter', this.itemInfo);
        }        
    },
}
</script>

<style>

</style>