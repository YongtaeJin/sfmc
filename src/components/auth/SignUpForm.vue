<template>
  <v-form @submit.prevent="save" ref="form" v-model="valid" lazy-validation>
    <input-duplicate-check
      ref="id"
      v-model="form.mb_id"
      label="아이디"
      prepend-icon="mdi-account"
      counter="30"
      :rules="rules.id()"
      :cbCheck="cbCheckId"
    />

    <v-text-field
      label="이름"
      v-model="form.mb_name"
      prepend-icon="mdi-card-account-details-outline"
      :rules="rules.name()"
    />
  
    <input-password
      label="비밀번호"
      v-model="form.mb_password"
      prepend-icon="mdi-lock"
      
      :rules="rules.password2({len:3})"
    />

    <input-password
      label="비밀번호 확인"
      v-model="confirmPw"
      prepend-icon="mdi-lock"
      :rules="[rules.matchValue(form.mb_password)]"
    />

    <input-duplicate-check
      ref="email"
      v-model="form.mb_email"
      label="이메일"
      prepend-icon="mdi-email"
      :rules="rules.email()"
      :cbCheck="cbCheckEmail"
    />

    <input-date v-if=false
      v-model="form.mb_birth"
      label="생년월일"
      prepend-icon="mdi-calendar"
      :rules="rules.date({ label: '생년월일' })"
    />

		<v-file-input v-if=false
			label="회원이미지"
			v-model="form.mb_image"
			prepend-icon="mdi-account-box"
			accept="image/jpg,image/png"
		/>


    <v-btn type="submit" block color="primary" :loading="isLoading">회원가입</v-btn>
  </v-form>
</template>

<script>
import validateRules from "../../../util/validateRules";
import InputDate from "../InputForms/InputDate.vue";
import InputDuplicateCheck from "../InputForms/InputDuplicateCheck.vue";
import InputPassword from "../InputForms/InputPassword.vue";
import InputPhone from "../InputForms/InputPhone.vue";
import InputPost from '../InputForms/InputPost.vue';
import InputRadio from "../InputForms/InputRadio.vue";

export default {
  components: {
    InputDuplicateCheck,
    InputPassword,
    InputDate,
    InputRadio,
    InputPhone,
    InputPost,
  },
  name: "SignUpForm",
  props: {
    cbCheckId: {
      type: Function,
      default: null,
    },
    cbCheckEmail: {
      type: Function,
      default: null,
    },
		isLoading : Boolean,
  },
  data() {
    return {
      valid: true,
      form: {
        mb_id: "",
        mb_password: "",
        mb_name: "",        
        mb_email: "",
        mb_phone: "",
        mb_zip: "",
        mb_addr1: "",
        mb_addr2: "",
				mb_image : null,
      },
      confirmPw: "",
      genderItems: [
        { label: "남자", value: "M" },
        { label: "여자", value: "F" },
      ],
    };
  },
  computed: {
    rules: () => validateRules,
  },
  methods: {
    async save() {
      this.$refs.form.validate();
      await this.$nextTick();
      if (!this.valid) return;
      if (!this.$refs.id.validate()) return;
      if (!this.$refs.email.validate()) return;

			const formData = new FormData();
			const keys = Object.keys(this.form);
			for(const key of keys) {
				formData.append(key, this.form[key]);
			}
			this.$emit('onSave', formData);
    },
  },
};
</script>

<style>
</style>