import Vue from "vue";
import qs from 'qs';
import { LV } from '../../../util/level';

export const actions = {
    async getProdPlanlist( { commit }, form) {	
		const { $axios } = Vue.prototype;
		const data = await $axios.post(`/api/prod/getProdPlanlist`, form);
		return data;
	},
	async iuProdPlanlist( { commit }, items) {
		const { $axios } = Vue.prototype;		
		const data = await $axios.post('/api/prod/iuProdPlanlist', items);
		return data;
	},
	async iuProdPlanlist2( { commit }, items) {
		const { $axios } = Vue.prototype;
		const data = await $axios.post('/api/prod/iuProdPlanlist2', items);
		return data;
	},
	async iuProdWorklist( { commit }, items) {
		const { $axios } = Vue.prototype;		
		const data = await $axios.post('/api/prod/iuProdWorklist', items);
		return data;
	},
	async iuProdWorkset( { commit }, items) {
		const { $axios } = Vue.prototype;		
		const data = await $axios.post('/api/prod/iuProdWorkset', items);
		return data;
	},

};