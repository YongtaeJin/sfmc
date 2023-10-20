<template>
    <div style="height: 100%">

         
        <v-text-field label="예약시간 : " v-model="form.s_restime" style="max-width:100px;"/>                        
        <input-date-4 label="발생일시 : " v-model="form.s_day"></input-date-4>
        <label v-if="tabindex == 0" for="radio-group" hide-details dense>시스템 가동여부 :</label>
        <v-radio-group  v-if="tabindex == 0" v-model="form.systmOprYn" row style="margin: 0;" dense>
            <v-radio label="가동" value="Y"></v-radio>
            <v-radio label="중지" value="N"></v-radio>      
        </v-radio-group>
        
        <label  v-if="tabindex > 0" for="radio-group" hide-details dense>성과지표분야코드 :</label>
        <v-radio-group  v-if="tabindex > 0" v-model="form.kpiFldCd" row style="margin: 0;" dense >
            <v-radio label="생산" value="P" @click="changeFild('P')"></v-radio>
            <v-radio label="원가" value="C" @click="changeFild('C')"></v-radio>
            <v-radio label="품질" value="Q" @click="changeFild('Q')"></v-radio>
            <v-radio label="납기" value="D" @click="changeFild('D')"></v-radio>
        </v-radio-group>

        <label  v-if="tabindex > 0" dense>세부성과지표 :</label>
        <div  v-if="tabindex > 0" style="display: flex;">
            <v-select v-model="form.kpiDtlCd" :items="kpifildfilter" item-text="n_code" item-value="c_code" dense @change="onChangeKPIDt"></v-select>
            <label dense>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>
            <v-text-field label="코드" v-model="form.kpiDtlCd"  readonly dense style="max-width:50px;"/> 
            <label dense>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>   
            <v-text-field label="단위" v-model="form.unt" dense style="max-width:50px;" />                    
        </div>
        <v-text-field  v-if="tabindex == 1" label="성치율 : "  v-model="form.achrt" dense style="max-width:100px;" />
        <label v-if="tabindex == 2">측정수치 :</label>
        <v-text-field v-if="tabindex == 2" v-model="form.msmtVl" dense style="max-width:100px;" />
     
        <v-btn @click="addd" block color="primary"> {{  btnTitle }}</v-btn>        
        
    </div>
</template>

<script>
import { getYYYYmmdd, getHHmm, getDate } from '../../../util/lib'
import InputDate from '../../components/InputForms/InputDate.vue';
import InputDate4 from '../../components/InputForms/InputDate4.vue';
export default {
  components: { InputDate, InputDate4 },
    name: "kpiManagerForm",
    props: {
        tabindex: 0 || 0,
        data: { c_com: "", n_com: "", i_kpikey: "", s_day: "", ocrDttm: "",},
        resTime: "",
    },
    created() {
       this.init('create');       
    },
    watch: {
        tabindex: {
            deep: true,
            handler(newItems, oldItems) {},            
        },
        data: {
            deep: true,
            handler(newItems, oldItems) {                
                this.init()                
            }
            
        }
    },
    computed: {
        chkRes() {           
            return this.form.ocrDttm > getYYYYmmdd()
        },
        btnTitle() {
            return this.chkRes ? "예 약" : "전 송"
        }
    },
    data() {
        return {
            tab : this.tabindex || 0,
            row : null,
            form : { c_com: "",
                     kpiCertKey: "", 
                     ocrDttm: "", 
                     s_restime:"", 
                     systmOprYn: "Y",
                     kpiFldCd: "P", 
                     kpiDtlCd: "", 
                     kpiDtlNm: "", 
                     achrt: "",
                     msmtVl: "",
                     unt: "",
                     trsDttm: "",
                     f_tst: "N",
                     i_kpilevel: "",
                     s_day: "",
                     f_sned: "",
                   },
            kpifilds: [], kpifildfilter: [],
            kpi1ResTime: "", kpi2ResTime: "", kpi3ResTime: "",
        }
    },
    methods: {
        async init(chk) {
            if (chk == 'create') {                                
                this.kpifilds = await this.$axios.post(`/api/kpi/getKpiFild`); 
                this.kpifildfilter = this.kpifilds.filter(function(item) { return item.c_gcode == `KPIP`; });
            }
            this.form.ocrDttm  = this.data.ocrDttm;
            this.form.kpiCertKey = this.data.i_kpikey;             
            this.form.s_day    = this.data.s_day; 
            this.form.s_restime = this.resTime;
        
        },
        async addd() {
            this.form.c_com      = this.data.c_com;
            this.form.ocrDttm    = this.form.s_day.replaceAll('-', '');
            this.form.i_kpilevel = this.tabindex == 0 ? "KPILEVEL1" : this.tabindex == 1 ? "KPILEVEL2" : "KPILEVEL3" ;
            this.form.f_sned     = this.chkRes ? "예약" : "전송"
            
            await this.$axios.post(`/api/kpi/sendKPIJob`, this.form); 

            this.$toast.info(`${this.form.f_sned} 처리 하였습니다 ...`);
        },
        changeFild(Cd) {            
            this.kpifildfilter = this.kpifilds.filter(function(item) { return item.c_gcode == `KPI${Cd}`; });         
            this.form.kpiDtlCd = ""
            this.form.kpiDtlNm = ""
            this.form.achrt    = ""
            this.form.msmtVl   = ""
            this.form.unt      = ""
        },
        onChangeKPIDt(Dt) {
            const index = this.kpifildfilter.findIndex((i) => i.c_code == Dt);            
            if (index >= 0) {
                this.form.kpiDtlNm = this.kpifildfilter[index].n_code;
                this.form.unt      = this.kpifildfilter[index].s_buf1;
            } 

        }
    }
}
</script>

<style>

</style>
