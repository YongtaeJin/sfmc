<template>
  <div>
    <p></p>  
    <v-date-picker v-model="selectedDates" no-title range :day-format="dayFormat" @input="handleDateChange"></v-date-picker>

    <v-btn color="primary" block @click="onclick" v-if="selectedDates[1] > selectedDates[0]" > 
      기간 : {{ selectedRange[0] }} ∽ {{ selectedRange[1] }}
    </v-btn>   
    <v-btn color="primary" block @click="onclick" v-else > 
      기간 : {{ selectedRange[1] }} ∽ {{ selectedRange[0] }}
    </v-btn>   
    
    
  </div>
  
</template>

<script>
export default {
  props: {
    sDate :{type : String, default: '',},
    eDate :{type : String, default: '',},
  },
  watch: {
    sDate() {this.selectedDates[0] = this.sDate; this.selectedRange = [...this.selectedDates]},
    eDate() {this.selectedDates[1] = this.eDate; this.selectedRange = [...this.selectedDates]},
  },
  created() {    
  },
  data() {
    return {
      selectedRange: [],
      selectedDates: []
    };
  },
  methods: {
    handleDateChange(newValue) {
      // console.log(newValue);
      this.selectedRange = newValue;      
    },
    onclick() {    
      // console.log("onEnter")  
      this.$emit("onEnter", this.selectedRange);  
    },
    dayFormat(day) {			
			const arr = day.split('-');
			return Number(arr[arr.length-1]);
		}
  },
};
</script>
