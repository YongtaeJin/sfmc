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
	{
		path: '/adm/notice',
		name: 'Notice',
		component: () => import(/* webpackChunkName: "Notice" */ '../views/system/Notice.vue')
	},
	// 기준정보
	{
		path: '/base/hrbase',
		name: 'BasejobHr',
		component: () => import(/* webpackChunkName: "BasejobHr" */ '../views/basejob/BasejobHrView.vue')
	},	
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
		path: '/sales/estimatelist',
		name: 'EstimateList',
		component: () => import(/* webpackChunkName: "EstimateList" */ '../views/sales/SalesEstimatelist.vue')
	},
	{
		path: '/sales/orders',
		name: 'Salesorders',
		component: () => import(/* webpackChunkName: "Salesorders" */ '../views/sales/SalesOrders.vue')
	},
	{
		path: '/sales/orderslist',
		name: 'SalesordersList',
		component: () => import(/* webpackChunkName: "SalesordersList" */ '../views/sales/SalesOrderslist.vue')
	},
	// 생산계획/관리
	{
		path: '/prod/plan',
		name: 'ProdPlanning',
		component: () => import(/* webpackChunkName: "ProdPlanning" */ '../views/prod/ProdPlanning.vue')
	},
	{
		path: '/prod/workorder',
		name: 'ProdWorkorder',
		component: () => import(/* webpackChunkName: "ProdWorkorder" */ '../views/prod/ProdWorkorder.vue')
	},
	{
		path: '/prod/work',
		name: 'ProdWork',
		component: () => import(/* webpackChunkName: "ProdWork" */ '../views/prod/ProdWork.vue')
	},
	{
		path: '/prod/workview',
		name: 'ProdWorkView',
		component: () => import(/* webpackChunkName: "ProdWorkView" */ '../views/prod/ProdWorkView.vue')
	},
	{
		path: '/prod/workorderview',
		name: 'ProdWorkorderview',
		component: () => import(/* webpackChunkName: "ProdWorkorderview" */ '../views/prod/ProdWorkorderview.vue')	},
	
	// 출하관리
	{
		path: '/shipment/derliver',
		name: 'DerliverView',
		component: () => import(/* webpackChunkName: "DerliverView" */ '../views/shipment/DerliverView.vue')
	},
	{
		path: '/shipment/derliverlist',
		name: 'DerliverViewList',
		component: () => import(/* webpackChunkName: "DerliverViewList" */ '../views/shipment/DerliverViewlist.vue')
	},
	{
		path: '/shipment/invoice',
		name: 'Invoice',
		component: () => import(/* webpackChunkName: "Invoice" */ '../views/shipment/InvoiceView.vue')
	},
	{
		path: '/shipment/account',
		name: 'Account',
		component: () => import(/* webpackChunkName: "Account" */ '../views/shipment/AccountView.vue')
	},
	{
		path: '/shipment/invoicelist',
		name: 'InvoiceList',
		component: () => import(/* webpackChunkName: "InvoiceList" */ '../views/shipment/InvoiceListView.vue')
	},

	// 현황분석
	{
		path: '/metrics/derliver',
		name: 'Derliverrate',
		component: () => import(/* webpackChunkName: "Derliverrate" */ '../views/metrics/DerliverrateView.vue')
	},
	{
		path: '/metrics/defectrate',
		name: 'DefectrateRate',
		component: () => import(/* webpackChunkName: "DefectrateRate" */ '../views/metrics/DefectraterateView.vue')
	},
	{
		path: '/metrics/clientsales',
		name: 'Clientsalerate',
		component: () => import(/* webpackChunkName: "Clientsalerate" */ '../views/metrics/ClientsalerateView.vue')
	},
	{
		path: '/metrics/periodsales',
		name: 'Periodsalerate',
		component: () => import(/* webpackChunkName: "Periodsalerate" */ '../views/metrics/Periodsalerate.vue')
	},

	// 모니터링
	{
		path: '/monitor/monitor1',
		name: 'Monitorview',
		component: () => import(/* webpackChunkName: "Monitorview" */ '../views/monitor/MonitorView.vue')
	},

	// KPI 
	{
		path: '/adm/kpimanager',
		name: 'kPIManager',
		component: () => import(/* webpackChunkName: "kPIManager" */ '../views/kpi/KpiManager.vue')
	},	
	{
		path: '/adm/kpidatainput',
		name: 'kPIDataInput',
		component: () => import(/* webpackChunkName: "kPIDataInput" */ '../views/kpi/kpiDataInputView.vue')
	},
	{
		path: '/kpi/level1',
		name: 'KPILevel1',
		component: () => import(/* webpackChunkName: "KPILevel1" */ '../views/kpi/Level1View.vue')
	},
	{
		path: '/kpi/level2',
		name: 'KPILevel2',
		component: () => import(/* webpackChunkName: "KPILevel2" */ '../views/kpi/Level2View.vue')
	},
	{
		path: '/kpi/level3',
		name: 'KPILevel3',
		component: () => import(/* webpackChunkName: "KPILevel3" */ '../views/kpi/Level3View.vue')
	},
	{
		path: '*',
		name: 'Error',
		component: () => import(/* webpackChunkName: "error" */ '../views/Error.vue')
	},
]

export default routes;