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
	async duplicateGrpcodeCheck(ctx, { com, value1, grp, value2 }) {		
		const { $axios } = Vue.prototype;
		const data = await $axios.get(`/api/system/duplicateGrpcodeCheck/${com}/${value1}/${grp}/${value2}`);		
		return data;
    },
	async duplicateComcodeCheck(ctx, { com, value1, grp, value2, cod, value3 }) {		
		const { $axios } = Vue.prototype;
		const data = await $axios.get(`/api/system/duplicateComcodeCheck/${com}/${value1}/${grp}/${value2}/${cod}/${value3}`);		
		return data;
    },
	async iuGprCode( { commit }, form) {
		const { $axios } = Vue.prototype;
		const data = await $axios.post('/api/system/iuGprCode', form);
		return data;
	},
	async iuComCode( { commit }, form) {
		const { $axios } = Vue.prototype;
		const data = await $axios.post('/api/system/iuComCode', form);
		return data;
	},
	async iuNotice( { commit }, form) {
		const { $axios } = Vue.prototype;
		const data = await $axios.post('/api/system/iuNotice', form);
		return data;
	},
	async iuSiteCodeinit( { commit }, form) {
		const { $axios } = Vue.prototype;
		const data = await $axios.post('/api/system/iuSiteCodeinit', form);
		return data;
	},
	async siteImageSave( { commit }, form) {
		const { $axios } = Vue.prototype;
		const data = await $axios.post('/api/system/siteImageSave', form);
		return data;
	}
	
};
