<template>
    <v-container fluid>
        <v-toolbar height="40px" background-color="primary" dark>
            <v-toolbar-title>품목 관리</v-toolbar-title>
            <v-spacer/>
            <v-text-field v-model="search" ense single-line hide-details/>
            <tooltip-btn label="조회" @click="fatch"><v-icon>mdi-magnify</v-icon></tooltip-btn>            
            <tooltip-btn label="추가" @click="addItem"><v-icon>mdi-plus</v-icon></tooltip-btn>            
            <tooltip-btn label="삭제" @click="delItem"><v-icon>mdi-minus</v-icon></tooltip-btn>
        </v-toolbar>
        <v-data-table :headers="headers" :items="items" @click:row="rowSelect" @dblclick:row="showRowInfo" 
            item-key="c_item" single-select
            :items-per-page="20" :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" 
            class="elevation-1 text-no-wrap" height="600px">  
            <template v-slot:[`item.i_unit`]="{ item }">
                 {{ getNameUnit(item.i_unit) }}
            </template>
            <template v-slot:[`item.i_type`]="{ item }">
                 {{ getNameType(item.i_type) }}
            </template>
            <template v-slot:[`item.a_bye`]="{ item }">
                 {{ item.a_bye.toLocaleString()}}
            </template>
            <template v-slot:[`item.a_sell`]="{ item }">
                {{ item.a_sell.toLocaleString()}}
            </template>
            <template v-slot:[`item.f_use`]="{ item }">
                <v-chip x-small :color="getColor(item.f_use)" dark>
                    {{ item.f_use == 'Y' ? '사용' : '중지' }}
                </v-chip>
            </template>
        </v-data-table>
        <ez-dialog ref="dialog" label="품목 등록(수정)" persistent @onClose="close" width="500px">            
            <basejobitem-form
                :data="item" :keyCheckItem="keyCheckItem" :isLoad="isLoad" :s_sort=getMaxNo 
                :units="units" :itemtypes="itemtypes"
                @onSave="saveItem">
            </basejobitem-form>
        </ez-dialog>
    </v-container>
</template>

<script>
import qs from "qs";
import { mapActions } from "vuex";
import EzDialog from '../../components/etc/EzDialog.vue';
import TooltipBtn from '../../components/etc/TooltipBtn.vue';
import BasejobitemForm from './JobComponent/BasejobitemForm.vue';
export default {
    components: { TooltipBtn, EzDialog, BasejobitemForm },
    name: "BasejobItem",
    mounted() {
        this.init();
    },
    data() {
        return {
            headers: [
                {text: 'No',  value: 's_sort', sortable: false, align:'center', width: "50px"},
                {text: '품번',  value: 'c_item', sortable: false, align:'center', width: "100px"},
                {text: '품명',  value: 'n_item', sortable: false, align:'left', width: "30%"},
                {text: '사양',  value: 't_size', sortable: false, align:'left', width: "30%"},
                {text: '단위',  value: 'i_unit', sortable: false, align:'center', width: "60px"},
                {text: '제품타입',  value: 'i_type', sortable: false, align:'center', width: "100px"},
                {text: '구매단가',  value: 'a_bye', sortable: false, align:'right', width: "80px"},
                {text: '판매단가',  value: 'a_sell', sortable: false, align:'right', width: "80px"},
                {text: '사용',  value: 'f_use', sortable: false, align:'center', width: "60px"},
                {text: '비고',  value: 't_remark', sortable: false, align:'left',  width: "40%"},
            ],
            items: [],
            item: null,
            search: '',
            isLoad: false,
            units:[],
            itemtypes:[],            
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
        ...mapActions("basejob", ["duplicateItemCheck", "iuBaseItem"]),
        getNameUnit(data) {
            const unit = this.units.find(v => v.c_code == data);            
            return unit ? unit.n_code : '';
        },
        getNameType(data) {
            const type = this.itemtypes.find(v => v.c_code == data);            
            return type ? type.n_code : '';
        },
        async init() {
            // 단위
            const unit = {c_com: this.$store.state.user.member.c_com, c_gcode: "UNIT"};
            var query = qs.stringify(unit);
            this.units = await this.$axios.get(`/api/system/getCodeList?${query}`);
            
            // 제품타입
            const type = {c_com: this.$store.state.user.member.c_com, c_gcode: "ITEMTYPE"};
            query = qs.stringify(type);
            this.itemtypes = await this.$axios.get(`/api/system/getCodeList?${query}`);            
            
            this.fatch();
        },
        async fatch() {            
            const where = { search: this.search.trim() };
            const query = qs.stringify(where);            
            if (this.items) this.items.splice(0);            
            this.items = await this.$axios.get(`/api/basejob/getBaseItem?${query}`);      
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
			 	`<b>Code : ${this.item.c_item}</b> 삭제 하시겠습니까 ?`,
			 	`Code`,
			 	{icon : 'mdi-delete', iconColor: 'red'}
			);
            if(!result) return;
            const data = await this.$axios.delete(`/api/basejob/delBaseItem/${this.item.c_com}/${this.item.c_item}`);
            if(data) {
                this.items.splice(idx, 1);                
                this.$toast.info(`[${this.item.c_item}] 삭제 하였습니다.`);
            } 
        },
        async saveItem(form) {
            this.isLoading = true;
            const data = await this.iuBaseItem(form);
            this.isLoading = false;
            if (data) {                
                this.$toast.info(`[${data.c_item}] 저장 하였습니다.`);
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
                c_item: "c_item",
                value           
            };            
            return await this.duplicateItemCheck(payload); 
        },
        getColor (yn) {
            if(yn == "N") { return 'red'; } 
            else { return 'green';}
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