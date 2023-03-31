<template>
    <v-container fluid>
        <v-toolbar height="40px" background-color="primary" dark>
            <v-toolbar-title>사업장 관리</v-toolbar-title>
            <v-spacer/>
            <tooltip-btn fab small label="추가" @click="addWorkSite"><v-icon>mdi-plus</v-icon></tooltip-btn>
        </v-toolbar>
        <v-data-table :headers="headers" :items="items" @dblclick:row=showRowInfo>
        </v-data-table>

        <ez-dialog ref="dialog" label="사업장" persistent>
            <worksite-form>
                
            </worksite-form>
        </ez-dialog>
    </v-container>
    
</template>

<script>
import TooltipBtn from "../../components/etc/TooltipBtn.vue";
import EzDialog from '../../components/etc/EzDialog.vue';
import WorksiteForm from './ConfigComponent/WorksiteForm.vue';
export default {
    components: { TooltipBtn, EzDialog, WorksiteForm }, 
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
             this.$refs.dialog.open();
        },
        async addWorkSite(item) {
            this.$refs.dialog.open();
        },
    },
}
</script>

<style>

</style>