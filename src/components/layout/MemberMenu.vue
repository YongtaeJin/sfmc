<template>
  <div>
		<v-list v-if="isSuper" dense class="mt-n6">
			<v-subheader>관리자 메뉴</v-subheader>
			<v-list-item
				v-for="item in admMenus"
				:key="item.title"
				dense
				:to="item.to"
			>
				<v-list-item-icon>
					<v-icon>{{item.icon}}</v-icon>
				</v-list-item-icon>
				<v-list-item-content>
					<v-list-item-title>{{item.title}}</v-list-item-title>
				</v-list-item-content>
			</v-list-item>
		</v-list>
    <v-card-actions>
      <v-btn color="primary" @click="$emit('open')" block>회원정보수정</v-btn>
    </v-card-actions>
    <v-card-actions>
      <v-btn color="secondary" @click="logout" block>로그아웃</v-btn>
    </v-card-actions>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from "vuex";
export default {
  name: "MemberMenu",
	data() {
		return {
			admMenus : [
				{title : '설정 관리', icon:'mdi-cog', to:'/adm/config'},
				{title : '사업장 관리', icon:'mdi-account-cog', to:'/adm/worksite'},
			]
		}
	},
	computed : {
		...mapState({
			member : state => state.user.member,
		}),
		...mapGetters('user', ['isSuper'])
	},
  methods: {
    ...mapActions("user", ["signOut"]),
    async logout() {
      const n_name = await this.signOut();
      if (n_name) {
        this.$toast.info(`${n_name}님 로그아웃 하였습니다.`);
        if (this.$route.name != "Home") {
          this.$router.push("/");
        }
      }
    },
  },
};
</script>

<style>
</style>