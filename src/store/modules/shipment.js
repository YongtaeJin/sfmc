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
	async iuShipWorkset( { commit }, items) {
		const { $axios } = Vue.prototype;		
		const data = await $axios.post('/api/shipment/iuShipWorkset', items);
		return data;
	},
	async iuInvoicelist( { commit }, items) {
		const { $axios } = Vue.prototype;		
		const data = await $axios.post('/api/shipment/iuInvoicelist', items);
		return data;
	},
	async invoiceNochk( { commit }, items) {
		const { $axios } = Vue.prototype;		
		const data = await $axios.post('/api/shipment/invoiceNochk', items);
		return data;
	},
	async iuAccountlist( { commit }, items) {
		const { $axios } = Vue.prototype;		
		const data = await $axios.post('/api/shipment/iuAccountlist', items);
		return data;
	},
}
