import Vue from "vue";
import qs from 'qs';
import { LV } from '../../../util/level';

export const actions = {
    async getProdPlanlist( { commit }, form) {	
		const { $axios } = Vue.prototype;
		const data = await $axios.post(`/api/prod/getProdPlanlist`, form);
		return data;
	},
	// async iuSaleEstimate( { commit }, est) {
	// 	const { $axios } = Vue.prototype;
		
	// 	const data = await $axios.post('/api/prod/iuSaleEstimate',  est);
	// 	return data;
	// },

	// async iuSaleOrder( { commit }, order) {
	// 	const { $axios } = Vue.prototype;
		
	// 	const data = await $axios.post('/api/prod/iuSaleOrder',  order);
	// 	return data;
	// },
};