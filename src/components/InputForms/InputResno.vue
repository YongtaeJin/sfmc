<template>
  <v-text-field
    :value="value"
    v-bind="$attrs"
    @keyup="onInput"
    :maxlength="max"
  />
</template>

<script>
export default {
  name: "InputResno",
  model: {
    prop: "value",
    event: "input",
  },
  props: {
    value: String,
  },
  data() {
    return {
      max: 12,
    };
  },
  methods: {
    onInput(event) {
			const val = this.authDash(event.target.value);
      this.$emit("input", val);
    },
    authDash(val) {
      val = val.replace(/[^0-9]/g, "");

      let pattern = null;      
      pattern = /([\d]{0,3})([\d]{0,2})([\d]{0,5})/;
      const matchs = pattern.exec(val);
			let rVal = matchs[1];
			rVal += matchs[2] ? '-'+ matchs[2] : "";
			rVal += matchs[3] ? '-'+ matchs[3] : "";
      
			return rVal;
    },
  },
};
</script>

<style>
</style>