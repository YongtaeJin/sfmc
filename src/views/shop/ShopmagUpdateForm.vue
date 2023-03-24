<template>
    <v-form @submit.prevent="save" ref="form" v-model="valid" lazy-validation>
        <input-duplicate-check  ref="i_shop"
            label="사업번호" v-model="form.i_shop"  counter="15" :readonly=!isNew 
            prepend-icon="mdi-identifier" 
            :rules="rules.name({label:'사업번호'})" 
            :origin="originKey" 
            :cbCheck="cbShopId"/>      
        <v-text-field label="사업명" v-model="form.n_shop" prepend-icon="mdi-briefcase"  />   
        <input-date label="사업시작일" v-model="form.d_date1" prepend-icon="mdi-calendar" />
        <input-date label="사업종료일" v-model="form.d_date2" prepend-icon="mdi-calendar" />
        <v-textarea label="신청서 설명" v-model="form.t_remark" />
        <v-textarea label="협약서 설명" v-model="form.t_remark2" />
        <v-btn type="submit" block color="primary" :loading="isLoading">{{isNew?'추  가':'수  정'}}</v-btn>
    </v-form>
</template>

<script>
import { deepCopy } from '../../../util/lib';
import validateRules from "../../../util/validateRules";
import InputDate from '../../components/InputForms/InputDate.vue';
import InputDuplicateCheck from '../../components/InputForms/InputDuplicateCheck.vue';
export default {
  components: { InputDate, InputDuplicateCheck },
    name: "ShopmagUpdateForm",
    props: {
        shopinfo: {
            type: Object,
            default: null,
        },
        cbShopId: {
            type: Function,
            default: null,
        },
        isNew : Boolean, 
        isLoading : Boolean,
    },
    data() {
        return {
            valid: true,
            form: {
                i_shop: "",
                n_shop: "",
                d_date1: "",
                d_date2: "",
                t_remark: "",
                t_remark2: "",
            },            
        }
    },
    created() {        
        this.init();        
    },    
    destroyed() {        
        this.form = null;
    },
    watch: {        
        shopinfo() {            
            this.init();            
        }
    },
    computed: {
        rules: () => validateRules,
        originKey() {            
           return this.shopinfo ? this.shopinfo.i_shop : "";            
        },
    },

    methods: {
        async save() {
            this.$refs.form.validate();
            await this.$nextTick();
            if (!this.valid) return;
            if (!this.$refs.i_shop.validate()) return;
            
            const formData = new FormData();
			const keys = Object.keys(this.form);

            this.$emit("save", this.form);
        },
        init() {
            if (this.shopinfo) {
                this.form = deepCopy(this.shopinfo);
            } else {
                this.form = {
                    i_shop: "",
                    n_shop: "",
                    d_date1: "",
                    d_date2: "",
                    t_remark: "",
                    t_remark2: ""
                }
            };     
            if (this.$refs.form) {
                this.$refs.form.resetValidation();
            };
        },
        onClose() {
            console.log("onClose");
        }
    }
}
</script>

<style>

</style>