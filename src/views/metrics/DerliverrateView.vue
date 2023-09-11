<template>
     <v-container fluid>        
        <v-toolbar height="40px" background-color="primary" dark>
            <v-toolbar-title>납기내역</v-toolbar-title>
            <v-spacer/>
            
            <tooltip-btn label="계산서 조회" @click="view"><v-icon>mdi-magnify</v-icon></tooltip-btn>
           
        </v-toolbar> 
        <v-card style="display: flex; height: 34px; " class="my-card text-input-blue my-text-fontsize  "> 
            <div style="display: flex;">
                <div style="width: 70px;"><v-text-field value="  수주납기일 : " readonly dense hide-details class="no-padding"/></div>                
                <input-dateft v-model="form.sDate1" :value2.sync="form.sDate2"/>                
                <div style="width: 56px;"><v-text-field value="    발주처 : " readonly dense hide-details class="no-padding"/></div>
                <div style="width: 100px;"><v-text-field v-model="form.sVend" dense hide-detail class="text-input-blue no-padding" /></div>
            </div>
        </v-card>
    </v-container>  
</template>

<script>
import TooltipBtn from '../../components/etc/TooltipBtn.vue';
import InputDateft from '../../components/InputForms/InputDateft.vue';
import { comma, getDate, dateToKorean, numberToKorean, amtToKorean } from '../../../util/lib';
export default {
    components: { InputDateft, TooltipBtn },
    name: "Derliverrate",
    mounted() {        
        this.init();
    },    
    data() {
        return {
            comma, 
            form : {sDate1:"", sDate2:"", sVend:"",},
        }
    },
    methods: {
        async init() {
            this.form.sDate1 = getDate(-100, 1);
            await this.view();
        },
        async view() {

        }
    },

}
</script>

<style>

</style>