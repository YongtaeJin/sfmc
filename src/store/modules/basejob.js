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
	// ITEM 관리
	async duplicateItemCheck(ctx, { c_item, value }) {		
		const { $axios } = Vue.prototype;
		const data = await $axios.get(`/api/basejob/duplicateItemCheck/${c_item}/${value}`);		
		return data;
    },
	async iuBaseItem( { commit }, form) {		
		const { $axios } = Vue.prototype;
		const data = await $axios.post('/api/basejob/iuBaseItem', form);
		return data;
	},
	// 공정관리
	async duplicateProcessCheck(ctx, { c_process, value }) {		
		const { $axios } = Vue.prototype;
		const data = await $axios.get(`/api/basejob/duplicateProcessCheck/${c_process}/${value}`);		
		return data;
    },
	async iuBaseProcess( { commit }, form) {		
		const { $axios } = Vue.prototype;
		const data = await $axios.post('/api/basejob/iuBaseProcess', form);
		return data;
	},

};
