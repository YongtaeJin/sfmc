<template>
    <v-container class="grey lighten-5">
        <v-form @submit.prevent="save" ref="form" v-model="valid" lazy-validation>
            <v-row>
                <v-col col="12" sm="2" md="2">
                    <v-text-field v-model="form.s_sort" label="No" :rules="[rules.Num()]"  hide-details="false"/>
                </v-col>
                <v-spacer/>
                <v-col col="12" sm="3" md="3">
                    <v-text-field v-model="form.m_whour" label="작업시간" :rules="[rules.Num()]" hide-details="false" readonly/>
                </v-col>
                <v-col col="12" sm="12" md="12">
                    <v-select v-model="form.c_process" label="공정코드"
                        :items="proclist" item-text="n_process" item-value="c_process" @change="setSelect"                        
                        :rules="[rules.require({ label: '공정코드' })]" >
                        <template v-slot:item="{ item }">{{ getText(item) }}</template>
                        <template v-slot:selection="{ item }">{{ getText(item) }}</template>
                    </v-select>
                </v-col>
                
                <v-col col="12" sm="4" md="4">
                    <v-checkbox v-model="form.f_jobs" label="첫공정" true-value="Y"  false-value="N" hide-details="false"/>
                </v-col>
                <v-col col="12" sm="4" md="4">
                    <v-checkbox v-model="form.f_jobf" label="마지막공정" true-value="Y"  false-value="N" hide-details="false"/>
                </v-col>
                <v-col col="12" sm="4" md="4">
                    <v-checkbox v-model="form.f_jobo" label="외주공정" true-value="Y"  false-value="N" hide-details="false"/>
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
import InputDuplicateTwoColCheck from '../../../components/InputForms/InputDuplicateTwoColCheck.vue';
import InputRadio from '../../../components/InputForms/InputRadio.vue';
export default {
  components: { InputRadio, InputDuplicateTwoColCheck },    
    name: "BasejobprocesstypeliForm",
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
        c_ptype: {
            type : String,
            default: null,
        },
        s_sort: {
            type : Number,
            default: 0,
        },
        proclist: {
            type: Array,
            default: null,
        },
    },
    data() {
        return {
            valid: true,
            form : {
                c_com: "",
                c_ptype: "",
                s_sort: 0,
                c_process: "",
                n_process: "",
                m_whour: 1,
                f_jobs: "Y",
                f_jobf: "N",
                f_jobo: "N",
            },
            
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
        originKeyId() { return this.data ? this.data.c_process : ""; }, 
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
                    c_ptype: this.c_ptype,
                    s_sort: (this.s_sort | 0) + 1,
                    c_process: "",
                    n_process: "",
                    m_whour: 1,
                    f_jobs: "Y",
                    f_jobf: "N",
                    f_jobo: "N",
                }
            }
            if (this.$refs.form) {
                this.$refs.form.resetValidation(); 
                // this.$refs.c_process.init();                               
            }
        },
        async save() {
            this.$refs.form.validate();
            await this.$nextTick();
            if (!this.valid) return;
            // if (!this.$refs.c_process.validate()) return;            
            this.$emit('onSave', this.form);
            this.init();
            // console.log(this.form)
        },

        getText(item) {
            return item.c_process + ' - ' + item.n_process;
        },
        setSelect(selectObj) {
            this.form.n_process = this.proclist.find( e => e.c_process === selectObj).n_process;            
        },
    },
}
</script>

<style>

</style>