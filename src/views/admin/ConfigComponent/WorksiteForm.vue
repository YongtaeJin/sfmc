<template>
    <v-form @submit.prevent="save" ref="form" v-model="valid" lazy-validation>
        <input-duplicate-check ref="c_com"
            label="사업장코드"
            v-model="form.c_com"
            :cbCheck="keyCheck"
            :origin="originKey"
            :readonly="!!data"
            :rules="[rules.require({ label: '사업장코드' }), rules.alphaNum()]" />
        <v-text-field label="사업장명"             
            v-model="form.n_com"
            :rules="rules.name({ label: '사업장명' })" />
        <input-duplicate-check ref="i_id"
            label="관리자ID"
            v-model="form.i_id"
            :cbCheck="keyCheck"
            :origin="originKey"
            :readonly="!!data"
            :rules="[rules.require({ label: '관리자ID' }), rules.alphaNum()]" />
        <v-text-field label="관리자성명"             
            v-model="form.n_name"
            :rules="rules.name({ label: '관리자성명' })" />
        <v-radio-group inline  label="사용여부 :" v-model="form.f_use" row hide-details class="small-radio no-space"   >
            <v-radio label="사용" value="Y" />
            <v-radio label="미사용" value="N" />
        </v-radio-group>
        <v-textarea label="설명" v-model="form.t_remark" />
        
        <v-btn type="submit" block>저장</v-btn>
        
    </v-form>
</template>

<script>
import { deepCopy } from '../../../../util/lib';
import validateRules from "../../../../util/validateRules";
import InputDuplicateCheck from '../../../components/InputForms/InputDuplicateCheck.vue';
export default {
  components: { InputDuplicateCheck },
    name: "WorksiteForm",
    props: {
        data: {
            type: Object,
            default: null,
        },
        keyCheck: {
            type: Function,
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
                t_remark: "",
            }
        };
    },
    created() {
        this.init();
    },
    watch: {
        data() {
            this.init();
        }
    },
    computed: {
        rules: () => validateRules,
        originKey() { return this.item ? this.item.cf_key : ""; },
    },
    methods: {
        async init() {
            if (this.data) {                
                this.form = deepCopy(this.data);
            } else {
                this.form = {
                    c_com: "",
                    n_com: "",
                    n_name: "",
                    i_id: "",
                    f_use: "Y",
                    t_remark: "",
                }
            }
        }
    },
}
</script>

<style>

</style>