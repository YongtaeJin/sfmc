<template>
    <v-container fluid>
        <v-toolbar height="40px" background-color="primary" dark>
            <v-toolbar-title>공지사항 관리</v-toolbar-title>
            <v-spacer/>
           
            <tooltip-btn label="조회" @click="fatch"><v-icon>mdi-magnify</v-icon></tooltip-btn>            
            <tooltip-btn label="추가" @click="addNoticeItem"><v-icon>mdi-plus</v-icon></tooltip-btn>            
            <tooltip-btn label="삭제" @click="delNoticeItem"><v-icon>mdi-minus</v-icon></tooltip-btn>
        </v-toolbar>
        <v-row>
            <v-col col="12" sm="7" md="7">
                <v-data-table :headers="headers" :items="items"
                    item-key="i_ser" single-select @click:row="rowSelect"
                    :items-per-page="20" :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" 
                    class="elevation-1 text-no-wrap">
                </v-data-table>
            </v-col>
            <v-col col="12" sm="5" md="5">
                <v-toolbar height="30px" background-color="primary" dark>
                <v-toolbar-title >공지내용</v-toolbar-title>
                </v-toolbar>
                <v-container class="grey lighten-5">                    
                    <v-form @submit.prevent="save" ref="form" v-model="valid" lazy-validation>
                        
                            <v-text-field v-model="form.t_title" label="제목" hide-details="false"/>
                            <input-date v-model="form.d_start" label="공지시작일" :rules="rules.date({required: false})" hide-details="false"/>
                            <input-date v-model="form.d_end" label="공지종료일" :rules="rules.date({required: false})" hide-details="false"/>                            
                            <v-textarea v-model="form.t_content" label="공지내용" hide-details="false" />
                            <input-radio v-model="form.f_use" label="공지여부" row :items="yesnoItem"/>
                            <v-btn type="submit" color="primary" block >저장</v-btn>
                                
                    </v-form>
                </v-container>
                
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import qs from "qs";
import { mapActions } from "vuex";
import { deepCopy } from '../../../util/lib';
import EzDialog from '../../components/etc/EzDialog.vue';
import TooltipBtn from '../../components/etc/TooltipBtn.vue';
import InputRadio from '../../components/InputForms/InputRadio.vue';
import InputDate from '../../components/InputForms/InputDate.vue';
import validateRules from "../../../util/validateRules";


export default {
    name: "Notice",
    components: { TooltipBtn, EzDialog, InputRadio, InputDate, },
    
    mount() {
        this.init();
    },
    data() {
        return {
            headers: [
                {text: '제목',  value: 't_title', sortable: false, align:'left'},
                {text: '공지시작',  value: 'd_start', sortable: false, align:'center', width: "60px"},
                {text: '공지종료',  value: 'd_end', sortable: false, align:'center', width: "60px"},
                {text: '공지',  value: 'f_use', sortable: false, align:'center', width: "50px"},
                {text: '작성자',    value: 'n_crnm', sortable: false, align:'center', width: "55px"},
                {text: '작성일시',  value: 'd_create_at', sortable: false, align:'center', width: "60px"},
            ],
            items: [], item: [],
            form : {
                i_ser: "", c_com: "", t_title: "", t_content: "", d_start: "", d_end: "", f_use: "Y", n_crnm: ""
            },
            yesnoItem: [
                {label: "공지", value: "Y"},
                {label: "중지", value: "N"},
            ],
            valid: true,
        }
    },
    computed: {
        rules: () => validateRules,
    },
    methods: {
        ...mapActions("system", ["iuNotice"]), 
        async init() {
            this.form = {
                c_com: "",
                i_ser: "",
                t_title: "", t_content: "", d_start: "", d_end: "", f_use: "Y", n_crnm: ""
            }
        },
        async fatch() {      
            this.items = [];
            const query = qs.stringify({c_com: this.$store.state.user.member.c_com});            
            this.items = await this.$axios.get(`/api/system/getNoticeList?${query}`);
        },
        async addNoticeItem() {
            this.form = {
                c_com: this.$store.state.user.member.c_com,
                i_ser: "new",
                t_title: "", t_content: "", d_start: "", d_end: "", f_use: "Y", n_crnm: ""
            }
        
        },
        async delNoticeItem() {
            if(this.form.i_ser && this.form.i_ser != "new") {
                const res = await this.$ezNotify.confirm("삭제 하시겠습니까 ?", "삭제", {icon: "mdi-message-bulleted-off", width: 350,});
                if(!res) return;
                const idx = this.items.findIndex((item) => item.i_ser === this.form.i_ser);
                const data = await this.$axios.delete(`/api/system/delNotice/${this.form.c_com}/${this.form.i_ser}`);
                if(data) {
                    this.$toast.info(`[${this.form.t_title}] 삭제 하였습니다.`);
                    this.items.splice(idx, 1);
                    this.init();
                }
            }

        },
        rowSelect :function (item, row) {            
            row.select(true);            
            //this.item = item;           
            this.form = deepCopy(item);
        },
        async save() {
            this.$refs.form.validate();
            await this.$nextTick();
            if (!this.valid) return;

            const row = await this.iuNotice(this.form);
            if (row) {                
                const idx = this.items.findIndex((item) => item.i_ser === row.i_ser);
                if (idx >=0 ) {
                    this.items.splice(idx, 1, row)
                } else {
                    this.items.push(row) ;
                }
                this.$toast.info(`수정 하였습니다.`);
            }        
        }

    }
}
</script>

<style>

</style>