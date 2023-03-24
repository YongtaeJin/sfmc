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
		path: '/sys/company',
		name: 'SysCompany',
		component: () => import(/* webpackChunkName: "SysCompany" */ '../views/sys/Company.vue')		
	},
	{
		path: '/shop/userlist',
		name: 'UserList',
		component: () => import(/* webpackChunkName: "UserList" */ '../views/shop/UserList.vue')		
	},
	{
		path: '/shop/signed',
		name: 'ShopSigned',
		component: () => import(/* webpackChunkName: "ShopSigned" */ '../views/shop/Signed.vue'),
		meta: { requireLogin: true },
	},
	{
		path: '/shop/signed',
		name: 'ShopSigned',
		component: () => import(/* webpackChunkName: "ShopSigned" */ '../views/shop/Signed.vue'),
		meta: { requireLogin: true },
	},
	{
		path: '/shop/shopmag',
		name: 'ShopMag',
		component: () => import(/* webpackChunkName: "ShopMag" */ '../views/shop/Shopmag.vue'),
		meta: { requireLogin: true },
	},
	{
		path: '/shop/agree',
		name: 'ShopArgee',
		component: () => import(/* webpackChunkName: "ShopArgee" */ '../views/shop/Agree.vue'),
		meta: { requireLogin: true },
	},
	{
		path: '/shop/shopinputmag',
		name: 'ShopInputMag',
		component: () => import(/* webpackChunkName: "ShopInputMag" */ '../views/shop/Shopinputmag.vue'),
	},
	{
		path: '/shop/shopargeemag',
		name: 'ShopArgeeMag',
		component: () => import(/* webpackChunkName: "ShopArgeeMag" */ '../views/shop/ShopArgeemag.vue'),
	},
	{
		path: '/no',
		name: 'NoLogin',
		component: () => import(/* webpackChunkName: "nologin" */ '../views/NotLogin.vue')
	},
	{
		path: '/tiptab',
		name: 'Tibtab',
		component: () => import(/* webpackChunkName: "tiptab" */ '../views/TibtabView.vue')
	},
	
	{
		path: '*',
		name: 'Error',
		component: () => import(/* webpackChunkName: "error" */ '../views/Error.vue')
	},
]

export default routes;