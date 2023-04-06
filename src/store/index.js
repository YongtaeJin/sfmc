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
					title : "시스템관리",
					icon : "mdi-database-settings",
					to : '',
					grant : 9, 
					newTab : false,
					subItems : [
						{
							title : "공통코드관리",
							icon : "",
							to : '',
							grant : 9, 
							newTab : false,
							subItems : []
						},
						{
							title : "사용자관리",
							icon : "",
							to : '/adm/systemusers',
							grant : 9, 
							newTab : false,
							subItems : []
						},
					]
				},
				{
					title : "기준정보",
					icon : "mdi-ab-testing",
					to : '',
					grant : 8, 
					newTab : false,
					subItems : [
						{
							title : "거래처관리",
							icon : "",
							to : '',
							grant : 8, 
							newTab : false,
							subItems : []
						},
						{
							title : "품목관리",
							icon : "",
							to : '',
							grant : 8, 
							newTab : false,
							subItems : []
						},
						{
							title : "공정관리",
							icon : "",
							to : '',
							grant : 8, 
							newTab : false,
							subItems : []
						},
						{
							title : "라우팅관리",
							icon : "",
							to : '',
							grant : 8, 
							newTab : false,
							subItems : []
						},
					]
				},
				{
					title : "영업관리",
					icon : "mdi-handshake",
					to : '',
					grant : 7, 
					newTab : false,
					subItems : [
						{
							title : "견적관리",
							icon : "",
							to : '',
							grant : 7, 
							newTab : false,
							subItems : []
						},
						{
							title : "수주관리",
							icon : "",
							to : '',
							grant : 7, 
							newTab : false,
							subItems : []
						},
					]
				},
				{
					title : "생산계획",
					icon : "mdi-wrench",
					to : '',
					grant : 6, 
					newTab : false,
					subItems : [
						{
							title : "생산계획",
							icon : "",
							to : '',
							grant : 6, 
							newTab : false,
							subItems : []
						},
						{
							title : "작업시지",
							icon : "",
							to : '',
							grant : 6, 
							newTab : false,
							subItems : []
						},
					]
				},
				{
					title : "생산관리",
					icon : "mdi-basket-fill",
					to : '',
					grant : 5, 
					newTab : false,
					subItems : [
						{
							title : "생산실적",
							icon : "",
							to : '',
							grant : 5, 
							newTab : false,
							subItems : []
						},	
					]
				},
				{
					title : "납품관리",
					icon : "mdi-car-multiple",
					to : '',
					grant : 4, 
					newTab : false,
					subItems : [
						{
							title : "출하관리",
							icon : "",
							to : '',
							grant : 4, 
							newTab : false,
							subItems : []
						},
					]
				},
				{
					title : "현황분석",
					icon : "mdi-chart-bar-stacked",
					to : '',
					grant : 6, 
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

