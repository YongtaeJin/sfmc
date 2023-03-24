<template>
    <v-form ref="form">
        <!-- <v-data-table :headers="fileHeaders" :items="inputfilelist" class="mytable" @dblclick:row="downLoad"> -->
        
        <v-toolbar background-color="primary" dark >
            <v-btn v-if="fileLists.length" @click="process" color="primary" >서류처리</v-btn>
            <v-btn v-if="fileLists.length" @click="mailSend" color="primary">메일발송</v-btn>
            <v-spacer></v-spacer>

            <v-checkbox v-if="fileLists.length" label="서류명" v-model="f_downchk2" hide-details color="primary" class="mx-4" />

            <v-btn v-if="fileLists.length"  color="primary" @click="alldownLoad">일과 내려받기</v-btn>
        </v-toolbar>
        
        <v-data-table :headers="fileHeaders" :items="inputfilelist" class="mytable">
            <template v-slot:item="{ item }">        
                <tr>
                    <td align=center> {{ item.i_sort }} </td>
                    <td align=center> {{ item.f_yn }} </td>
                    <td> {{ item.n_nm }} </td>
                    <td align=center @dblclick="docProcess(item)"
                        :class="{redcol: item.f_noact=='N', greencol: item.f_noact == 'Y',  bluecol: item.f_noact == 'I' }" > 
                        <u>{{ f_noact(item.f_noact) }}</u> 
                    </td>
                    
                    <td> {{ item.n_file }} </td>
                    <td> {{ item.n_filename }} </td>
                    <td align=center>
                        <v-btn v-if=item.n_filename fab x-small  @click="onDownLoad(item)">
                        <v-icon dark>mdi-file-download</v-icon>
                        </v-btn>                
                    </td>  
                </tr>
            </template>
        </v-data-table>                
    </v-form>
</template>

<script>
import { deepCopy } from "../../../util/lib";
import { save } from 'save-file';
export default {
    name: "Shopinputmag03Form",
    props: {        
        fileLists: {
            type: Object,
            default: null,
        },
        companyName: null,
    },
    data() {
        return {
             fileHeaders : [
                { text: '순번',       value: 'i_sort', sortable: false, align:'center', width: "55px"},
                { text: '필수',       value: 'f_yn', sortable: false, align:'center', width: "75px"},
                { text: '명칭',       value: 'n_nm', sortable: false, }, 
                { text: '서류',       value: 'f_noact', sortable: false, align:'center', width: "55px"},
                { text: '첨부서류',   value: 'n_file', sortable: false, }, 
                { text: '첨부파일명', value: 'n_filename', sortable: false, },
                { text: 'DOWN',      value: 't_att', sortable: false, align:'center', width: "75px"}, 
                
            ],       
            inputfilelist: [],
            // form : {
            //     i_shop: "",
            //     i_ser: "",
            //     f_gubun: "",                
            //     n_nm: "",                
            //     i_sort: "",
            //     f_yn: "",
            //     i_no: "",
            //     f_noact: "",
            //     n_file: "",
            //     n_filename: "",
            //     t_att: "",
            //     f_edit: false,
            // },
            f_downchk2: 0,
        }
    },
    created() {       
        this.init();
    },
    watch: {
        fileLists() {
            this.init();
        }
    },
    methods: {
        async init() {
             if (this.fileLists) {                   
                this.inputfilelist = await this.$axios.get(`/api/shopinfo/getShopArgeeInDetail?i_shop=${this.fileLists.i_shop}&i_no=${this.fileLists.i_no}`);
            } 
        },
        f_noact(data) {
            return data == "I" ? "등록" : (data == "Y") ? "확인" : (data == "N") ? "반려" : (data == "R") ? '수정': "";
        },
        // async downLoad(event, { item }) {
        //     // this.editedIndex = this.items.indexOf(item)
        //     // this.editedItem = Object.assign({}, item)
        //     // this.dialog = true
        //     const { n_filename, t_att } = item;
        //     if (!n_filename && !t_att)  {
        //         await this.$ezNotify.alert("서류 미등록 ", item.n_nm, {});
        //         return
        //     }
        //     const fileBuffer = await this.$axios.get(`/api/shopinfo/getFileDown?path=${t_att }`);            
        //     if (fileBuffer ) {
        //         save (fileBuffer, n_filename);
        //         alert('File Donw load Click !!!!!'); 
        //     } else {
        //         await this.$ezNotify.alert("다운로드 실패 !!", "오류", {
        //             // icon: "mdi-video-4k-box",
        //         });
        //     }
        // },
        async onDownLoad(item) {        
            const fileName = `https://protagonist.kro.kr${item.t_att}`;
            const downFile = item.n_filename;

            const fileBuffer = await this.$axios.get(`/api/shopinfo/getFileDown?path=${ item.t_att }`); 
            if (fileBuffer) {
                save (fileBuffer, downFile);
                alert('File Donw load Click !!!!!'); 
            } else {
                await this.$ezNotify.alert("다운로드 실패 !!", "오류" );
            }
        },
        async alldownLoad() {

            const path = require('path');
            let f_filetype = '1';

            if (this.f_downchk2) { f_filetype = '2'};
            if (this.inputfilelist) {
                const fileBuffer = await this.$axios.get(`/api/shopinfo/getFileDownZip?i_shop=${ this.inputfilelist[0].i_shop }&i_no=${ this.inputfilelist[0].i_no }&f_gubun=${ this.inputfilelist[0].f_gubun }&f_filetype=${f_filetype}`);

                if (fileBuffer ) {
                    save (fileBuffer, `${this.companyName}.zip`);
                    alert('File Donw load Click !!!!!'); 
                } else {
                   await this.$ezNotify.alert("다운로드 실패 !!", "오류" );
                }
            }
        },
        async docProcess(item) {
            if (item.f_noact) {
                item.f_noact = item.f_noact == "Y" ? "N" : "Y";    
                item.f_edit = true;            
            }
        },
        async process() {               
            this.$emit("process", this.inputfilelist);
        },

        async mailSend() {
            this.$emit("mailSend", this.inputfilelist);
        },
    }
}
</script>

<style>

</style>