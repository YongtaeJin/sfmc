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
		name: 'SystemCode',
		component: () => import(/* webpackChunkName: "Systemcode" */ '../views/system/Systemcode.vue')
	},
	{
		path: '/adm/systemusers',
		name: 'Systemusers',
		component: () => import(/* webpackChunkName: "Systemusers" */ '../views/system/Systemusers.vue')
	},


	{
		path: '*',
		name: 'Error',
		component: () => import(/* webpackChunkName: "error" */ '../views/Error.vue')
	},
]

export default routes;