<template>
    <v-form  ref="form">
        <v-toolbar background-color="primary" dark >
            <!-- <v-toolbar-title>일괄 내려받기 : </v-toolbar-title> -->
            <v-btn v-if="fileLists.length" @click="process(form)" color="primary" >서류처리</v-btn>
            <v-btn v-if="fileLists.length" @click="mailSend" color="primary">메일발송</v-btn>
            <v-spacer></v-spacer>
            <!-- <v-checkbox label="회사명" v-model="f_downchk1" hide-details color="primary"/> -->
            <v-checkbox v-if="fileLists.length" label="서류명" v-model="f_downchk2" hide-details color="primary" class="mx-4" />
            <!-- <v-spacer></v-spacer> -->
            <v-btn v-if="fileLists.length" color="primary" @click="alldownLoad">일과 내려받기</v-btn>
        </v-toolbar>
        
        <v-data-table :headers="fileHeaders" :items="form" class="mytable">
            <template v-slot:item="{ item }">        
                <tr>
                    <td align=center> {{ item.i_ser }} </td>
                    <td align=center :class="{redcol: item.f_yn==1, greencol: item.f_yn == 0}">{{f_ynchk(item.f_yn)}} </td>                    
                    <td align=center @dblclick="docProcess(item)"
                        :class="{redcol: item.f_noact=='N', greencol: item.f_noact == 'Y',  bluecol: item.f_noact == 'I' }" > 
                        <u>{{ f_noact(item.f_noact) }}</u>
                    </td>
                    <td> {{ item.n_filename }} </td>
                    <td> {{ item.n_file }} </td>
                    <td align=center>
                        <v-btn v-if=item.t_att fab x-small  @click="downLoad(item)">
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
            type: Array,
            default: null,
        },
        companyName: null,
    },
    data() {
        return {
            fileHeaders : [
                { text: '순번',           value: 'i_ser', sortable: false, align:'center', width: "55px"},
                { text: '필수여부',       value: 'f_yn', sortable: false, align:'center', width: "80px"},
                { text: '서류',           value: 'f_noact', sortable: false, align:'center', width: "55px"},
                { text: '첨부서류',       value: 'n_filename', sortable: false, }, 
                { text: '첨부파일명',     value: 'n_file', sortable: false, },
                { text: 'DOWN',          value: 't_att', sortable: false, align:'center', width: "75px"}, 
                
            ],
            form : {
                i_shop: "",
                i_ser: "",
                i_no: "",
                f_gubun: "",
                f_yn: "",
                f_noact: "",
                n_filename: "",
                n_file: "",
                t_att: "",
                f_edit: false,
            },
            f_downchk1: 1,
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
        init() {
            if (this.fileLists) {       
                this.form = deepCopy(this.fileLists);
            } 
        },
        f_ynchk(data) {
            return data == 1  ? '필수' : '선택';
        },
        f_noact(data) {
            return data == "I" ? "등록" : (data == "Y") ? "확인" : (data == "N") ? "반려" : (data == "R") ? '수정': "";
        },
        docProcess(item) {            
            if (item.f_noact) {
                item.f_noact = item.f_noact == "Y" ? "N" : "Y";    
                item.f_edit = true;            
            }
        },
        async process(form) {
            this.$emit("process", form);
        },
        async mailSend() {
            this.$emit("mailSend")            
        },

        async downLoad(item) {
            const disableAutoBOM = true;

            const downFile = item.n_file;            

            // const res = await this.$ezNotify.confirm(
            //     `${item.n_file} <br><br>내려받기 하시겠습니까 ?`,
            //     item.n_filename,
            //     // { width: 200 }
            // );
            // if (res) {
                // const fileBuffer = await this.$axios.get(`/api/shopinfo/getFileDown?path=${ item.t_att }`);            
                // save (fileBuffer, downFile);
            // }
            const fileBuffer = await this.$axios.get(`/api/shopinfo/getFileDown?path=${ item.t_att }`);            
            if (fileBuffer ) {
                save (fileBuffer, downFile);
                alert('File Donw load Click !!!!!'); 
            } else {
                await this.$ezNotify.alert("다운로드 실패 !!", "오류", {
                    // icon: "mdi-video-4k-box",
                });
            }
            
            

            //  const fileBufferRes = await this.$axios.get(`/api/shopinfo/getFileDownRes?path=${ item.t_att }`);
            //  console.log(fileBufferRes);
            // res.download("D:\WEBAPP\protagonist\server/upload/shopsigned/23-001/freeview/2_afUOwFG3RaccbLph.xlsx");
	        //res.download("D:/WEBAPP/protagonist/server/upload/shopsigned/23-001/freeview/2_afUOwFG3RaccbLph.xlsx");
       
          

            //  const fs = require('fs');
            // try { fs.writeFileSync(downFile, "aaaaaaaa", 'utf-8'); }
            //     catch(e) { 
            //         console.log(e);
            //         alert('Failed to save the file !'); 
            //         }
            // await saveAs  (fileBuffer, downFile);
          


            //  const res = await this.$ezNotify.alert("저장 하였습니다.");

            // try {
                
            //     const a = document.createElement("a");
            //     a.href = fileBuffer;        
            //     a.download = downFile;
            //     document.body.appendChild(a);
            //     a.click();
            //     document.body.removeChild(a);
            // } catch(err) {
            //     console.log({ err })
            // }
     
            // const element = document.createElement('a');
            // element.setAttribute('href',  fileBuffer);
            // element.setAttribute('download', downFile);
            // document.body.appendChild(element);
            // element.click();

            // await axios({
            //         url: 'https://protagonist.kro.kr/upload/shopsigned/23-001/freeview/2_iY4SbGs909QykRrD.pdf',
            //         method: 'GET',
            //         responseType: 'blob',
            //     }).then((response) => {
            //          var fileURL = window.URL.createObjectURL(new Blob([response.data]));
            //          var fileLink = document.createElement('a');
   
            //          fileLink.href = fileURL;
            //          fileLink.setAttribute('download', 'file.pdf');
            //          document.body.appendChild(fileLink);
   
            //          fileLink.click();
            //     });

            // console.log("sdfsafsaf");


        },
        async alldownLoad() {

            const path = require('path');
            let f_filetype = '1';

            if (this.f_downchk2) { f_filetype = '2'};
           
            if (this.fileLists) {
                // var t_att = this.fileLists[0].t_att;
                // var t_path =  t_att.split("/").slice(0, -1).join("/");
                // console.log(t_path);

                const fileBuffer = await this.$axios.get(`/api/shopinfo/getFileDownZip?i_shop=${ this.fileLists[0].i_shop }&i_no=${ this.fileLists[0].i_no }&f_gubun=${ this.fileLists[0].f_gubun }&f_filetype=${f_filetype}`);

                if (fileBuffer ) {
                    save (fileBuffer, `${this.companyName}.zip`);
                    alert('File Donw load Click !!!!!'); 
                } else {
                   await this.$ezNotify.alert("다운로드 실패 !!", "오류" );
                }
            }


            // const fileBufferRes = await this.$axios.get(`/api/shopinfo/getFileDownZip`);
            return ;
             
            // 일괄 다운르드
            let downFile = "";           
            let fileName = ""; // `http://localhost:8080${item.t_att}`; 
            if (this.fileLists) {               
                for (let ob in this.fileLists) {
                    if (this.f_downchk1) {
                        downFile = this.companyName + "_";
                    } else {
                        downFile = "";
                    }
                    if (this.fileLists[ob].n_file && this.fileLists[ob].t_att) {
                        if (this.f_downchk2) {
                            downFile = downFile + this.fileLists[ob].n_filename;
                        } else {
                            downFile = downFile + this.fileLists[ob].n_file;
                        }
                        downFile = downFile + path.extname(this.fileLists[ob].n_file);                        
                        // fileName = `https://protagonist.kro.kr${this.fileLists[ob].t_att}`; 
                        fileName = this.fileLists[ob].t_att;

                        
                        const fileBuffer = await this.$axios.get(`/api/shopinfo/getFileDown?path=${ fileName }`);            
                        save (fileBuffer, downFile);
                        setTimeout(() => alert("World"));

                        // setTimeout(() => alert("World"), 1);
                        // try {
                        //     const response = await fetch(fileName)
                        //     const blob = await response.blob();
                        //     const url = await URL.createObjectURL(blob)

                        //     const a = document.createElement("a");
                        //     a.href = url;        
                        //     a.download = downFile;
                        //     document.body.appendChild(a);
                        //     a.click();
                        //     document.body.removeChild(a);
                        // } catch(err) {
                        //     console.log({ err })
                        // }
                    }
                }
            }
        },
    },
}
</script>

<style>

</style>