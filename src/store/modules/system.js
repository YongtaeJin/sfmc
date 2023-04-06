import Vue from "vue";
import qs from 'qs';
import { LV } from '../../../util/level';

export const actions = {
    async duplicateCheck(ctx, { field, value }) {
        const { $axios } = Vue.prototype;
		const data = await $axios.get(`/api/system/duplicateCheck/${field}/${value}`);
		return data;
    },
	async duplicateDualCheck(ctx, { com, aFiled, field, value }) {		
		const { $axios } = Vue.prototype;
		const data = await $axios.get(`/api/system/duplicateDualCheck/${com}/${aFiled}/${field}/${value}`);		
		return data;
    },
    async insertWorksite(ctx, form) {
		const { $axios } = Vue.prototype;
		const data = await $axios.post('/api/system', form);
		return data;
	},
    async updateWorksite({ commit }, form) {
		const { $axios } = Vue.prototype;
		const data = await $axios.patch(`/api/system`, form);	
		return !!data;
	},	
	async iuWorkUser( { commit }, form) {
		const { $axios } = Vue.prototype;
		const data = await $axios.post('/api/system/iuWorkUser', form);
		return data;
	},
	
};
