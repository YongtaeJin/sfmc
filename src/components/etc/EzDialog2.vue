<template>
  <v-dialog v-model="dialog" v-bind="$attrs">
    <v-card>
      <v-toolbar>
        <v-toolbar-title>{{ label }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text>
        <slot></slot>
      </v-card-text>
      
      <ez-wait/>
    </v-card>
  </v-dialog>
</template>

<script>
import EzWait from './EzWait.vue';
export default {
  components: { EzWait },
  name: "ezDialog2",
  props: {
    label: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      dialog: false,
    };
  },
  methods: {
    close() {
      this.dialog = false;      
			this.$emit('onClose');
    },
    open() {
			this.$emit('onOpen');
      this.dialog = true;
    },    
  },
};
</script>

<style>
</style>