import Vue from "vue";
import qs from 'qs';
import { LV } from '../../../util/level';

export const state = () => ({
    company : null,
});

export const mutations = {
};
export const getters = {

};
export const actions = {
    async duplicateCheckCompany(ctx, { field, value }) {        
		const { $axios } = Vue.prototype;
		const data = await $axios.get(`/api/company/duplicateCheckCompany/${field}/${value}`);
		return data;
	},
	async createUser(ctx, form) {
		const { $axios } = Vue.prototype;
		const data = await $axios.post('/api/company/user', form);
		return data;
	},
	async updateUser(ctx, form) {
		const { $axios } = Vue.prototype;
		const data = await $axios.post('/api/company/userMod', form);
		return data;
	},
	async deleteUser(ctx, form)	 {
		const { $axios } = Vue.prototype;
		const data = await $axios.post('/api/company/userDelete', form);
		return false;
	},
	async duplicateCheckId(ctx, { field, value }) {        
		const { $axios } = Vue.prototype;
		const data = await $axios.get(`/api/company/duplicateCheckId/${field}/${value}`);
		return data;
	},
};
