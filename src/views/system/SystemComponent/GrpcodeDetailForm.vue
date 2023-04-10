<template>
    <v-container class="grey lighten-5">
        <v-form @submit.prevent="save" ref="form" v-model="valid" lazy-validation>
            <v-text-field label="No" 
                v-model="form.s_sort"
                :rules="[rules.Num()]" />
            <input-duplicate-grpcode-check ref="c_gcode"
                label="Code"
                v-model="form.c_gcode"                
                :cbCheck="keyCheckId"
                :origin="originKeyId"
                :readonly="!!data"
                :rules="[rules.require({ label: 'Code' }), rules.alphaNum()]" />
            <v-text-field label="명칭" v-model="form.n_gcode" />
            <v-textarea label="설명" v-model="form.t_remark" />
            <v-btn type="submit" color="primary" block>저장</v-btn>
        </v-form>
        
    </v-container>    
</template>

<script>
import { deepCopy } from '../../../../util/lib';
import validateRules from "../../../../util/validateRules";
import InputDuplicateGrpcodeCheck from '../../../components/InputForms/InputDuplicateGrpcodeCheck.vue';

export default {
    components: {InputDuplicateGrpcodeCheck  },
    name: "GrpcodeDetailForm",
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
                n_gcode: "",
                s_sort: 0,
                t_remark: "",
            }
        }
    },
    created() {
        this.init();
    },
    watch: {
        data() { this.init(); },
        isLoad() { this.init(); }
    },
    computed: {
        rules: () => validateRules,
        originKeyId() { return this.data ? this.data.c_gcode : ""; }, 
    },
    methods: {
        async init() {   
            if (this.data) {      
                this.form = deepCopy(this.data);         
            }
            else {
                this.form = {
                    c_com: this.$store.state.user.member.c_com,
                    c_gcode: "",
                    n_gcode: "",
                    s_sort: (this.s_sort | 0) + 1,
                    t_remark: "",
                }
            }
            if (this.$refs.form) {
                this.$refs.form.resetValidation(); 
                this.$refs.c_gcode.init();                               
            }
        },
        async save() {
            this.$refs.form.validate();
            await this.$nextTick();
            if (!this.valid) return;        
            if (!this.$refs.c_gcode.validate()) return;    
            this.$emit('onSave', this.form);  
            this.init(); 
        }
    }
}
</script>

<style>

</style>