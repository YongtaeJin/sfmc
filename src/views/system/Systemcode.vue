<template>   
    <v-container fluid>
        <v-toolbar height="40px" background-color="primary" dark>
            <v-toolbar-title>시스템코드 관리</v-toolbar-title>
            <v-spacer/>           
            <tooltip-btn label="조회" @click="fetchData"><v-icon>mdi-magnify</v-icon></tooltip-btn>
        </v-toolbar>
        <v-layout>
            <v-flex xs5>            
                <grpcode-form :data="grpcodes" @onSelect="grpSelect" @onshowRowInfo="grpInfo" @onDelete="delGrpcode"></grpcode-form>
            </v-flex> 
            <v-flex xs7>            
                <comcode-form :data="comcode" :title="comTitle" @onshowRowInfo="comcodeInfo" @onDelete="delComcode"></comcode-form>
            </v-flex>
        </v-layout>

        <ez-dialog ref="dialogGrpcode" label="Grop Code" persistent @onClose="closeGrpcode" width="350px">           
            <grpcode-detail-form :data="grpdetail" :keyCheckId="keyCheckGrp" :isLoad="isLoad" :s_sort=getMaxNo @onSave="grpSave">
                 
            </grpcode-detail-form>
        </ez-dialog>  
        
        <ez-dialog ref="dialogComcode" label="공통 Code" persistent @onClose="closeComcode" width="350px">
            <comcode-detail-form :data="comdetail" :keyCheckId="keyCheckComcode" :isLoad="isLoad" :c_gcode="c_gcode" :s_sort=getComMaxNo @onSave="comcodeSave">

            </comcode-detail-form>
        </ez-dialog>
        
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
            c_gcode: "",
            grpdetail: null,            
            comdetail: null,
            isLoad: false,            
        }
    },
    mounted() {
        this.fetchData();
    },
    watch: {
        'grpcodes.s_sort'() {
            console.log("grpcodes.s_sort");
        },
    },
    computed: {
        getMaxNo() {            
            const max = Math.max(...this.grpcodes.map((item) => item.s_sort));
            return isFinite(max) ? max : 0;
        },
        getComMaxNo() {            
            const max = Math.max(...this.comcode.map((item) => item.s_sort));            
            return isFinite(max) ? max : 0;
        },
    },
    methods: {
        ...mapActions("system", ["duplicateGrpcodeCheck", "duplicateComcodeCheck", "iuGprCode", "iuComCode"]),
        async fetchData() {
            this.grpcodes.splice(0);
            this.comcodes.splice(0);
            this.grpcodes = await this.$axios.get(`/api/system/grpcode`);
            this.comcodes = await this.$axios.get(`/api/system/comcode`);
        },
        async grpSelect(grpcode) {
            this.c_gcode = grpcode.c_gcode;
            this.comTitle = 'Code : '  + grpcode.c_gcode + ' / ' + grpcode.n_gcode;
            this.comcode = this.comcodes.filter((item) => {
                return item.c_gcode == grpcode.c_gcode && item.c_com == grpcode.c_com;
            });
        },
        async grpInfo(item) {
            this.isLoad = true;                         
            this.grpdetail = item;
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
        async grpSave(form) {
            this.isLoading = true;
            const data = await this.iuGprCode(form);
            this.isLoading = false;
            if (data) {                
                this.$toast.info(`[${data.c_gcode}] 저장 하였습니다.`);
                const idx = this.grpcodes.indexOf(this.grpdetail);
                idx >= 0 ? this.grpcodes.splice(idx, 1, data) : this.grpcodes.push(data);
            }
            this.$refs.dialogGrpcode.close();
        },
        async comcodeSave(form) {
            this.isLoading = true;
            const data = await this.iuComCode(form);
            this.isLoading = false;
            if (data) {                
                this.$toast.info(`[${data.c_code}] 저장 하였습니다.`);
                const idx = this.comcodes.indexOf(this.comdetail);
                idx >= 0 ? this.comcodes.splice(idx, 1, data) : this.comcodes.push(data);

                const idx1 = this.comcode.indexOf(this.comdetail);
                idx1 >= 0 ? this.comcode.splice(idx1, 1, data) : this.comcode.push(data);
            }
            this.$refs.dialogComcode.close();
        },
        async comcodeInfo(item) {
            this.isLoad = true;
            this.comdetail = item;
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
        closeGrpcode() {
            this.isLoad = false;
        },
        closeComcode() {
            this.isLoad = false;            
        },
        async delGrpcode(item) {
            if(this.getComMaxNo) {
                this.$toast.info(`Code List 삭제 후 삭제 가능 합니다.`);
                return
            }
            const idx = this.grpcodes.indexOf(item);
            if (idx < 0) return;
            const result = await this.$ezNotify.confirm(
			 	`<b>Code : ${item.c_gcode}</b> 삭제 하시겠습니까 ?`,
			 	`Group Code`,
			 	{icon : 'mdi-delete', iconColor: 'red'}
			);
            if(!result) return;
            const data = await this.$axios.delete(`/api/system/delGprCode/${item.c_com}/${item.c_gcode}`);
            if(data) { 
                this.grpcodes.splice(idx, 1);
                this.$toast.info(`[${item.c_gcode}] 삭제 하였습니다.`);
            }
        },
        async delComcode(item) {            
            const idx = this.comcodes.indexOf(item);
            const idx1 = this.comcode.indexOf(item);
            if (idx < 0) return;
            const result = await this.$ezNotify.confirm(
			 	`<b>Code : ${item.c_code}</b> 삭제 하시겠습니까 ?`,
			 	`Code`,
			 	{icon : 'mdi-delete', iconColor: 'red'}
			);
            if(!result) return;
            const data = await this.$axios.delete(`/api/system/delComCode/${item.c_com}/${item.c_gcode}/${item.c_code}`);
            if(data) {
                this.comcodes.splice(idx, 1);
                this.comcode.splice(idx1, 1);
                this.$toast.info(`[${item.c_code}] 삭제 하였습니다.`);
            } 
        },
    },
}
</script>

<style>

</style>