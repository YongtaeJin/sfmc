<template>
  <v-form @submit.prevent="save" ref="form" v-model="valid" lazy-validation>
    <v-row>
      <v-col>
        
        <input-resno label="사업자번호" v-model="form.i_regno" prepend-icon="mdi-card-account-details-outline" />  	        
        <v-text-field label="대표자" v-model="form.n_person" prepend-icon="mdi-card-account-details-outline" />        
        <input-phone label="연락처(유선)" v-model="form.t_tel1" prepend-icon="mdi-phone" />
      </v-col>
      <v-col>
        <v-text-field label="업체명" v-model="form.n_company" prepend-icon="mdi-office-building-outline" />
        <v-text-field label="대표자 주민번호" v-model="form.i_presno" prepend-icon="mdi-card-account-details-outline"/>
        <input-phone label="휴대폰" v-model="form.t_tel2" prepend-icon="mdi-cellphone" />
      </v-col>
      <v-col>
        <v-text-field label="이나라도움 아이디" v-model="form.t_enarainfo" prepend-icon="mdi-account" /> 
        <v-text-field label="이나라도움 패스워드" v-model="form.t_enarainfopw" prepend-icon="mdi-account" /> 
        <v-text-field label="이메일" v-model="form.i_email" prepend-icon="mdi-email"/>
      </v-col>
    </v-row> 
    <v-row>
      <v-col>
        <input-post3 :zipcode.sync="form.i_post" :addr1.sync="form.t_addr1" :addr2.sync="form.t_addr2" />
      </v-col>
    </v-row>
    <v-row>
      <v-col>        
        <v-select label="사업자구분" v-model="form.f_saugup" :items="saugup_Items" />
      </v-col>
      <v-col>
        <v-select label="이전 중진공 사업" v-model="form.f_run" :items="run_Items" />        
      </v-col> 
      <v-col>        
        <v-select label="3년 표준 재무제표 (손익계산서 필수)" v-model="form.f_dart" :items="dart_Items" />                
      </v-col>
    </v-row>
    <v-row>
      <v-col>
      <v-btn  color="primary" type="submit" block> 저 장 </v-btn>
      </v-col>
    </v-row>
  </v-form>

</template>

<script>
import { deepCopy } from "../../../util/lib";
import InputPhone from '../../components/InputForms/InputPhone.vue';
import InputPost3 from '../../components/InputForms/InputPost3.vue';
import InputResno from '../../components/InputForms/InputResno.vue';
export default {
  components: { InputPost3, InputPhone, InputResno },
  name: "SignedP02Form",
  props: {
    item: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {        
      valid: true,
      form: {
        i_shop: null,
        i_no: null,
        i_userid: null,
        f_persioninfo: null,
        d_persioninfo: null,
        i_regno: null,
        n_company: null,
        n_person: null,
        t_tel1: null,
        t_tel2: null,
        i_email: null,
        i_presno: null,
        i_post: null,
        t_addr1: null,
        t_addr2: null,
        f_saugup: null,
        f_run: null,
        f_dart: null,
        t_enarainfo: null,
        t_enarainfopw: null,
      },
      saugup_Items: ["개인-3년 미만", "개인-3년 이상", "법인-3년 미만", "법인-3년 이상"],
      run_Items: ["미 수행", "수행"],
      dart_Items: ["발행 불가", "발행가능"],
    };
  },  
  watch: {
    item() {
      this.init();
    },
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      if (this.item) {
        this.form = deepCopy(this.item);
      }
    },
    async save() {
      this.$emit("save", this.form);
    },
  },  
}
</script>

<style>

</style>