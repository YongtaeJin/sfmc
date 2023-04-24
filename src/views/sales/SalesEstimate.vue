<template>
    <v-container fluid>
        <v-toolbar height="40px" background-color="primary" dark>
            <v-toolbar-title>견적 관리</v-toolbar-title>
            <v-spacer/>            
            <tooltip-btn label="견적 조회" @click="select"><v-icon>mdi-magnify</v-icon></tooltip-btn>
            <tooltip-btn label="견적 작성" @click="addEstimates"><v-icon>mdi-plus</v-icon></tooltip-btn>
            <tooltip-btn label="견적 삭제" @click="delEstimates"><v-icon>mdi-minus</v-icon></tooltip-btn>
            <tooltip-btn label="견적 저장" @click="saveEstimates"><v-icon>mdi-content-save-outline</v-icon></tooltip-btn>
            <tooltip-btn label="견적 저장" @click="printEstimates"><v-icon>mdi-printer</v-icon></tooltip-btn>
        </v-toolbar>      
        <v-card class="my-card">
            <v-row no-gutters class="my-text-field">
                <v-col col="12" sm="1" md="1"><v-text-field value="견적기간" readonly dense hide-details class="text-input-blue"/></v-col>
                <v-col col="12" sm="2" md="2"><input-date-2 v-model="form.sDate1" /></v-col>
                <v-col col="12" sm="2" md="2"><input-date-2 v-model="form.sDate2" /></v-col>
                <v-col col="12" sm="1" md="1"><v-text-field value="고객사" readonly dense hide-details class="text-input-blue"/></v-col>
                <v-col col="12" sm="3" md="3"><v-text-field v-model="form.sVend" dense hide-detailsclass="text-input-blue" /></v-col>
                <v-col col="12" sm="1" md="1"><v-text-field value="견적상태" readonly dense hide-details class="text-input-blue"/> </v-col>
                <v-col col="12" sm="2" md="2">
                    <v-select v-model="form.sStatus"
                        :items="ESTI001" item-text="label" item-value="value"                        
                        class="my-text-field" dense
                        >                       
                    </v-select></v-col>
            </v-row>
            <v-row no-gutters class="my-text-field">
                <v-col col="12" sm="1" md="1"><v-text-field value="견적번호" readonly dense hide-details class="text-input-blue"/></v-col>
                <v-col col="12" sm="4" md="4"><v-text-field v-model="form.sEsimate" dense hide-details class="my-text-field" /></v-col>
            </v-row>
            <v-row no-gutters class="my-text-fieldend"><v-col></v-col></v-row>
            <v-row no-gutters class="my-text-fieldend"><v-col></v-col></v-row>
        </v-card>  

        <v-row >
            <v-col col="12" sm="4" md="4">
                <v-data-table :headers="master" :items="estimates" @click:row="rowSelectMaster" 
                    item-key="i_ser" single-select v-model="selectedM"
                    :items-per-page="20" :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" 
                    class="elevation-1" max-height="600px" > 
                </v-data-table>
            </v-col>

            <v-col col="12" sm="8" md="8">
                <v-form @submit.prevent="save" ref="form" v-model="valid" lazy-validation>
                <v-card color="grey lighten-4">
                <v-row no-gutters class="my-text-field" >
                    <v-col col="8" sm="1" md="1"><v-text-field value="견적번호" readonly dense hide-details class="text-input-redbrg"/></v-col>
                    <v-col col="8" sm="2" md="2"><v-text-field v-model="estimate.i_estno"  dense hide-details /></v-col>
                    
                    <v-col col="8" sm="1" md="1"><v-text-field value="견적상태" readonly dense hide-details class="text-input-redbrg"/></v-col>
                    <v-col col="8" sm="2" md="2">
                        <v-select v-model="estimate.f_status"
                        :items="ESTI001" item-text="label" item-value="value" 
                        :rules="[rules.require({ label: '견적상태' })]"                         
                        class="my-text-field" dense >                       
                        </v-select></v-col>                    
                </v-row>
                <v-row no-gutters class="my-text-field">
                    <v-col col="8" sm="1" md="1"><v-text-field value="견적명" readonly dense hide-details class="text-input-redbrg"/> </v-col>
                    <v-col col="8" sm="6" md="6"><v-text-field v-model="estimate.n_estnm" dense hide-details /> </v-col>
                </v-row>
                <v-row no-gutters class="my-text-field">
                    <v-col col="8" sm="1" md="1"><v-text-field value="고객사" readonly dense hide-details class="text-input-bluebrg"/> </v-col>
                    <v-col col="8" sm="4" md="4"><v-text-field v-model="estimate.c_vend" dense hide-details /></v-col>
                    <v-col col="8" sm="1" md="1"></v-col>
                </v-row>
                <v-row no-gutters class="my-text-field">
                    <v-col col="8" sm="1" md="1"><v-text-field value="견적일" readonly dense hide-details class="text-input-bluebrg"/> </v-col>
                    <v-col col="8" sm="2" md="2"><input-date-2 v-model="estimate.s_date" :rules="rules.date({required: false})" /> </v-col>                    
                    <v-col col="8" sm="1" md="1"><v-text-field value="유효일" readonly dense hide-details class="text-input-bluebrg"/> </v-col>
                    <v-col col="8" sm="2" md="2"><input-date-2 v-model="estimate.s_date2" :rules="rules.date({required: false})" /> </v-col>
                    <v-col col="8" sm="1" md="1"><v-text-field value="납기일" readonly dense hide-details class="text-input-bluebrg"/> </v-col>
                    <v-col col="8" sm="2" md="2"><input-date-2 v-model="estimate.s_date3" :rules="rules.date({required: false})" /> </v-col>

                    <!-- :rules="[rules.require({ label: 'Code' }), rules.alphaNum()]" /> -->
                </v-row>
                <v-row no-gutters class="my-text-field">
                    <v-col col="8" sm="1" md="1"><v-text-field value="수신자" readonly dense hide-details class="text-input-bluebrg"/> </v-col>
                    <v-col col="8" sm="2" md="2"><v-text-field v-model="estimate.n_rname" dense hide-details /> </v-col>
                    <v-col col="8" sm="1" md="1"><v-text-field value="연락처" readonly dense hide-details class="text-input-bluebrg"/> </v-col>
                    <v-col col="8" sm="2" md="2"><v-text-field v-model="estimate.t_rtel" placeholder="전화번호" dense hide-details /> </v-col>
                    <v-col col="8" sm="1" md="1"><v-text-field value="E-Mail" readonly dense hide-details class="text-input-bluebrg"/> </v-col>
                    <v-col col="8" sm="3" md="3"><v-text-field v-model="estimate.t_remail" placeholder="E-Mail" dense hide-details /> </v-col>                    
                </v-row>
                <v-row no-gutters class="my-text-field">
                    <v-col col="8" sm="1" md="1"><v-text-field value="담당자" readonly dense hide-details class="text-input-bluebrg"/> </v-col>
                    <v-col col="12" sm="2" md="2"><v-text-field v-model="estimate.n_rname" dense hide-details /> </v-col>
                </v-row>
                <v-row no-gutters class="my-text-field">
                    <v-col col="8" sm="1" md="1"><v-text-field value="메모" readonly dense hide-details class="text-input-bluebrg"/> </v-col>
                    <v-col col="12" sm="8" md="8"><v-text-field v-model="estimate.t_remark" dense hide-details /> </v-col>
                </v-row>
                <v-row no-gutters class="my-text-fieldend"><v-col></v-col></v-row>
                </v-card>
                </v-form>

                <v-toolbar height="35px" color="accent" >
                    <v-toolbar-title>견적 품목 List</v-toolbar-title>
                    <v-spacer/>                       
                    <tooltip-btn label="추가" @click="addDetail" fab x-small><v-icon>mdi-plus</v-icon></tooltip-btn>            
                    <tooltip-btn label="삭제" @click="delDetail" fab x-small><v-icon>mdi-minus</v-icon></tooltip-btn>
                </v-toolbar>
                <v-data-table :headers="detail" :items="itmelits" @click:row="rowSelectDetail" 
                    item-key="i_ser" single-select v-model="selectedD"
                    :items-per-page="20" :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" 
                    class="elevation-1" max-height="425px"> 
                </v-data-table>
            </v-col>           
            
        </v-row>
    </v-container>
</template>

<script>
import qs from "qs";
import { mapActions } from "vuex";
import { ESTI001 } from '../../../util/constval';
import EzDialog from '../../components/etc/EzDialog.vue';
import TooltipBtn from '../../components/etc/TooltipBtn.vue';
import validateRules from "../../../util/validateRules";
import InputDate2 from '../../components/InputForms/InputDate2.vue';

export default {
    components: { TooltipBtn, EzDialog, InputDate2 },    
    
    name: "Salesestimate",
    mounted() {
        this.init();
    },
    data() {
        return {
            ESTI001,
            valid: true,
            master: [
                {text: '견적번호',  value: 'i_estno', sortable: false, align:'center', width: "65px"},                
                {text: '상태',  value: 'f_status', sortable: false, align:'center', width: "15px"},
                {text: '고객사',    value: 'n_vend', sortable: false, align:'center', width: "75px" },
                {text: '견적금액',  value: 'a_estamt', sortable: false, align:'center', width: "65px"},
            ],
            estimates:[], estimate:[], selectedM: [],
            detail: [
                {text: '항목(품목)',  value: 'f_status', sortable: false, align:'center',},
                {text: '규격',  value: 'f_status', sortable: false},
                {text: '단위',  value: 'f_status', sortable: false},
                {text: '수량',  value: 'f_status', sortable: false},
                {text: '단가',  value: 'f_status', sortable: false},
                {text: '금액',  value: 'f_status', sortable: false},
                {text: '통화',  value: 'f_status', sortable: false, align:'center'},
                {text: '납기일',  value: 'f_status', sortable: false, align:'center'},
            ],
            itmelits: [], itmelit: [], selectedD: [],

            form : {
                sDate1:"", sDate2:"", sEsimate:"", sVend:"", sStatus:"",
            },
        }
    },
    watch: {
    },
    computed: {
         rules: () => validateRules,
    },
    methods: {
        ...mapActions("sales", ["getSaleEstimate"]),
        async init() {
            this.select();
        },
        async select() {
            this.selectedM = []; this.selectedD = [];
            this.estimate = [];
            if (this.itmelit) this.itmelit.splice(0);
            

            this.estimates = await this.$axios.post(`/api/sales/getSaleEstimate`, this.form); 
           
        },
        rowSelectMaster :function (item, row) {            
            row.select(true);            
            this.estimate = item;            
        },
        async addEstimates() {
             
        },
        async delEstimates() {

        },
        async saveEstimates() {
            this.$refs.form.validate();
            await this.$nextTick();
            if (!this.valid) return; 
            console.log('aaa');
        },
        async printEstimates() {

        },
        rowSelectDetail:function (item, row) {            
            // row.select(true);            
            // this.typeitem = item;
            // this.c_ptype = this.typeitem.c_ptype;
            // this.typeTitle = this.typeitem.c_ptype ? 'Code : ' + this.typeitem.c_ptype +'/' + this.typeitem.n_ptype : 'Code' ;
            // this.progresstypeli = this.progresstypelis.filter((item) => {
            //     return item.c_ptype == this.typeitem.c_ptype && item.c_com == this.typeitem.c_com;
            // });   
            // this.notProcSeletc();
        },
        async openVend(){

        },

        async addDetail() {

        },
        async delDetail() {

        },
    }

}
</script>

<style>
    
</style>