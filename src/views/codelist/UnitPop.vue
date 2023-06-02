<template>
    
</template>

<script>
import qs from "qs";
import TooltipBtn from '../../components/etc/TooltipBtn.vue';

export default {
  components: { TooltipBtn },

    name: "UnitPop",    
    props: {},
    data() {
        return {
            headers: [
                {text: 'Code',  value: 'c_code', sortable: false, align:'center', width:"50px"  },
                {text: '명칭',  value: 'n_code', sortable: false,  },              
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
            const where = {c_com: this.$store.state.user.member.c_com, c_gcode:"UNIT", col:["c_code", "n_code"]};
            const query = qs.stringify(where);
            this.items = await this.$axios.get(`/api/sales/getSaleEstimateInit?${query}`);   
            console.log(this.items);
        }
    },
}
</script>

<style>

</style>