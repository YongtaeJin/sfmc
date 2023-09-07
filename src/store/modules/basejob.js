import Vue from "vue";
import qs from 'qs';
import { LV } from '../../../util/level';


export const actions = {	
    async duplicateVendCheck(ctx, { c_com, value1, c_vend, value2 }) {		
		const { $axios } = Vue.prototype;
		const data = await $axios.get(`/api/basejob/duplicateVendCheck/${c_com}/${value1}/${c_vend}/${value2}`);		
		return data;
    },
	async iuHrbase( { commit }, form) {		
		const { $axios } = Vue.prototype;
		const data = await $axios.post('/api/basejob/iuHrbase', form);
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
	// 공정유형관리
	async duplicateProcesstypeCheck(ctx, { c_ptype, value }) {		
		const { $axios } = Vue.prototype;
		const data = await $axios.get(`/api/basejob/duplicateProcesstypeCheck/${c_ptype}/${value}`);		
		return data;
    },
	async iuBaseProcesstype( { commit }, form) {		
		const { $axios } = Vue.prototype;
		const data = await $axios.post('/api/basejob/iuBaseProcesstype', form);
		return data;
	},
	async duplicateProcesstypeCheckLi(ctx, { c_col1, value1, c_col2, value }) {	
		const { $axios } = Vue.prototype;
		const data = await $axios.get(`/api/basejob/duplicateProcesstypeCheckLi/${c_col1}/${value1}/${c_col2}/${value}`);		
		return data;
    },
	async iuBaseProcesstypeLi( { commit }, form) {		
		const { $axios } = Vue.prototype;
		const data = await $axios.post('/api/basejob/iuBaseProcesstypeLi', form);
		return data;
	},
	// 라우트관리
	async duplicateRouteCheck(ctx, { c_route, value }) {		
		const { $axios } = Vue.prototype;
		const data = await $axios.get(`/api/basejob/duplicateRouteCheck/${c_item}/${value}`);		
		return data;
    },
	async iuBaseRoute( { commit }, form) {		
		const { $axios } = Vue.prototype;
		const data = await $axios.post('/api/basejob/iuBaseRoute', form);
		return data;
	},
	async iuBaseRouteProc( { commit }, form) {		
		const { $axios } = Vue.prototype;
		const data = await $axios.post('/api/basejob/iuBaseRouteProc', form);
		return data;
	},

};
