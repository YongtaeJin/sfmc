<template>
    <v-text-field
        v-bind="$attrs"        
        :value="value"
        type="number"
        maxlength="3"
        hide-details         
        dense 
        single-line
        oninput="javascript: this.value = this.value.replace(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g, '' );"        
        @input="onInput"        
        class="my-text-field inputPrice text-xs-right no-padding">
    </v-text-field>
</template>

<script>
export default {
  props: {
    value: 0,
    maxlength: {
      type: Number,
      default: 15,
    },
  },
  
  methods: {    
    onInput(value) {      
      // 부모 컴포넌트에 값을 전달합니다.           
      if (String(value).length > this.maxlength) {
        value = value.slice(0, this.maxlength);
      }     
      this.$emit('input', value);      
    },
  },

}
</script>

<style>
</style>