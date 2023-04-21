<template>
    <v-container fluid>
        <v-toolbar height="40px" background-color="primary" dark>
            <v-toolbar-title>견적 관리</v-toolbar-title>
            <v-spacer/>
            <tooltip-btn label="조회" @click="select"><v-icon>mdi-magnify</v-icon></tooltip-btn>
        </v-toolbar>
        <v-row  >
            <v-col col="12" sm="4" md="4">
                <v-data-table :headers="master" :items="estimates" @click:row="rowSelectMaster" 
                    item-key="i_ser" single-select
                    :items-per-page="20" :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" 
                    class="elevation-1" height="600px"> 
                </v-data-table>
            </v-col>
            <v-col col="12" sm="8" md="8">
                <v-card color="grey lighten-4">
                <v-row no-gutters class="my-text-field" >
                    <v-col col="8" sm="1" md="1"><v-text-field value="견적번호" readonly dense hide-details class="text-input-redbrg"/></v-col>
                    <v-col col="8" sm="2" md="2"><v-text-field v-model="estimate.i_estno"  dense hide-details /></v-col>
                    
                    <v-col col="8" sm="1" md="1"><v-text-field value="견적상태" readonly dense hide-details class="text-input-redbrg"/></v-col>
                    <v-col col="8" sm="2" md="2"><v-text-field v-model="estimate.f_status" readonly dense hide-details class="text-input-red"/></v-col>
                </v-row>
                <v-row no-gutters class="my-text-field">
                    <v-col col="8" sm="1" md="1"><v-text-field value="견적명" readonly dense hide-details class="text-input-redbrg"/> </v-col>
                    <v-col col="8" sm="6" md="6"><v-text-field v-model="estimate.n_estnm" dense hide-details /> </v-col>
                </v-row>
                <v-row no-gutters class="my-text-field">
                    <v-col col="8" sm="1" md="1"><v-text-field value="견적일" readonly dense hide-details class="text-input-bluebrg"/> </v-col>
                    <v-col col="8" sm="2" md="2"><v-text-field v-model="estimate.s_date" dense hide-details /> </v-col>
                    <v-col col="8" sm="1" md="1"><v-text-field value="유효일" readonly dense hide-details class="text-input-bluebrg"/> </v-col>
                    <v-col col="8" sm="2" md="2"><v-text-field v-model="estimate.s_date2" dense hide-details /> </v-col>
                    <v-col col="8" sm="1" md="1"><v-text-field value="납기일" readonly dense hide-details class="text-input-bluebrg"/> </v-col>
                    <v-col col="8" sm="2" md="2"><v-text-field v-model="estimate.s_date3" dense hide-details /> </v-col>
                </v-row>
                <v-row no-gutters class="my-text-field">
                    <v-col col="8" sm="1" md="1"><v-text-field value="수신자" readonly dense hide-details class="text-input-bluebrg"/> </v-col>
                    <v-col col="8" sm="2" md="2"><v-text-field v-model="estimate.n_rname" dense hide-details /> </v-col>
                    <v-col col="8" sm="1" md="1"><v-text-field value="연락처" readonly dense hide-details class="text-input-bluebrg"/> </v-col>
                    <v-col col="8" sm="2" md="2"><v-text-field v-model="estimate.t_rtel" placeholder="전화번호" dense hide-details /> </v-col>
                    <v-col col="8" sm="1" md="1"><v-text-field value="E-Mail" readonly dense hide-details class="text-input-bluebrg"/> </v-col>
                    <v-col col="8" sm="2" md="2"><v-text-field v-model="estimate.t_remail" placeholder="E-Mail" dense hide-details /> </v-col>
                    
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

                <v-toolbar height="35px" color="accent" >
                    <v-toolbar-title>견적 품목 List</v-toolbar-title>
                    <v-spacer/>                       
                    <tooltip-btn label="추가" @click="addDetail" fab x-small><v-icon>mdi-plus</v-icon></tooltip-btn>            
                    <tooltip-btn label="삭제" @click="delDetail" fab x-small><v-icon>mdi-minus</v-icon></tooltip-btn>
                </v-toolbar>
                <v-data-table :headers="detail" :items="itmelits" @click:row="rowSelectDetail" 
                    item-key="i_ser" single-select
                    :items-per-page="20" :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" 
                    class="elevation-1" height="414px"> 
                </v-data-table>
            </v-col>
        </v-row>
    </v-container>
</template>




<script>
import qs from "qs";
import { mapActions } from "vuex";
import EzDialog from '../../components/etc/EzDialog.vue';
import TooltipBtn from '../../components/etc/TooltipBtn.vue';
import validateRules from "../../../util/validateRules";

export default {
    components: { TooltipBtn, EzDialog },
    name: "Salesestimate",
    mounted() {
        this.init();
    },
    data() {
        return {
            master: [
                {text: '견적번호',  value: 'i_estno', sortable: false, align:'center', width: "65px"},                
                {text: '상태',  value: 'f_status', sortable: false, align:'center', width: "15px"},
                {text: '고객사',    value: 'n_vend', sortable: false, align:'center', width: "75px" },
                {text: '견적금액',  value: 'a_estamt', sortable: false, align:'center', width: "65px"},
            ],
            estimates:[],
            estimate:[],
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
            itmelits: [],
            itmelit: [],
        }
    },
    watch: {
    },
    computed: {
         rules: () => validateRules,
    },
    methods: {
        // ...mapActions("sales"),
        async init() {
            this.select();
        },
        async select() {
            this.estimates = await this.$axios.get(`/api/sales/getSaleEstimate`); 
           
        },
        rowSelectMaster :function (item, row) {            
            row.select(true);            
            this.estimate = item;
            // this.c_ptype = this.typeitem.c_ptype;
            // this.typeTitle = this.typeitem.c_ptype ? 'Code : ' + this.typeitem.c_ptype +'/' + this.typeitem.n_ptype : 'Code' ;
            // this.progresstypeli = this.progresstypelis.filter((item) => {
            //     return item.c_ptype == this.typeitem.c_ptype && item.c_com == this.typeitem.c_com;
            // });   
            // this.notProcSeletc();
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
    }

}
</script>

<style>

</style>