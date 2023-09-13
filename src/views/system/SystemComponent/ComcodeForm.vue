<template>
    <div>
        <v-toolbar height="40px" background-color="primary" >
            <v-toolbar-title>{{title}}</v-toolbar-title>
            <v-spacer/>                       
            <tooltip-btn label="추가" @click="addUser" fab x-small><v-icon>mdi-plus</v-icon></tooltip-btn>            
            <tooltip-btn label="삭제" @click="delUser" fab x-small><v-icon>mdi-minus</v-icon></tooltip-btn>
        </v-toolbar>
        <v-data-table :headers="headers" :items="data" @click:row="rowSelect" @dblclick:row="showRowInfo" class="elevation-1 text-no-wrap" 
            item-key="c_code" single-select
            :items-per-page="-1" hide-default-footer :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" 
            height="500px" max-height="500px" > 
        </v-data-table>
    </div>    
</template>

<script>
import TooltipBtn from '../../../components/etc/TooltipBtn.vue'
export default {
  components: { TooltipBtn },
    name: "ComcodeForm",
    props: {
        title: {
            type: String,
            default: null,
        },
        data: {
            type: Array,
            default: null,
        },        
    },
    watch: {
    },
    computed: {
    },
    data() {
        return {
            headers: [
                {text: 'No',  value: 's_sort', sortable: false, align:'center', width:"30px" },
                {text: 'Code',  value: 'c_code', sortable: false,  },
                {text: '명칭',  value: 'n_code', sortable: false,  },
                {text: '문자1',  value: 's_buf1', sortable: false,  },
                {text: '문자2',  value: 's_buf2', sortable: false,  },
                {text: '숫자1',  value: 'm_buf1', sortable: false,  },
                {text: '숫자2',  value: 'm_buf2', sortable: false,  },
                {text: '비고',  value: 't_remark', sortable: false, }, 
                ],
            item: null,
        }
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