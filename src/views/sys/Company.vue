<template>
    <v-container fluid>        
        <v-toolbar >
            <v-toolbar-title>사업장 관리</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>       
            <v-spacer></v-spacer>
            <v-btn color="primary" dark class="mr-2" @click="openDialog()">사업장 추가</v-btn>
        </v-toolbar>
        <v-card>
            <v-card-title>
                <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details></v-text-field>
            </v-card-title>
        </v-card>
        
        <v-data-table :headers="headers" :items="items" :search="search" :loading="loading">
            <template v-slot:item.cmd="{ item }">
                <tooltip-btn icon label="수정" @click="openDialog(item)">
                <v-icon>mdi-pencil</v-icon>
                </tooltip-btn>
            </template>
        </v-data-table>
        
        <ez-dialog label="사업장 추가/수정" ref="dialog" width="500" color="primary" persistent>
            <company-update-form @onSave="companyUpdate" @onCreate="companyCreate" :keyCheck="keyCheck" :company="curitem" :newItem="newItem">
            </company-update-form>
        </ez-dialog>
    </v-container>
</template>


<script>
import { mapActions } from "vuex";
import axios from "axios";
import EzDialog from '../../components/etc/EzDialog.vue';
import CompanyUpdateForm from './CompanyUpdateForm.vue';
import TooltipBtn from "../../components/etc/TooltipBtn.vue";
import { deepCopy } from "../../../util/lib";

export default {
  components: { TooltipBtn, EzDialog, CompanyUpdateForm},
    name: "SysCompany",
    data () {
        return {
            search: '',
            loading: false,
            headers: [
                { text: '사업장코드', align: 'start', filterable: false, value: 'i_com' },
                { text: '사업장명', value: 'n_com' },
                { text: '사업자번호', value: 'i_creg' },
                { text: '대표자명', value: 'n_pernm' },
                { text: '전화번호', value: 't_tel' },
                { text: 'FAX번호', value: 't_fax' },
                { text: 'email', value: 't_email' },
                { text: '', value: 'cmd', sortable: false,},
            ],
            items: [],            
            curitem: null,
            initItem: {
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
          newItem: "",
        }
    },
    mounted() {
        this.fetchData();        
    },
    methods: {
        ...mapActions('company', ["duplicateCheckCompany"]),

        async keyCheck(value) {
            const payload = {
                field: "i_com",
                value,
            };            
            return await this.duplicateCheckCompany(payload);            
        },
        async fetchData() {
            this.items = await this.$axios.get("/api/company/company");
        },        
        openDialog(item) {
            if(item) { 
                this.curitem = item;
                this.newItem = "수 정";
            } else {                
                this.curitem = this.initItem;                
                this.newItem = "추 가";
            }
            this.$refs.dialog.open();
        },

        async companyUpdate(form) {
            this.loading = true;
            const data = await this.$axios.patch("/api/company", form);
            this.loading = false;
            if (data) {
                const idx = this.items.indexOf(this.curitem);
                this.items.splice(idx, 1, data);
                this.$toast.info(`${data.i_com} 수정 하였습니다.`);
        
            }
            this.$refs.dialog.close();
        },
        async companyCreate(form) {
            this.loading = true;
            const data = await this.$axios.post("/api/company", form);
            this.loading = false;
            if (data) {
                this.items.push(data);                
                this.$toast.info(`${data.i_com} 추가 하였습니다.`);
            }
            this.$refs.dialog.close();
        },
    },
}
</script>

<style>

</style>

