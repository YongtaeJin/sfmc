<template>
  <v-form @submit.prevent="save" ref="form" v-model="valid" lazy-validation>
    <input-duplicate-check
      ref="id"
      v-model="form.i_id"
      label="아이디"
      prepend-icon="mdi-account"
      counter="30"
      :rules="rules.id()"
      :cbCheck="cbCheckId"
    />

    <v-text-field
      label="이름"
      v-model="form.n_name"
      prepend-icon="mdi-card-account-details-outline"
      :rules="rules.name()"
    />
  
    <input-password
      label="비밀번호"
      v-model="form.p_password"
      prepend-icon="mdi-lock"
      
      :rules="rules.password2({len:3})"
    />

    <input-password
      label="비밀번호 확인"
      v-model="confirmPw"
      prepend-icon="mdi-lock"
      :rules="[rules.matchValue(form.p_password)]"
    />

    <input-duplicate-check
      ref="email"
      v-model="form.e_email"
      label="이메일"
      prepend-icon="mdi-email"
      :rules="rules.email()"
      :cbCheck="cbCheckEmail"
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
        i_id: "",
        p_password: "",
        n_name: "",        
        e_email: "",
    
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