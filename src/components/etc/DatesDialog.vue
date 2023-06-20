<template>
  <div>
    <v-text-field v-model="startDate" label="Start Date" type="date"></v-text-field>
    <v-text-field v-model="endDate" label="End Date" type="date"></v-text-field>
    <v-btn @click="getSelectedRange">선택</v-btn>
  </div>
</template>

<script>
export default {
  props: {
    sDate: {type : String, default: null,},    
    eDate: {type : String, default: null,},    
  },
  data() {
    return {
      startDate: null,
      endDate: null
    };
  },
  created() {
  },  
  watch: {
    sDate() { this.startDate = Date(this.sDate) , console.log(this.sDate, this.startDate)},
    eDate() { this.endDate = Date(this.eDate) },
  },
  methods: {
    getSelectedRange() {
      if (this.startDate && this.endDate) {
        //console.log("Selected Range:", this.startDate, "-", this.endDate);
        // 여기서 선택된 날짜 범위를 사용하여 원하는 작업을 수행할 수 있습니다.
        this.$emit('onEnter'); 
      } else {
        console.log("Please enter start and end dates.");
      }
    }
  }
};
</script>
