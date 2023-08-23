import Vue from "vue";
import qs from 'qs';
import { LV } from '../../../util/level';

export const actions = {
    async getSaleEstimate( { commit }, form) {	
		const { $axios } = Vue.prototype;
		const data = await $axios.post(`/api/sales/getSaleEstimate`, form);
		return data;
	},
	async iuSaleEstimate( { commit }, est) {
		const { $axios } = Vue.prototype;
		
		const data = await $axios.post('/api/sales/iuSaleEstimate',  est);
		return data;
	},
	async iuSaleOrder( { commit }, order) {
		const { $axios } = Vue.prototype;
		
		const data = await $axios.post('/api/sales/iuSaleOrder',  order);
		return data;
	},
};