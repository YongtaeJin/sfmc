<template>
    <v-form @submit.prevent="save" ref="form" v-model="valid" lazy-validation @@submit.prevent="edit">
        <v-data-table :headers="headers" :items="form" class="mytable" >
            <template v-slot:item="{ item }">    
                <!-- <tr @dblclick:row="showRowInfo" > -->
                <tr @dblclick="showRowInfo(item)" >
                    <td :class="{red2: item.f_gubun==1, green2: item.f_gubun == 2, blue2: item.f_gubun == 3}" > {{ f_gubunchk(item.f_gubun) }} </td>                     
                    <td :class="{red2: item.f_gubun==1, green2: item.f_gubun == 2, blue2: item.f_gubun == 3}" align=center> {{ item.i_sort }} </td>
                    <td :class="{red2: item.f_gubun==1, green2: item.f_gubun == 2, blue2: item.f_gubun == 3}" align=center> {{ item.n_nm }} </td>
                    <td :class="{red2: item.f_yn==1, green2: item.f_yn == 0}"> {{ item.n_file }} </td>
                    <td align=center :class="{red2: item.f_yn==1, green2: item.f_yn == 0}"> {{ f_ynchk(item.f_yn) }} </td>
                    <td> {{ item.t_remark }} </td>
                </tr>
            </template>
        </v-data-table>
    </v-form>
</template>

<script>
import { deepCopy } from "../../../util/lib";
export default {
    name: "Shopmag02Form",     
    props: {
       addLists: {
            type: Array,
            default: null,
        },        
    },
    data() {
        return {
            valid: true,            
            headers: [
                { text: '신청번호',  value: 'i_shop', sortable: false, width: "200px", fixed: true, align:'center', align:' d-none'},
                { text: '구분', value: 'f_gubun', sortable: false, width: "60px", fixed: true},
                { text: '순번', value: 'i_sort', sortable: false, width: "50px", fixed: true,  align:'center'},                
                { text: '명칭', value: 'n_nm', sortable: false, width: "75px", fixed: true,  align:'center'},
                { text: '첨부서류', value: 'n_file', sortable: false, width: "150px", fixed: true, align:'center'},
                { text: '파일명', value: 't_filenm', sortable: false, width: "150px", fixed: true, align:'center', align:' d-none'},
                { text: '필수', value: 'f_yn', sortable: false, width: "50px", fixed: true, align:'center'}, 
                { text: '비고', value: 't_remark', sortable: false, width:"45%"},
                { text: '샘플', value: 't_sample', sortable: false, width:"35%", align:' d-none'},  
            ],
            form: {
                i_shop: "",
                i_ser: "",
                f_gubun: "",
                f_yn: "",
                n_nm: "",
                n_file: "",
                t_filenm: "",
                t_remark: "",
                t_sample: "",
                i_sort: "",
                f_del: "",
                
            },
        }
    },
     created() {
        this.init();
    },
    watch: {
        addLists() {
            this.init();
        }
    },
    methods: {
        init() {
            if (this.addLists) {       
                this.form = deepCopy(this.addLists);
            } else {

            }
        },
        f_gubunchk(data) {
            if (data == 1) { 
                return '신청서' ;
            } else if (data == 2) {
                return '추가정보';
            } else if (data == 3) {
                return '협약서';
            } else {
                return '기타';
            }

            // return data == 1  ? '신청서' : '추가정보';
        },
        f_ynchk(data) {
            return data == 1  ? '필수' : '선택';
        },
        async showRowInfo( item ) {            
            await this.$emit("edit", item );        
        },
        async save() {
            // this.$emit("save");
        },
    }

}
</script>

<style>
.red2 {
  font-size: 30;
  color: red;
}
.green2 {
  font-size: 10;
  color: green;
}
.blue2 {
  color: blue;
}

</style>