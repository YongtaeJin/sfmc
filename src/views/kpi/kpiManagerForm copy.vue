<template>
    <div class="d-flex justify-center align-center" style="height: 100%">
        <v-card max-width="500" width="100%" elevation="10"  >
            <!-- <v-tabs v-model="tabindex" background-color="primary" dark>
                <v-tab style="flex: 1">1</v-tab>
                <v-tab style="flex: 1">2</v-tab>
                <v-tab style="flex: 1">3</v-tab>
            </v-tabs> -->
            <v-card-text >
                <v-tabs-items v-model="tabindex">
                    <v-tab-item ><div >
                        <v-text-field label="예약시간 : " :readonly="!chkRes"  style="max-width:100px;"/>
                        <input-date label="발생일시 : " v-model="form.s_day"></input-date>
                        <v-radio-group label="시스템 가동여부 :"  v-model="form.systmOprYn" row>
                            <v-radio label="가동" value="Y"></v-radio>
                            <v-radio label="중지" value="N"></v-radio>
      
                        </v-radio-group>
                    </div></v-tab-item>
                    <v-tab-item><div>
                        <v-text-field label="예약시간 : " style="max-width:100px;"/>                        
                        <input-date-4 label="발생일시 : " v-model="form.s_day"></input-date-4>
                        
                        <label for="radio-group" hide-details dense>성과지표분야코드 :</label>
                        <v-radio-group  v-model="form.kpiFldCd" row style="margin: 0;" dense >
                            <v-radio label="생산" value="P" @click="changeFild('P')"></v-radio>
                            <v-radio label="원가" value="C" @click="changeFild('C')"></v-radio>
                            <v-radio label="품질" value="Q" @click="changeFild('Q')"></v-radio>
                            <v-radio label="납기" value="D" @click="changeFild('D')"></v-radio>
                        </v-radio-group>

                        <label>세부성과지표 :</label>
                        <div style="display: flex;">
                            <v-select v-model="form.kpiDtlCd" :items="kpifildfilter" item-text="n_code" item-value="c_code" dense @change="onChangeKPIDt"></v-select>
                            <label dense>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>
                            <v-text-field v-model="form.kpiDtlCd"  readonly dense />
                        
                        </div>
                        <v-text-field label="성치율 : "  v-model="form.achrt" dense style="max-width:100px;" />

                    </div></v-tab-item>
                        
                    <v-tab-item><div>
                        <v-text-field label="예약시간 : " style="max-width:100px;"/>
                        <v-text-field label="발생일시 : " style="max-width:100px;"/>
                        <v-text-field label="성과지표분야코드 : "/>
                        <v-text-field label="세부성과지표코드 : "/>
                        <v-text-field label="세부성과지표명 : "/>
                        <v-text-field label="측정수치 : "/>
                        <v-text-field label="단위 : "/>
                    </div></v-tab-item>
                </v-tabs-items>
            </v-card-text>
            <v-btn @click="addd"> {{  btnTitle }}</v-btn>
        </v-card>
        
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
        data: { n_com: "", i_kpikey: "", s_day: "", ocrDttm: "",}
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
            form : { i_kpikey: "", 
                     s_restime:"", 
                     ocrDttm: "", 
                     systmOprYn: "Y",
                     kpiFldCd: "P", 
                     kpiDtlCd: "", 
                     kpiDtlNm: "", 
                     achrt: "",
                     msmtVl: "",
                     unt: "",
                     trsDttm: "",
                   },
            kpifilds: [], kpifildfilter: [],
        }
    },
    methods: {
        async init(chk) {
            if (chk == 'create') {
                this.kpifilds = await this.$axios.post(`/api/kpi/getKpiFild`); 
                this.kpifildfilter = this.kpifilds.filter(function(item) { return item.c_gcode == `KPIP`; });
            }
            this.form.ocrDttm  = this.data.ocrDttm;
            this.form.i_kpikey = this.data.i_kpikey; 
            this.form.s_day    = this.data.s_day; 
            
        },
        addd() {
            console.log(this.form)   
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
