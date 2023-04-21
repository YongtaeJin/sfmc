import Home from '../views/Home.vue'

const routes = [
	{
		path: '/',
		name: 'Home',
		component: Home,
		
	},
	{
		path: '/about',
		name: 'About',
		component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
	},
	{
		path: '/login',
		name: 'NoAuthLogin',
		component: () => import(/* webpackChunkName: "login" */ '../views/member/Login.vue')
		
	},
	{
		path: '/join',
		name: 'NoAuthJoin',
		component: () => import(/* webpackChunkName: "join" */ '../views/member/Join.vue')
	},
	{
		path: '/modifyPassword/:hash',
		name: 'NoAuthModifyPassword',
		component: () => import(/* webpackChunkName: "modifyPassword" */ '../views/member/ModifyPassword.vue')
	},
	{
		path: '/adm/config',
		name: 'AdmConfig',
		component: () => import(/* webpackChunkName: "AdmConfig" */ '../views/admin/Config.vue')
	},	
	{
		path: '/adm/worksite',
		name: 'AdmWorksite',
		component: () => import(/* webpackChunkName: "AdmWorksite" */ '../views/admin/Worksite.vue')
	},
	// 시스템관리 
	{
		path: '/adm/systemcode',
		name: 'Systemcode',
		component: () => import(/* webpackChunkName: "Systemcode" */ '../views/system/Systemcode.vue')
	},
	{
		path: '/adm/systemusers',
		name: 'Systemusers',
		component: () => import(/* webpackChunkName: "Systemusers" */ '../views/system/Systemusers.vue')
	},
	// 기준정보
	{
		path: '/base/vend',
		name: 'Basejobvend',
		component: () => import(/* webpackChunkName: "Basejobvend" */ '../views/basejob/BasejobVend.vue')
	},	
	{
		path: '/base/item',
		name: 'Basejobitem',
		component: () => import(/* webpackChunkName: "Basejobitem" */ '../views/basejob/BasejobItem.vue')
	},
	{
		path: '/base/process',
		name: 'Basejobprocess',
		component: () => import(/* webpackChunkName: "Basejobprocess" */ '../views/basejob/BasejobProcess.vue')
	},
	{
		path: '/base/prtype',
		name: 'Basejobprtype',
		component: () => import(/* webpackChunkName: "Basejobprtype" */ '../views/basejob/BasejobPrType.vue')
	},
	{
		path: '/base/route',
		name: 'Basejobroute',
		component: () => import(/* webpackChunkName: "Basejobroute" */ '../views/basejob/BasejobRoute.vue')
	},
	{
		path: '/sales/estimate',
		name: 'Salesestimate',
		component: () => import(/* webpackChunkName: "Salesestimate" */ '../views/sales/SalesEstimate.vue')
	},
	{
		path: '/sales/orders',
		name: 'Salesorders',
		component: () => import(/* webpackChunkName: "Salesorders" */ '../views/sales/SalesOrders.vue')
	},


	

	{
		path: '*',
		name: 'Error',
		component: () => import(/* webpackChunkName: "error" */ '../views/Error.vue')
	},
]

export default routes;