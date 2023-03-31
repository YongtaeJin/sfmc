<template>
  <div :style="{'padding-left' : depth*2 + 'px'}">
    <div v-for="(item, i) in items" :key="`${i}${item.title}`">
      <v-list-group
        v-if="member && item.subItems && item.subItems.length > 0 && member.i_level >= item.grant "
        :prepend-icon="depth === 0 ? item.icon : ''"
        no-action
        :sub-group="depth > 0"
        append-icon=""
				v-model="item.active"
      >
        <template v-slot:activator>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
					<v-btn icon @click.stop="goUrl(item)" plain :disabled="!item.to">
						<v-icon>mdi-arrow-top-right</v-icon>
					</v-btn>
          <v-icon :style="activeStyle(item.active)">mdi-chevron-down</v-icon>
        </template>
        <nested-menu :items="item.subItems" :depth="depth + 1" />
      </v-list-group>
      
      <v-list-item v-else-if="member && member.i_level >= item.grant" v-bind="getLink(item)">
        <v-list-item-icon v-if="depth === 0">
          <v-icon>{{ item.icon }}</v-icon>
        </v-list-item-icon>
        <v-list-item-title
          :style="{ 'padding-left': depth == 1 ? '16px' : '0px' }"
        >
          <div>{{ item.title }}</div>
        </v-list-item-title>
      </v-list-item>
      
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
export default {
  name: "NestedMenu",
  props: {
    items: {
      type: Array,
      required: true,
    },
    depth: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    ...mapState({
      member : state => state.user.member,
    }),    
  },
  methods: {
    getLink(item) {
      if (item.newTab) {
        return { href: item.to, target: "_blank" };
      } else {
        return { to: item.to };
      }
    },
    activeStyle(active) {
      return { trasnform: active ? "rotate(180dep)" : "rotate(360dep)" };
    },
		goUrl(item) {
			if(item.newTab) {
				window.open(item.to, "_blank")
			}else {
				if(item.to != this.$route.path) {
					this.$router.push(item.to);
				}
			}
		}
  },
};
</script>

<style>
</style>