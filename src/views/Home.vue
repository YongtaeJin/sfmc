<template>
  <v-container fill-height fluid> 
    <v-row  v-if= "this.$store.state.user.member && this.$store.state.user.member.c_com" class="text-center">
      <v-col>
        <v-data-table :headers="headers" :items="data">
          
        </v-data-table>
      </v-col>      
    </v-row>
    <v-row v-else >
      <v-col cols="12">
        <!-- <v-img
          :src="require('../../server/upload/mainlog.jpeg')"          
          contain
          height="200"
        /> -->
        <h1>스마트공방</h1>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import qs from "qs";
import SiteTitle from '../components/layout/SiteTitle.vue';
export default {
  components: { SiteTitle },
  
  name: "Home",
	data() {
		return {
			title : "스마트공방",   
      isLoading: false,   
      headers: [
        {text: '제목',  value: 't_title', sortable: false, align:'left'},
        {text: '작성자',    value: 'n_crnm', sortable: false, align:'center', width: "100px"},        
      ],
      data: [],
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
    }
    
  },
};
</script>


<style>

</style>