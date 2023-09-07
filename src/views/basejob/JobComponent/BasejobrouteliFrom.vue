<template>
    <v-container class="grey lighten-5">
        <v-form @submit.prevent="save" ref="form" v-model="valid" lazy-validation>
            <v-row>
                <v-col col="12" sm="2" md="2">
                    <v-text-field v-model="form.s_sort" label="No" :rules="[rules.Num()]" hide-details="false"/>
                </v-col>
                <v-spacer/>
                <v-col col="12" sm="4" md="4">
                    <v-checkbox v-model="form.f_jobo" label="외주" true-value="Y"  false-value="N" hide-details="false"/>
                </v-col>
                <v-col col="12" sm="9" md="9">
                    <v-select v-model="form.c_process" label="공정코드"
                        @change="changeSelect"
                        :readonly="!!form.c_ptype"
                        :items="prcoess" item-text="n_process" item-value="c_process" 
                        :rules="[rules.require({ label: '공정코드' })]" >
                       
                    </v-select>
                </v-col>
                <v-col col="12" sm="3" md="3">
                    <v-text-field v-model="form.m_whour" label="작업일" :rules="[rules.Num()]" hide-details="false"/>
                </v-col>
                <v-col col="12" sm="5" md="5">
                    <v-checkbox v-model="form.f_jobs" label="첫공정" true-value="Y"  false-value="N" hide-details="false"/>
                </v-col>
                <v-spacer />
                <v-col col="12" sm="5" md="5">
                    <v-checkbox v-model="form.f_jobf" label="마지막공정" true-value="Y"  false-value="N" hide-details="false"/>
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
export default {
    name: "BasejobrouteliForm",
    props: {
        data: {
            type: Object,
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
        prcoess: {
            type: Array,
            default: null,
        },
        route: {
            type: Object,
            default: null,
        },
    },
    data() {
        return {
            valid: true,
            form : {
                c_com: "",
                c_item: "",
                s_sort: 0,
                c_process: "",
                n_process: "",
                c_ptype: "",
                m_whour: "",
                f_jobs: "",
                f_jobf: "",
                f_jobo: "",
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
                    c_item: this.route.c_item,
                    s_sort: (this.s_sort | 0) + 1,
                    c_process: "",
                    n_process: "",
                    c_ptype: "",
                    m_whour: 1,
                    f_jobs: "N",
                    f_jobf: "N",
                    f_jobo: "N",
                }
            }
            if (this.$refs.form) {
                this.$refs.form.resetValidation();                                        
            }
        },
        async save() {
            this.$refs.form.validate();
            await this.$nextTick();
            if (!this.valid) return;            
            this.$emit('onSave', this.form);
            // this.init();
            
        },
        getText(item) {
            return item.c_process + ' - ' + item.n_process;
        },
        changeSelect() {
            var find = this.prcoess.find(e => e.c_process === this.form.c_process);
            this.form.n_process = find.n_process;
        }
    },
}
</script>

<style>

</style>