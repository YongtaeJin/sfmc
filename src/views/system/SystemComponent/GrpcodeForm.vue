<template>
    <div>
        <v-toolbar height="40px" background-color="primary" >
            <v-toolbar-title>Group Code</v-toolbar-title>
            <v-spacer/>           
            <tooltip-btn label="추가" @click="addUser" fab x-small><v-icon>mdi-plus</v-icon></tooltip-btn>            
            <tooltip-btn label="삭제" @click="delUser" fab x-small><v-icon>mdi-minus</v-icon></tooltip-btn>
        </v-toolbar>
        <v-data-table :headers="headers" :items="data" @click:row="rowSelect" @dblclick:row="showRowInfo" class="elevation-1 text-no-wrap" 
            item-key="c_gcode" single-select
            :items-per-page="-1" hide-default-footer :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" 
            height="500px" max-height="500px" > 
        </v-data-table>        
    </div>    
</template>

<script>
import TooltipBtn from '../../../components/etc/TooltipBtn.vue'
export default {
  components: { TooltipBtn },
    name: "GrpcodeForm",
    props: {
        data: {
            type: Array,
            default: null,
        }        
    },
    data() {
        return {
            headers: [
                {text: 'No',  value: 's_sort', sortable: false, align:'center', width:"40px" },
                {text: 'Code',  value: 'c_gcode', sortable: false,  },
                {text: '명칭',  value: 'n_gcode', sortable: false,  },
                {text: '비고',  value: 't_remark', sortable: false, }, 
                ],            
            item: null,
        }        
    },
    watch: {
    },
    computed: {
    },
    methods: {
        async fetchData() {
            
        },
        async addUser() {
            this.$emit('onshowRowInfo');
        },
        async delUser() {            
            this.$emit('onDelete', this.item);
        },
        rowSelect :function (item, row) {    
            row.select(true);            
            this.item = item;
            this.$emit('onSelect', item);
        },
        async showRowInfo(event, { item }) {
            this.$emit('onshowRowInfo', item);
        }
    }
}
</script>

<style>
    
</style>