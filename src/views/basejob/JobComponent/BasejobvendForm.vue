<template>
    <v-container class="grey lighten-5">
        <v-form @submit.prevent="save" ref="form" v-model="valid" lazy-validation>
            <v-row>
                <v-col col="12" sm="2" md="2">
                    <v-text-field v-model="form.s_sort" label="No" :rules="[rules.Num()]" solo hide-details="false"/>
                </v-col>
                <v-col col="12" sm="6" md="6">
                    <v-text-field v-model="form.n_compnay" label="명칭" solo hide-details="false"/>
                </v-col>
                <v-col col="12" sm="4" md="4">
                    <v-checkbox v-model="form.f_use" label="거래유무" true-value="Y"  false-value="N" hide-details="false"/>
                </v-col>                
                <v-col col="12" sm="4" md="4">
                    <v-text-field v-model="form.n_vend" label="약칭" solo hide-details="false"/>
                </v-col>                                
                <v-col col="12" sm="4" md="4">
                    <v-text-field v-model="form.n_ceo" label="대표자" hide-details="false"/>
                </v-col>
                <v-col col="12" sm="4" md="4">
                    <v-text-field v-model="form.i_company" label="사업자번호" hide-details="false"/>
                </v-col>                
                <v-col col="12" sm="4" md="4">
                    <v-text-field v-model="form.t_tel" label="연락처" hide-details="false"/>                    
                </v-col>
                 <v-col col="12" sm="4" md="4">
                    <v-text-field v-model="form.t_fax" label="FAX" hide-details="false"/>
                </v-col>
                <v-col col="12" sm="4" md="4">
                    <v-text-field v-model="form.e_mail" label="회사EMail" hide-details="false"/>
                </v-col>
                <v-col col="12" sm="4" md="4">
                    <v-text-field v-model="form.n_mag" label="담당자" hide-details="false"/>
                </v-col>
                 <v-col col="12" sm="4" md="4">
                    <v-text-field v-model="form.t_magtel" label="담당자연락처" hide-details="false"/>
                </v-col>
                <v-col col="12" sm="4" md="4">
                    <v-text-field v-model="form.t_magmail" label="담당자EMail" hide-details="false"/>
                </v-col>
                <v-col col="12" sm="6" md="6">
                    <v-text-field v-model="form.t_job1" label="업태" hide-details="false"/>
                </v-col>
                <v-col col="12" sm="6" md="6">
                    <v-text-field v-model="form.t_job2" label="업종" hide-details="false"/>
                </v-col>
                <v-col col="12" sm="12" md="12">
                    <v-text-field v-model="form.t_addr" label="회사 주소" hide-details="false"/>
                </v-col>
                <v-col col="12" sm="12" md="12">
                    <v-text-field v-model="form.t_remark" label="비고" hide-details="false"/>
                </v-col>    
                
            </v-row>
            <v-row><v-col></v-col></v-row>
            <v-btn type="submit" color="primary" block>저장</v-btn>
        </v-form>
    </v-container>
</template>
<script>
import { deepCopy } from '../../../../util/lib';
import validateRules from "../../../../util/validateRules";
import InputRadio from '../../../components/InputForms/InputRadio.vue';
export default {
  components: { InputRadio },
    name: "BasejobvendForm",
    props: {
        data: {
            type: Object,
            default: null,
        },       
        keyCheckVend: {
            type: Function,
            default: null,
        },
        isLoad: {
            type : Boolean,
            default: null,
        },
        s_sort: {
            type : Number,
            default: 0,
        },
    },
    data() {
        return {
            valid: true,
            form : {
                c_com: "",
                c_vend: "",
                s_sort: 0,
                n_vend: "",
                n_compnay: "",
                n_ceo: "",
                i_company: "",
                t_job1: "",
                t_job2: "",
                t_tel: "",
                t_fax: "",
                e_mail: "",
                t_addr: "",
                n_mag: "",
                t_magtel: "",
                t_magmail: "",
                f_use: "Y",
                t_remark: "",
            },
            YesorNo: [
                { label: "거래", value: "Y" },
                { label: "중지", value: "N" },
            ],
        }
    },
    created() {
        this.init();        
    },
    watch: {
        data() {this.init();},
        isLoad() {this.init();},
    },
    computed: {
        rules: () => validateRules,
        // originKeyId() { return this.data ? this.data.c_code : ""; }, 
    },
    methods: {
        async init() { 
            if (this.data) {      
                this.form = deepCopy(this.data);         
            }
            else {
                this.form = {
                    c_com: this.$store.state.user.member.c_com,                                        
                    c_vend: "",
                    s_sort: (this.s_sort | 0) + 1,
                    n_vend: "",
                    n_compnay: "",
                    n_ceo: "",
                    i_company: "",
                    t_job1: "",
                    t_job2: "",
                    t_tel: "",
                    t_fax: "",
                    e_mail: "",
                    t_addr: "",
                    n_mag: "",
                    t_magtel: "",
                    t_magmail: "",
                    f_use: "Y",
                    t_remark: "",
                }
            }
            if (this.$refs.form) {
                this.$refs.form.resetValidation(); 
                // this.$refs.c_code.init();                               
            }
        },
        async save() {
            this.$refs.form.validate();
            await this.$nextTick();
            if (!this.valid) return;
            this.$emit('onSave', this.form);              
        },
    },
}
</script>

<style>

</style>