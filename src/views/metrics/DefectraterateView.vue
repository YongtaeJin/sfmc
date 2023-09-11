<template>
    <v-container fluid>        
       <v-toolbar height="40px" background-color="primary" dark>
           <v-toolbar-title>불양율 분석</v-toolbar-title>
           <v-spacer/>
           
           <tooltip-btn label="조회" @click="view"><v-icon>mdi-magnify</v-icon></tooltip-btn>
          
       </v-toolbar> 
       <v-card style="display: flex; height: 34px; " class="my-card text-input-blue my-text-fontsize  "> 
           <div style="display: flex;">
               <div style="width: 70px;"><v-text-field value="  생산예정일 : " readonly dense hide-details class="no-padding"/></div>                
               <input-dateft v-model="form.sDate1" :value2.sync="form.sDate2"/>                
               <!-- <div style="width: 56px;"><v-text-field value="    발주처 : " readonly dense hide-details class="no-padding"/></div>
               <div style="width: 100px;"><v-text-field v-model="form.sVend" dense hide-detail class="text-input-blue no-padding" /></div> -->
           </div>
        </v-card>
        <v-row>
            <v-col>
                <v-toolbar height="25px" color="accent" >
                    <v-toolbar-title>공정별</v-toolbar-title>                    
                </v-toolbar>
                <v-data-table ref="table" :headers="Head1" :items="headItem1" 
                    item-key="c_process" single-select v-model="selectedM1" @click:row="rowSelectHead1" 
                    :items-per-page="-1" hide-default-footer :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" 
                    class="elevation-1 text-no-wrap" height="200px" max-height="200px" > 
                    <template v-slot:[`item.p_per`]="{ item }">                        
                        <v-progress-linear :value="item.p_per"  color="red" height="18">                        
                            <strong>{{ item.p_per }}%</strong>                        
                        </v-progress-linear>
                    </template>
                </v-data-table>   
            </v-col>
            <v-col>
                <v-toolbar height="25px" color="accent" >
                    <v-toolbar-title>품목별</v-toolbar-title>                    
                </v-toolbar>
                <v-data-table ref="table2" :headers="Head2" :items="headItem2" 
                    item-key="c_item" single-select v-model="selectedM2" @click:row="rowSelectHead2" 
                    :items-per-page="-1" hide-default-footer :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" 
                    class="elevation-1 text-no-wrap" height="200px" max-height="200px" > 
                    <template v-slot:[`item.p_per`]="{ item }">                        
                        <v-progress-linear :value="item.p_per"  color="red" height="18">                        
                            <strong>{{ item.p_per }}%</strong>                        
                        </v-progress-linear>
                    </template>
                </v-data-table>   
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-toolbar height="25px" color="accent" >
                    <v-toolbar-title>불량 List</v-toolbar-title>                    
                </v-toolbar>
            </v-col>
        </v-row>
   </v-container>  
</template>

<script>
import TooltipBtn from '../../components/etc/TooltipBtn.vue';
import InputDateft from '../../components/InputForms/InputDateft.vue';
import { comma, getDate, dateToKorean, numberToKorean, amtToKorean } from '../../../util/lib';
export default {
   components: { InputDateft, TooltipBtn },
   name: "DefectrateRate",
   mounted() {        
       this.init();
   },    
   data() {
       return {
           comma, 
           form : {sDate1:"", sDate2:"", sVend:"",},
           Head1: [
                {text: '공정코드',  value: 'c_process', sortable: false, align:'center', width: "50px"},                
                {text: '공정명',    value: 'n_process', sortable: false, align:'center', width: "60px"},
                {text: '지시수량',  value: 'm_cnt', sortable: false, align:'center', width: "50px"},
                {text: '불량수량',  value: 'm_err', sortable: false, align:'center', width: "50px" },                
                {text: '불량률',    value: 'p_per', sortable: false, align:'center', width: "50px"},
            ],
            Head2: [
                {text: '품목코드',  value: 'c_item', sortable: false, align:'center', width: "50px"},                
                {text: '품목명',    value: 'n_item', sortable: false, align:'center', width: "100px"},
                {text: '지시수량',  value: 'm_ordcnt', sortable: false, align:'center', width: "50px"},
                {text: '불량수량',  value: 'm_err', sortable: false, align:'center', width: "50px" },                
                {text: '불량률',    value: 'p_per', sortable: false, align:'center', width: "50px"},
            ],
            headItem1:[], headItem1Info:[], selectedM1: [], headItem2:[], headItem2Info:[], selectedM2: [],
       }
   },
   methods: {
        async init() {
            this.form.sDate1 = getDate(-365, 1);
            await this.view();
        },
        async view() {
            this.headItem1 = await this.$axios.post(`/api/metrics/getDefectraterate`, this.form); 
            this.headItem2 = await this.$axios.post(`/api/metrics/getDefectraterate2`, this.form); 

        },
        rowSelectHead1 :function (item, row) {                  
            this.headItem1Info = item;  
            if (row) {
                row.select(true) 
            } else {
                this.selectedM1 = [item]
            }
        },
        rowSelectHead2 :function (item, row) {                  
            this.headItem2Info = item;  
            if (row) {
                row.select(true) 
            } else {
                this.selectedM2 = [item]
            }
        },
   },

}
</script>

<style>

</style>