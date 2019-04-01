;(function (OBJECT, _frame, _script) {
	/*******************************************************************
	 *
	 * OBJECT => PROJECTNAV_OBJ, PROJECT_OBJ
	 *
	 *
	 *******************************************************************/

	PUBLIC_JS.AddListener(_frame, "load", function () {window.jQuery||_script("/"+JS_DIR+"/comn/jquery.min.js");});
	for(var obj in OBJECT){
		_frame[obj]||(_frame[obj]=OBJECT[obj]());
	}
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
	/*******************************************************************
	 * TODO PorjectScheduler Class
	 *******************************************************************/
	var _PorjectScheduler = {
		init : function (_config,_date) {
			//this.locale();
			this._setConfig(_config);
			scheduler.init('scheduler_here', _date||new Date, "month");
			return this;
		}
		,_setConfig : function (_config) {
			//scheduler.skin = "custom"; //classic, glossy, flat
			//scheduler.config.xml_date="%Y-%m-%d %H:%i";
			if (_config) {
				for (var x in _config) {
					scheduler.config[x] = _config[x];
				}
			}
			scheduler.config.xml_date="%Y-%m-%d";
		}
		,setConfig : function (_config) {
			this._setConfig(_config);
			return this;
		}
		,setEvent : function (_event) {
			for(var x in _event){
				scheduler.attachEvent[x] = _event[x];
			}
			return this;
		}
		,setTemplate : function (_templates) {
			for(var x in _templates){
				scheduler.templates[x] = _templates[x];
			}
			return this;
		}
		,parse : function (_data) {
			scheduler.parse(_data ,"json");
			return  this;
		}
		,clearAll : function () {
			scheduler.clearAll();
			return this;
		}

//		,locale : function () {
//			scheduler.locale={
//				date:{
//					month_full:["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
//					month_short:["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
//					day_full:["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"],
//					day_short:["일", "월", "화", "수", "목", "금", "토"]
//				},
//				labels:{
//					dhx_cal_today_button:"오늘",
//					day_tab:"일별",
//					week_tab:"주별",
//					month_tab:"월별",
//					new_event:"새 일정",
//					icon_save:"저장",
//					icon_cancel:"취소",
//					icon_details:"자세히",
//					icon_edit:"편집",
//					icon_delete:"삭제",
//					confirm_closing:"취소하시겠습니다. \"확인\"을 클릭하면 저장되지 않습니다.",//Your changes will be lost, are your sure ?
//					confirm_deleting:"일정을 삭제하시겠습니까?",
//					section_description:"설명",
//					section_time:"기간설정",
//					full_day:"전체일",
//
//					/*recurring events*/
//					confirm_recurring:"반복 일정 전체를 모두 변경하시겠습니까?",
//					section_recurring:"반복 일정",
//					button_recurring:"중지",
//					button_recurring_open:"사용",
//					button_edit_series: "Edit series",
//					button_edit_occurrence: "종류편집",
//
//					/*agenda view extension*/
//					agenda_tab:"Agenda",
//					date:"일자",
//					description:"설명",
//
//					/*year view extension*/
//					year_tab:"1년",
//
//					/* week agenda extension */
//					week_agenda_tab: "Agenda",
//
//					/*grid view extension*/
//					grid_tab: "Grid",
//
//					/* touch tooltip*/
//					drag_to_create:"Drag to create",
//					drag_to_move:"Drag to move",
//
//					/* dhtmlx message default buttons */
//					message_ok:"OK",
//					message_cancel:"Cancel",
//
//					/* wai aria labels for non-text controls */
//					next: "Next",
//					prev: "Previous",
//					year: "Year",
//					month: "Month",
//					day: "Day",
//					hour:"Hour",
//					minute: "Minute"
//				}
//			};
//		}



	};

	//dhtmlxscheduler.js 에 있는 dhtmlx 이용
	//jQuery의 extend 와 같은 효과 이고, singleton 함수 임
	var _scheduler = dhtmlx(_PorjectScheduler);
	/*******************************************************************
	 *
	 * $OBJ
	 * Will Return
	 * Object Group
	 * 		PROJECT_SCH :
	 *
	 *******************************************************************/
	var $OBJ = {
		PROJECT_SCH :function ()  {
			return {
				init : function (_config,_date) {
					//debugger;
					return _scheduler.init(_config,_date);
				}
				,parse : function (_data) {
					return _scheduler.parse(_data);
				}
				,clearAll : function () {
					return _scheduler.clearAll();
				}
				,setEvent : function (_event) {
					return _scheduler.setEvent(_event);
				}
				,setTemplate : function (_templates) {
					return _scheduler.setTemplate(_templates);
				}
				,getsch : function () {
					return scheduler;
				}
			};
		}
	};

	/*******************************************************************
	 *
	 * $OBJ return
	 *
	 *
	 *******************************************************************/
	return $OBJ;
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
