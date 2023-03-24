<template>
    <v-container fluid>     
        <v-toolbar >
            <v-toolbar-title>사용자 관리</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>       
            <v-spacer></v-spacer>
            <v-btn color="primary" dark class="mr-2" @click="openDialog()">사용자 추가</v-btn>
        </v-toolbar>
        <v-card>
            <v-card-title>                
                <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details sm="2"></v-text-field>                
            </v-card-title>
            
            <v-data-table :headers="headers" :items="users" :search="search" :loading="loading" @dblclick:row="showRowInfo" />
            <!--
            <v-data-table :headers="headers" :items="users" :search="search" :loading="loading" @dblclick:row="showRowInfo" >            
                <template v-slot:item="{ item }"  >
                    <tr @dblclick="handleClick(item)">
                        <td width="160"> <v-select v-model="item.i_com" :readonly="true" :items="compnayLists" item-text="n_com" item-value="i_com"></v-select> </td>
                        <td> {{item.i_id}} </td>
                        <td> {{item.n_name}} </td>
                        <td> {{item.i_password}} </td>
                        <td> {{item.t_memo}}</td>                        
                    </tr>
                </template>            
            </v-data-table>
            -->
        </v-card>
        
    
        <ez-dialog label="사용자 추가/수정" ref="dialog" width="400" color="primary" persistent @onClose="onClose">
        
            <sys-users-form :user="user" :companys="compnayLists" :isNew="isNew" :cbCheckId="cbCheckId" @onSave="save" @onDelete="userdel" :onClose="onClose">
            </sys-users-form>
            <!--
            <sys-users-form :user="user" :companys="compnayLists" :isNew="isNew" @onSave="save">
            </sys-users-form>
            -->
        </ez-dialog>
    </v-container>
</template>

<script>
import { mapActions } from "vuex";
import EzDialog from '../../components/etc/EzDialog.vue';
import SysUsersForm from './SysUsersForm.vue';


export default {
  components: { EzDialog, SysUsersForm },
    name: "SysUsers",
    data() {
        return {
            search: '',
            loading: false,
            compnayLists: [],

            headers: [
                
                { text: '사업장명', value: 'n_com' },
                { text: 'ID', value: 'i_id' },
                { text: '성명', value: 'n_name' },
                
                { text: '메모', value: 't_memo'},
            ],

            users: [],
            company: -1,
            curUsers: [],
            user: null,
            isNew: true,
            isEdit: false,
        };
    },
    computed: {
        companyUsers() {           
        },
        companyName() {           
        },
    },
    watch: {
        company() {
            
        }
    },
    mounted() {
        this.fetchData();
    },
    methods: {        
        ...mapActions("company", ["createUser", "updateUser", "deleteUser", "duplicateCheckId"]),
        onClose(){
            if(!this.isEdit) {
                if(this.users) {
                    if (this.user) {
                        this.user = null;
                    } else {
                        this.user = this.users[0];
                    }
                }
            }
        },
        async fetchData() {            
            this.compnayLists = await this.$axios.get("/api/company/companylist");
            this.users = await this.$axios.get("/api/company/companyusers");                 
        },
        openDialog() {
            this.isNew = true;            
            this.user = null;
            this.isEdit = false;
            this.$refs.dialog.open();            
        },
        showRowInfo(event, { item }) {
            this.isNew = false;
            this.isEdit = false;
            this.user = item;
            this.$refs.dialog.open();
        },       
        handleClick({ item }) {
            console.log("item", this.item);
            // this.user = item;
            // this.$refs.dialog.open();
        },
        async cbCheckId(value) {
            const payload = {
                field: "i_id",
                value,
            };            
            return await this.duplicateCheckId(payload); 
        },
        async save(form) {
            this.isLoading = true;            
            if (this.isNew) {
                const data = await this.createUser(form);
                if (data) {
                    this.users.push(data);                
                    this.$toast.info(`${data.i_id} 추가 하였습니다.`);
                }
            } else {
                const data = await this.updateUser(form);                
                if (data) {
                    if (data == true) {
                        const idx = this.users.indexOf(this.user);
                        this.users.splice(idx, 1);
                        this.$toast.info(`${this.user.i_id} 삭제 하였습니다.`);
                    } else {
                        const idx = this.users.indexOf(this.user);                    
                        this.users.splice(idx, 1, data);
                        this.$toast.info(`${this.user.i_id} 수정 하였습니다.`);
                    }
                }
            }            
            this.isEdit = true;
            this.isLoading = false;    
            this.$refs.dialog.close();       
        },

        async userdel(form) {                   
            const result =  await this.$ezNotify.confirm(
			 	`<b>${this.user.i_id}</b> 삭제 하시겠습니까?`,
			 	'사용자 삭제',
			 	{icon : 'mdi-delete', iconColor: 'red'}
			 );
            if(!result) {
                this.$refs.dialog.close();
                return;
            } 
            this.isEdit = true;
            const idx = this.users.indexOf(this.user);
            this.users.splice(idx, 1);
            this.$toast.info(`${this.user.i_id} 삭제 하였습니다.`);

            const data = await this.deleteUser(form); 
            
            this.$refs.dialog.close();            
        }
        
    },
}
</script>

<style>

</style>