<template>
  
  <v-form @submit.prevent="save" ref="form">    
      <v-checkbox v-model="form.f_persioninfo" 
        :disabled="!this.$store.state.user.shopinfo || this.$store.state.user.shopinfo.f_persioninfo=='1'"
        label="개인정보 수집 및 이용 동의함" color="success" value="1" hide-details></v-checkbox>    
      
      <v-btn 
        :disabled="!this.$store.state.user.shopinfo || this.$store.state.user.shopinfo.f_persioninfo=='1'"
        color="primary" type="submit" block>동의함</v-btn>       

      <br>    
      당 사이트는 「개인정보보호법」 제15조 제1항 제1호, 제17조 제1항 제1호, 제23조 제1호 따라 아래와 같이 개인정보의 수집. 이용에 관하여 귀하의 동의를 얻고자 합니다.<br>
      <br>
      당 사이트는 이용자의 사전 동의 없이는 이용자의 개인정보를 함부로 공개하지 않으며, 수집된 정보는 아래와 같이 이용하고 있습니다. 이용자가 제공한 모든 정보는 아래의 목적에 필요한 용도 이외로는 사용되지 않으며 이용 목적이 변경될 시에는 이를 알리고 동의를 구할 것입니다.<br>
      <br>
      <br>
      1. 개인정보의 수집·이용에 관한 사항<br>
      <br>
      I. 개인정보의 수집·이용 목적<br>
      가. 소상공인 지원사업 신청 및 정책연동 : 교육, 컨설팅, 희망리턴패키지, 자금, 협동조합활성화, 프랜차이즈, 나들가게, 상권정보, 특성화시장육성, 행사, 이용자 만족도조사, 이벤트, 경품발송, 게시글, 메일링서비스, SMS 제공을 위하여 개인의 정보를 수집, 이용하고 있습니다.<br>
      나. 회원관리 : 회원제 서비스 이용 및 제한적 본인 확인제에 따른 본인확인, 개인식별, 가입의사 확인, 가입 및 가입횟수 제한, 추후 법정 대리인 본인확인, 분쟁 조정을 위한 기록보존, 불만처리 등 민원처리, 공지사항 전달<br>
      <br>
      II. 수집하려는 개인정보의 항목<br>
      필수 11개 항목: 사업자 구분(개인사업자, 법인사업자, 예비창업자), 아이디, 비밀번호, 사업자등록번호, 업체명, 대표자명, 사업장주소, 전화번호, 휴대전화번호, 이메일<br>
      추가 2개 항목 : SMS 수신, 이메일 수신<br>
      자동수집 1개 항목 : 접속IP정보(동시접속제어)<br>
      <br>
      III. 개인정보의 보유 및 이용 기간 : 2년<br>
      개인정보 및 관련 정보는 원칙적으로 보유기간의 경과, 개인정보의 수집 및 이용목적의 달성 등 그 개인정보가 불필요하게 되었을 때에는 지체 없이 파기합니다. 다만, 다른 법령에 따라 보존하여야 하는 경우에는 그러하지 않을 수 있습니다. 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.<br>
      <br>
      IV. 동의를 거부할 권리 및 동의를 거부할 경우의 불이익<br>
      정보주체는 개인정보 수집에 동의를 거부할 권리가 있습니다. 다만, 필수 항목에 대한 동의를 거부할 시 저희가 제공하는 서비스를 이용할 수 없습니다.<br>
      <br>
      V. 14세 미만 아동의 경우 회원가입 및 저희가 제공하는 서비스를 이용할 수 없습니다.<br>

  </v-form>
</template>

<script>
import { deepCopy } from "../../../util/lib";

export default {
    name: "SignedP01Form",     
    props: {
      
    },
    data() {
      return {
        valid: true,
        form: {
          i_shop: null,
          i_no: null,
          i_userid: null,
          f_persioninfo: "1",
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
        },
      };
    },    
    methods: {      
       async save() {
          if(!this.form.f_persioninfo) {
            this.$toast.error(`동의 후 사용 가능 합니다.`);
            return;
          }                    
          this.$emit("save", this.form);
        },
    }
}
</script>

<style>

</style>