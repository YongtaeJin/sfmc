const level = {
	LV: {
		BLOCK: 0,
		AWAIT: 1,
		MEMBER: 2,		
		DELIVERY : 4,		
		MANAGER: 5,
		PRODUCTION: 6,
		BUSINESS: 7,
		ADMIN: 8,
		SYSTEM: 9,
		SUPER: 10
	},
	LVITEMS : [
		{ label: "BLOCK", lv: 0 },
		{ label: "AWAIT", lv: 1 },
		{ label: "MEMBER", lv: 2 },		
		{ label: "DELIVERY", lv: 4 },		
		{ label: "MANAGER", lv: 5 },
		{ label: "PRODUCTION", lv: 6 },
		{ label: "BUSINESS", lv: 7 },
		{ label: "ADMIN", lv: 8 },
		{ label: "SYSTEM", lv: 9 },
	],
	LV_LABEL: (lv) => {
		if (lv >= level.LV.SUPER) {
			return '프로그램관리자';
		} else if (level.LV.ADMIN <= lv && lv < level.LV.SYSTEM) {
			return '시스템관리자';
		} else if (level.LV.BUSINESS <= lv && lv < level.LV.ADMIN) {			
			return '관리자';
		} else if (level.LV.PRODUCTION <= lv && lv < level.LV.BUSINESS) {
			return '영업관리';
		} else if (level.LV.MANAGER <= lv && lv < level.LV.PRODUCTION) {
			return '생산계획';
		} else if (level.LV.DELIVERY <= lv && lv < level.LV.MANAGER) {
			return '생산관리';
		} else if (level.LV.MEMBER <= lv && lv < level.LV.DELIVERY) {
			return '납품관리';
		} else if (level.LV.AWAIT <= lv && lv < level.LV.MEMBER) {
			return '일반';
		} else if (level.LV.AWAIT == lv) {
			return '대기';
		} else {
			return '차단';
		}
	},
	LV_COLOR: (lv) => {
		if (lv >= level.LV.SUPER) {
			return 'light-blue accent-4';
		} else if (level.LV.ADMIN <= lv && lv < level.LV.SUPER) {
			return 'green lighten-1';
		} else if (level.LV.VIP <= lv && lv < level.LV.ADMIN) {
			return 'green lighten-2';
		} else if (level.LV.MEMBER <= lv && lv < level.LV.VIP) {
			return 'lime lighten-3';
		} else if (level.LV.AWAIT == lv) {
			return 'red accent-2';
		} else {
			return 'red accent-4';
		}
	},
	isGrant(req, lv) {
		return req.user && req.user.i_level >= lv ? true : false;
	}
};

module.exports = level;