<template>
  <v-form
    v-if="form"
    @submit.prevent="save"
    ref="form"
    v-model="valid"
    lazy-validation
  >
    <input-duplicate-check
      ref="id"
      v-model="form.i_id"
      label="아이디"
      prepend-icon="mdi-account"
      readonly
    />

    <v-text-field
      label="이름"
      v-model="form.n_name"
      prepend-icon="mdi-card-account-details-outline"
      :rules="rules.name()"
    />

    <template v-if="!member.i_provider">
      <input-password
        label="비밀번호"
        v-model="form.p_password"
        prepend-icon="mdi-lock"
        :rules="rules.password2({ required: false , len: 3 })"
      />

      <input-password
        label="비밀번호 확인"
        v-model="confirmPw"
        prepend-icon="mdi-lock"
        :rules="[rules.matchValue(form.p_password)]"
      />
    </template>

    <input-duplicate-check
      ref="email"
      v-model="form.e_email"
      label="이메일"
      prepend-icon="mdi-email"
      :rules="rules.email()"
      :cbCheck="cbCheckEmail"
      :origin="member.e_email"
      :readonly="!admMode"
    />

    <v-btn type="submit" block color="primary" :loading="isLoading">
      정보 수정
    </v-btn>
		<v-btn class="mt-4" block color="error" :loading="isLoading" @click="$emit('onLeave')">
      회원 탈퇴
    </v-btn>
  </v-form>
</template>

<script>
import { deepCopy } from "../../../util/lib";
import validateRules from "../../../util/validateRules";
import InputDate from "../InputForms/InputDate.vue";
import InputDuplicateCheck from "../InputForms/InputDuplicateCheck.vue";
import InputPassword from "../InputForms/InputPassword.vue";
import InputPhone from "../InputForms/InputPhone.vue";
import InputPost from "../InputForms/InputPost.vue";
import InputRadio from "../InputForms/InputRadio.vue";
import DisplayAvatar from "../layout/DisplayAvatar.vue";

export default {
  components: {
    InputDuplicateCheck,
    InputPassword,
    InputDate,
    InputRadio,
    InputPhone,
    InputPost,
    DisplayAvatar,
  },
  name: "UserUpdateForm",
  props: {
    admMode: {
      type: Boolean,
      default: false,
    },
    member: {
      type: Object,
      required: true,
    },
    cbCheckEmail: {
      type: Function,
      default: null,
    },
    isLoading: Boolean,
  },
  data() {
    return {
      valid: true,
      form: null,
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
  mounted() {
    this.form = deepCopy(this.member);
    this.form.p_password = "";
    this.form.admMode = this.admMode;
    this.form.deleteImage = false;
    delete this.form.d_create_at;
    delete this.form.t_create_ip;
    delete this.form.d_update_at;
    delete this.form.t_update_ip;
    delete this.form.d_login_at;
    delete this.form.t_login_ip;
    delete this.form.d_leave_at;
  },
  destroyed() {
    this.form = null;
  },
  methods: {
    async save() {
      this.$refs.form.validate();
      await this.$nextTick();
      if (!this.valid) return;
      if (!this.$refs.id.validate()) return;
      if (!this.$refs.email.validate()) return;

      // this.$emit('onSave', this.form);
      const formData = new FormData();
      const keys = Object.keys(this.form);
      for (const key of keys) {
        formData.append(key, this.form[key]);
      }
      this.$emit("onSave", formData);
    },
  },
};
</script>

<style>
</style>