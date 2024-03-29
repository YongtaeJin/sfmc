import Vue from "vue";
import qs from 'qs';
import { LV } from '../../../util/level';

export const state = () => ({
	member: null,
	token: null,	
});

export const mutations = {
	SET_MEMBER(state, member) {
		state.member = member;
	},
	SET_TOKEN(state, token) {
		state.token = token;
	},	
	
};
export const getters = {
	isAdmin(state) {
		return state.member && state.member.i_level >= LV.ADMIN;
	},
	isSuperMag(state) {
		return state.member && state.member.i_level == LV.SUPER && state.member.i_id == "freeview";
	},
	isSuper(state) {
		return state.member && state.member.i_level >= LV.SUPER;
	},	
	GRANT(state) {
		return state.member ? state.member.i_level : 2 ;
	} ,
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
		// console.log(data);
		if (data) {
			commit('SET_MEMBER', data.member);
			commit('SET_TOKEN', data.token);
		}
		return !!data;
	},
	async signOut({ commit, state }) {
		const { $axios } = Vue.prototype;
		const n_name = state.member.n_name;
		const data = await $axios.get('/api/member/signOut');
		commit('SET_MEMBER', null);
		commit('SET_TOKEN', null);		
		return n_name;
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
};
