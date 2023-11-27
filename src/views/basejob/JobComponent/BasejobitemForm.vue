<template>
    <v-container class="grey lighten-5">
        <v-form @submit.prevent="save" ref="form" v-model="valid" lazy-validation>
            <v-row>
                <v-col col="12" sm="2" md="2">
                    <v-text-field v-model="form.s_sort" label="No" :rules="[rules.Num()]"  hide-details="false"/>
                </v-col>
                <v-col col="12" sm="6" md="6">
                    <!-- <v-text-field v-model="form.c_item" label="품번" hide-details="false"/> -->
                    <input-duplicate-check ref="c_item"
                        label="품번"
                        v-model="form.c_item"                        
                        :cbCheck="keyCheckItem"
                        :origin="originKeyId"
                        :readonly="!!data"                        
                        :rules="[rules.require({ label: '품번1' }), rules.alphaNumDash()]" />
                </v-col>
                <v-col col="12" sm="4" md="4">
                    <!-- <v-text-field v-model="form.f_use" label="사용" hide-details="false"/> -->
                    <v-checkbox v-model="form.f_use" label="사용" true-value="Y"  false-value="N" hide-details="false"/>
                </v-col>
                <v-col col="12" sm="12" md="12">
                    <v-text-field v-model="form.n_item" label="품명" hide-details="false"/>
                </v-col>
                <v-col col="12" sm="12" md="12">
                    <v-text-field v-model="form.t_size" label="사양(규격)" hide-details="false"/>
                </v-col>
                <v-col col="12" sm="6" md="6">
                    <!-- <v-text-field v-model="form.i_unit" label="단위" hide-details="false"/> -->
                    <v-select v-model="form.i_unit" label="단위"
                        :items="units" item-text="n_code" item-value="c_code" />
                </v-col>
                <v-col col="12" sm="6" md="6">
                    <!-- <v-text-field v-model="form.i_type" label="제품타입" hide-details="false"/> -->
                    <v-select v-model="form.i_type" label="제품타입"
                        :items="itemtypes" item-text="n_code" item-value="c_code" />
                </v-col>
                <v-col col="12" sm="6" md="6">
                    <v-text-field v-model="form.a_bye" label="구매단가" hide-details="false"/>
                </v-col>
                <v-col col="12" sm="6" md="6">
                    <v-text-field v-model="form.a_sell" label="판매단가" hide-details="false"/>
                </v-col>
                <v-col col="12" sm="12" md="12">
                    <v-text-field v-model="form.t_remark" label="비고" hide-details="false"/>
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
    name: "BasejobvendForm",
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
        units: {
            type: Array,
            default: null,
        },  
        itemtypes: {
            type: Array,
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
                n_item: "",
                t_size: "",
                i_unit: "",
                i_type: "",
                a_bye: 0,                
                a_sell: 0,           
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
        originKeyId() { return this.data ? this.data.c_item : ""; }, 
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
                    c_item: "",
                    s_sort: (this.s_sort | 0) + 1,                    
                    n_item: "",
                    t_size: "",
                    i_unit: "",
                    i_type: "",
                    a_bye: 0,                    
                    a_sell: 0,           
                    f_use: "Y",
                    t_remark: "",
                }
            }
            if (this.$refs.form) {
                this.$refs.form.resetValidation(); 
                this.$refs.c_item.init();                               
            }
        },
        async save() {
            this.$refs.form.validate();
            await this.$nextTick();
            if (!this.valid) return;
            if (!this.$refs.c_item.validate()) return;
            this.$emit('onSave', this.form);
            this.init();
        },
    },
}
</script>

<style>

</style>