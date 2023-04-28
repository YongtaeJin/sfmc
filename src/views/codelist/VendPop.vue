<template>
  
</template>

<script>
import TooltipBtn from '../../../components/etc/TooltipBtn.vue'
export default {
    components: { TooltipBtn },
    name: "VendPop",    
    props: {},
    data() {
        return {
            headers: [
                {text: 'Code',  value: 'c_code', sortable: false, align:'center', width:"5px"  },
                {text: '명칭',  value: 'n_code', sortable: false,  },              
                ],
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

        }
    },
}
</script>

<style>

</style>