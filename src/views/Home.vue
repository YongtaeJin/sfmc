<template>
  <v-container fill-height fluid> 
    <v-row v-if="this.$store.state.user.member" class="text-center">
      <!-- <v-col cols="12">
        <v-img
          :src="require('../../server/upload/mainlog.jpeg')"          
          contain
          height="200"
        />
      </v-col> -->
      <v-col class="mb-4">
        <h1 class="display-1 ">
          스마트공방 필수정보 및 서류 업로드(도입기업전용)
        </h1>
      </v-col>   
      
    </v-row>

    <v-row v-if="!this.$store.state.user.member">
      <v-col cols="12">
      <div class="d-flex justify-center align-center" style="height: 100%">
        <v-card max-width="400" width="100%" elevation="10">
          <v-toolbar>
            <site-title />
          </v-toolbar>
          <v-tabs v-model="tabs" background-color="primary" dark>
            <v-tab v-for="item in items" :key="item" style="flex: 1">
              {{ item }}
            </v-tab>
          </v-tabs>
          <v-card-text>
            <v-tabs-items v-model="tabs">
              <v-tab-item>
                <sign-in-form @save="loginLocal" :isLoading="isLoading" />
              </v-tab-item>
              <v-tab-item>
                <find-id-form @save="findId" :isLoading="isLoading" />
              </v-tab-item>
              <v-tab-item>              
                <find-pw-form @save="findPw" :isLoading="isLoading" />
              </v-tab-item>
            </v-tabs-items>
          </v-card-text>
          <template>
            <v-card-text class="mt-n4">
              <v-btn to="/join" block>회원가입</v-btn>
            </v-card-text>
          </template>
        </v-card>
      </div>
      </v-col>
    </v-row>
  </v-container>
  

</template>

<script>
import { mapActions, mapMutations } from "vuex";
import FindIdForm from '../components/auth/FindIdForm.vue';
import FindPwForm from '../components/auth/FindPwForm.vue';
import SignInForm from '../components/auth/SignInForm.vue';
import SiteTitle from '../components/layout/SiteTitle.vue';
export default {
  components: { SiteTitle, SignInForm, FindIdForm, FindPwForm },
  
  name: "Home",
	data() {
		return {
			title : "Protagonist App",   
      tabs: parseInt(this.$route.query.tabs) || 0,
      items: ["로그인", "아이디 찾기", "비밀번호 찾기"],
      isLoading: false,   
		}
	},
	title() {
		return this.title;
	},
	
  methods: {
    ...mapActions("user", ["signInLocal", "findIdLocal", "findPwLocal"]),
    ...mapMutations("user", ["SET_MEMBER", "SET_TOKEN"]),
     async loginLocal(form) {
      this.isLoading = true;
      const data = await this.signInLocal(form);
      this.isLoading = false;
      if (data) {
        const mb_name = this.$store.state.user.member.mb_name;
        this.$toast.info(`${mb_name}님 환영합니다.`);
        // this.$router.push("/");
      }
    },
    async findId(form) {
      this.isLoading = true;
      const data = await this.findIdLocal(form);
      this.isLoading = false;
      if (data && data.mb_id) {
        await this.$ezNotify.alert(
          `<span style="font-size:1.5em">회원 아이디 : [ <b>${data.mb_id}</b> ]</span>`,
          "아이디 찾기 결과"
        );
        this.tabs = 0;
      }
    },
    async findPw(form) {
      this.isLoading = true;
      const data = await this.findPwLocal(form);
      this.isLoading = false;
      if (data) {
        await this.$ezNotify.alert(
          `${data.mb_name}님<br><b>${form.mb_email}</b>로 이메일 발송하였습니다.`,
          "이메일 발송 성공"
        );
        this.tabs = 0;
      }
    },
  },
};
</script>


<style>
.mytable table th {
    /* background-color: lightgoldenrodyellow; */	
	color: #FFFFFF;
  background-color: #D4F755;

    border-bottom: none !important;
 }
 
.v-data-table > .v-data-table__wrapper > table > tbody > tr > th, .v-data-table > .v-data-table__wrapper > table > thead > tr > th, .v-data-table > .v-data-table__wrapper > table > tfoot > tr > th 
{
	font-size: 1.00rem;
    height: 35px;    
}
.v-data-table > .v-data-table__wrapper > table > tbody > tr > td, .v-data-table > .v-data-table__wrapper > table > thead > tr > td, .v-data-table > .v-data-table__wrapper > table > tfoot > tr > td {
  font-size: 0.35rem;
  height: 26px; 
}

</style>