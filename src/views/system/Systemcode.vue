<template>   
    <v-container fluid>
        <v-toolbar height="40px" background-color="primary" dark>
            <v-toolbar-title>시스템코드 관리</v-toolbar-title>
            <v-spacer/>           
            <tooltip-btn label="조회" @click="fetchData"><v-icon>mdi-magnify</v-icon></tooltip-btn>
        </v-toolbar>
        <v-layout>
            <v-flex xs5>            
                <grpcode-form :data="grpcodes" @onSelect="grpSelect"></grpcode-form>
            </v-flex> 
            <v-flex xs7>            
                <comcode-form :data="comcode" :title="comTitle"></comcode-form>
            </v-flex>
        </v-layout>
        
    </v-container>
</template>

<script>
import TooltipBtn from '../../components/etc/TooltipBtn.vue'
import ComcodeForm from './SystemComponent/ComcodeForm.vue'
import GrpcodeForm from './SystemComponent/GrpcodeForm.vue'
export default {
  components: { GrpcodeForm, ComcodeForm, TooltipBtn },
    name: "Systemcode",
    data() {
        return {
            grpcodes: [],
            comcodes: [],
            comcode: [],
            comTitle: "Code",
        }
    },
    mounted() {
        this.fetchData();
    },
    methods: {
        async fetchData() {
            this.grpcodes = await this.$axios.get(`/api/system/grpcode`);
            this.comcodes = await this.$axios.get(`/api/system/comcode`);
        },
        async grpSelect(grpcode) {
            this.comTitle = 'Code : '  + grpcode.c_gcode + ' / ' + grpcode.n_gcode;
            this.comcode = this.comcodes.filter((item) => {
                return item.c_gcode == grpcode.c_gcode && item.c_com == grpcode.c_com;
            });
        }
    },
}
</script>

<style>

</style>