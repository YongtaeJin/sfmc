<template>
  <v-container fill-height fluid v-if= "this.$store.state.user.member == undefined"> 
    <v-row >
      <v-col  class="text-center" cols="12" >        
        <v-row >
          <v-col>
            <v-img src="../assets/logo.png"  contain height="200" />
          </v-col>
          <v-col>
            <v-img src="../assets/mapdata.png" contain height="500" />
          </v-col>          
        </v-row>        
      </v-col>      
    </v-row>
  </v-container>
  
  <v-card v-else style="margin-top: 10px;" >
    <v-tabs v-model="tab" background-color="primary" dark>
      <v-tab v-if="member.f_dashboard === 'Y'" >Dashboard</v-tab> 
      <v-tab>공지사항</v-tab> 
    </v-tabs>
    <v-tabs-items v-model="tab">
      <v-tab-item v-if="member.f_dashboard === 'Y'">
        <v-row>
          <v-col><line-chart /></v-col>
        </v-row>
        <v-row>
          <v-col>좌</v-col>
          <v-col>우</v-col>
        </v-row>
        <v-row>
          <v-col>하단</v-col>
        </v-row>
      </v-tab-item>
      <v-tab-item>        
        <v-text-field v-model="form.t_title" label="제목" readonly hide-details="false"/>
        <v-textarea v-model="form.t_content" label="공지내용" readonly hide-details="false" rows="15" auto-grow/>
        <v-data-table ref="noticeTable"  :headers="headers" :items="data" item-key="i_ser" single-select @click:row="rowSelect">
        </v-data-table>
      </v-tab-item>      
    </v-tabs-items>

  </v-card>

</template>

<script>
import qs from "qs";
import { mapState } from "vuex";
import SiteTitle from '../components/layout/SiteTitle.vue';
import LineChart from "../components/dashboard/LineChart.vue";
import { deepCopy } from '../../util/lib';


export default {
  components: { SiteTitle, LineChart  },
  
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
      tab: '',
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
    this.tab = this.$store.state.user.member.f_dashboard === 'Y' ? 0 : 1;
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

  computed: {
    ...mapState({
      member: (state) => state.user.member,
    }),
  },
};
</script>


<style>

</style>