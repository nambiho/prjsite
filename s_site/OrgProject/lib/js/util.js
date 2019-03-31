/*
 * UTIL
 */
;(function (win) {
	"use strict";
	var toString = Object.prototype.toString;
	var noop = function () {};
	var util = {
		isObject : function(x) {
			return (toString.call(x) === "[object Object]");
		},
		isArray : function(x) {
			return (toString.call(x) === "[object Array]");
		},
		copy : function(target, source) {
			target = util.isObject(target) ? target : {};
			for (var x in source) {
				target[x] = (util.isArray(source[x])
					? source[x].slice()
					: util.isObject(source[x])
						? util.copy({}, source[x])
						: source[x]);
			}
			return target||{};
		},
		merge : function (target) {
			var len = arguments.length,
				source;
			for(var i=1;i<len;i++){
				source = arguments[i];
				util.copy(target, source);
			}
			return target||{};
		},
		ViewDataParse : function (data) {
			return {
				entry : (function (viewentry) {
					var entry={}, entrydata=[], _tempentrydata={}, ret=[], temp={}
					, _tag="";
					for (var i=0; i<viewentry.length;i++) {
						entry = viewentry[i];
						temp = {unid : entry["@unid"], position : entry["@position"], response : !!entry["@response"]};
						entrydata = entry["entrydata"];
						for (var j=0;j<entrydata.length;j++){
							_tempentrydata = entrydata[j];
							_tag = _tempentrydata["@name"]||("$" + _tempentrydata["@columnnumber"]);
							if (_tempentrydata["text"]) {
								temp[_tag] = _tempentrydata.text[0];
							} else if (_tempentrydata["textlist"]) {
								temp[_tag] = _tempentrydata.textlist.text;
							} else if (_tempentrydata["numberlist"]) {
								temp[_tag] = _tempentrydata.numberlist.number;
							} else if (_tempentrydata["datetime"]) {
								temp[_tag] = _tempentrydata.datetime[0];
							} else if (_tempentrydata["datetimelist"]) {
								temp[_tag] = _tempentrydata.datetimelist.datetime;
							}
						}
						ret[i] = temp;
					}
					return ret;
				}(data["viewentry"]||[]))
			};
		}
	};

	win.util || (win.util = util);

} (this));
