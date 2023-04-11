import Vue from "vue";
import qs from 'qs';
import { LV } from '../../../util/level';


export const actions = {	
    async duplicateVendCheck(ctx, { c_com, value1, c_vend, value2 }) {		
		const { $axios } = Vue.prototype;
		const data = await $axios.get(`/api/basejob/duplicateVendCheck/${c_com}/${value1}/${c_vend}/${value2}`);		
		return data;
    },
	async iuBaseVend( { commit }, form) {		
		const { $axios } = Vue.prototype;
		const data = await $axios.post('/api/basejob/iuBaseVend', form);
		return data;
	},
};
