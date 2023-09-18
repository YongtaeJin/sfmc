<template>
    <v-container fluid>
        <v-toolbar height="40px" background-color="primary" dark>
            <v-toolbar-title>거래처(고객사) 관리</v-toolbar-title>
            <v-spacer/>
            <v-text-field v-model="search" ense single-line hide-details/>
            <tooltip-btn label="조회" @click="init"><v-icon>mdi-magnify</v-icon></tooltip-btn>            
            <tooltip-btn label="추가" @click="addVend"><v-icon>mdi-plus</v-icon></tooltip-btn>            
            <tooltip-btn label="삭제" @click="delVend"><v-icon>mdi-minus</v-icon></tooltip-btn>
        </v-toolbar>
        <v-data-table :headers="headers" :items="vends" @click:row="rowSelect" @dblclick:row="showRowInfo" 
            item-key="c_vend" single-select
            :items-per-page="-1"  hide-default-footer :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" 
            class="elevation-1 text-no-wrap" :height="iframeHeight">  

            <!-- <template v-slot:item.s_sort="{ item }"> -->
            <template v-slot:[`item.s_sort`]="{ item }">
                <v-chip x-small :color="getColor(item.f_use)" dark>
                    {{ item.s_sort }}
                </v-chip>
            </template>
        </v-data-table>
        <ez-dialog ref="dialog" label="거래처(고객사)" persistent @onClose="close" width="700px">
            <basejobvend-form 
                :data="vend" :keyCheckVend="keyCheckVend" :isLoad="isLoad" :s_sort=getMaxNo @onSave="vendSave">
            </basejobvend-form>
        </ez-dialog>
    </v-container>
    
</template>

<script>
import qs from "qs";
import { mapActions } from "vuex";
import EzDialog from '../../components/etc/EzDialog.vue';
import TooltipBtn from '../../components/etc/TooltipBtn.vue';
import BasejobvendForm from './JobComponent/BasejobvendForm.vue';
export default {
  components: { TooltipBtn, EzDialog, BasejobvendForm },
    name: "Basejobvend",
    mounted() {
        // 창 크기가 변경될 때마다 iframe의 높이를 조정
        window.addEventListener('resize', this.adjustIframeHeight);
        this.adjustIframeHeight(); // 초기 조정 
        this.init();
    },
    beforeDestroy() {
        // 컴포넌트가 파기될 때 리스너 제거
        window.removeEventListener('resize', this.adjustIframeHeight);
    },
    data() {
        return {
            iframeHeight: 500, // 초기 높이 설정 (원하는 높이로 초기화)
            headers: [
                {text: 'No',  value: 's_sort', sortable: false, align:'center', width: "50px"},
                // {text: 'Code',  value: 'c_vend', sortable: false, align:'center', width: "50px"},
                {text: '약칭',  value: 'n_vend', sortable: false, align:'center', width: "100px"},
                {text: '명칭',  value: 'n_compnay', sortable: false, align:'center', width: "200px"},
                {text: '사업자번호',  value: 'i_company', sortable: false, align:'center', width: "120px"},
                {text: '대표자',  value: 'n_ceo', sortable: false, align:'center', width: "110px"},
                {text: '전화',  value: 't_tel', sortable: false, align:'center', width: "125px"},
                {text: 'FAX',  value: 't_fax', sortable: false, align:'center', width: "125px"},
                {text: 'EMail',  value: 'e_mail', sortable: false, align:'center', width: "150px"},
                {text: '담당자',  value: 'n_mag', sortable: false, align:'center', width: "110px"},
                {text: '전화',  value: 't_magtel', sortable: false, align:'center', width: "125px"},
                {text: 'EMail',  value: 't_magmail', sortable: false, align:'center', width: "150px"},
            ],
            vends: [],
            vend: null,
            search: '',
            isLoad: false,
        }
    },
    watch: {
    },
    computed: {
        getMaxNo() {            
            const max = Math.max(...this.vends.map((item) => item.s_sort));
            return isFinite(max) ? max : 0;
        },
    },    
    methods: {
        ...mapActions("basejob", ["duplicateVendCheck", "iuBaseVend"]),
        adjustIframeHeight() {
        // 브라우저 창의 높이를 iframe의 높이로 설정
            const windowHeight = window.innerHeight;
            this.iframeHeight = windowHeight - 200;           
        },
        async init() {
            const where = { search: this.search.trim() };
            const query = qs.stringify(where);

            if (this.vends) this.vends.splice(0);            
            this.vends = await this.$axios.get(`/api/basejob/getBaseVned?${query}`);      

        },
        async addVend() {
            this.isLoad = true;                         
            this.vend = null;
            this.$refs.dialog.open();            
        },
        async delVend() {
            const idx = this.vends.indexOf(this.vend);
            const result = await this.$ezNotify.confirm(
			 	`<b>거래처 : ${this.vend.n_vend}</b> 삭제 하시겠습니까 ?`,
			 	`거래처 삭제`,
			 	{icon : 'mdi-delete', iconColor: 'red'}
			);
            if(!result) return;
            const data = await this.$axios.delete(`/api/basejob/delBaseVned/${this.vend.c_com}/${this.vend.c_vend}`);
            if(data) {
                this.vends.splice(idx, 1);
                this.$toast.info(`[${this.vend.n_vend}] 삭제 하였습니다.`);
            } 
        },
        rowSelect :function (item, row) {    
            row.select(true);            
            this.vend = item;            
        },
        getColor (yn) {
            if(yn == "N") { return 'red'; } 
            else { return 'green';}
        },
        async keyCheckVend() {

        },
        async showRowInfo(event, { item }) {
            this.isLoad = true;     
            this.vend = item;
            this.$refs.dialog.open();
        },
        async vendSave(form) {
            this.isLoading = true;
            const data = await this.iuBaseVend(form);
            this.isLoading = false;
            if (data) {                
                this.$toast.info(`[${data.n_vend}] 저장 하였습니다.`);
                const idx = this.vends.indexOf(this.vend);
                idx >= 0 ? this.vends.splice(idx, 1, data) : this.vends.push(data);
            }
            this.$refs.dialog.close();
        },
        async close() {
            this.isLoad = false;
        }
    }       

}

</script>

<style>

</style>