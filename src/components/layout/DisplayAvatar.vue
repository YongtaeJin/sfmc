<template>
  <v-avatar color="accent" size="32">  
    <template v-if="member">      
      <v-img v-if="hasImage" :src="memberPhoto" @error="imageError" />      
      <div v-else> {{ member.n_name[0] }}</div>
    </template>
    <v-icon v-else>mdi-account</v-icon>
  </v-avatar>
</template>

<script>
export default {
  name: "DisplayAvatar",
  props: {
    member: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      hasImage: true,
    };
  },
  computed: {
    memberPhoto() {
      if (this.member.t_photo) {
				this.hasImage = true;
        if (this.member.t_photo.startsWith("/upload")) {
          return this.member.t_photo + "?w=32&h=32";
        } else {
          return this.member.t_photo;
        }
      } else {
				this.hasImage = false;
			}
    },
  },
  methods: {
    imageError() {
      this.hasImage = false;
    },
  },
};
</script>

<style>
</style>