<template>
    <v-container fluid>
        <v-toolbar height="40px" background-color="primary" dark>
            <v-toolbar-title>공정유형 관리</v-toolbar-title>
            <v-spacer/>
            <v-text-field v-model="search" ense single-line hide-details/>
            <tooltip-btn label="조회" @click="fatch"><v-icon>mdi-magnify</v-icon></tooltip-btn>            
            <tooltip-btn label="추가" @click="addPTypeItem"><v-icon>mdi-plus</v-icon></tooltip-btn>            
            <tooltip-btn label="삭제" @click="delPTypeItem"><v-icon>mdi-minus</v-icon></tooltip-btn>
        </v-toolbar>
    <v-row>
        <v-col col="12" sm="5" md="5">
            <v-data-table :headers="headers" :items="progresstype" @click:row="rowSelect" @dblclick:row="showRowInfo" 
                item-key="c_ptype" single-select
                :items-per-page="-1"  hide-default-footer :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" 
                class="elevation-1 text-no-wrap" :height="iframeHeight">  

                <template v-slot:[`item.f_use`]="{ item }">
                    <v-chip x-small :color="getColor(item.f_use)" dark>
                        {{ item.f_use == 'Y' ? '사용' : '중지' }}
                    </v-chip>
                </template>
            </v-data-table>
        </v-col>

        <v-col col="12" sm="7" md="7">
            <v-toolbar height="40px" background-color="primary" >
                <v-toolbar-title>{{ typeTitle }}</v-toolbar-title>
                <v-spacer/>                       
                <tooltip-btn label="추가" @click="addDetail" fab x-small><v-icon>mdi-plus</v-icon></tooltip-btn>            
                <tooltip-btn label="삭제" @click="delDetail" fab x-small><v-icon>mdi-minus</v-icon></tooltip-btn>
            </v-toolbar>
            <v-data-table :headers="headersDT" :items="progresstypeli" @click:row="rowSelectLI" @dblclick:row="showRowInfoLI" 
                item-key="c_id" single-select
                :items-per-page="20" hide-default-footer :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" 
                class="elevation-1 text-no-wrap" :height="iframeHeight - 40"> 

                <template v-slot:[`item.f_jobs`]="{ item }">
                    <v-icon small v-if="item.f_jobs=='Y'" :color="getColor(item.f_jobs)"> mdi-check </v-icon>
                </template>
                <template v-slot:[`item.f_jobf`]="{ item }">
                    <v-icon small v-if="item.f_jobf=='Y'" :color="getColor(item.f_jobf)"> mdi-check </v-icon>
                </template> 
                <template v-slot:[`item.f_jobo`]="{ item }">
                    <v-icon small v-if="item.f_jobo=='Y'"   :color="getColor(item.f_jobo)"> mdi-check </v-icon>
                </template>
            </v-data-table>
        </v-col>
    </v-row>

    <ez-dialog ref="dialog" label="공정유형 등록(수정)" persistent @onClose="close" width="500px">
        <basejobprtype-from
            :data="typeitem" :keyCheckItem="keyCheckItem" :isLoad="isLoad" :s_sort=getMaxNo                 
            @onSave="saveType">
        </basejobprtype-from>        
    </ez-dialog>
    
    <ez-dialog ref="dialogLi" label="공정추가/삭제" persistent @onClose="closeLi" width="460px">
        <basejobprtypeli-from :data="typeliitem" :keyCheckItem="keyCheckItemLi" :isLoad="isLoad" 
            :c_ptype="c_ptype" :s_sort=getMaxNo2 :proclist="proclist"
            @onSave="saveLiType">
        </basejobprtypeli-from>  
        
    </ez-dialog>
    </v-container>
    
</template>

<script>
import qs from "qs";
import { mapActions } from "vuex";
import EzDialog from '../../components/etc/EzDialog.vue';
import TooltipBtn from '../../components/etc/TooltipBtn.vue';
import BasejobprtypeFrom from './JobComponent/BasejobprtypeFrom.vue';
import BasejobprtypeliFrom from './JobComponent/BasejobprtypeliFrom.vue';


export default {
    components: { TooltipBtn, EzDialog, BasejobprtypeFrom, BasejobprtypeliFrom,  },
    name: "BasejobProcesstype",
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
                {text: 'No',  value: 's_sort', sortable: false, align:'center', width: "35px"},
                {text: '공정유형코드',  value: 'c_ptype', sortable: false, align:'center', },
                {text: '공정유형명',  value: 'n_ptype', sortable: false, align:'left', },
                // {text: '설명',  value: 't_remark', sortable: false, align:'left', },                
                {text: '사용',  value: 'f_use', sortable: false, align:'center'},                
            ],
            progresstype: [],
            typeitem: [],           
            search: '',
            isLoad: false,
            typeTitle: "Code",
            c_ptype: "", 
            headersDT: [
                {text: 'No',  value: 's_sort', sortable: false, align:'center', width: "35px"},
                {text: '공정코드',  value: 'c_process', sortable: false, align:'center', },
                {text: '공정명',  value: 'n_process', sortable: false, align:'left', },
                {text: '작업시간',  value: 'm_whour', sortable: false, align:'center', width: "70px"},
                {text: '첫공정',  value: 'f_jobs', sortable: false, align:'center', width: "70px"},
                {text: '마지막공정',  value: 'f_jobf', sortable: false, align:'center', width: "70px"},
                {text: '외주',  value: 'f_jobo', sortable: false, align:'center', width: "70px"},                
            ],
            progresstypelis: [],
            progresstypeli: [],
            typeliitem: [],

            proclists:[],
            proclist:[],
        }
    },
    watch: {
    },
    computed: {
        ptypeDiplay() {
            return this.typeitem.c_ptype ? 'Code : ' + this.typeitem.c_ptype +'/' + this.typeitem.n_ptype : 'Code' ;
        },
        getMaxNo() {            
            const max = Math.max(...this.progresstype.map((item) => item.s_sort));
            return isFinite(max) ? max : 0;
        },
        getMaxNo2() {            
            const max = Math.max(...this.progresstypeli.map((item) => item.s_sort));
            return isFinite(max) ? max : 0;
        },
    },
     methods: {
        ...mapActions("basejob", ["duplicateProcesstypeCheck", "iuBaseProcesstype", "duplicateProcesstypeCheckLi", "iuBaseProcesstypeLi"]),
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
            if (this.progresstype) this.progresstype.splice(0);   
            if (this.progresstypelis) this.progresstypelis.splice(0);  

            this.progresstype = await this.$axios.get(`/api/basejob/getBaseProcesstype?${query}`);   
            this.progresstypelis = await this.$axios.get(`/api/basejob/getBaseProcesstypeLi`);   
            this.proclists = await this.$axios.get(`/api/basejob/getProcessItem`);
        },
        async addPTypeItem() {
            this.isLoad = true;     
            this.typeitem = null;
            this.$refs.dialog.open();
        },
        async delPTypeItem() {
            if(this.getMaxNo2) {
                this.$toast.info(`공정 List 삭제 후 삭제 가능 합니다.`);
                return
            }
            const idx = this.progresstype.indexOf(this.typeitem);
            if (idx < 0) return;
            const result = await this.$ezNotify.confirm(
			 	`<b>공정유형 코드 : ${this.typeitem.c_ptype}</b> 삭제 하시겠습니까 ?`,
			 	`공정유형`,
			 	{icon : 'mdi-delete', iconColor: 'red'}
			);
            if(!result) return;
            const data = await this.$axios.delete(`/api/basejob/delBaseProcesstype/${this.typeitem.c_com}/${this.typeitem.c_ptype}`);
            if(data) { 
                this.progresstype.splice(idx, 1);
                this.$toast.info(`[${this.typeitem.c_ptype}] 삭제 하였습니다.`);
            }
        },
        getColor (yn) {            
            return yn == "N" ? 'red' : 'green';
        },
        getColor2 (yn) {            
            return yn == "Y" ? 'red' : 'green';
        },
        rowSelect :function (item, row) {            
            row.select(true);            
            this.typeitem = item;
            this.c_ptype = this.typeitem.c_ptype;
            this.typeTitle = this.typeitem.c_ptype ? 'Code : ' + this.typeitem.c_ptype +'/' + this.typeitem.n_ptype : 'Code' ;
            this.progresstypeli = this.progresstypelis.filter((item) => {
                return item.c_ptype == this.typeitem.c_ptype && item.c_com == this.typeitem.c_com;
            });   
            this.notProcSeletc();
        },
        notProcSeletc() {
            var _ = require('underscore');
            this.proclist = JSON.parse(JSON.stringify(this.proclists));             
            this.progresstypeli.forEach(typeitem => {
                const idx = this.proclist.findIndex(e => e.c_process == typeitem.c_process);                
                if (idx > -1) { this.proclist.splice(idx, 1) };                
            });
        },
        async keyCheckItem(value) {
            const payload = {
                c_ptype: "c_ptype",
                value           
            };            
            return await this.duplicateProcesstypeCheck(payload); 
        },
        async showRowInfo(event, { item }) {
            this.isLoad = true;     
            this.typeitem = item;
            this.$refs.dialog.open();
        },
        async saveType(form) {
            this.isLoading = true;
            const data = await this.iuBaseProcesstype(form);
            this.isLoading = false;
            if (data) {                
                this.$toast.info(`[${data.c_ptype}] 저장 하였습니다.`);
                const idx = this.progresstype.indexOf(this.typeitem);
                idx >= 0 ? this.progresstype.splice(idx, 1, data) : this.progresstype.push(data);
            }
            this.$refs.dialog.close();
        },
        async close() {
            this.isLoad = false;
            // this.typeitem = null;
        },


        async addDetail() {
            if (!this.typeitem) return;
            if (!this.typeitem.c_ptype) return;            

            this.isLoad = true;     
            this.typeliitem = null;
            this.$refs.dialogLi.open();
        },
        async delDetail() {
            const idx = this.progresstypeli.indexOf(this.typeliitem);
            if (idx < 0) return;
            const result = await this.$ezNotify.confirm(
			 	`<b>공정 코드 : ${this.typeliitem.c_process}</b> 삭제 하시겠습니까 ?`,
			 	`공정유형_공정코드`,
			 	{icon : 'mdi-delete', iconColor: 'red'}
			);
            if(!result) return;
            const data = await this.$axios.delete(`/api/basejob/delBaseProcesstypeLi/${this.typeliitem.c_com}/${this.typeliitem.c_ptype}/${this.typeliitem.c_process}`);
            if(data) { 
                this.progresstypeli.splice(idx, 1);
                this.$toast.info(`[${this.typeliitem.c_process}] 삭제 하였습니다.`);
            }
        },
        rowSelectLI :function (item, row) {    
            row.select(true);            
            this.typeliitem = item;            
        },
        async showRowInfoLI(event, { item }) {
            this.isLoad = true;     
            this.typeliitem = item;
            this.$refs.dialogLi.open();
        },
        
        async saveLiType(form) {
            this.isLoading = true;
            const data = await this.iuBaseProcesstypeLi(form);
            this.isLoading = false;
            if (data) {                
                this.$toast.info(`[${data.c_ptype}] 저장 하였습니다.`);
                const idx = this.progresstypeli.indexOf(this.typeliitem);
                idx >= 0 ? this.progresstypeli.splice(idx, 1, data) : this.progresstypeli.push(data);
                const idx2 = this.progresstypelis.indexOf(this.typeliitem);
                idx2 >= 0 ? this.progresstypelis.splice(idx2, 1, data) : this.progresstypelis.push(data);
                this.notProcSeletc();
            }
            this.$refs.dialogLi.close();
        },
        async closeLi() {
            this.isLoad = false;          
        },
        async keyCheckItemLi(value1, value) {
            const payload = {
                c_col1: "c_ptype",
                value1,
                c_col2: "c_process",
                value
            };            
            return await this.duplicateProcesstypeCheckLi(payload); 
        },
     }
}
</script>

<style>

</style>