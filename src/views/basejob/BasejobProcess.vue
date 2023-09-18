<template>
    <v-container fluid>
        <v-toolbar height="40px" background-color="primary" dark>
            <v-toolbar-title>공정 관리</v-toolbar-title>
            <v-spacer/>
            <v-text-field v-model="search" ense single-line hide-details/>
            <tooltip-btn label="조회" @click="fatch"><v-icon>mdi-magnify</v-icon></tooltip-btn>            
            <tooltip-btn label="추가" @click="addItem"><v-icon>mdi-plus</v-icon></tooltip-btn>            
            <tooltip-btn label="삭제" @click="delItem"><v-icon>mdi-minus</v-icon></tooltip-btn>
        </v-toolbar>
        <v-data-table :headers="headers" :items="items" @click:row="rowSelect" @dblclick:row="showRowInfo" 
            item-key="c_process" single-select
            :items-per-page="-1" hide-default-footer :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" 
            class="elevation-1 text-no-wrap" :height="iframeHeight">  

            <template v-slot:[`item.f_outside`]="{ item }">
                <v-chip x-small :color="getColor2(item.f_outside)" dark>
                    {{ item.f_outside == 'Y' ? '외주공정' : '사내공정' }}
                </v-chip>
            </template>
            <template v-slot:[`item.f_use`]="{ item }">
                <v-chip x-small :color="getColor(item.f_use)" dark>
                    {{ item.f_use == 'Y' ? '사용' : '중지' }}
                </v-chip>
            </template>
        </v-data-table>
        <ez-dialog ref="dialog" label="공정 등록(수정)" persistent @onClose="close" width="500px">            
            <basejobprocess-form
                :data="item" :keyCheckItem="keyCheckItem" :isLoad="isLoad" :s_sort=getMaxNo                 
                @onSave="saveItem">
            </basejobprocess-form>
        </ez-dialog>
    </v-container>
</template>

<script>
import qs from "qs";
import { mapActions } from "vuex";
import EzDialog from '../../components/etc/EzDialog.vue';
import TooltipBtn from '../../components/etc/TooltipBtn.vue';
import BasejobprocessForm from './JobComponent/BasejobprocessForm.vue';
export default {
    components: { TooltipBtn, EzDialog, BasejobprocessForm },
    name: "BasejobProcess",
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
                {text: '공정코드',  value: 'c_process', sortable: false, align:'center', },
                {text: '공정명',  value: 'n_process', sortable: false, align:'left', },
                {text: '공정설명',  value: 't_remark', sortable: false, align:'left', },
                {text: '외주공정',  value: 'f_outside', sortable: false, align:'center',  width: "100px"},
                {text: '사용여부',  value: 'f_use', sortable: false, align:'center',  width: "100px"},
                
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
        getMaxNo() {            
            const max = Math.max(...this.items.map((item) => item.s_sort));
            return isFinite(max) ? max : 0;
        },
    },    
    methods: {
        ...mapActions("basejob", ["duplicateProcessCheck", "iuBaseProcess"]),
        adjustIframeHeight() {
        // 브라우저 창의 높이를 iframe의 높이로 설정
            const windowHeight = window.innerHeight;
            this.iframeHeight = windowHeight - 200;           
        },
        async init() {            
            this.fatch();
        },
        async fatch() {            
            const where = { search: this.search.trim() };
            const query = qs.stringify(where);            
            if (this.items) this.items.splice(0);            
            this.items = await this.$axios.get(`/api/basejob/getBaseProcess?${query}`);      
        },
        
        async addItem() {
            this.isLoad = true;
            this.item = null;
            this.$refs.dialog.open();
        },
        async delItem() {
            const idx = this.items.indexOf(this.item);
            if (idx < 0) return;
            const result = await this.$ezNotify.confirm(
			 	`<b>Code : ${this.item.c_process}</b> 삭제 하시겠습니까 ?`,
			 	`Code`,
			 	{icon : 'mdi-delete', iconColor: 'red'}
			);
            if(!result) return;
            const data = await this.$axios.delete(`/api/basejob/delBaseProcess/${this.item.c_com}/${this.item.c_process}`);
            if(data) {
                this.items.splice(idx, 1);                
                this.$toast.info(`[${this.item.c_process}] 삭제 하였습니다.`);
            } 
        },
        async saveItem(form) {
            this.isLoading = true;
            const data = await this.iuBaseProcess(form);
            this.isLoading = false;
            if (data) {                
                this.$toast.info(`[${data.c_process}] 저장 하였습니다.`);
                const idx = this.items.indexOf(this.item);
                idx >= 0 ? this.items.splice(idx, 1, data) : this.items.push(data);
            }
            this.$refs.dialog.close();
        },
        async close() {
            this.isLoad = false;
            this.item = null;
        },
        async keyCheckItem(value) {
            const payload = {
                c_process: "c_process",
                value           
            };            
            return await this.duplicateProcessCheck(payload); 
        },
        getColor (yn) {            
            return yn == "N" ? 'red' : 'green';
        },
        getColor2 (yn) {            
            return yn == "Y" ? 'red' : 'green';
        },
        rowSelect :function (item, row) {    
            row.select(true);            
            this.item = item;            
        },
        async showRowInfo(event, { item }) {
            this.isLoad = true;     
            this.item = item;
            this.$refs.dialog.open();
        },
    },
}
</script>

<style>

</style>