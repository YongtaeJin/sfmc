<template>
  <v-form @submit.prevent="save" ref="form" v-model="valid" lazy-validation>
    <v-text-field label="사업장" v-model="form.c_com" />
    <v-text-field label="아이디" v-model="form.i_id" :rules="rules.id()" />
    <input-password
      label="비밀번호"
      v-model="form.p_password"
      :rules="rules.password2({len:3})"
    />
    <v-btn block color="primary" type="submit" :loading="isLoading">
      로그인
    </v-btn>
  </v-form>
</template>

<script>
import validateRules from "../../../util/validateRules";
import InputPassword from "../InputForms/InputPassword.vue";
export default {
  components: { InputPassword },
  name: "SignInForm",
  props: {
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      valid: true,
      form: {
        c_com: "",
        i_id: "",
        p_idcom: "",
        p_password: "",
      },
    };
  },  
  computed: {
    rules: () => validateRules,
  },
  methods: {
    async save() {
			this.$refs.form.validate();
			await this.$nextTick();
			if(!this.valid) return;
      this.form.p_idcom = this.form.i_id + "^:^" + this.form.c_com;
			this.$emit('save', this.form);
		},
  },
};
</script>

<style>
</style>