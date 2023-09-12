<template>
    <v-container fluid>
        <v-toolbar height="40px" background-color="primary" dark>
            <v-toolbar-title>사업장 관리</v-toolbar-title>
            <v-spacer/>           
            <tooltip-btn fab small label="추가" @click="addWorkSite"><v-icon>mdi-plus</v-icon></tooltip-btn>
            <tooltip-btn fab small label="조회" @click="fetchData"><v-icon>mdi-magnify</v-icon></tooltip-btn>
        </v-toolbar>
        <v-data-table :headers="headers" :items="items" @dblclick:row=showRowInfo 
                    item-key="i_ser" single-select 
                    :items-per-page="20" :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" 
                    class="elevation-1 text-no-wrap" height="500px" max-height="500px" >
            <template v-slot:[`item.f_init`]="{ item }">
               <v-btn icon x-small tabindex="-1" @click="clickInit(item)"><v-icon> mdi-dialpad </v-icon></v-btn>
            </template>
         
        </v-data-table>

        <ez-dialog ref="dialog" label="사업장" persistent @onClose="closeDialog" width="500px">
            <worksite-form :data="item" :keyCheckCom="keyCheckCom" :keyCheckId="keyCheckId" :isLoad="isLoad" @onSave="save">
                
            </worksite-form>
        </ez-dialog>
    </v-container>
    
</template>

<script>
import { mapActions } from "vuex";
import TooltipBtn from "../../components/etc/TooltipBtn.vue";
import EzDialog from '../../components/etc/EzDialog.vue';
import WorksiteForm from './ConfigComponent/WorksiteForm.vue';
import { deepCopy } from '../../../util/lib';
export default {
    components: { TooltipBtn, EzDialog, WorksiteForm }, 
    name: "AdmWorksite",
    mounted() {
        this.init();
    },
    data() {
        return {
            headers: [
                {text: '사업장코드',  value: 'c_com', sortable: false, align:'center', width: "100px"},
                {text: '사업장명',  value: 'n_com', sortable: false, },
                {text: '관리자성명',  value: 'n_name', sortable: false, align:'center', width: "20%"},
                {text: '관리자ID',  value: 'i_id', sortable: false, align:'center', width: "20%"},
                {text: '사업자번호',  value: 'i_company', sortable: false, align:'center', width: "130px"},
                {text: 'KPI 인증키',  value: 'i_kpikey', sortable: false, align:'center', width: "130px"},
                {text: '장비모니터링주소',  value: 't_monitor', sortable: false, align:'center', width: "130px"},
                {text: '사용여부',  value: 'f_use', sortable: false, align:'center', width: "100px"},
                {text: '코드초기화',  value: 'f_init', sortable: false, align:'center', width: "100px"},
                ],
            items: [], selected: [],
            item : {
                c_com: "",
                n_com: "",
                n_name: "",
                i_id: "",
                f_use: "",
                i_company: "",
                i_kpikey: "",
                f_kpichk: "",
                n_kpiconm: "",
                t_monitor: "",
                t_remark: "",
            },
            isLoad: false,
        };
    },
    watch: {
    },
    computed: {
    },
    
    methods: {
        ...mapActions("system", ["duplicateCheck", "duplicateDualCheck", "insertWorksite", "updateWorksite", "iuSiteCodeinit"]),
        async init() {
            this.fetchData();
        },
        async fetchData() {
            this.items = await this.$axios.get(`/api/system/`);
        },
        async showRowInfo(event, { item } ) {
            this.item = deepCopy(item); 
            
            this.$refs.dialog.open();
        },
        async addWorkSite(item) {
            this.isLoad = true;
            this.item = null;
            this.$refs.dialog.open();            
        },
        closeDialog() { 
            this.isLoad = false;           
            this.item = null;
        },
        async keyCheckCom(value){
            const payload = {
                field: "c_com",
                value,
            };            
            return await this.duplicateCheck(payload); 
        },
        async keyCheckId(value, aFiled){           
            const payload = {
                com: "c_com",
                aFiled, 
                field: "i_id",
                value,
            };            
            return await this.duplicateDualCheck(payload); 
        },
        async save(form) {
            this.isLoading = true;   
            // console.log(this.item ? "update" : "insert")
            if (this.item) {
                // update
                const data = await this.updateWorksite(form); 
            } else {
                // insert
                const data = await this.insertWorksite(form); 
            }
            this.isLoading = false;   
            this.$refs.dialog.close(); 
        },
        async clickInit(item) {
            const res = await this.$ezNotify.confirm("<br>공통코드 초기화 하시겠습니까 ?<br>이전 자료는 삭제 처리.... ", `${item.n_com}`, {icon: "mdi-message-bulleted-off", width: 400,});
            if(!res) return;
            const res2 = await this.$ezNotify.confirm("초기화 실행 합니다. ", `${item.n_com}`, {icon: "mdi-message-bulleted-off", width: 400,});
            if(!res2) return;
            const rv = this.iuSiteCodeinit(item);
            if (rv) {
                this.$toast.info(`공통코드 초기하 처리 하였습니다...`);
            } else {
                this.$toast.error(`실패...`);
            }
        },
    },
}
</script>

<style>

</style>