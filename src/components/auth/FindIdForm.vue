<template>
  <v-form @submit.prevent="save" ref="form" v-model="valid" lazy-validation>
    <v-text-field label="이름" v-model="form.n_name" :rules="rules.name()" />
    <v-text-field
      label="이메일"
      v-model="form.e_email"
      :rules="rules.email()"
    />
    <v-btn block color="primary" type="submit" :loading="isLoading">
      아이디 찾기
    </v-btn>
  </v-form>
</template>

<script>
import validateRules from "../../../util/validateRules";
export default {
  name: "FindIdForm",
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
        n_name: "",
        e_email: "",
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
      if (!this.valid) return;
      this.$emit("save", this.form);
    },
  },
};
</script>

<style>
</style>