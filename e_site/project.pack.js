(function (OBJECT, _frame, _script) {
	/*******************************************************************
	 *
	 * OBJECT => PROJECTNAV_OBJ, PROJECT_OBJ
	 *
	 *
	 *******************************************************************/
	PUBLIC_JS.AddListener(_frame, "load", function () {window.jQuery||_script("/"+JS_DIR+"/comn/jquery.min.js");});
	_frame.PROJECT_PACK = OBJECT;
}(
//Start of OBJECT parameter
( function () {
	"use strict";

	/*******************************************************************
	 *
	 * global Function, Variable
	 * 프로젝트 관리에서 사용 되는 함수 변수
	 * project_main.js 와 project_node.js 를 동일 하게 유지
	 *
	 *******************************************************************/
	var
	_runtask=function(_t) {
		var _this,__queue;return _this=this,__queue=_t||[],{
		add:function (_) {if (!isArray(_)) return;var _e=_.every(function (_1,_2) {return ("func" in _1);});_e&&(__queue=__queue.concat(_));}
		,run:function(){__queue.forEach(function (_) {var __s=_.async,__f=_.func,__o=_.object||null,__a=(isArray(_.argv)?_.argv:[_.argv]);
		isFunction(__f)&&(__s?setTimeout(function(){__f.apply(__o||_this, __a)},0):__f.apply(__o||_this, __a));});}};
	}
	,query=function (s){var _ret=((this&&this.querySelector)?this:document).querySelector(s);return _ret;}
	,queryall=function (s){var m=((this&&this.querySelectorAll)?this:document).querySelectorAll(s);return m.forEach?m:Array.prototype.slice.call(m);}
	,getElementClassName=function (s){return Array.prototype.slice.call(((this&&this.getElementsByClassName)?this:document).getElementsByClassName(s));}
	,getElementName=function (s){return Array.prototype.slice.call(((this&&this.getElementsByName)?this:document).getElementsByName(s));}
	,getElementTagName=function (s){return Array.prototype.slice.call(((this&&this.getElementsByTagName)?this:document).getElementsByTagName(s));}
	,getElementId=function (s){return ((this&&this.getElementById)?this:document).getElementById(s);}
	,_typename=function (o){return Object.prototype.toString.call(o);}
	,isUndefined=function (x){return (typeof x==="undefined")}
	,isFunction=function (x){return (Object.prototype.toString.call(x)==="[object Function]");}
	,isObject=function (x){return (Object.prototype.toString.call(x)==="[object Object]");}
	,isNull=function (x){return (Object.prototype.toString.call(x)==="[object Null]");}
	,isFalse=function (x){return (isNull(x)||isUndefined(x)||(x==="")||(x===0)||!x);}
	,isArray=function (x){return (Object.prototype.toString.call(x)==="[object Array]");}
	,isFunction=function (x){return (Object.prototype.toString.call(x)==="[object Function]");}
	,isPopup=function (){return (DOC_READ_TYPE=="popup");}
	,JSON=window.JSON||{parse:function (_){return eval(_);}}
	;

	function _R(d,c){if(Object.prototype.toString.call(d)==="[object Object]"){c=d;d=this
	}for(var e in c){d=d.replace(new RegExp("{{@"+e+"}}","g"),c[e])}return d.replace(/\{\{@[a-zA-Z0-9_@\. \*\^\$\#-]*\}\}/g,"")
	};
	function _RX(c){var d=this,a=/\{\{@([a-zA-Z0-9_@\. \*\^\$\#-]*)\}\}/g,b=c.replace(a,function(e,f){return isNull(d[f])||isUndefined(d[f])?"":d[f]});return b};

	function _AfterJQuery (_process, _argv) {
		var _interval;
		function _clearInterval() {clearInterval(_interval);}
		function _check$ () {return !isFalse(window.jQuery);}
		function _on () {
			if (_check$()) {
				_process&&_process.apply(null, isArray(_argv)?_argv:[_argv]);
				//ajax가 완료 되지 않더라도 interval은 종료
				_clearInterval();
			}
		}
		_interval = setInterval(_on);
	}

	function _getOtherLang () {
		var langcode = ["KR","US","JP","CN"];
		return (langcode.indexOf(NATIVE_LANGUAGE)!=-1)&&langcode.splice(langcode.indexOf(NATIVE_LANGUAGE), 1), langcode;
	}

	function CURL (_url, _option) {
		this.option = _option;
		this.param = "";
		if (!isFalse(this.option)) {
			for(var x in this.option) {
				if (!isFalse(this.option[x]) && !isObject(this.option[x])) {
					this.param += ( "&" + x + "=" + PUBLIC_JS.URLEncode(this.option[x]) );
				}
			}
		}
		this.url = _url + this.param + (window["PROJECTCODE"]?("&projectcode=" + PROJECTCODE):"");
	}

	function _showOrg (sCollectionName, sDivName, sKind, sIsSingle, sfunction) {
		ORGINFO_LOADER.showOrgBasicWindow(
			parent.parent
			,sCollectionName
			,sDivName
			,sKind
			,sfunction
			,sIsSingle
		);
	}//End of _showOrg

	function _viewdataParse (data) {
		return {
			//count : parseInt((data["@toplevelentries"]||"0"))
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
	}//End of _viewdataParse

	function _moneyFieldEvt (_selector) {
		var money_field = getElementClassName(_selector);
		money_field.forEach(function (_item, _idx) {
			var _back="";
			PUBLIC_JS.AddListener(_item, "focus", function () {
				_back = this.value;
				this.value = this.value.replace(/,/g, "");
			});
			PUBLIC_JS.AddListener(_item, "blur", function () {
				if (isFalse(this.value)) return;
				if (/\D/g.test(this.value)) {this.value=_back; return;}
				this.value = this.value.replace(/\B(?=((\d){3})+(\b))/g, ",");
			});
		});
	}//End of _moneyEvt

	function _selectBoxEvent (_box, _label, _call) {
		// 디자인에 사용된 jquery 대용 이벤트 처리
		if (_box && _label) {
			PUBLIC_JS.AddListener(_box, "change", function () {
				_label.innerText = this.options[this.selectedIndex].text;
				_call.change&&isFunction(_call.change)&&_call.change();
			});
			if(isFalse(_call)) return;
			_trigger(_box, "change", {
				before : _call.before
				,end : _call.end
			});
		}
	}

	function _processqueue (_, _param) {
		var _c=Array.prototype.slice.call(_);
		_param=(isArray(_param)?_param:[_param]);
		for (var i=0;i<_c.length;i++) {
			if (!isFalse(_c[i].argv)) {
				_c[i].argv = (isArray(_c[i].argv)?_c[i].argv:[_c[i].argv]).concat(_param);
			} else _c[i].argv=_param;
		}
		_runtask.call(this, _c).run();;
	}//End of _processqueue

	function _getViewEntries (_opt, _c, _fail) {
		if (isFalse(_opt)||isFalse(_opt.dbPath)||isFalse(_opt.viewname)) return;
		var _this = this
		,_url = "", _param = _opt;
		_param.outputformat = "json";
		_param.count = _opt.count||"-1";

		 _url = new CURL("/" + _opt.dbPath  + "/" + _opt.viewname + "?readviewentries", _param);
		$.ajax(_url.url, {dataType : "json"})
		.done (function (data, status, xhr) {
			if (isFalse(data)) return;
			_c&&_processqueue.call (_this, _c, [data, status, xhr]);
		})
		.fail (function () {
			var _arguments = Array.prototype.slice.call(arguments);
			_fail&&isFunction(_fail)&&_fail.apply(null, _arguments);
		});
	}//End of _getViewEntries

	function _formActionProcess (_data, _call) {
		var sUrl = "/"+DB_PATH+"/form_action?openform";
		var sPostContent = "";
		for (var x in _data) {
			sPostContent+=PUBLIC_JS.XMLPostString(x, _data[x]);
		}
		var oResult = new PUBLIC_JS.PostReturnMsg(PUBLIC_JS.XMLPost(sUrl, sPostContent));
		_call&&_call(oResult);
	}

	function _trigger (_obj, _eventtype, _call) {
		if(!isFalse(_call) && !isFalse(_call.before) && isFunction(_call.before)) _call.before.call(_obj, _eventtype);
		function _browserEvent () {
			if(typeof(Event) === 'function') {
				var event = new Event(_eventtype,{
					bubbles : true
					,cancelBubble : true
					,cancelable : true
				});
		    }else{
		    	var event = document.createEvent('Event');
		    	event.initEvent(_eventtype, true, true);
		    }
			return event;
		}
		_obj.dispatchEvent(_browserEvent());
		var _ret
		if(!isFalse(_call) && !isFalse(_call.end) && isFunction(_call.end)) var _ret = _call.end.call(_obj, _eventtype);
		if (!isFalse(_ret)) return _ret;
	}
	function extend (target, source) {
		for (var x in source) {
			if (x.substr(0, 1) != "_") {
				target[x] = source[x];
			}
		}
		return target;
	}
	/*******************************************************************
	 *
	 * $OBJ
	 * 		PROJECT_NODE_NAV : nav menu object
	 * 		PROJECT_NODE : node object
	 *
	 *******************************************************************/
	var
	_PROJECT_PACK = window.PROJECT_PACK||{}
	,_views = {
		myproject : "json_mylist_by_id"
		,item : "json_item_flat"
	}
	,_pattern = {
		myproject : "<li><span data-key=\"{{@key}}\" data-dbpath=\"{{@dbpath}}\" class=\"project_title\">{{@subject}}</span></li>"
		,item : "<li>"+
			"<input "+
				"data-categorycode=\"{{@categorycode}}\" "+
				"data-unid=\"{{@unid}}\" type=\"radio\" name=\"choice\" id=\"radio{{@index}}\" class=\"line_radio\">"+
			"<label for=\"radio{{@index}}\">{{@subject}}</label>"+
			"</li>" //line_radio
		,ul : "<ul style=\"display:block\">{{@items}}</ul>"
	}

	;

	function PROJECT_PACK (_opt) { return _pack._init(_opt); }
	var _itemList={};
	var _pack = {
		options : {}
		,_init : function (_opt) {
			this.options = _opt||{};
			return extend(PROJECT_PACK, this);
		}
		,_project : {}
		,_callback : null
		,_getMainDbPath : function () {
			if (window.PROJECT_MAIN_DBPATH) return window.PROJECT_MAIN_DBPATH;
			return ROOT_PATH + "/project/project_main.nsf";
		}
		,Callback : function () {
			if (isFalse(_pack._callback)) return;
			if (!isFunction(_pack._callback)) return;
			_pack._callback.apply (null, Array.prototype.slice.call(arguments));
			_pack._callback = null;
		}
		,openSelectProject : function (_callback, _param) {
			_pack._callback = _callback;
			if (isFalse(this.options.dbPath))
				this.options.dbPath = _pack._getMainDbPath();
			var _url = new CURL("/" + this.options.dbPath + "/selectProjectItem?readForm", _param);
			PUBLIC_JS.ModalSubwin(_url.url, "Project", "500", "363", window, true);
			return this;
		}
		,initItemSelectForm : function () {
			var _confirm_btn = getElementId("confirm_select");
			_confirm_btn && PUBLIC_JS.AddListener(_confirm_btn, "click", function (){
				var _radio = query("input[type=\"radio\"]:checked");
				if (isFalse(_radio)) {
					alert(msg_item_enter);
					return;
				}
				var _return = _itemList[_radio.getAttribute("data-unid")];
				parent.PROJECT_PACK().Callback(_return);
				parent.MSG_OBJ.Close();
			}, false);
			return this;
		}
		,getMyProjectList : function (_empno, _selector) {
			if (isFalse(_empno)) return;
			if (isFalse(this.options.dbPath))
				this.options.dbPath = _pack._getMainDbPath();
			var _this = this
			,_draw = function (_viewmig) {
				var _html = "", _coldata
				,_project_list = getElementId(_selector||"project_list")
				;
				for ( var i = 0 ; i < _viewmig.entry.length; i++) {
					_coldata = JSON.parse(_viewmig.entry[i].Col_Data_Json);
					_pack._project[_coldata.ProjectCode] = _coldata;
					_html += _RX.call({
						key : _coldata.ProjectCode
						,dbpath : _coldata.ProjectFullname
						,subject : _coldata.Subject
					}, _pattern.myproject);
				}
				_project_list.insertAdjacentHTML("beforeend", _html);

				getElementClassName.call(_project_list, "project_title").forEach(function (_titlespan) {
					PUBLIC_JS.AddListener(_titlespan, "click", function () {
						var _ul = getElementTagName.call(this.parentNode, "ul")[0]
						,_loading = this.parentNode.getAttribute("data-loading");
						_this.getItems4Project(this.getAttribute("data-dbpath"), this.getAttribute("data-key"), this.parentNode);
					}, false);
				});
			};
			_getViewEntries({
				dbPath : this.options.dbPath
				,viewname : _views.myproject
				,restricttocategory : _empno
			}, [
			    {func : _pack._viewdataParse, argv : [_draw]}
			]);
			return this;
		}
		,getItems4Project : function (_dbPath, _key, _selector) {
			if (isFalse(_dbPath) || isFalse(_selector) || isFalse(_key)) return;
			var _projectJson = _pack._project[_key];
			if (isFalse(_projectJson)) return;
			if (_typename(_selector) == "[object String]") {
				_selector = getElementId(_selector);
				if (isFalse(_selector)) return;
			}
			var _this = this
			,_closure = {}
			,_draw = function (_viewmig) {
				var _item_ul = getElementId("item_list")
				,_html = "", _coldata;
				for ( var i = 0 ; i < _viewmig.entry.length; i++) {
					_coldata = JSON.parse(_viewmig.entry[i].Col_Data);
					_closure[_coldata.Unid] = extend(_coldata, {
						project : _projectJson
					});
					if (_this.options.selected_code && (_coldata.UniqueKey == _this.options.selected_code)) {
						console.log("eq");
					}
					_html += _RX.call({
						categorycode : _coldata.CategoryCode
						,unid : _coldata.Unid
						,subject : _coldata.Subject
						,index : i
					}, _pattern.item);
				}
				_item_ul.innerHTML = _html;
				_itemList = _closure;
			};
			_getViewEntries({
				dbPath : _dbPath
				,viewname : _views.item
			}, [
			    {func : _pack._viewdataParse, argv : [_draw]}
			]);
			return this;
		}
		,_viewdataParse : function (_drawFunc, _data,_status,_xhr) {
			if (_status != "success") return;
			isFunction(_drawFunc) && _drawFunc (_viewdataParse(_data), _status, _xhr);
		}
		,constructor : PROJECT_PACK
	}

	extend(PROJECT_PACK.prototype, _pack);
	var _project_pack = new PROJECT_PACK;
	/*******************************************************************
	 *
	 * $OBJ return
	 *
	 *******************************************************************/
	return PROJECT_PACK;
}())//End of OBJECT IIFE

	/*******************************************************************
	 *
	 * window parameter
	 *
	 *
	 *******************************************************************/
,window


	/*******************************************************************
	 *
	 * _script parameter
	 * just and simple js loader
	 *
	 *******************************************************************/
,function _script(){function b(d){return d}function a(e){var d=(document.head||document.getElementsByName("head"));
(d.append||d.appendChild).call(d,(function(){var f=document.createElement("script");
f.onload=f.onreadystatechange=function(){};f.src=b(e);return f})())}for(var c=0;c<arguments.length;
c++){a(arguments[c])}}

));
