import Vue from 'vue'
import VueRouter from 'vue-router'
import routes from './routes';
import store from '../store';
import { LV, LV_LABEL } from '../../util/level';

Vue.use(VueRouter)

export function createRouter() {
	const router = new VueRouter({
		mode: 'history',
		base: process.env.BASE_URL,
		routes
	});

	router.beforeEach(async (to, from, next) => {
		const { $Progress, $toast } = Vue.prototype;

		if ($Progress) $Progress.start();

		if (typeof (window) == 'object') {
			if (!store.state.appReady) {
				if (window.__INITIAL_STATE__) {
					store.replaceState(window.__INITIAL_STATE__);
				} else {
					await store.dispatch('appInit');
				}
			}
		}

		const access = store.getters.access;
		const GRANT = store.getters['user/GRANT'];
		const isMember = !!store.state.user.member;		

		if ( isMember ) {
			const log = {
				c_com: store.state.user.member.c_com,
				i_id: store.state.user.member.i_id,
				n_name: store.state.user.member.n_name,
				i_level: store.state.user.member.i_level,
				to_name: to.name,
				to_path: to.path,
				from_name: from.name,
				from_path: from.path,
			};
			$axios.post(`/api/system/openLog`, log);
		}

		let msg = '';		
		if (to.name.startsWith('NoAuth') && isMember) {
			// 비회원 인경우에만 접근
			msg = "이미 로그인 되어 있습니다.";
		} else if (to.name.startsWith('Adm') && GRANT < LV.SUPER ) {
			// 관리자 전용 페이지
			msg = `${LV_LABEL(LV.SUPER)}(${LV.SUPER}) 이상 접근 가능합니다.`;
		} else {
			// 메뉴 접근 레벨에 따름			
			const accessLV = access[to.path] || LV.BLOCK;
			if (accessLV > GRANT) {
				msg = `${LV_LABEL(accessLV)}(${accessLV}) 이상 접근 가능합니다.`;
			}
		}
		if (msg) {
			// 접근 차단
			if ($toast) $toast.error(msg);
			if ($Progress) $Progress.fail();
			if (from.name) { // 이전 경로가 있으면 라우팅을 동작하지 않고
				next(false);			
			} else { // 이전 경로가 없으면 홈으로 이동 또는 로그인 페이지로 보내도 됨
				return isMember ? next('/') : next({
					name: 'NoAuthLogin',
					query: { next: to.fullPath }
				});
			}
		} else {
			// 통과
			if ($Progress) $Progress.finish();
			next();
		}
	});

	router.afterEach((to, from) => {
		
	});
	return router;
}