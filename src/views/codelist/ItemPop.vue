<template>
    <v-data-table
        :headers="headers" :items="items" height="270px" max-height="350px" class="text-no-wrap"
        item-key="c_item" single-select @click:row="rowSelect"  @dblclick:row="itemSelect" 
        >
    </v-data-table>
</template>

<script>
import TooltipBtn from '../../components/etc/TooltipBtn.vue';

export default {
  components: { TooltipBtn },

    name: "ItemPop",    
    props: {},
    data() {
        return {
            headers: [
                {text: '품번',  value: 'c_item', sortable: false, align:'center'},
                {text: '품명',  value: 'n_item', sortable: false,  },
                {text: '사양',  value: 't_size', sortable: false,  },
                {text: '단위',  value: 'n_unit', sortable: false, align:'center' },
                {text: '제품타입',  value: 'n_type', sortable: false,  },                
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
            // const where = {c_com: this.$store.state.user.member.c_com, c_gcode:"UNIT", col:["c_code", "n_code"]};
            // const query = qs.stringify(where);
            this.items = await this.$axios.get(`/api/basejob/getItemList`);               
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