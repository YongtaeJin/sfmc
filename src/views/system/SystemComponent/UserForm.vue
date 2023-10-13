<template>
    <v-container class="grey lighten-5">
        <v-form @submit.prevent="save" ref="form" v-model="valid" lazy-validation>
            <input-duplicate-dual-check ref="i_id"
                label="ID"
                v-model="form.i_id"
                :aFiled="form.c_com"
                :cbCheck="keyCheckId"
                :origin="originKeyId"
                :readonly="!!data"
                :rules="[rules.require({ label: 'ID' }), rules.alphaNum()]" />
            <v-text-field ref="p_password" label="성명"             
                v-model="form.n_name" />
            <input-password label="비밀번호"
                v-model="form.p_password"
                :rules="rules.password2({ label: '비밀번호', required: false , len: 3 })" />
            <v-select laebl="사용등급"
                v-model="form.i_level"
                :items="lvitems"
                item-text="label"
                item-value="lv"
                />
            <input-radio label="사용여부"
                v-model="form.f_use"
                row
                :items="yesnoItem"
                :rules="[rules.require({ label: '사용' })]"/>
            <v-textarea label="설명" v-model="form.t_remark" />
            <v-btn type="submit" color="primary" block>저장</v-btn>
        </v-form>       
    </v-container>
</template>

<script>
import { deepCopy } from '../../../../util/lib';
import { LVITEMS2 } from '../../../../util/level';
import validateRules from "../../../../util/validateRules";
import InputDuplicateDualCheck from '../../../components/InputForms/InputDuplicateDualCheck.vue';
import InputPassword from '../../../components/InputForms/InputPassword.vue';
import InputRadio from '../../../components/InputForms/InputRadio.vue';
export default {
  components: { InputDuplicateDualCheck, InputPassword, InputRadio },
    name: "UserForm",
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
    },
    data() {
        return {
            valid: true,
            form : {
                c_com: "",
                i_id: "",
                n_name: "",
                p_password: "",
                i_level: 6,
                f_use: "Y",
                t_remark: "",
            },
            yesnoItem: [
                {label: "사용", value: "Y"},
                {label: "중지", value: "N"},
            ],
            lvitems: null,
        }
    },
    created() {
        this.init();
        this.lvitems = LVITEMS2;
    },
    watch: {
        isLoad() {
            this.init();
        }
    },
    computed: {
        rules: () => validateRules,
        originKeyId() { return this.data ? this.data.i_id : ""; }, 
    },
    methods: {
        async init() {   
            if (this.data) {                     
                this.form = deepCopy(this.data);
            } else {
                this.form = {
                    c_com: this.$store.state.user.member.c_com,
                    i_id: "",
                    n_name: "",                    
                    f_use: "Y",
                    p_password: "",
                    i_level: 6,
                    t_remark: "",
                }
            }
            this.form.p_password = "";
            if (this.$refs.form) {
                this.$refs.form.resetValidation();                
                this.$refs.i_id.init();
            }
        },
        async save() {
            this.$refs.form.validate();
            await this.$nextTick();
            if (!this.valid) return;
            if (!this.$refs.i_id.validate()) return;
            this.$emit('onSave', this.form);  
            this.init(); 
        }
    },
}
</script>

<style>

</style>