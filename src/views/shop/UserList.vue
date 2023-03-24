<template>
    <v-form  ref="form">
        <v-toolbar background-color="primary" dark >
            <v-spacer/>
            <v-text-field label="ID/이름/email : " v-model="f_serarch" hide-details  single-lin  />            
            <v-btn color="primary"  @click="fetchData">조회</v-btn>
        </v-toolbar>
        
        <v-data-table :headers="headers" class="mytable"
            :items="items" :items-per-page="20"  :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" >
            <template v-slot:item="{ item }">
                <tr>
                    <td>{{ item.mb_id }}</td>
                    <td>{{ item.mb_name }}</td>
                    <td>{{ item.mb_email }}</td>
                    <td  @dblclick="levleChange(item)"><u>{{ item.mb_level }}</u></td>
                    <td>{{ item.chkpw }}</td>
                    <td @dblclick="use_delete(item)"><u>삭제</u> </td>
                </tr>
            </template>

        </v-data-table>
            
        
    </v-form>
</template>

<script>
import { id } from '../../../util/validateRules';
export default {
    name :"UserList",
	title : "사용자정보",
    data() {
        return {
            headers: [
                { text: 'ID',  value: 'mb_id', sortable: true},
                { text: '이름',  value: 'mb_name', sortable: true},
                // { text: '연락처',  value: 'mb_phone', sortable: false},
                { text: 'email',  value: 'mb_email', sortable: true},
                { text: '등급',  value: 'mb_level', sortable: true},
                { text: '비빌먼호',  value: 'chkpw', sortable: false},
                { text: '사용자삭제', value: 'f_del', sortable: false},
                // { text: '업체명',  value: 'mb_login_at', sortable: false},
            ],
            items: [],
            f_serarch: "",
        }
    },
    
    created() {
        this.fetchData() ;
    },
    mounted() {
        window.addEventListener('beforeunload', this.leave)
    },
    
    beforeUnmount() {
        window.removeEventListener('beforeunload', this.leave)
    },
    methods: {
        leave(event) {
		    event.preventDefault();
		    event.returnValue = '';
	    },
        async fetchData(){
            this.items = await this.$axios.get(`/api/shopinfo/getShopUserList?f_serarch=${this.f_serarch}`);
        },
        async levleChange(item) {
            let lev = item.mb_level=="관리자"?'일반':'관리자';
            const res = await this.$ezNotify.confirm(`${item.mb_name} 등급 변경 하시겠습니까 ?`, lev);
            if(res) {
                const data = await this.$axios.patch(`/api/shopinfo/patchShopUserList?mb_id=${item.mb_id}&mb_level=${item.mb_level}`);
                if (data.changedRows === 1) {
                    item.mb_level = lev;
                }
            }
        },
        async use_delete(item) {
             const res = await this.$ezNotify.confirm(`${item.mb_name} 삭제 하시겠습니까 ?`, '회사삭제');
             if(res) {
                const data = await this.$axios.patch(`/api/shopinfo/patchShopUserDelete?mb_id=${item.mb_id}&mb_level=${item.mb_level}`);
                if (data.affectedRows === 1) {
                    await this.$ezNotify.confirm("삭제 완료 !!!!!!", "");
                    const idx = this.items.indexOf(item);
                    if (idx) {
                        this.items.splice(idx, 1);
                    }
                }
            }
        },
    }
}
</script>

<style>

</style>