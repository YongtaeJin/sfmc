<template>
	<v-footer app dark class="justify-center" absolute>
		<v-spacer></v-spacer>
		&copy; {{ new Date().getFullYear() }} {{ footer }}
		<v-spacer></v-spacer>
		<!-- 문의 사항 : 055-602-4277 -->
	</v-footer>
</template>

<script>
import { mapState } from 'vuex'
export default {
	name : "SiteFooter",
	computed :{
		...mapState({
			footer : state => state.config.footer
		})
	}
}
</script>

<style>

</style>