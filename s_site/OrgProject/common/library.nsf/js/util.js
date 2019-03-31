;(function (realm) {
	"use strict";
	
	var ssoprefix="",
	iv_jct=document.cookie.match(/iv_jct=([^;]*)(;)?/i),
	isSSO=false;

	iv_jct=(iv_jct!=null?iv_jct[1]:"");
	ssoprefix=(document.location.host.search(/sso/i)!=-1?decodeURIComponent(iv_jct):"");
	if(realm.location.host.indexOf("sso")!=-1){
		isSSO=true;
	}

	var
		toString=Object.prototype.toString,
		jsonctor=JSON.constructor,
		isObject=function(x) {if (!x) return false;if (!x.constructor) return false;return (!x.constructor.name)?toString.call(x)==="[object Object]":x.constructor.name==="Object"},
		isNative=function (x) {return x.indexOf("[native code]")>-1},
		isArray=function(x) {return (toString.call(x)==="[object Array]")},
		isFunction=function(x) {return typeof x==="function"},
		isPlain=function (x) {if (isFalse(x) || !isObject(x)) return false;var p=Object.getPrototypeOf(x);if (!p) return __isJSON(x);var ctor=Object.hasOwnProperty.call(p,"constructor") && p.constructor;return isFunction(ctor)&&isNative(ctor.toLocaleString())},
		isString=function (x) {return typeof x==="string"},
		isNull=function (x){return (toString.call(x)==="[object Null]")},
		isUndefined=function (x){return (typeof x==="undefined")},
		isDom=function (x) {return x&&!!x.nodeName},
		isFalse=function (x){return (isNull(x)||isUndefined(x)||(x==="")||(x===0)||!x)},
		__noop=function () {},
		__getElementById=function (s){return ((this&&this.getElementById)?this:document).getElementById(s)},
		__getElementByClassName=function (s){return Array.prototype.slice.call(((this&&this.getElementsByClassName)?this:document).getElementsByClassName(s))},
		__getElementByTagName=function (s){return Array.prototype.slice.call(((this&&this.getElementsByTagName)?this:document).getElementsByTagName(s))},
		__query=function (s){var _ret=((this&&this.querySelector)?this:document).querySelector(s);return _ret},
		__queryall=function (s){var m=((this&&this.querySelectorAll)?this:document).querySelectorAll(s);return m.forEach?m:Array.prototype.slice.call(m)},
		__copy=function (target,source,delPrefix) {
			var rtype=isArray(source)?[]:{};target=isObject(target) ? target:rtype;for (var x in source) {if (!delPrefix || x.charCodeAt(0) !==delPrefix) {
			target[x]=(isArray(source[x])? __copy(target[x]||[],source[x],delPrefix): isPlain(source[x])? __copy(target[x]||{},source[x],delPrefix): source[x]);}}return target
		},
		__isJSON=function (x) {return x.constructor===jsonctor},
		__style=function (el,style) {if (!isObject(style)) return el;for(var x in style){el.style[x]=style[x];}},
		__merge=function (target,delPrefix) {
			var len=arguments.length,i=(isObject(delPrefix)?1:2),source;
			for(;i<len;i++){source=arguments[i]; !isFalse(source)&&(target=__copy(target,source,delPrefix));}
			return target||{}
		},
		__createElement=function (info,obj) {
			if (!info.dom) return null;var el=document.createElement(info.dom);for(var attr in info.attr) {el.setAttribute(attr,info.attr[attr]);}
			for(var style in info.style) {el.style[style]=info.style[style];}
			for(var ev in info.event){el.addEventListener(ev,function (e) {info.event[ev].call(obj||this,e);},false);}
			info.text&&(el.textContent=info.text);
			(info.parent||document.body)["appendChild"](el);
			return el;
		},
		__addEvent=function (t,tp,ev,c) {
			t&&tp&&isFunction(ev)&&(t.addEventListener?t.addEventListener(tp,ev||__noop,c||false):t.attachEvent("on"+tp,ev||__noop));
		},
		__trigger=function _trigger (_obj,_eventtype,_call) {
			if(!isFalse(_call) && !isFalse(_call.before) && isFunction(_call.before)) _call.before.call(_obj,_eventtype);
			function _browserEvent () {
			if(typeof(Event)==='function') {var event=new Event(_eventtype,{bubbles:true,cancelBubble:true,cancelable:true});
			}else{var event=document.createEvent('Event');event.initEvent(_eventtype,true,true);}return event}
			if (_obj.dispatchEvent) _obj.dispatchEvent(_browserEvent())
			else _obj.fireEvent("on"+_eventtype)
			var _ret;
			if(!isFalse(_call) && !isFalse(_call.end) && isFunction(_call.end)) var _ret=_call.end.call(_obj,_eventtype);
			if (!isFalse(_ret)) return _ret
		},
		__getUrl=function (u,p) {
			var host=location.host,
			slash="\u002F",dot="\u002E",
			protocal=location.protocol+slash+slash,
			isSlash=(u.charAt(0)===slash);
			//if (isSSO) u=(protocal+(ssoprefix?ssoprefix+dot:"")+host+(isSlash?"":slash)+u);
			return u+(function () {
				var ret=[];
				for(var x in p) ret[ret.length]=(x+"\u003D"+encodeURIComponent(p[x]));
				return (ret.length>0)?"\u0026"+ret.join("\u0026"):"";
			}())
		}
	;
	

	var _util={
		noop:__noop,
		warn:function (x) {realm.console&&console.warn(x)},
		isFalse:function(x){return isFalse(x)},
		style:function (el,style) {__style(el,style)},
		isJSON:function (x) {return __isJSON(x)},
		isJsonString:function (_str) {try {return JSON.parse(_str)&&!!_str} catch(e) {return false}},
		addEvent:function (target,eventType,eventFunction,useCapture) {
			__addEvent(target,eventType,eventFunction,useCapture);
		},
		trigger:function (_obj,_eventtype,_call) {__trigger(_obj,_eventtype,_call)},
		getUrl:function (url,param) {return __getUrl(url,param)},
		object:function (o,descriptor,extend) {return Object.create(__merge({},0x5f,o,extend),descriptor)},
		pattern:function _RX(d,c){
			if (isString(d)) {c=d; d=this||{}}
			var a=/\{\{@([a-zA-Z0-9_@\. \*\^\$\#-]*)\}\}/g,
			b=c.replace(a,function(e,f){return isNull(d[f])||isUndefined(d[f])?"":d[f]});
			return b
		},
		rx:function (d,c){
			if (isString(d)) {c=d; d=__isJSON(this)?this:{}}
			var a=/\{\{@([a-zA-Z0-9_@\. \*\^\$\#-]*)\}\}/g,
			b=c.replace(a,function(e,f){return isNull(d[f])||isUndefined(d[f])?"":d[f]});
			return b
		},
		trim:function  (val) {return val.replace(/^[\s]+|[\s]+$/g,"")},
		getElementById:function (o,s){if(isString(o)){s=o; o=isDom(this)?this:null}return __getElementById.call(o,s)},
		getElementByClassName:function (o,s) {if(isString(o)){s=o; o=isDom(this)?this:null}return __getElementByClassName.call(o,s)},
		getElementByTagName:function (o,s) {if(isString(o)){s=o; o=isDom(this)?this:null}return __getElementByTagName.call(o,s)},
		query:function (o,s){if(isString(o)){s=o; o=isDom(this)?this:null}return __query.call(o,s)},
		queryall:function (o,s){if(isString(o)){s=o; o=isDom(this)?this:null}return __queryall.call(o,s)},
		copy:function(target,source,delPrefix) {return __copy(target,source,delPrefix)},
		merge:function (target) {return __merge.apply(null,Array.prototype.slice.call(arguments))},
		createElement:function (elementinfo,obj) {return __createElement(elementinfo,obj)},
		getJson2Info:function (source,dep) {
			var info={};
			source.split(dep).forEach(function (data,idx) {
				if(data.indexOf("\u003D")>-1){
					var sd=data.split("\u003D");
					info[sd[0]]=sd.slice(1).join("\u003D");
				}
			});
			return info
		},
		addClass:function (target,classname) {
			var tc=(target.className&&target.className.split("\u0020"))||[];
			classname=isArray(classname)?classname:[classname];
			classname=tc.concat(classname);
			target.className=classname.join("\u0020");
		},
		deleteClass:function (target,classname) {
			var tc=(target.className&&target.className.split("\u0020")),
			idx=tc.indexOf(classname);
			if (idx>-1) tc.splice(idx,1);
			target.className=tc.join("\u0020");
		},
		getTooltip:function (id) {
			return __getElementById(id||"__tooltip__")
		},
		tooltip:function (el,id,text,style) {
			if (!el || !text || !id) return;
			
			id=(id+"__tooltip__");
			var tooltip=__getElementById(id);
			rmTooltip(tooltip);

			var rect=el.getClientRects()[0];
			tooltip=util.createElement({
				dom:"div",
				attr:{"id":id||"__tooltip__"},
				style:__copy({
					top:(rect.bottom+10)+"px",
					left:(rect.left-90)+"px",
					position:"absolute",
					zIndex:"555",
					background:"white",
					boxShadow:"0px 0px 6px #666",
					borderRadius:"6px",
					padding:"7px"
				},style),
				text:text
			});
			setTimeout(rmTooltip,1200,tooltip);
			function rmTooltip(t) {try{t&&t.parentNode&&t.parentNode&&t.parentNode.removeChild(t)}catch(e){}}
		},
		ViewDataParse:function (data) {
			return {
				entry:(function (viewentry) {
					var entry={}
					,entrydata=[]
					,_tempentrydata={}
					,ret=[]
					,temp={}
					,_tag=""
					,size=viewentry.length-1
					,length=viewentry.length
					,i=0;

					for (;length--;) {
						i=size-length;
						entry=viewentry[i];
						temp={unid:entry["@unid"],position:entry["@position"],response:!!entry["@response"]};
						entrydata=entry["entrydata"];
						for (var j=0;j<entrydata.length;j++){
							_tempentrydata=entrydata[j];
							_tag=_tempentrydata["@name"]||("$" + _tempentrydata["@columnnumber"]);
							if (_tempentrydata["text"]) {
								temp[_tag]=_tempentrydata.text[0];
							} else if (_tempentrydata["textlist"]) {
								temp[_tag]=_tempentrydata.textlist.text;
							} else if (_tempentrydata["numberlist"]) {
								temp[_tag]=_tempentrydata.numberlist.number;
							} else if (_tempentrydata["datetime"]) {
								temp[_tag]=_tempentrydata.datetime[0];
							} else if (_tempentrydata["datetimelist"]) {
								temp[_tag]=_tempentrydata.datetimelist.datetime;
							}
						}
						ret[i]=temp;
					}
					return ret;
				}(data["viewentry"]||[]))
			}
		}
	};
	realm.util||(realm.util=_util);
} (this));
