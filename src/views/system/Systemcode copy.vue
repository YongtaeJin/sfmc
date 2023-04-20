<template>   
    <v-container fluid>
        <v-toolbar height="40px" background-color="primary" dark>
            <v-toolbar-title>시스템코드 관리</v-toolbar-title>
            <v-spacer/>           
            <tooltip-btn label="조회" @click="fetchData"><v-icon>mdi-magnify</v-icon></tooltip-btn>
        </v-toolbar>
        <v-layout>
            <v-flex xs5>            
                <grpcode-form :data="grpcodes" @onSelect="grpSelect" @onshowRowInfo="grpInfo"></grpcode-form>
            </v-flex> 
            <v-flex xs7>            
                <comcode-form :data="comcode" :title="comTitle"></comcode-form>
            </v-flex>
        </v-layout>

        <!-- <ez-dialog ref="dialogGrpcode" label="Grop Code" persistent @onClose="closeGrpcode" width="350px">           
            <grpcode-detail-form :data="grpdetail" :keyCheckId="keyCheckGrp" :isLoad="isLoad" @onSave="grpSave">
                 
            </grpcode-detail-form>
        </ez-dialog>  
        
        <ez-dialog ref="dialogComcode" label="공통 Code" persistent @onClose="closeComcode" width="350px">
            <comcode-detail-form>

            </comcode-detail-form>
        </ez-dialog> -->
        
    </v-container>
</template>

<script>
import { mapActions } from "vuex";
import EzDialog from '../../components/etc/EzDialog.vue'
import TooltipBtn from '../../components/etc/TooltipBtn.vue'
import ComcodeDetailForm from './SystemComponent/ComcodeDetailForm.vue'
import ComcodeForm from './SystemComponent/ComcodeForm.vue'
import GrpcodeDetailForm from './SystemComponent/GrpcodeDetailForm.vue'
import GrpcodeForm from './SystemComponent/GrpcodeForm.vue'
export default {
  components: { GrpcodeForm, ComcodeForm, TooltipBtn, EzDialog, GrpcodeDetailForm, ComcodeDetailForm },
    name: "Systemcode",
    data() {
        return {
            grpcodes: [],
            comcodes: [],
            comcode: [],
            comTitle: "Code",
            grpdetail: null,
            comdetail: null,
            isLoad: false,
        }
    },
    mounted() {
        this.fetchData();
    },
    methods: {
        ...mapActions("system", ["duplicateGrpcodeCheck", "duplicateComcodeCheck"]),
        async fetchData() {
            // this.grpcodes = await this.$axios.get(`/api/system/grpcode`);
            // this.comcodes = await this.$axios.get(`/api/system/comcode`);
        },
        async grpSelect(grpcode) {
            this.comTitle = 'Code : '  + grpcode.c_gcode + ' / ' + grpcode.n_gcode;
            this.comcode = this.comcodes.filter((item) => {
                return item.c_gcode == grpcode.c_gcode && item.c_com == grpcode.c_com;
            });
        },
        async grpInfo(item) {
            this.isLoad = true;
            this.$refs.dialogGrpcode.open();
        },
        async keyCheckGrp(value1, value2){           
            const payload = {
                com: "c_com",
                value1, 
                grp: "c_gcode",
                value2,
            };
            return await this.duplicateGrpcodeCheck(payload); 
        },
        async comcodeSave(form) {

        },
        async comcodeInfo(item) {
            this.isLoad = true;
            this.$refs.dialogComcode.open();
        },
        async keyCheckComcode(value1, value2, value3){           
            const payload = {
                com: "c_com",
                value1, 
                grp: "c_gcode",
                value2,
                cod: "c_code",
                value3,
            };            
            return await this.duplicateComcodeCheck(payload); 
        },
        async grpSave(form) {

        },
        closeGrpcode() {
            this.isLoad = false;
        },
        closeComcode() {
            this.isLoad = false;
            
        },
    },
}
</script>

<style>

</style>