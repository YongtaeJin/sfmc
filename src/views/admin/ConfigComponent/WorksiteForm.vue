<template>
    <v-container class="grey lighten-5">
    <v-form @submit.prevent="save" ref="form" v-model="valid" lazy-validation>
        <v-row no-gutters>
            <v-responsive width="60px">
                <input-duplicate-check ref="c_com"
                label="사업장코드"
                v-model="form.c_com"
                
                :cbCheck="keyCheckCom"
                :origin="originKeyCom"
                :readonly="!!data"
                :rules="[rules.require({ label: '사업장코드' }), rules.alphaNum()]" />
            </v-responsive>
            <v-spacer />        
            <v-text-field label="사업장명"             
                v-model="form.n_com"
                :rules="rules.name({ label: '사업장명' })" />
        </v-row>
        <v-row no-gutters>
             <v-responsive width="60px">
                <input-duplicate-dual-check ref="i_id"
                    label="관리자ID"
                    v-model="form.i_id"
                    :aFiled="form.c_com"
                    :cbCheck="keyCheckId"
                    :origin="originKeyId"
                    :readonly="!!data"
                    :rules="[rules.require({ label: '관리자ID' }), rules.alphaNum()]" />
            </v-responsive>
            <v-spacer />
            <v-text-field label="관리자성명"             
                v-model="form.n_name"            
                :rules="rules.name({ label: '관리자성명' })" />
        </v-row>
        <v-row no-gutters>
            <v-responsive width="60px">
                <v-text-field label="사용여부"             
                    :readonly=true
                    v-model=form.f_use>
                    -
                    <template v-slot:append>                        
                        <v-btn @click="setUseYN" small icon >
                            <v-icon>mdi-check</v-icon>
                            <!-- {{ form.f_use == "Y" ? '미사용' : '사용'}} -->
                        </v-btn>
                    </template>
                </v-text-field>
            </v-responsive>
            <v-spacer />      
            <v-text-field
                label="비밀번호"
                v-model="form.p_pw"                
                :rules="rules.password2({len:3})"
            />                         
        </v-row>        
        <v-textarea label="설명" v-model="form.t_remark" />        
        <v-btn type="submit" block>저장</v-btn>
        
    </v-form>
    </v-container>
</template>

<script>
import { deepCopy } from '../../../../util/lib';
import validateRules from "../../../../util/validateRules";
import InputDuplicateCheck from '../../../components/InputForms/InputDuplicateCheck.vue';
import InputDuplicateDualCheck from '../../../components/InputForms/InputDuplicateDualCheck.vue';
import InputPassword from '../../../components/InputForms/InputPassword.vue';
export default {
  components: { InputDuplicateCheck, InputPassword, InputDuplicateDualCheck },
    name: "WorksiteForm",
    props: {
        data: {
            type: Object,
            default: null,
        },
        keyCheckCom: {
            type: Function,
            default: null,
        },
        keyCheckId: {
            type: Function,
            default: null,
        },
        isLoad :{
            type : Boolean,
            default: null,
        },
    },
    data() {
        return {
            valid: true,
            form : {
                c_com: "",
                n_com: "",
                n_name: "",
                i_id: "",
                f_use: "",
                p_pw: "",
                t_remark: "",
            },
            isNew : false,            
        };
    },
    created() {
        this.init();
    },
    watch: {
        data() {
            this.init();            
        },        
        isLoad() {
            this.init();
        },
        'form.c_com'() {
            this.$refs.i_id.init();
        }
       
    },
    computed: {
        rules: () => validateRules,
        originKeyCom() { return this.data ? this.data.c_com : ""; },
        originKeyId() { return this.data ? this.data.i_id : ""; },        
    },
    methods: {
        async init() {    
            // if (this.$refs.form) this.$refs.form.reset();    
            if (this.data) {                         
                this.form = deepCopy(this.data);
                this.isNew = false;  
            } else {
                this.form = {
                    c_com: "",
                    n_com: "",
                    n_name: "",
                    i_id: "",
                    f_use: "Y",
                    p_pw: "",
                    t_remark: "",
                },
                this.isNew = true;
            }
            if (this.$refs.form) {
                this.$refs.form.resetValidation();
                this.$refs.c_com.init();
                this.$refs.i_id.init();
            }
        },
        setUseYN() {
            this.form.f_use = this.form.f_use == "Y" ? "N" : "Y";
        },
        async save() {            
            this.$refs.form.validate();
            await this.$nextTick();
            if (!this.valid) return;
            
            if (!this.$refs.c_com.validate()) return;
            if (!this.$refs.i_id.validate()) return;

            this.$emit('onSave', this.form);  
            this.init();      
        }       
    },
}
</script>

<style>

</style>