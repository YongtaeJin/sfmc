<template>
  <v-dialog v-model="dialog" v-bind="$attrs">
    <v-card>
      <v-toolbar>
        <v-toolbar-title>{{ label }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn v-if="obtn" color="primary" small @click="btnClick"> {{ obtn }} </v-btn> 
        <v-btn icon @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text>
        <slot></slot>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "ezDialog",
  props: {
    label: {
      type: String,
      required: true,
    },
    obtn: {
      type: String,
    }
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
    btnClick() {
      this.dialog = false;
			this.$emit('btnClick');      
    },
  },
};
</script>

<style>
</style>