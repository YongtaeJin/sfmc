<template>
  <div style="width: 190px; display: flex;">
      <v-dialog v-model="modal" persistent max-width="290">
        <template v-slot:activator="{ attrs }">
          <v-text-field dense hide-details v-bind="{ ...$attrs, ...attrs }" :value="value" :readonly="readonly" @input="onInput" class="my-text-field">
            <template v-if="!readonly" v-slot:append>
              <v-btn icon small tabindex="-1" @click="open"><v-icon>mdi-calendar-today</v-icon></v-btn>
            </template>            
          </v-text-field>
        </template>
        <v-card>
          <v-toolbar>
				    <v-toolbar-title>{{ $attrs.label }}</v-toolbar-title>
				    <v-spacer></v-spacer>
				    <v-btn icon plain @click="close"><v-icon>mdi-close</v-icon></v-btn>
			    </v-toolbar>
			    <v-date-picker v-model="date" no-title @input="picker" :day-format="dayFormat"/>
        </v-card>
      </v-dialog>

      <v-text-field style="width: 20px; border-bottom: none;" dense hide-details value="∽" :readonly="readonly" @input="onInput" class="no-padding" />      
    
      <v-dialog v-model="modal2" persistent max-width="290">
        <template v-slot:activator="{ attrs }">
          <v-text-field dense hide-details v-bind="{ ...$attrs, ...attrs }" :value="value2" :readonly="readonly" @input="onInput2" class="my-text-field">
            <template v-if="!readonly" v-slot:append>
              <v-btn icon small tabindex="-1" @click="open2"><v-icon>mdi-calendar-today</v-icon></v-btn>
            </template>            
          </v-text-field>
        </template>
        <v-card>
          <v-toolbar>
				    <v-toolbar-title>{{ $attrs.label }}</v-toolbar-title>
				    <v-spacer></v-spacer>
				    <v-btn icon plain @click="close"><v-icon>mdi-close</v-icon></v-btn>
			    </v-toolbar>
			    <v-date-picker v-model="date2" no-title @input="picker2" :day-format="dayFormat"/>
        </v-card>
      </v-dialog>
    
  </div>
</template>

<script>
  import { getDate } from '../../../util/lib';
  export default {
  name: "InputDateft",

  model: {
    prop: "value",
    event: "input",
  },
  model2: {
    prop: "value2",
    event: "input2",
  },
  props: {
    value: String,
    value2: String,
    readonly: Boolean
  },
  data() {
    return {
      modal: false,
			date : "",
      modal2: false,
			date2 : "",
    };
  },  
  watch: {
    date2(newValue) {
      this.$emit('update:value2', newValue);
    }
  }, 
  methods: {
    onInput(val) {
      this.$emit("input", val);
    },    
    picker() {
			this.onInput(this.date);
			this.close();
		},
		open() {
			const pattern = /^\d{4}-\d{2}-\d{2}$/;
			this.date = pattern.test(this.value) ? this.value : this.date;
			this.modal = true;
		},
    close() {
			this.modal = false;
      this.modal2 = false;
		},

    onInput2(val) {
      this.$emit("input2", val);  
    },
    picker2() {
			this.onInput2(this.date2);
      this.close();
		},
    open2() {
			const pattern = /^\d{4}-\d{2}-\d{2}$/;
			this.date2 = pattern.test(this.value2) ? this.value2 : this.date2;
			this.modal2 = true;
		},
		
		    
		dayFormat(day) {
			if(!this.modal && !this.modal2) return;
			const arr = day.split('-');
			return Number(arr[arr.length-1]);
		}
  },
};
</script>

<style>
</style>