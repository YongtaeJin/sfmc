<template>
    <v-form @submit.prevent="save" ref="form" v-model="valid" lazy-validation >
        <input-duplicate-check
            ref="i_com"
            label="사업장코드" 
            v-model="form.i_com" 
            counter="10"
            prepend-icon="mdi-barcode"
            :cbCheck="keyCheck"
            :origin="originKey"
            :readonly="newItem != '추 가'"            
            :rules="[rules.require({ label: '사업장코드' }), rules.alphaNum()]"
            />
        <v-text-field label="사업자번호" v-model="form.i_creg" prepend-icon="mdi-office-building-outline" />
        <v-text-field label="사업자  명" v-model="form.n_com" prepend-icon="mdi-rename-box " />
        <v-text-field label="대표자성명" v-model="form.n_pernm" prepend-icon="mdi-account" />
        
        <input-phone label="전화번호" v-model="form.t_tel" prepend-icon="mdi-phone" :rules="rules.phone({required:false})" />
        <input-phone label="FAX 번호" v-model="form.t_fax" prepend-icon="mdi-fax" :rules="rules.phone({required:false})" />
        
        <v-text-field label="E-mail" v-model="form.t_email" prepend-icon="mdi-at" :rules="rules.email({required:false})" />
        <input-post2 :zipcode.sync="form.t_post" :addr1.sync="form.t_addr1" :addr2.sync="form.t_addr2" />
     
        
        <v-btn type="submit" block color="primary" :loading="isLoading">{{ newItem }}</v-btn>
    </v-form>
</template>

<script>
import { deepCopy } from "../../../util/lib";
import validateRules from "../../../util/validateRules";
import InputDuplicateCheck from '../../components/InputForms/InputDuplicateCheck.vue';
import InputPhone from '../../components/InputForms/InputPhone.vue';
import InputPost2 from '../../components/InputForms/InputPost2.vue';


export default {
    components: { InputDuplicateCheck, InputPhone, InputPost2 },
    name: "CompanyUpdateForm",
    props: {
        keyCheck: {
            type: Function,
            default: null,
        },
        company: {
            type: Object,
            default: null,
        },    
        isLoading: Boolean,
        newItem: {
            type: String,
            default: null,
        }
    },
    data() {
        return {
            valid: true,            
            form: {
                i_com: "",
                n_com: "",
                i_creg: "",
                n_pernm: "",
                t_tel: "",
                t_fax: "",
                t_email: "",
                t_post: "",
                t_addr1: "",
                t_addr2: "",
            },      
        };
    },    
    mounted() {        
        this.form = deepCopy(this.company);
    },
    watch: {        
        company() {        
            this.init();             
        },        
    },
    computed: {
        rules: () => validateRules,
        originKey() {
            return this.company ? this.company.i_com : "";
        },
    },
    created() {        
        this.init();
    },    
    destroyed() {        
        this.form = null;
    },
    methods: {       
        init() {
            if (this.company) {
                this.form = deepCopy(this.company);
            } else {
                this.from = { 
                    i_com: "",
                    n_com: "",
                    i_creg: "",
                    n_pernm: "",
                    t_tel: "",
                    t_fax: "",
                    t_email: "",
                    t_post: "",
                    t_addr1: "",
                    t_addr2: "",
                };
            }
            if (this.$refs.form) {
                this.$refs.form.resetValidation(); 
            }
        },
        async save() {
            this.$refs.form.validate();
            await this.$nextTick();
            if (!this.valid) return;
            if (!this.$refs.i_com.validate()) return;

            const formData = new FormData();
            const keys = Object.keys(this.form);
            for (const key of keys) {
                formData.append(key, this.form[key]);
            }       
            if (this.newItem == "수 정") {
                this.$emit("onSave", formData)
            } else {
                this.$emit("onCreate", formData) 
            }
            this.init();
        },
    },
}
</script>

<style>

</style>