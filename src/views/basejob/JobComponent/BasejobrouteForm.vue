<template>
    <v-container class="grey lighten-5">
        <v-form @submit.prevent="save" ref="form" v-model="valid" lazy-validation>
            <!-- <v-text-field v-model="form.s_sort" label="No" :rules="[rules.Num()]"  hide-details="false" class="s_no" /> -->
            <v-row>
                <v-col col="12" sm="9" md="9">
                    <v-select v-if="!data" v-model="form.c_item" label="품명"
                        :items="itemList" item-text="n_item" item-value="c_item" 
                        :rules="[rules.require({ label: '품명' })]" >
                        <template v-slot:item="{ item }">{{ getText(item) }}</template>
                        <template v-slot:selection="{ item }">{{ getText(item) }}</template>
                    </v-select>
                    <v-text-field v-else label="품명"  v-model="getItemname" readonly />
                </v-col>
                <v-col col="12" sm="3" md="3">
                    <v-checkbox v-model="form.f_use" label="사용" true-value="Y"  false-value="N" hide-details="false"/>
                </v-col>
            </v-row>
            <v-select v-model="form.c_ptype" label="공정유형"
                :items="procList" item-text="n_ptype" item-value="c_ptype" 
                :rules="[rules.require({ label: '공정유형' })]" >
                <template v-slot:item="{ item }">{{ getText2(item) }}</template>
                <template v-slot:selection="{ item }">{{ getText2(item) }}</template>
            </v-select>
            <v-text-field v-model="form.t_remark" label="비고" />
            <v-btn type="submit" color="primary" block>저장</v-btn>
        </v-form>
    </v-container>
</template>

<script>
import { deepCopy } from '../../../../util/lib';
import validateRules from "../../../../util/validateRules";
export default {
    name: "BasejobrouteForm",
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
        itemList: {
            type: Array,
            default: null,
        },
        procList: {
            type: Array,
            default: null,
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
        // originKeyId() { return this.data ? this.data.c_ptype : ""; }, 
        getItemname() { return this.form.c_item  + ' - ' + this.form.n_item},
    },
    data() {
        return {
            valid: true,
            form : {
                c_com: "",
                c_item: "",
                c_ptype: "",
                s_sort: 0,
                f_use: "Y",
                t_remark: "",
            },            
        }
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
                    c_ptype: "",
                    // s_sort: (this.s_sort | 0) + 1,
                    f_use: "Y",
                    t_remark: "",                   
                }
            }
            if (this.$refs.form) {
                this.$refs.form.resetValidation(); 
                // this.$refs.c_ptype.init();                               
            }
        },
        async save() {
            this.$refs.form.validate();
            await this.$nextTick();
            if (!this.valid) return;
            // if (!this.$refs.c_ptype.validate()) return;
            this.$emit('onSave', this.form);
            this.init();
        },
        getText(itemList) {
            return itemList.c_item + ' - ' + itemList.n_item;
        },
        getText2(procList) {
            return procList.c_ptype + ' - ' + procList.n_ptype;
        },
    },
}
</script>

<style>

</style>