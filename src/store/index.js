import Vue from 'vue'
import Vuex from 'vuex'
import modules from "./modules";
import qs from 'qs';
Vue.use(Vuex)


function menuAccess(ref, arr) {
	arr.forEach(el=> {
		ref[el.to] = el.grant;
		if(el.subItems && el.subItems.length) {
			menuAccess(ref, el.subItems);
		}
	})
}

const store = new Vuex.Store({
	state: {
		appReady: false,
		config: {
			menu : [
				{
					title : "Home",
					icon : "mdi-home",
					to : '/',
					grant : 2, 
					newTab : false,
					subItems : []
				},
				{
					title : "관리자",
					icon : "mdi-store",
					to : '',
					grant : 5, 
					newTab : false,
					subItems : [
						{
							title : "사용자정보",
							icon : "",
							to : '/shop/userlist',							
							grant : 5, 
							newTab : false,
							subItems : []
						},
						{
							title : "사업등록",
							icon : "",
							to : '/shop/shopmag',							
							grant : 5, 
							newTab : false,
							subItems : []
						},
						{
							title : "사업신청관리",
							icon : "",
							to : '/shop/shopinputmag',							
							grant : 5, 
							newTab : false,
							subItems : []
						},
						{
							title : "사업협약서관리",
							icon : "",
							to : '/shop/shopargeemag',							
							grant : 5, 
							newTab : false,
							subItems : []
						},		
					]
				},
				{
					title : "스마트공방 사업신청",
					icon : "mdi-store",
					to : '/shop/signed',
					grant : 2, 
					newTab : false,
					subItems : []
				},
				{
					title : "스마트공방 협약신청",
					icon : "mdi-store-plus",
					to : '/shop/agree',
					grant : 2, 
					newTab : false,
					subItems : []
				},
				// {
				// 	title : "스마트공방",
				// 	icon : "mdi-store-plus",
				// 	to : '',
				// 	grant : 2, 
				// 	newTab : false,
				// 	subItems : [
				// 		{
				// 			title : "사업신청",
				// 			icon : "",
				// 			to : '/shop/signed',							
				// 			grant : 2, 
				// 			newTab : false,
				// 			subItems : []
				// 		},
				// 		{
				// 			title : "협약신청",
				// 			icon : "",
				// 			to : '/shop/agree',							
				// 			grant : 2, 
				// 			newTab : false,
				// 			subItems : []
				// 		},
				// 	]
				// },
				{
					title : "TipTab",
					icon : "mdi-home",
					to : '/tiptab',
					grant : 9, 
					newTab : false,
					subItems : []
				},
			]
		},
	},
	mutations: {
		SET_APP_READY(state) {
			state.appReady = true;
		},
		SET_CONFIG(state, { key, value }) {
			// console.log(typeof value, key, value);
			try {
				value = JSON.parse(value);
			} catch(e){}
			
			if(state.config[key]){
				state.config[key] = value;
			} else {
				Vue.set(state.config, key, value);
			}
		},
		PUSH_FETCH(state, tag) {
			state.initFetchs.push(tag);
		},
		SET_INITDATA(state, data) {
			if(data == null) {
				this.initFetchs = null;
				this.initData = null;
			} else {
				const keys = Object.keys(data);
				if(state.initData == null) {
					state.initData = {};
				}
				for(const key of keys) {
					state.initData[key] = data[key];
				}
			}
		},
	},
	getters : {
		access(state) {
			const obj = {};
			if(state.config.menu) {
				menuAccess(obj, state.config.menu);
			}
			return obj;
		}
	},
	actions: {
		async appInit({ dispatch, commit }, ctx) {
			if (ctx) {
				const keys = Object.keys(ctx.config);
				for (const key of keys) {
					commit('SET_CONFIG', { key, value: ctx.config[key] });
				}
				commit('user/SET_MEMBER', ctx.member);
				commit('user/SET_TOKEN', ctx.token);
			} else {
				await dispatch('configLoad');
				await dispatch('user/initUser');
			}
			commit('SET_APP_READY');
		},
		async configDuplicate(ctx, payload) {
			const { $axios } = Vue.prototype;
			const query = qs.stringify(payload);
			const data = await $axios.get(`/api/config/duplicateCheck?${query}`);
			return data;
		},
		async configSave({ commit }, form) {
			const { $axios } = Vue.prototype;
			const data = await $axios.post(`/api/config`, form);
			return data;
		},
		async configLoad({ commit }) {
			const data = await $axios.get('/api/config');
			if (data) {
				const keys = Object.keys(data);
				for (const key of keys) {
					commit('SET_CONFIG', { key, value: data[key] });
				}
			}

		}

	},
	modules,
});

export function createStore() {
	return store;
}

export default store;

