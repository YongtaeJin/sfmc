<template>
  <v-container fill-height fluid> 
    <v-row >
      <v-col v-if= "this.$store.state.user.member == undefined" class="text-center" cols="12" >
        <!-- <v-img
          :src="require('../../server/upload/mainlog.jpeg')"          
          contain
          height="200"
        /> -->
      
        <v-img src="../assets/logo.png"  contain height="200" />


        <!-- <h1><br>스마트공방</h1> -->
      </v-col>
      <v-col v-else cols="12">
        <h1>공지사항</h1> <br>
        <v-text-field v-model="form.t_title" label="제목" readonly hide-details="false"/>
        <v-textarea v-model="form.t_content" label="공지내용" readonly hide-details="false" />
      </v-col>  
    </v-row>
    <v-row v-if= "this.$store.state.user.member" class="text-center">
      <v-col>
        <v-data-table ref="noticeTable" :headers="headers" :items="data" item-key="i_ser" single-select @click:row="rowSelect">
          
        </v-data-table>
      </v-col>      
    </v-row>
    
  </v-container>
</template>

<script>
import qs from "qs";
import SiteTitle from '../components/layout/SiteTitle.vue';
import { deepCopy } from '../../util/lib';
export default {
  components: { SiteTitle },
  
  name: "Home",
	data() {
		return {
			title : "스마트공방",   
      isLoading: false,   
      headers: [
        {text: '제목',  value: 't_title', sortable: false, align:'left'},
        {text: '게시시작일', value: 'd_start', sortable: false, align:'center', width: "120px"}, 
        {text: '작성자', value: 'n_crnm', sortable: false, align:'center', width: "120px"},        
      ],
      data: [],
      form : { i_ser: "", c_com: "", t_title: "", t_content: "", d_start: "", d_end: "", f_use: "Y", n_crnm: "" },
		}
	},
	title() {
		return this.title;
	},
  mounted(){    
    if (this.$store.state.user.member && this.$store.state.user.member.c_com) {      
      this.init();
    } else {      
    }
  },
	
  methods: {
    async init() {
      const query = qs.stringify({c_com: this.$store.state.user.member.c_com});            
      this.data = await this.$axios.get(`/api/system/getNoticeCom?${query}`);
      
      if (this.data.length) {
        this.form.t_title = this.data[0].t_title
        this.form.t_content = this.data[0].t_content
      }
    },
    rowSelect :function (item, row) {            
      row.select(true);            
      
      this.form = deepCopy(item);
    },

    
  },
};
</script>


<style>

</style>