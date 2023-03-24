<template>
  <v-form @submit.prevent="save" ref="form" v-model="valid" lazy-validation>
    
    <v-layout align-start>
    <v-flex>
      <v-data-table :headers="headers" :items="form" item-key="n_filename"
        :expanded.sync="expanded"
        :single-expand="singleExpand"
        class="mytable"
      >
        <template v-slot:item="{ item, expand, isExpanded }">        
          <tr >            
            <td align=center :class="{red2: item.f_yn==1, green2: item.f_yn == 0}">{{f_ynchk(item.f_yn)}} </td>
            <td align=center>
              <v-btn v-if="item.t_sample" small fab  @click="downLoad(item)">
                <v-icon>mdi-note</v-icon>
              </v-btn>
            </td>
            <td> {{ item.n_filename }} <v-icon v-if="item.t_remark" @click="expand(!isExpanded)">mdi-help-circle-outline</v-icon></td> 
            <td align=center :class="{red2: item.f_noact=='N', green2: item.f_noact == 'Y'}"> {{ f_noact(item.f_noact) }} </td>
            <td>
              <div class="d-flex align-center">
                {{ item.n_file2 }} <v-spacer/>
              </div>
            </td>
            <td align=center width="50px">                 
                <v-file-input  v-model="item.n_file" :multiple="false"
                  @change="getFilename($event, item)"
                  color="primary accent-4" hide-details prepend-icon="mdi-file-upload" />
            </td> 
             <td align=center>
                <v-btn v-if=item.n_file2 fab x-small  @click="onButtonClick3(item)">
                  <v-icon dark>mdi-delete-circle-outline</v-icon>
                </v-btn>                
            </td>       
            <td align=center>
                <v-btn v-if=item.n_file2 fab x-small  @click="onButtonClick2(item)">
                  <v-icon dark>mdi-file-download</v-icon>
                </v-btn>                
            </td>          
          </tr>
        </template>
        <template v-slot:expanded-item="{ headers, item }">
          <td :colspan="headers.length">{{ item.t_remark }} </td>
        </template>
      </v-data-table>
    </v-flex>    
    </v-layout>
    <v-btn  color="primary" type="submit" block> 저 장 </v-btn>
  </v-form>

</template>

<script>
import { deepCopy } from "../../../util/lib";
import { save } from 'save-file';
import InputPost3 from '../../components/InputForms/InputPost3.vue';
export default {
  components: { InputPost3 },
  name: "SignedP04Form",
  props: {
    attfile: {
      type: Array,
      default: null,
    },
  },
  data() {
    return {        
      valid: true,
      expanded: [],
      singleExpand: true,
      form: {
        i_shop: null,
        i_ser:null,        
        f_yn: null,
        n_filename: null,
        i_no: null,
        n_file2: null,
        n_file: null,
        t_att: null,
        f_noact: null,
        t_sample: null,
        t_samplefile: null,
        f_del: null,
        t_remark: null,
      },
      
      headers: [
        { text: '신청번호',  value: 'i_shop', sortable: false, align:' d-none' },
        { text: '파일순번', value: 'i_ser', sortable: false, align:' d-none' },
        { text: '필수여부', value: 'f_yn', sortable: false, width: "100px", fixed: true, align:'center'},
        { text: '양식', value: 'f_sample', sortable: false, width: "60px", fixed: true, align:'center'},
        { text: '첨부서류', value: 'n_filename', sortable: false, width: "200px" },
        { text: '신청no', value: 'i_no', sortable: false, align:' d-none' },
        { text: '확인', value: 'f_noact', sortable: false, align:'center', width: "55px"},
        { text: '파일명', value: 'n_file2', sortable: false, },
        { text: 'UP', value: 'n_file', sortable: false, width: "1%" },
        { text: '삭제', value: 'f_del', sortable: false, width: "50px" },
        { text: 'DOWN', value: 't_att', sortable: false, width: "50px" },
      ],
      isSelecting: false,
      selectedFile: null,
    };
  },  
  watch: {
    attfile() {
      this.init();
    },
  },
  created() {
    this.init();
  },
  computed: {
    
  },
  methods: {
    init() {
      if (this.attfile) {       
        this.form = deepCopy(this.attfile);
      }
    },
    f_ynchk(data) {
      return data == 1  ? '필수' : '선택';
    },
    f_noact(data) {
      return data == 'I' ? '○' : (data == 'Y') ? '●' : (data == 'N') ? '●' : (data == 'R') ? '○'  : '';
    },
    async save() {     
      // 한번에 저장 하기 위해 아래 와 같이 전달 해야 함...  (첨부파일 동시 Upload 문제 때문에 주석 처리)
      const formData = new FormData();   
      
      for (const item of Object.keys(this.form)) {        
        const { n_file } = this.form[item];   
        if (n_file) {
          for (const key of Object.keys(this.form[item])) {            
            formData.append(key, this.form[item][key]);
          }
        }
      }
      this.$emit("save", formData);
    },

    async getFilename(files, item) {
      if (files) {
        console.log(files.name);
        item.t_att = files.name;
      }
    },
    
    async onButtonClick2(item) {        
      const fileName = `https://protagonist.kro.kr${item.t_att}`;
      const downFile = item.n_file2;

      const fileBuffer = await this.$axios.get(`/api/shopinfo/getFileDown?path=${ item.t_att }`); 
      if (fileBuffer) {
        save (fileBuffer, downFile);
        alert('File Donw load Click !!!!!'); 
      } else {
        await this.$ezNotify.alert("다운로드 실패 !!", "오류" );
      }
      // try {
      //   const response = await fetch(fileName)
      //   const blob = await response.blob();
      //   const url = await URL.createObjectURL(blob)

      //   const a = document.createElement("a");
      //   a.href = url;
      //   //a.download = "myImage.png";
      //   a.download = downFile;
      //   document.body.appendChild(a);
      //   a.click();
      //   document.body.removeChild(a);
      // } catch(err) {
      //   console.log({ err })
      // }
    },
    async onButtonClick3(item) {
      const deleteFile = item.n_file2;
      const res = await this.$ezNotify.confirm("삭제 하시겠습니까 ?", item.n_filename);
      if (res) {
        const data = await this.$axios.delete(`/api/shopinfo/attfiles/delete/${item.i_shop}/${item.i_no}/${item.i_ser}`);
        if (data) {
          item.n_file = null;
          item.n_file2 = null;
          item.t_att = null;
        }
      }
    },
    async downLoad(item) {
      const fileName = `https://protagonist.kro.kr${item.t_sample}`;
      const downFile = item.t_samplefile;

      const fileBuffer = await this.$axios.get(`/api/shopinfo/getFileDown?path=${ item.t_sample }`); 
      if (fileBuffer) {
        save (fileBuffer, downFile);
        alert('File Donw load Click !!!!!'); 
      } else {
        await this.$ezNotify.alert("다운로드 실패 !!", "오류" );
      }
    
      // try {
      //   const response = await fetch(fileName)
      //   const blob = await response.blob();
      //   const url = await URL.createObjectURL(blob)

      //   const a = document.createElement("a");
      //   a.href = url;        
      //   a.download = downFile;
      //   document.body.appendChild(a);
      //   a.click();
      //   document.body.removeChild(a);
      // } catch(err) {
      //   console.log({ err })
      // }
    },
  },  
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