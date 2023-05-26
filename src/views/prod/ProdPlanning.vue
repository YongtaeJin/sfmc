<template>
    <v-container fluid>
        <v-toolbar height="40px" background-color="primary" dark>
            <v-toolbar-title>생산 계획</v-toolbar-title>
            <v-spacer/>
            <tooltip-btn label="조회" @click="view"><v-icon>mdi-magnify</v-icon></tooltip-btn>
            <tooltip-btn label="작성" @click="add"><v-icon>mdi-plus</v-icon></tooltip-btn>
            <tooltip-btn label="삭제" @click="del"><v-icon>mdi-minus</v-icon></tooltip-btn>
            <tooltip-btn label="저장" @click="save"><v-icon>mdi-content-save-outline</v-icon></tooltip-btn>            
        </v-toolbar> 
        <v-card style="display: flex; height: 30px; " class="my-card text-input-blue my-text-fontsize "> 
            <div style="display: flex;">
                <div style="width: 65px;"><v-text-field value="  납품예정일 : " readonly dense hide-details /></div>                
                <input-dateft v-model="form.sDate1" :value2.sync="form.sDate2"/>
                <div style="width: 65px;"><v-text-field value="  발주처 : " readonly dense hide-details /></div>
                <div style="width: 100px;"><v-text-field v-model="form.sVend" dense hide-detail sclass="text-input-blue" /></div>
            </div>
        </v-card>
    </v-container>
</template>

<script>
import InputDateft from '../../components/InputForms/InputDateft.vue'
import EzDialog from '../../components/etc/EzDialog.vue';
import TooltipBtn from '../../components/etc/TooltipBtn.vue';
import DisplayAvatar from '../../components/layout/DisplayAvatar.vue';

export default {
    // components: { TooltipBtn, EzDialog, InputDate2, InputAmt, InputNumber, ItemPop, VendPop, SalesNotestimate },
    components: { InputDateft, TooltipBtn, EzDialog, DisplayAvatar },
    data() {
        return {
            form : {
                sDate1:"", sDate2:"", sVend:"",
            },
        }
    },
    methods: {        
        async view() {

        },
        async add() {

        },
        async del() {

        },
        async save() {

        },
    }

}
</script>

<style>

</style>
