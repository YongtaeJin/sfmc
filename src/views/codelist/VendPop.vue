<template>
    <v-data-table
        :headers="headers" :items="items" height="270px" max-height="350px" class="text-no-wrap"
        item-key="c_vend" single-select @click:row="rowSelect"  @dblclick:row="itemSelect" 
        >
    </v-data-table>
</template>

<script>
import TooltipBtn from '../../components/etc/TooltipBtn.vue'
export default {
    components: { TooltipBtn },
    name: "VendPop",    
    props: {},
    data() {
        return {
            headers: [
                {text: '약칭',  value: 'n_vend', sortable: false, align:'center', width:"70px"  },
                {text: '명칭',  value: 'n_compnay', sortable: false,  },                
                {text: '비고',  value: 't_remark', sortable: false,  },
                ],
            items: [],
        }
    },
    created() {
        this.init();
    },
    watch: {
    },
    computed: {
    },
    methods: {
        async init() {
            this.items = await this.$axios.get(`/api/basejob/getVendList`);
        },
        rowSelect :function (item, row) {            
            row.select(true);                           
        },        
        async itemSelect(event, { item }) {            
            this.$emit('onSelect', item);
            
        },
    },
}
</script>

<style>

</style>