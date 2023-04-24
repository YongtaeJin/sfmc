import Vue from "vue";
import qs from 'qs';
import { LV } from '../../../util/level';

export const actions = {
    async getSaleEstimate( { commit }, form) {	
		const { $axios } = Vue.prototype;
		const data = await $axios.post(`/api/sales/getSaleEstimate`, form);
		return data;
	},
};