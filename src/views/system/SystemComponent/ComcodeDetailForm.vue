<template>
    <v-container class="grey lighten-5">
        <v-form @submit.prevent="save" ref="form" v-model="valid" lazy-validation>
            <!-- <v-text-field label="gcode" v-model="form.c_gcode"/> -->
            <v-text-field label="No" 
                v-model="form.s_sort"
                :rules="[rules.Num()]" />
            <input-duplicate-comcode-check ref="c_code"
                label="Code"
                v-model="form.c_code"
                :gcode="form.c_gcode" 
                :cbCheck="keyCheckId"
                :origin="originKeyId"
                :readonly="!!data"
                :rules="[rules.require({ label: 'Code' }), rules.alphaNum()]" />
            <v-text-field label="명칭" v-model="form.n_code" />
            <v-text-field label="문자열 1" v-model="form.s_buf1" />
            <v-text-field label="문자열 2" v-model="form.s_buf2" />
            <v-text-field label="숫자열 1" v-model="form.m_buf1" :rules="[rules.Numbuer()]"/>
            <v-text-field label="숫자열 2" v-model="form.m_buf2" :rules="[rules.Numbuer()]"/>
            <v-textarea label="설명" v-model="form.t_remark" />
            <v-btn type="submit" color="primary" block>저장</v-btn>
        </v-form>
    </v-container>
</template>

<script>
import { deepCopy } from '../../../../util/lib';
import validateRules from "../../../../util/validateRules";
import InputDuplicateComcodeCheck from '../../../components/InputForms/InputDuplicateComcodeCheck.vue';
export default {
    components: { InputDuplicateComcodeCheck },
    name: "ComcodeDetailForm",
    props: {
        data: {
            type: Object,
            default: null,
        },       
        keyCheckId: {
            type: Function,
            default: null,
        },
        isLoad: {
            type : Boolean,
            default: null,
        },
        c_gcode: {
            type : String,
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
                c_gcode: "",
                c_code: "",
                n_code: "",
                s_sort: 0,        
                s_buf1: "",
                s_buf2: "",
                s_buf3: "",
                m_buf1: 0.0,
                m_buf2: 0.0,
                m_buf3: 0.0,                
                t_remark: "",
            },
        }
    },
    created() {
        this.init();        
    },
    watch: {
        isLoad() {
            this.init();
        }
    },
    computed: {
        rules: () => validateRules,
        originKeyId() { return this.data ? this.data.c_code : ""; }, 
    },
    methods: {
        async init() {   
            if (this.data) {      
                this.form = deepCopy(this.data);         
            }
            else {
                this.form = {
                    c_com: this.$store.state.user.member.c_com,                    
                    c_gcode: this.c_gcode,
                    c_code: "",
                    n_code: "",
                    s_sort: (this.s_sort | 0) + 1,
                    s_buf1: "",
                    s_buf2: "",
                    s_buf3: "",
                    m_buf1: 0,
                    m_buf2: 0,
                    m_buf3: 0,                
                    t_remark: "",
                }
            }
            if (this.$refs.form) {
                this.$refs.form.resetValidation(); 
                this.$refs.c_code.init();                               
            }
        },
        async save() {
            this.$refs.form.validate();
            await this.$nextTick();
            if (!this.valid) return;        
            if (!this.$refs.c_code.validate()) return;    
            this.$emit('onSave', this.form);  
            this.init(); 
        }
    }
}
</script>

<style>

</style>