<template>
    <v-container fluid>
    <v-toolbar height="40px" background-color="primary" dark>
        <v-toolbar-title>라우팅 관리</v-toolbar-title>
        <v-spacer/>
        <v-text-field v-model="search" ense single-line hide-details/>
        <tooltip-btn label="라우딩 조회" @click="fetch"><v-icon>mdi-magnify</v-icon></tooltip-btn>            
        <tooltip-btn label="라우딩 등록" @click="addRouter"><v-icon>mdi-plus</v-icon></tooltip-btn>            
        <tooltip-btn label="라우딩 삭제" @click="delRouter"><v-icon>mdi-minus</v-icon></tooltip-btn>
    </v-toolbar>
    <v-row>
        <v-col col="12" sm="4" md="4">
            <v-data-table :headers="headers" :items="routes" @click:row="rowSelect" @dblclick:row="showRowInfo" 
                item-key="c_item" single-select
                v-model="selected1"
                :items-per-page="-1"  hide-default-footer :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" 
                class="elevation-1 text-no-wrap" :height="iframeHeight">  

                <template v-slot:[`item.f_use`]="{ item }">
                    <v-chip x-small :color="getColor(item.f_use)" dark>
                        {{ item.f_use == 'Y' ? '사용' : '중지' }}
                    </v-chip>
                </template>
            </v-data-table>
        </v-col>

        <v-col col="12" sm="8" md="8">
            <v-card >
                <table class="type07">
                    <thead><tr><th scope="row">품명</th><td v-if="route" >[{{ route.c_item}}] {{route.n_item}}</td></tr></thead>
                    <thead><tr><th scope="row">공정유형</th><td v-if="route">[{{route.c_ptype}}] {{route.n_ptype}}</td></tr></thead>
                    <thead><tr><th scope="row">비고</th><td v-if="route">{{route.t_remark}}</td></tr></thead>
                </table>
            </v-card>
            <v-card>
                <v-toolbar height="40px" background-color="primary" >
                    <!-- <v-toolbar-title>{{ typeTitle }}</v-toolbar-title> -->
                    <v-spacer/>                       
                    <tooltip-btn label="공정추가" @click="addDetail" fab x-small><v-icon>mdi-plus</v-icon></tooltip-btn>            
                    <tooltip-btn label="공정삭제" @click="delDetail" fab x-small><v-icon>mdi-minus</v-icon></tooltip-btn>
                </v-toolbar>                
                <!-- @dblclick:row="showRowInfoDetail" -->
                <v-data-table :headers="headersDetail" :items="routesProc" @click:row="rowSelectDetial" 
                    item-key="i_ser" single-select 
                    v-model="selected2"
                    :items-per-page="-1"  hide-default-footer :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" 
                    class="elevation-1 text-no-wrap" :height="iframeHeight - 110">  

                    <template v-slot:[`item.s_sort`]="{ item }">
                        <div @dblclick="showRowInfoDetail()"> {{ item.s_sort }} </div>
                    </template>
                    <template v-slot:[`item.c_process`]="{ item }">
                        <div @dblclick="showRowInfoDetail()"> {{ item.c_process }} </div>
                    </template>
                    <template v-slot:[`item.n_process`]="{ item }">
                        <div @dblclick="showRowInfoDetail()"> {{ item.n_process }} </div>
                        <!-- <div @dblclick="showRowInfoDetail()"> {{getProccessName(item.c_process)}} </div> -->
                    </template>
                    <template v-slot:[`item.m_whour`]="{ item }">
                        <div @dblclick="showRowInfoDetail()"> {{ item.m_whour }} </div>                     
                    </template>
                    <template v-slot:[`item.f_jobs`]="{ item }">
                        <div @dblclick="handleDoubleClick(item, 'f_jobs')">
                        <v-icon v-if="item.f_jobs=='Y'" small color=#008000> mdi-check </v-icon>
                        <v-icon v-else x-small >mdi-minus</v-icon>
                        </div>                       
                    </template>
                    <template v-slot:[`item.f_jobf`]="{ item }">
                        <div @dblclick="handleDoubleClick(item, 'f_jobf')">
                        <v-icon v-if="item.f_jobf=='Y'" small color=#008000> mdi-check </v-icon>
                        <v-icon v-else x-small >mdi-minus</v-icon>
                        </div>
                    </template> 
                    <template v-slot:[`item.f_jobo`]="{ item }">
                        <div @dblclick="handleDoubleClick(item, 'f_jobo')">
                        <v-icon v-if="item.f_jobo=='Y'" small color=#008000> mdi-check </v-icon>
                        <v-icon v-else x-small >mdi-minus</v-icon>                        
                        </div>
                    </template>                    
                </v-data-table>
            </v-card>
        </v-col>
    </v-row>

    <ez-dialog ref="dialog" label="라우팅 등록(수정)" persistent @onClose="close" width="400px">
        <basejobroute-form
            :data="route" :keyCheckItem="keyCheckRoute" :isLoad="isLoad" :s_sort=getMaxNo :itemList="itemLists" :procList="procLists" 
            @onSave="saveRouter" >
        </basejobroute-form>
    </ez-dialog>
    
    <ez-dialog ref="dialogLi" label="라우팅 품목 추가/삭제" persistent @onClose="closeLi" width="400px">
        <basejobrouteli-from :data="procDetail" :isLoad="isLoad" :s_sort=getMaxNo 
            :prcoess="prcoess" :route="route" @onSave="saveRouterProc">
        </basejobrouteli-from>
    </ez-dialog>

    </v-container>
</template>

<script>
import qs from "qs";
import { mapActions } from "vuex";
import EzDialog from '../../components/etc/EzDialog.vue';
import TooltipBtn from '../../components/etc/TooltipBtn.vue';
import BasejobrouteForm from './JobComponent/BasejobrouteForm.vue';
import BasejobrouteliFrom from './JobComponent/BasejobrouteliFrom.vue';

export default {
    components: { TooltipBtn, EzDialog, BasejobrouteForm, BasejobrouteliFrom },
    name: "BasejobRoute",
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
                // {text: 'No',  value: 's_sort', sortable: false, align:'center', width: "50px"},
                {text: '품번',  value: 'c_item', sortable: false,  align:'center'},
                {text: '품명',  value: 'n_item', sortable: false, },
                {text: '사용',  value: 'f_use', sortable: false, align:'center'},
                
            ],
            routes: [],
            route: [],
            search: '',
            isLoad: false,
            itemLists: [],
            prcoess: [],    
            procLists: [],
            headersDetail: [
                {text: 'No',  value: 's_sort', sortable: false, align:'center', width: "35px"},                
                {text: '공정코드',  value: 'c_process', sortable: false, align:'center', },
                {text: '공정명',  value: 'n_process', sortable: false, align:'center', },
                {text: '작업일',  value: 'm_whour', sortable: false, align:'center',  width: "70px"},
                {text: '첫공정',  value: 'f_jobs', sortable: false, align:'center', width: "70px" },
                {text: '마지막공정',  value: 'f_jobf', sortable: false, align:'center',  width: "70px"},
                {text: '외주',  value: 'f_jobo', sortable: false, align:'center',  width: "70px"},                 
            ],
            routesProcs: [],
            routesProc: [],
            procDetail: [],
            temp: [],

            selected1: [],
            selected2: [],
        }
    },
    watch: {
    },
    computed: {
        getMaxNo() {            
            const max = Math.max(...this.routesProc.map((item) => item.s_sort));
            return isFinite(max) ? max : 0;
        },       
    },
    methods: {
        ...mapActions("basejob", ["duplicateRouteCheck", "iuBaseRoute", "iuBaseRouteProc"]),
        adjustIframeHeight() {
        // 브라우저 창의 높이를 iframe의 높이로 설정
            const windowHeight = window.innerHeight;
            this.iframeHeight = windowHeight - 200;           
        },
        getColor (yn) {            
            return yn == "N" ? 'red' : 'green';
        },
        getProccessName(data) {
            var find = this.prcoess.find(e => e.c_process === data);
            return find.n_process;
        },
        async init() {
            this.fetch();
            this.prcoess = await this.$axios.get(`/api/basejob/getUseProcess`); 
            this.procLists = await this.$axios.get(`/api/basejob/getUseProcessList`); 
        },
        async fetch() {
            const where = { search: this.search.trim() };
            const query = qs.stringify(where);

            if (this.routesProcs) this.routesProcs.splice(0); 
            if (this.routesProc) this.routesProc.splice(0); 
            if (this.itemLists) this.itemLists.splice(0); 
            if (this.routes) this.routes.splice(0); 

            this.selected1 = [];
            this.selected2 = [];            

            this.itemLists = await this.$axios.get(`/api/basejob/getNotItemList`);
            this.routes = await this.$axios.get(`/api/basejob/getBaseRoute?${query}`);
            this.routesProcs = await this.$axios.get(`/api/basejob/getBaseRouteProc`);
        },        
        rowSelect :function (item, row) {            
            row.select(true);            
            this.route = item;            
            this.routesProc = this.routesProcs.filter((item) => {
                return item.c_item == this.route.c_item && item.c_com == this.route.c_com;
            }); 
        },
        async delRouter() {            
            const idx = this.routes.indexOf(this.route);
            if (idx < 0) return;
            const result = await this.$ezNotify.confirm(
			 	`<b>라우팅 품번코드 : ${this.route.c_item}</b> 삭제 하시겠습니까 ?`,
			 	`라우팅 삭제`,
			 	{icon : 'mdi-delete', iconColor: 'red'}
			);
            if(!result) return;
            const data = await this.$axios.delete(`/api/basejob/delBaseRoute/${this.route.c_com}/${this.route.c_item}`);
            if(data) { 
                this.routes.splice(idx, 1);
                this.$toast.info(`[${this.route.c_item}] 삭제 하였습니다.`);

                for (var i = this.routesProcs.length - 1; i >= 0; i--) {
                    if (this.routesProcs[i].c_item == this.route.c_item) this.routesProcs.splice(i, 1);
                }
                this.selected1 = [];
                this.selected2 = [];  
                this.routesPro = null;
                this.procDetail = null;                
            } 
        },
        async keyCheckRoute() {

        },
        async saveRouter(form) {
            this.isLoading = true;
            const data = await this.iuBaseRoute(form);
            this.isLoading = false;
            if (data) {                
                this.$toast.info(`[${data.c_item}] 저장 하였습니다.`);
                var idx = this.routes.indexOf(this.route);                
                idx >= 0 ? this.routes.splice(idx, 1, data) : this.routes.push(data);
                
                idx = this.itemLists.findIndex(e => e.c_item == data.c_item);                
                if (idx >= 0 ) this.itemLists.splice(idx, 1);

                // routesProcs 갱신작업                
                for (var i = this.routesProcs.length - 1; i >= 0; i--) {
                    if (this.routesProcs[i].c_item == data.c_item) this.routesProcs.splice(i, 1);
                }
                this.temp = await this.$axios.get(`/api/basejob/getBaseRouteProc/${data.c_com}/${data.c_item}`);                
                this.temp.forEach(item => {this.routesProcs.push(item);});    
                this.routesProc = this.routesProcs.filter((item) => {
                    return item.c_item == data.c_item && item.c_com == data.c_com;
                });    
            }
            this.$refs.dialog.close();            
        },
        async addRouter() {
            this.isLoad = true;
            this.route = null;
            this.$refs.dialog.open();

        },
        async showRowInfo(event, { item }) {
            this.isLoad = true;
            this.route = item;
            this.$refs.dialog.open();
        },

        async addDetail() {
            this.isLoad = true;
            this.procDetail = null;
            this.$refs.dialogLi.open();
        },
        async delDetail() {
            const idx = this.routesProcs.indexOf(this.procDetail);
            if (idx < 0) return;
            const result = await this.$ezNotify.confirm(
			 	`<b>라우팅 공정코드 : ${this.procDetail.c_process}</b> 삭제 하시겠습니까 ?`,
			 	`공정 삭제`,
			 	{icon : 'mdi-delete', iconColor: 'red'}
			);
            if(!result) return;
            const data = await this.$axios.delete(`/api/basejob/delBaseRouteProc/${this.procDetail.c_com}/${this.procDetail.c_item}/${this.procDetail.i_ser}`);
            if(data) { 
                this.routesProcs.splice(idx, 1);
                this.$toast.info(`[${this.route.c_item}] 삭제 하였습니다.`);
                const idx1 = this.routesProc.indexOf(this.procDetail);
                if(idx >= 0 ) this.routesProc.splice(idx1, 1);                
            }       
        },
        
        async showRowInfoDetail() {
            this.isLoad = true;
            this.$refs.dialogLi.open();
        },
        rowSelectDetial :function (item, row) { 
            row.select(true);            
            this.procDetail = item;
        },
        
        close() { this.isLoad = false },
        closeLi() { this.isLoad = false },

        async handleDoubleClick(item, col) {
            var idx = this.routesProcs.indexOf(item);                
            switch (col) {
                case 'f_jobs' :
                    item.f_jobs = item.f_jobs == 'Y' ? 'N' : 'Y';
                    break;
                case 'f_jobf' :
                    item.f_jobf = item.f_jobf == 'Y' ? 'N' : 'Y';
                    break;
                case 'f_jobo' :
                    item.f_jobo = item.f_jobo == 'Y' ? 'N' : 'Y';
                    break;
            } 
            // 변경내용 저장            
            if (idx >= 0 ) this.routesProcs.splice(idx, 1, item);
            await this.iuBaseRouteProc(item);
            this.procDetail = item;
        },
        async saveRouterProc(form) {
            this.isLoading = true;        
            const data = await this.iuBaseRouteProc(form);
            this.isLoading = false;
            if (data) {
                this.$toast.info(`저장 하였습니다.`);
                var idx = this.routesProcs.indexOf(this.procDetail); 
                if (idx >= 0 ) this.routesProcs.splice(idx, 1, data);
                var idx = this.routesProc.indexOf(this.procDetail); 
                if (idx >= 0 ) {
                    this.routesProc.splice(idx, 1, data);
                } else {
                    this.routesProcs.push(data);
                    this.routesProc.push(data);
                }
            }
            this.$refs.dialogLi.close();
        }    
    },    
}
</script>

<style>

</style>