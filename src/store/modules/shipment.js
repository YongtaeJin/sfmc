import Vue from "vue";
import qs from 'qs';
import { LV } from '../../../util/level';

export const actions = {
    async getDerliverlist( { commit }, form) {	
		const { $axios } = Vue.prototype;
		const data = await $axios.post(`/api/shipment/getDerliverlist`, form);
		return data;
	},
	async iuDerliverlist( { commit }, items) {
		const { $axios } = Vue.prototype;		
		const data = await $axios.post('/api/shipment/iuDerliverlist', items);
		return data;
	},
}
