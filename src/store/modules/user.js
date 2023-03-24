import Vue from "vue";
import qs from 'qs';
import { LV } from '../../../util/level';

export const state = () => ({
	member: null,
	token: null,
	shopinfo: null,   // 스마트공방 신청 정보
});

export const mutations = {
	SET_MEMBER(state, member) {
		state.member = member;
	},
	SET_TOKEN(state, token) {
		state.token = token;
	},	
	SET_SHOPINFO(state, shopinfo) {
		state.shopinfo = shopinfo;
	}
};
export const getters = {
	isAdmin(state) {
		return state.member && state.member.mb_level >= LV.ADMIN;
	},
	isSuper(state) {
		return state.member && state.member.mb_level >= LV.SUPER;
	},
	isShopinfochk(state) {
		for(let ob in state.shopinfo) {
			// console.log(ob, state.shopinfo[ob]);
			if (!state.shopinfo[ob]) { return 0 ;}
		}
		return 1;
	}
};
export const actions = {
	async initUser({ commit }) {
		const { $axios } = Vue.prototype;
		const data = await $axios.get('api/member/auth');
		if (data) {
			commit('SET_MEMBER', data.member);
			commit('SET_TOKEN', data.token);
		}		
	},
	async duplicateCheck(ctx, { field, value }) {
		const { $axios } = Vue.prototype;
		const data = await $axios.get(`/api/member/duplicateCheck/${field}/${value}`);
		return data;
	},
	async createMember(ctx, form) {
		const { $axios } = Vue.prototype;
		const data = await $axios.post('/api/member', form);
		return data;
	},
	async signInLocal({ commit }, form) {
		const { $axios } = Vue.prototype;
		const data = await $axios.post('/api/member/loginLocal', form);
		if (data) {
			commit('SET_MEMBER', data.member);
			commit('SET_TOKEN', data.token);
		}
		const data2 = await $axios.get(`/api/shopinfo`, form);		
		if (data2) {			
			commit('SET_SHOPINFO', data2);
		}
		return !!data;
	},
	async signOut({ commit, state }) {
		const { $axios } = Vue.prototype;
		const mb_name = state.member.mb_name;
		const data = await $axios.get('/api/member/signOut');
		commit('SET_MEMBER', null);
		commit('SET_TOKEN', null);
		commit('SET_SHOPINFO', null);
		return mb_name;
	},
	async findIdLocal(ctx, form) {
		const { $axios } = Vue.prototype;
		const query = qs.stringify(form);
		const data = await $axios.get(`/api/member/findId?${query}`);
		return data;
	},
	async findPwLocal(ctx, form) {
		const { $axios } = Vue.prototype;
		const query = qs.stringify(form);
		const data = await $axios.get(`/api/member/findPw?${query}`);
		return data;
	},
	async modifyPassword(ctx, form) {
		const { $axios } = Vue.prototype;
		const data = await $axios.patch(`/api/member/modifyPassword`, form);
		return data;
	},
	async checkPassword(ctx, form) {
		const { $axios } = Vue.prototype;
		const data = await $axios.post(`/api/member/checkPassword`, form);
		return data;
	},
	async updateMember({ commit }, form) {
		const { $axios } = Vue.prototype;
		const data = await $axios.patch(`/api/member`, form);
		if (data) {
			commit('SET_MEMBER', data);
		}
		return !!data;
	},
	async checkShopInfo({ commit }, form) {
		const { $axios } = Vue.prototype;
		const data = await $axios.get(`/api/shopinfo`, form);		
		if (data) {			
			commit('SET_SHOPINFO', data);
		}				
		return !!data;
	},
	async updateShopInfo({ commit }, form) {
		const { $axios } = Vue.prototype;
		const data = await $axios.patch(`/api/shopinfo`, form);		
		return !!data;
	}
};
