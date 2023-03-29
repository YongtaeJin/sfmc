<template>
    <v-container fluid>
        <v-toolbar height="40px" background-color="primary" dark>
            <v-toolbar-title>사업장 관리</v-toolbar-title>
            <v-spacer/>
            <tooltip-btn fab small label="추가" @click="addWorkSite"><v-icon>mdi-plus</v-icon></tooltip-btn>
        </v-toolbar>
        <v-data-table :headers="headers" :items="items" @dblclick:row=showRowInfo>
        </v-data-table>
    </v-container>
</template>

<script>
import TooltipBtn from "../../components/etc/TooltipBtn.vue";
import EzDialog from '../../components/etc/EzDialog.vue';
export default {
    components: { TooltipBtn, EzDialog }, 
    name: "AdmWorksite",
    mounted() {
        this.init();
    },
    data() {
        return {
            headers: [
                {text: '코드',  value: 'c_com', sortable: false, align:'center', width: "100px"},
                {text: '사업장',  value: 'n_com', sortable: false, },
                {text: '관리자',  value: 'n_name', sortable: false, align:'center', width: "20%"},
                {text: 'ID',  value: 'i_id', sortable: false, align:'center', width: "20%"},
                {text: '사용여부',  value: 'f_use', sortable: false, align:'center', width: "100px"}, 
                ],
            items: [],
        };
    },
    watch: {
    },
    computed: {
    },
    
    methods: {
        async init() {
            this.fetchData();
        },
        async fetchData() {
            this.items = await this.$axios.get(`/api/system/`);
        },
        async showRowInfo(event, { item } ) {
            
        },
        async addWorkSite(item) {
            console.log("addWorkSite");
        },
    },
}
</script>

<style>

</style>