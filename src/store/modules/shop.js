import Vue from "vue";
import qs from 'qs';
import { LV } from '../../../util/level';


export const actions = {
	async duplicateCheckShop(ctx, { field, value }) {        
		const { $axios } = Vue.prototype;
		const data = await $axios.get(`/api/shopinfo/duplicgateCheckShop/${field}/${value}`);        
		return data;
	},

	async shopInfoSave({ commit }, form) {
		const { $axios } = Vue.prototype;
		const data = await $axios.post(`/api/shopinfo/shopInfoSave`, form);
		return data;
	},

	async shopAddFile({ commit }, form) {
		const { $axios } = Vue.prototype;
		const data = await $axios.post(`/api/shopinfo/shopAddFile`, form);
		return data;
	},
	async shopAddFileDelete({ commit }, form) {
		const { $axios } = Vue.prototype;
		const data = await $axios.post(`/api/shopinfo/shopAddFileDelete`, form);
		return data;
	},
	async shopEmailSend({ commit }, form) {		
		const { $axios } = Vue.prototype;
		const data = await $axios.post(`/api/shopinfo/postMailSend`, form);
		return data;
	},


}

