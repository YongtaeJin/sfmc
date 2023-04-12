<template>
  
</template>

<script>
export default {
    name: "BasejobItem",
    mounted() {
        this.init();
    },
    data() {
        return {
            headers: [
                {text: 'No',  value: 's_sort', sortable: false, align:'center', width: "50px"},
                
            ],
            items: [],
            item: null,
            search: '',
            isLoad: false,
        }
    },
    watch: {
    },
    computed: {
        
    },    
    methods: {
        async init() {

        },
    },
}
</script>

<style>

</style>