<template>
    <v-container class="grey lighten-5">
        <v-form @submit.prevent="save" ref="form" v-model="valid" lazy-validation>
            <v-row>
                <v-col col="12" sm="2" md="2">
                    <v-text-field v-model="form.s_sort" label="No" :rules="[rules.Num()]"  hide-details="false"/>
                </v-col>
                <v-col col="12" sm="6" md="6">
                    <!-- <v-text-field v-model="form.c_item" label="품번" hide-details="false"/> -->
                    <input-duplicate-check ref="c_ptype"
                        label="공정유형코드"
                        v-model="form.c_ptype"                        
                        :cbCheck="keyCheckItem"
                        :origin="originKeyId"
                        :readonly="!!data"                        
                        :rules="[rules.require({ label: '공정유형코드' }), rules.alphaNum()]" />
                </v-col>
                <v-col col="12" sm="4" md="4">
                    <v-checkbox v-model="form.f_use" label="사용" true-value="Y"  false-value="N" hide-details="false"/>
                </v-col>
                <v-col col="12" sm="8" md="8">
                    <v-text-field v-model="form.n_ptype" label="공정유형 명" hide-details="false"/>
                </v-col>
                <v-col col="12" sm="12" md="12">
                    <v-text-field v-model="form.t_remark" label="설명" hide-details="false"/>
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
import InputDuplicateCheck from '../../../components/InputForms/InputDuplicateCheck.vue';
import InputRadio from '../../../components/InputForms/InputRadio.vue';
export default {
  components: { InputRadio, InputDuplicateCheck },    
    name: "BasejobprocesstypeForm",
    props: {
        data: {
            type: Object,
            default: null,
        },       
        keyCheckItem: {
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
                c_ptype: "",
                s_sort: 0,
                n_ptype: "",                
                f_use: "Y",
                t_remark: "",
            },
            YesorNo: [
                { label: "사용", value: "Y" },
                { label: "중지", value: "N" },
            ],            
        }
    },
    created() {        
        this.init();        
    },
    watch: {
        data() {this.fatch();},
        isLoad() {this.fatch();},
    },
    computed: {
        rules: () => validateRules,
        originKeyId() { return this.data ? this.data.c_ptype : ""; }, 
    },
    methods: {
        async init() {
            this.fatch();
        },
        async fatch() {
            if (this.data) {      
                this.form = deepCopy(this.data);         
            }
            else {
                this.form = {
                    c_com: this.$store.state.user.member.c_com,
                    c_ptype: "",
                    s_sort: (this.s_sort | 0) + 1,
                    n_ptype: "",                    
                    f_use: "Y",
                    t_remark: "",
                }
            }
            if (this.$refs.form) {
                this.$refs.form.resetValidation(); 
                this.$refs.c_ptype.init();                               
            }
        },
        async save() {
            this.$refs.form.validate();
            await this.$nextTick();
            if (!this.valid) return;
            if (!this.$refs.c_ptype.validate()) return;
            this.$emit('onSave', this.form);
            this.init();
        },
    },
}
</script>

<style>

</style>