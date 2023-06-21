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

};