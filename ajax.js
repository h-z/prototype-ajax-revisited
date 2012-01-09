var HZ = {};

/**
 * Class used for sending XMLHttp requests.
 * A request can be synchronous or asynchronous,
 * requests can be in queue,
 * their response can be cached.
 * If more of the same name waits for a request, only the last one will be run.
 */
HZ.Ajax = {
	//cached responses
	cache: {},

	//requests standing in queue
	requestPool: [],

	//cache timeout in msec
	cacheTimeout: 30000,

	/**
	 * fingerprint of a request, to identify it later
	 * @param object the request
	 * @return string fingerprint
	 */
	fingerprint: function(opt) {
		var r = '';
		for(var i in opt) {
			r += i + '#' + opt[i].toString() + '@@';
		}
		return r;
	},

	/**
	 * deletes the cache
	 */
	deleteCache: function() {
		this.cache = {};
	},

	/**
	 * @return true if name exists in pool, false otherwise
	 */
	isNameInPool: function(name) {
		var is = false;
		// 0 is for current
		for (var i=0; i<this.requestPool.length; i++) {
			if(this.requestPool[i].name == name) {
				is = true;
				break;
			}
		}
		return is;
	},

	/**
	 * adds a new request into the pool.
	 * if the pool was empty, starts it.
	 * @param object request
	 */
	addRequest: function(params) {
		//older requests of the same name must be removed from the pool
		if(params.name) {
			for (var i=0; i<this.requestPool.length; i++) {
				if(this.requestPool[i].name == params.name) {
					this.requestPool[i].name = "___deactivated";
				}
			}
		} else {
			params.name = '';
		}
		var request = {
			requestURL: params.requestURL?params.requestURL:'', 
			callBack: params.callBack?params.callBack:'', 
			postParams: params.postParams?params.postParams:[], 
			callbackParams: params.callbackParams?params.callbackParams:[], 
			name: params.name?params.name:'',
			method: params.method?params.method:'POST',
			cache: params.cache?params.cache:false,
			async: params.async?params.async:true,
			queue: params.queue?params.queue:true
		};
		
		//synchronous/asynchronous
		if(false == params.queue) {
			this.sendRequest(request);
		} else {
			request.async = true;
			this.requestPool.push(request);
			if (this.requestPool.length==1) {
				this.processRequest();
			}
		}
	},

	
	/**
	 * send the next request
	 * @param object request
	 */
	sendRequest: function(request) {
		var f = this.fingerprint(request);
		var cached = false;
		if(request.cache && ('undefined' != typeof this.cache[f])) {
			if((new Date()).getTime() - this.cache[f].timestamp < this.cacheTimeout) {
				cached = true;
			}
		}
		//if there is a usable cached response for the given request, then we can use it without any network traffic
		if(cached) {
			this.run(request, this.cache[f].responseText);
			this.requestPool.shift();
			this.processRequest();
		//no cached response
		} else {
			var postData = '';
			for (var j=0; j<request.postParams.length; j++) {
				postData += '&' + request.postParams[j][0] + '=' + encodeURIComponent(request.postParams[j][1]);
			}
			postData = postData.replace(/^&/, '?');
			new Ajax.Request(request.requestURL, {
				method: request.method,
				asynchronous: request.async,
				parameters: request.postParams.toObject(),
				onSuccess: function(transport) {
					//saving response into cache
					transport.timestamp = (new Date()).getTime();
					HZ.Ajax.cache[f] = transport;
					HZ.Ajax.run(request, transport.responseText);
					HZ.Ajax.requestPool.shift();
					HZ.Ajax.processRequest();
				},
				onException: function(req, ex) {
					HZ.Ajax.requestPool.shift();
					HZ.Ajax.processRequest();
				}
			});
		}
	},

	/**
	 * runs the callback function
	 * @param object request
	 * @param object response from XMLHttp or cache
	 */
	run: function(request, response) {
		if(typeof(request.callBack) == 'function') {
			request.callBack(escape(response), request.callbackParams);
		} else if('' != request.callBack) {
			//callback function as a string
			eval("callbackExists = (window." + request.callBack + ");");
			if (callbackExists) {
				var s = request.callBack + "('" + escape(response) + "', request.callbackParams);";
				eval(s);
			}
		}  
	},

	/**
	 * processes the pool
	 */
	processRequest: function() {
		if(this.requestPool.length > 0 && this.requestPool[0].name != '___deactivated') {
			var r = this.requestPool[0];
			this.sendRequest(r);
		} else if(this.requestPool.length > 0) {
			this.requestPool.shift();
			this.processRequest();
		}
	}
}
// [['a', 2],['b',3]] => {a:2,b:3}
Array.prototype.toObject = function() {
	var o = {};
	for (i in this) {
		var c = this[i];
		if(isArray(c)) {
			if (2 == c.size()) {
				if(c[0].match(/\[\]$/)) {
					if('undefined' == typeof o[c[0]]) {
						o[c[0]] = [];
					}
					o[c[0]].push(c[1]);
				} else {
					o[c[0]] = c[1];
				}
			}
		}
	}
	return o;
}
