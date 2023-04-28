const lib = {
	deepCopy(obj) {
		if(obj === null || typeof obj !== 'object') {
			return obj;
		}
		const result = Array.isArray(obj) ? [] : {};
		for(const key of Object.keys(obj)) {
			result[key] = lib.deepCopy(obj[key]);
		}
		return result;
	},
	async modelCall(fn, ...args) {
		try {
			const result = await fn(...args);
			return result;
		} catch(e) {
			console.trace(e);
			return { err : e.message };
		}
	},
	extractNumber(data) {
		var regex  = /[^0-9]/g;
		var rv = data.replace(regex, "");
		return rv
	},

	getIp(req) {		
		//return req.ip.replace('::ffff:', '');
		var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;		
		if (ip.substr(0, 7) == "::ffff:") {
				ip = ip.substr(7);
		} else {
			ip = ip.replace('::ffff:', '');
		}
		return ip;	
	},
	findParentVm(vm, target) {
		let parent = vm.$parent;
		while(parent.$vnode) {
			// console.log(parent.$vnode.tag);
			if(parent.$vnode.tag.endsWith(target)) {
				return parent;
			}
			parent = parent.$parent
		}
		return null;
	},
	getIdComDiv(req) {
		return req.split('^:^');
	},
	priceToString(price)  {
		return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	},
	getDate(dayAf) {		
		const now = new Date(Date.now());
		now.setDate(now.getDate() + (dayAf !== undefined ? dayAf || 0 : 0));
		const year = now.getFullYear();
		const month = String(now.getMonth() + 1).padStart(2, '0');
		const day = String(now.getDate()).padStart(2, '0');
		const dateString = `${year}-${month}-${day}`;
		return dateString;
	}
}

module.exports = lib;