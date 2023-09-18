<template>
    <v-container fluid>
        <v-toolbar height="40px" background-color="primary" dark>
            <v-toolbar-title>사용자 관리</v-toolbar-title>
            <v-spacer/>           
            <tooltip-btn label="조회" @click="fetchData"><v-icon>mdi-magnify</v-icon></tooltip-btn>
            <tooltip-btn label="추가" @click="addUser"><v-icon>mdi-plus</v-icon></tooltip-btn>            
            <tooltip-btn label="삭제" @click="delUser"><v-icon>mdi-minus</v-icon></tooltip-btn>
        </v-toolbar>
        
        <v-data-table :headers="headers" :items="items" @click:row="rowSelect" @dblclick:row="showRowInfo" class="elevation-1 text-no-wrap" 
            item-key="i_id" single-select
            :items-per-page="-1" hide-default-footer :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" 
            :height="iframeHeight" > 
        <!-- <v-data-table :headers="headers" :items="items" @dblclick:row=showRowInfo
            v-model="selected" :single-select="true" item-key="i_id" show-select > -->
            <template v-slot:[`item.i_level`]="{ item }">                
                {{ getLvlabel(item.i_level) }}                
            </template>
        </v-data-table> 

        <ez-dialog ref="dialog" label="사용자 추가/수정" persistent @onClose="closeDialog" width="350px">           
            <user-form :data="item" :keyCheckId="keyCheckId" :isLoad="isLoad" @onSave="save">
            </user-form>            
        </ez-dialog>         
        
    </v-container>
</template>

<script>
import { mapActions } from "vuex";
import { deepCopy } from '../../../util/lib';
import { LVITEMS } from '../../../util/level';
import EzDialog from '../../components/etc/EzDialog.vue';
import TooltipBtn from '../../components/etc/TooltipBtn.vue';
import UserForm from './SystemComponent/UserForm.vue';



export default {
    components: { TooltipBtn, EzDialog, UserForm },    
    name: "Systemusers",
    
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
                {text: 'ID',  value: 'i_id', sortable: true, align:'center', },
                {text: '성명',  value: 'n_name', sortable: true, align:'center', },
                {text: '등급',  value: 'i_level', sortable: true, align:'center', width: "100px"},
                {text: '사용',  value: 'f_use', sortable: true, align:'center', width: "100px"}, 
                {text: '접속일',  value: 'd_login_at', sortable: false, align:'center', width: "150px"}, 
                {text: '생성일',  value: 'd_create_at', sortable: false, align:'center', width: "150px"}, 
                {text: '갱신일',  value: 'd_update_at', sortable: false, align:'center', width: "150px"}, 
                
                ],
            items : [],
            item: null,            
            isLoad: false,
            selected: [],
        }
    },
    watch: {
    },
    computed: {        
    },    
    methods: {
        ...mapActions("system", ["duplicateDualCheck", "iuWorkUser"]),
        adjustIframeHeight() {
        // 브라우저 창의 높이를 iframe의 높이로 설정
            const windowHeight = window.innerHeight;
            this.iframeHeight = windowHeight - 200;           
        },
        getLvlabel (lv) {            
            var i = LVITEMS.findIndex(i => i.lv == lv );
            return (lv > -1) ?  LVITEMS[i].label : lv;
            // return  lv;
        },
        rowSelect :function (item, row) {    
            row.select(true);            
            this.item = item;
            this.$emit('onSelect', item);
        },
        async init() {
            this.fetchData();
        },
        async fetchData() {
            this.items.splice(0);
            this.items = await this.$axios.get(`/api/system/worksiteusers`);            
        },
        async addUser () {       
            this.isLoad = true;     
            this.item = null;
            this.$refs.dialog.open();
        },
        async delUser () {
            // if (!this.selected.length) return; 
            const idx = this.items.indexOf(this.item);
            if (idx < 0) return;
            if (!this.item) return;

            const result = await this.$ezNotify.confirm(
			 	`<b>성명 : ${this.item.n_name}</b><br> 삭제 하시겠습니까 ? <br> 삭제한 ID는 사용 불가 합니다.`,
			 	`ID : ${this.item.i_id} 삭제`,
			 	{icon : 'mdi-delete', iconColor: 'red'}
			);
            if(!result) return;

            const data = await this.$axios.delete(`/api/system/delWorkUser/${this.item.c_com}/${this.item.i_id}`);

            if(data) this.items.splice(idx, 1);

            this.$toast.info(`[${this.item.n_name}] 삭제 하였습니다.`);
        },
        async showRowInfo(event, { item } ) {
            this.isLoad = true;
            this.item = item;            
            this.$refs.dialog.open();
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
            if (!form.p_password) delete form.p_password;
            const data = await this.iuWorkUser(form); 
            this.isLoading = false;
            if (data) {                
                this.$toast.info(`[${data.n_name}] 저장 하였습니다.`);
                const idx = this.items.indexOf(this.item);
                idx >= 0 ? this.items.splice(idx, 1, data) : this.items.push(data);
            }
            this.$refs.dialog.close();    
        },
        closeDialog() {
            this.isLoad = false;
            this.item = null;
        }
    },
}
</script>

<style>

</style>