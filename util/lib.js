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
	getDate(dayAf, dd) {		
		const now = new Date(Date.now());
		now.setDate(now.getDate() + (dayAf !== undefined ? dayAf || 0 : 0));
		const year = now.getFullYear();
		const month = String(now.getMonth() + 1).padStart(2, '0');
		const day = String(now.getDate()).padStart(2, '0');		
		const dateString = dd !== undefined || dd > 0 ? `${year}-${month}-${String(dd).padStart(2, '0')}` :`${year}-${month}-${day}` ;
		return dateString;
	},
	getYYYYmmdd() {
		const now = new Date(Date.now());
		const year = now.getFullYear();		
		const month = String(now.getMonth() + 1).padStart(2, '0');
		const day = String(now.getDate()).padStart(2, '0');		
		return year + month + day;
	},
	getHHmm() {
		const now = new Date(Date.now());
		const hours = now.getHours().toString().padStart(2, '0');
		const minutes = now.getMinutes().toString().padStart(2, '0'); 
		return hours + minutes;

	},
	numberToKorean(number) {
		const units = ['', '만', '억', '조', '경', '해'];
		const digits = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
		const decimals = ['', '십', '백', '천'];
	  
		if (number === 0) {
		  return '영';
		}
	  
		let result = '';
		let num = Math.abs(number);
	  
		for (let i = 0; num > 0; i++) {
		  const unit = units[i % 6];
		  let segment = '';
		  let segmentNotEmpty = false;
	  
		  for (let j = 0; j < 4 && num > 0; j++) {
			const digit = num % 10;
			if (digit > 0) {
			  segment = digits[digit] + decimals[j] + segment;
			  segmentNotEmpty = true;
			}
			num = Math.floor(num / 10);
		  }	  
		  if (segmentNotEmpty) {
			result = segment + unit + result;
		  }
		}	  
		if (number < 0) {
		  result = '마이너스 ' + result;
		}	  
		return result;
	  },
	dateToKorean(dateStr) {
		// 입력된 날짜를 Date 객체로 변환

		if (!dateStr) return '';
		var date = new Date(dateStr);

		// 원하는 형식으로 날짜를 변환
		var options = { year: 'numeric', month: 'long', day: 'numeric' };
		var dateFormatter = new Intl.DateTimeFormat('ko-KR', options);

		return dateFormatter.format(date);		 
	},
	amtToKorean(amount) {
		return amount.toLocaleString('ko-KR');
	},

	addToUniqueArray(array, value) {
		if (!array.includes(value)) {
		  array.push(value);
		}
	},
	
	comma (value) {
		if (value !== null && value !== undefined) {
			return String(Math.trunc(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
		} else {
			return String(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
		}
	},

	previousMonth () {
		const now = new Date(Date.now());

		now.setDate(now.getDate());
		const year = now.getDate() > 7 && now.getMonth() == 0 ?  now.getFullYear() - 1 :  now.getFullYear();		
		const month = now.getDate() > 7 ? now.getMonth() == 0 ? '01' : String(now.getMonth() + 1).padStart(2, '0') : String(now.getMonth()).padStart(2, '0');
		const day = '01';
		const dateString = `${year}-${month}-${day}`;
		return dateString;	
	},
	later3Month() {

	}


}

module.exports = lib;