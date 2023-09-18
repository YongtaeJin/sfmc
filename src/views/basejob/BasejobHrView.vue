<template>
    <v-container fluid>        
        <v-toolbar height="40px" background-color="primary" dark>
            <v-toolbar-title>사원관리</v-toolbar-title>
            <v-spacer/>
            
            <tooltip-btn label="조회" @click="view"><v-icon>mdi-magnify</v-icon></tooltip-btn>
            <tooltip-btn label="등록" @click="add"><v-icon>mdi-plus</v-icon></tooltip-btn>
            <tooltip-btn label="삭제" @click="del"><v-icon>mdi-minus</v-icon></tooltip-btn>
            <tooltip-btn label="저장" @click="save"><v-icon>mdi-content-save-outline</v-icon></tooltip-btn>
            
        </v-toolbar> 
        
        <v-data-table ref="table" :headers="masterHead" :items="masters" @click:row="rowSelectMaster" 
            item-key="i_hrbaseser" single-select v-model="selectedM"
            hide-default-footer :items-per-page="-1" :item-class= "row_classes" 
            class="elevation-1 text-no-wrap" :height="iframeHeight"  > 

            <template v-slot:[`item.s_sort`]="{ item }">
                <v-text-field v-model="item.s_sort" @input="onChange" v-if="item.i_hrbaseser === masterinfo.i_hrbaseser" dense hide-details class="my-text-field" />
                <span v-else>{{item.s_sort}}</span>
            </template>
            <template v-slot:[`item.i_empno`]="{ item }">
                <v-text-field v-model="item.i_empno" @input="onChange" v-if="item.i_hrbaseser === masterinfo.i_hrbaseser" dense hide-details class="my-text-field" />
                <span v-else>{{item.i_empno}}</span>
            </template>
            <template v-slot:[`item.n_empnm`]="{ item }">
                <v-text-field v-model="item.n_empnm" @input="onChange" v-if="item.i_hrbaseser === masterinfo.i_hrbaseser" dense hide-details class="my-text-field" />
                <span v-else>{{item.n_empnm}}</span>
            </template>
            <template v-slot:[`item.n_level`]="{ item }">
                <v-text-field v-model="item.n_level" @input="onChange" v-if="item.i_hrbaseser === masterinfo.i_hrbaseser" dense hide-details class="my-text-field" />
                <span v-else>{{item.n_level}}</span>
            </template>
            <template v-slot:[`item.n_dept`]="{ item }">
                <v-text-field v-model="item.n_dept" @input="onChange" v-if="item.i_hrbaseser === masterinfo.i_hrbaseser" dense hide-details class="my-text-field" />
                <span v-else>{{item.n_dept}}</span>
            </template>
            <template v-slot:[`item.t_tel`]="{ item }">
                <v-text-field v-model="item.t_tel" @input="onChange" v-if="item.i_hrbaseser === masterinfo.i_hrbaseser" dense hide-details class="my-text-field" />
                <span v-else>{{item.t_tel}}</span>
            </template>
            <template v-slot:[`item.t_mail`]="{ item }">
                <v-text-field v-model="item.t_mail" @input="onChange" v-if="item.i_hrbaseser === masterinfo.i_hrbaseser" dense hide-details class="my-text-field" />
                <span v-else>{{item.t_mail}}</span>
            </template>
            <template v-slot:[`item.t_remark`]="{ item }">
                <v-text-field v-model="item.t_remark" @input="onChange" v-if="item.i_hrbaseser === masterinfo.i_hrbaseser" dense hide-details class="my-text-field" />
                <span v-else>{{item.t_remark}}</span>
            </template>
        </v-data-table>
            
    </v-container>
    
</template>

<script>
import { mapActions } from "vuex";
import TooltipBtn from '../../components/etc/TooltipBtn.vue'
export default {
    components: { TooltipBtn },
    name: "BasejobHr",
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
            masterHead: [
                {text: 'No',     value: 's_sort',    sortable: false, align:'center', width: "40px"},                
                {text: '사번',    value: 'i_empno',  sortable: false, align:'center', width: "70px"},
                {text: '성명',    value: 'n_empnm',  sortable: false, align:'center', width: "100px" },                
                {text: '직급',    value: 'n_level',  sortable: false, align:'center', width: "80px" },
                {text: '부서',    value: 'n_dept',   sortable: false, align:'center', width: "150px" },
                {text: '연락처',  value: 't_tel',     sortable: false, align:'center', width: "120px" },
                {text: 'Email',   value: 't_mail',   sortable: false, align:'center', width: "102px" },
                {text: '기타',    value: 't_remark',  sortable: false, align:'center', width: "150px" },
            ],
            masters:[], masterinfo:[], selectedM: [],            
        }
    },
    computed: {
        getMaxNo() {            
            const max = Math.max(...this.masters.map((item) => item.s_sort));
            return isFinite(max) ? max : 0;
        },
    },
    methods: {
        ...mapActions("basejob", ["iuHrbase"]),
        adjustIframeHeight() {
        // 브라우저 창의 높이를 iframe의 높이로 설정
            const windowHeight = window.innerHeight;
            this.iframeHeight = windowHeight - 200;           
        },
        async init() {
            this.view()
        },
        async view() {
            this.masterinfo = []; this.selectedM = [];
            this.masters =  await this.$axios.get(`/api/basejob/getHrbase`);
           
        },
        async add() {
            const obj = {};
            obj.c_com        = this.$store.state.user.member.c_com;
            obj.i_hrbaseser  = Date.now(); 
            obj.s_sort       = this.getMaxNo + 1;
            obj.i_empno      = "";
            obj.n_empnm      = "";
            obj.n_dept       = "";
            obj.n_level      = "";
            obj.t_tel        = "";
            obj.t_mail       = "";            
            obj.t_remark     = "";
            obj.f_edit       = "1";
            obj.f_editold    = "1";
            const idx = this.masters.push(obj);            
        },
        async del() {
            if(!this.masterinfo || this.masterinfo.i_hrbaseser == undefined ) return;
            const idx = this.masters.indexOf(this.masterinfo);
            if (idx > -1) {                
                if (this.masters[idx].f_editold == "0") {
                    this.masters[idx].f_edit = this.masters[idx].f_edit === "2" ? "1": "2";                    
                } else {
                    this.masters.splice(idx, 1);
                }                
            }
        },
        async save() {
            const data = await this.iuHrbase(this.masters);            
            if (data) {
                for (let i = this.masters.length - 1; i >= 0; i--) {
                    if (this.masters[i].f_edit == "2" ) {
                        this.masters.splice(i, 1);
                    };
                }
                this.masters.forEach((row, index) => { 
                    // row.m_sort = index + 1;
                    row.f_edit = "0";
                    row.f_editold = "0";
                });
                this.$toast.info(`저장 하였습니다.`);                
            }

        },
        async rowSelectMaster(item, row) {
            if(this.masterinfo.i_hrbaseser == item.i_hrbaseser) return;    
            this.masterinfo = item;
            if (row) { row.select(true) } else { this.selectedM = [item] };            
        },

        onChange() {
            const idx = this.masters.indexOf(this.masterinfo);
            if (idx > -1) {
                if (this.masters[idx].f_edit == "0" ) this.masters[idx].f_edit = '1';                
            };
        },
        row_classes(item) {
            if (item.f_edit == "2") {
                return "orange";
            } 
        },
        getColor (data) {
            return data == "3" ? 'red' : data == "4" ? 'blue' : 'green';
        },
    }
}
</script>

<style>

</style>