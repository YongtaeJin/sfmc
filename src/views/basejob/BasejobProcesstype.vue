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
                :items-per-page="20" :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" 
                class="elevation-1" height="600px">  

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
                :items-per-page="20" :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" 
                class="elevation-1" height="600px">  
            </v-data-table>
        </v-col>
    </v-row>

    <ez-dialog ref="dialog" label="공정유형 등록(수정)" persistent @onClose="close" width="500px">
        <basejobprocesstype-from
            :data="typeitem" :keyCheckItem="keyCheckItem" :isLoad="isLoad" :s_sort=getMaxNo                 
            @onSave="saveType">
        </basejobprocesstype-from>        
    </ez-dialog>
    
    <ez-dialog ref="dialogLi" label="공정추가/삭제" persistent @onClose="closeLi" width="500px">
        <basejobprocesstypeli-from :data="typeliitem" :keyCheckItem="keyCheckItemLi" :isLoad="isLoad" 
            :c_ptype="this.typeitem.c_ptype" :s_sort=getMaxNo2                 
            @onSave="saveTypeLi">
        </basejobprocesstypeli-from>  
    </ez-dialog>
    </v-container>
    
</template>

<script>
import qs from "qs";
import { mapActions } from "vuex";
import EzDialog from '../../components/etc/EzDialog.vue';
import TooltipBtn from '../../components/etc/TooltipBtn.vue';
import BasejobprocesstypeFrom from './JobComponent/BasejobprocesstypeFrom.vue';
import BasejobprocesstypeliFrom from './JobComponent/BasejobprocesstypeliFrom.vue';

export default {
    components: { TooltipBtn, EzDialog, BasejobprocesstypeFrom, BasejobprocesstypeliFrom,  },
    name: "BasejobProcesstype",
    mounted() {
        this.init();
    },
    data() {
        return {
            headers: [
                {text: 'No',  value: 's_sort', sortable: false, align:'center', width: "10px"},
                {text: '공정유형코드',  value: 'c_ptype', sortable: false, align:'left', },
                {text: '공정유형명',  value: 'n_ptype', sortable: false, align:'left', },
                // {text: '설명',  value: 't_remark', sortable: false, align:'left', },                
                {text: '사용',  value: 'f_use', sortable: false, align:'center'},                
            ],
            progresstype: [],
            typeitem: [],           
            search: '',
            isLoad: false,
            typeTitle: "Code",
            headersDT: [
                {text: 'No',  value: 's_sort', sortable: false, align:'center', width: "10px"},
                {text: '공정코드',  value: 'c_process', sortable: false, align:'left', },
                {text: '공정명',  value: 'n_process', sortable: false, align:'left', },
                {text: '작업일수',  value: 'm_wday', sortable: false, align:'center', },
                {text: '첫공정',  value: 'f_jobs', sortable: false, align:'center', },
                {text: '마지막공정',  value: 'f_jobf', sortable: false, align:'center', },
                {text: '외주',  value: 'f_jobo', sortable: false, align:'center', },                
            ],
            progresstypelis: [],
            progresstypeli: [],
            typeliitem: [],
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
            this.typeTitle = this.typeitem.c_ptype ? 'Code : ' + this.typeitem.c_ptype +'/' + this.typeitem.n_ptype : 'Code' ;
            this.progresstypeli = this.progresstypelis.filter((item) => {
                return item.c_ptype == this.typeitem.c_ptype && item.c_com == this.typeitem.c_com;
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
            this.typeitem = null;
        },


        async addDetail() {
            if (!this.typeitem) return;
            if (!this.typeitem.c_ptype) return;            

            this.isLoad = true;     
            this.typeliitem = null;
            this.$refs.dialogLi.open();
        },
        async delDetail() {
            
        },
        rowSelectLI :function (item, row) {    
            row.select(true);            
            this.typeliitem = item;            
        },
        async showRowInfoLI(event, { item }) {
            this.isLoad = true;     
            this.typeliitem = item;
            // this.$refs.dialog.open();
        },
        async saveTypeLi(form) {
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