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
        class="my-text-field inputNumber text-xs-right no-padding">
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
    onInput(event) {      
      // 부모 컴포넌트에 값을 전달합니다.           
      if (String(event).length > this.maxlength) {
        event = event.slice(0, this.maxlength);
      }     
      this.$emit('input', event);      
    },
  },

}
</script>

<style>
</style>