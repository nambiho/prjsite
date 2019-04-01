;(function (OBJECT, _frame, _script) {
	/*******************************************************************
	 *
	 * OBJECT => PROJECTNAV_OBJ, PROJECT_OBJ
	 *
	 *
	 *******************************************************************/
	PUBLIC_JS.AddListener(_frame, "load", function () {window.jQuery||_script("/"+JS_DIR+"/comn/jquery.min.js");});
	for(var obj in OBJECT){_frame[obj]||(_frame[obj]=OBJECT[obj]());}
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
	//oShowObj, sCollectionName, sDivName, sKind, sAfterFunction, sIsSingle
	function _showOrg (sCollectionName, sDivName, sKind, sIsSingle, sfunction) {
//		ORGINFO_LOADER.showOrgBasicWindow(
//			parent.parent
//			,sCollectionName
//			,sDivName
//			,sKind
//			,sfunction
//			,sIsSingle
//		);
		ORGINFO_LOADER.showOrgSimpleWindow(parent.parent, sCollectionName, sDivName, sKind, sfunction, sIsSingle);
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
	 *
	 * scope : local
	 * 여기부터 local 에서 사용 할 변수나 함수를 작성
	 *
	 *******************************************************************/
	function _formdataProcessing (sAction) {
		var _fm = window.fm||document.forms[0];
		switch (fm.name) {
		case "_projectdoc":
			if (sAction == "review") {
				if (_fm.Reviewer.value == "") {
					PUBLIC_JS.Alert(msg_reviewer_enter);
					return;
				}
			}
			// 프로젝트 제목
			if(_fm.Subject.value == "") {
				_fm.Subject.focus();
				PUBLIC_JS.Alert(msg_subject_enter);
				return false;
			}
			ORGSELECT_OBJ.BasicSave("ReviewerInfo", "Reviewer", REVIEWER_COLLECTION);
			ORGSELECT_OBJ.EmpNoSave("ReviewerInfo", "ReviewerEmpno", REVIEWER_COLLECTION);
			ORGSELECT_OBJ.BasicSave("ManagerInfo", "Manager", MANAGER_COLLECTION);
			ORGSELECT_OBJ.EmpNoSave("ManagerInfo", "ManagerEmpno", MANAGER_COLLECTION);
			ORGSELECT_OBJ.BasicSave("MemberInfo", "Member", MEMBER_COLLECTION);
			ORGSELECT_OBJ.EmpNoSave("MemberInfo", "MemberEmpno", MEMBER_COLLECTION);
		case "_orderdoc":
			// 프로젝트 제목
			if(_fm.Subject.value == "") {
				_fm.Subject.focus();
				PUBLIC_JS.Alert(msg_subject_enter);
				return false;
			}
			ORGSELECT_OBJ.BasicSave("ManagerInfo", "Manager", MANAGER_COLLECTION);
			ORGSELECT_OBJ.EmpNoSave("ManagerInfo", "ManagerEmpno", MANAGER_COLLECTION);
			break;
		}
		return true;
	}//End of _formValidation

	var __pattern={
		homeList : "<tr>"+
			"<td>{{@num}}</td>"+
			"<td>{{@manager}}</td>"+
			"<td>{{@dept}}</td>"+
			"<td class=\"title_pr_td\">"+
			"<span data-unid=\"{{@unid}}\" class=\"{{@classname}} link_st\">{{@Subject}}</span>"+
			"</td>"+
			"<td>{{@projectstatus}}</td>"+
			"<td>{{@StartDate}} ~ {{@EndDate}}</td>"+
			"<td>{{@Budget}}</td>"+
			"<td>{{@CompleteRate}}%</td>"+
			"</tr>"
	};

	var _ProjectStatus={
		"ing" : "진행중"
		,"complete" : "완료"
	};
	/*******************************************************************
	 *
	 * Draw Project List
	 * scope : local
	 *
	 *******************************************************************/
	function _drawProjectList (_opt) {
		this.options = _opt;
		_getViewEntries(this.options, [
			{func : this.renderData||_renderData, argv : this}
			,{func : this.draw||_draw, argv : this}
			,{func : this.setEvent||_setEvent, argv : this}
		]);
	}
	function _refreshProjectList () {
		this.options.$elem.html("");
		this.jsondata={};
		_getViewEntries(this.options, [
			{func : this.renderData||_renderData, argv : this}
			,{func : this.draw||_draw, argv : this}
			,{func : this.setEvent||_setEvent, argv : this}
		]);
	}
	function _renderData (_this, data) {
		var pList = _this.viewdata = _viewdataParse(data)
		,_record_pattern=_this.record_pattern
		,_json={}, _html="", _managerinfo;

		for (var i=0;i<pList.entry.length;i++){
			_json=JSON.parse(pList.entry[i].Col_Data_Json);
			_managerinfo = _json.ManagerInfo.split(SUB_SEP);

			_json=$.extend(_json, {
				unid:pList.entry[i].unid
				,manager : PUBLIC_JS.GetCN(_json.Manager)
				,classname:_this.classname
				,projectstatus : _ProjectStatus[_json.ProjectStatus]
				,num : pList.entry.length-i
				,dept : _managerinfo[4]
			});
			_json.html=_RX.call(_json, _record_pattern);
			_this.jsondata[pList.entry[i].unid] = _json;
		}
	}

	function _draw (_this) {
		var _html="", _jsondata=_this.jsondata;
		for (var _data in _jsondata) {
			_html += _jsondata[_data].html;
		}
		_this.options.$elem.append(_html);
	}

	function _setEvent (_this) {}

	function _project_node_open (_this/*_home object or _orderForm object*/) {
		var _data_unid = this.getAttribute("data-unid")
		,_json = _this.jsondata[_data_unid];

		(window.TOPMENU_LOADER||parent.TOPMENU_LOADER||parent.parent.TOPMENU_LOADER)
		.selectedTMAppCode = "project_node";
		parent.location.href=(new CURL("/"+_json.ProjectFullname + "/mainbody?openform", {
			loadkey : _json.ProjectCode
			,loadlabel : "HOME"
			,loadurl : "home?openform&projectcode=" + _json.ProjectCode
			,projectcode : _json.ProjectCode
		})).url;
	}


	//"<li data-unid=\"{{@unid}}\" class=\"{{@classname}}\">프로젝트명 : {{@Subject}}</li>"
	var _home = {
		options : {}
		,jsondata : {}
		,viewdata : []
		,classname : "MY_PROJECT"
		,record_pattern : __pattern.homeList
		,setEvent : function () {
			var list = getElementClassName(_home.classname);
			list.forEach(function (_item, _idx, _arr) {
				PUBLIC_JS.AddListener(_item, "click", function () {
					_project_node_open.call(this, _home);
				});
			});
		}
	};

	var _orderForm = {
		options : {}
		,jsondata : {}
		,viewdata : []
		,classname : "ORDER_PROJECT"
		,record_pattern : "<li data-unid=\"{{@unid}}\" class=\"{{@classname}}\" style=\"cursor:pointer\">{{@Subject}}"
			+" (담당자 : {{@manager}})"
			+"</li>"
		,setEvent : function (){
			var list = getElementClassName(_orderForm.classname); //queryall("."+_orderForm.classname);
			list.forEach(function (_item, _idx, _arr) {
				PUBLIC_JS.AddListener(_item, "click", function () {
					_project_node_open.call(this, _orderForm);
				});
			});
		}
	};


	/*******************************************************************
	 *
	 * Project Form Object
	 * scope : local
	 *
	 *******************************************************************/
	var _projectForm = {
		options : {}
		,init : function (_opt) {
			_projectForm.options=_opt||{};
			if (IS_EDIT=="1") {
				//예산 필드 이벤트 처리
				_moneyFieldEvt("MONEY");
			}

			return _projectForm;
		}
	};


	/*******************************************************************
	 *
	 * $OBJ
	 * Will Return
	 * Object Group
	 * 		PROJECTNAV_OBJ : navigation menu
	 * 		PROJECT_OBJ : manager database main object
	 *
	 *******************************************************************/
	var $OBJ = {
		PROJECTNAV_OBJ : function () {
			return {};
		}//End of PROJECTNAV_OBJ

		,PROJECT_OBJ : function () {
			return {
				insertManager : function () {
					var _fm = window.fm||document.forms[0];
					var dispInfo = MANAGER_COLLECTION[0].Org.UserName
					+ " / "+MANAGER_COLLECTION[0].Org.Post
					+ " ( "+MANAGER_COLLECTION[0].Org.DeptName+" )";
					getElementId("DIS_MANAGER").innerHTML = dispInfo;
					_fm.Manager.value=MANAGER_COLLECTION[0].Org.NotesId;
				}
				,insertReviewer : function () {
					var _fm = window.fm||document.forms[0];
					var dispInfo = REVIEWER_COLLECTION[0].Org.UserName
					+ " / "+REVIEWER_COLLECTION[0].Org.Post
					+ " ( "+REVIEWER_COLLECTION[0].Org.DeptName+" )";
					getElementId("DIS_REVIEWER").innerHTML = dispInfo;
					_fm.Reviewer.value=REVIEWER_COLLECTION[0].Org.NotesId;
				}
				,showOrg : function (sCollectionName, sDivName, sKind, sIsSingle, sfunction) {
					_showOrg(sCollectionName, sDivName, sKind, sIsSingle, sfunction);
				}
				,CloseDocument : function(){
					DOC_OBJ.Close();
				}
				,SaveDocument : function (sAction) {
					if (!_formdataProcessing(sAction)) {
						return;
					}
					DOC_OBJ.Save(sAction);
				}
				,EditDocument : function () {
					var _path = location.pathname
					,_search = location.search.replace(/\?opendocument\&/i, "?EditDocument&");
					location.href = _path+_search;
				}
				,projectHome : function (_opt) {
					_drawProjectList.call(_home, _opt);
				}
				,afterProjectSave : function (openroom) {
					_refreshProjectList.call(_home);
				}
				,refreshProjectList : function () {
					_refreshProjectList.call(_home);
				}
				,ProjectList4Order : function (_opt) {
					_drawProjectList.call(_orderForm, _opt);
					//_orderForm.getProjectList(_opt);
				}
				,CreateDocumentOpen : function (orderid) {
					//지시문서에서 프로젝트 생성 버튼. 프로젝스 작성 문서 오픈
					PROJECT_OBJ.CreateDocument(msg_create_project, "projectdoc", MNG_DB_PATH, "", (isFalse(orderid)?"":"&orderid="+orderid));
				}
				,CreateProject : function () {
					//검토요청에서 프로젝트 생성 버튼, 실제 프로젝트 생성
					var _url = (new CURL("/" + DB_PATH + "/create_project_agent?openagent", {
						unid : UNID
						,contentid : CONTENTS_ID
					})).url;
					location.href = _url;
//					_formActionProcess({
//						Action : "create_project"
//						,UNID : UNID
//					}, function (_return) {
//						console.log(_return);
//					});
				}
				,CreateDocument : function(tabtitle, formname, sDB, sTabKey, param){
					//지시문서에서 프로젝트 생성 버튼 눌렀을 때 CreateDocumentOpen 메소드에서 호출, 팝업인지 아닌지 확인해서 url 오픈
					var url = (new CURL("/" + (sDB||DB_PATH) + "/" + formname + "?openForm", param)).url;

					if (isPopup()) {
						location.href = url + "&readtype=popup";
					} else {
						(window.TAB_LOADER||parent.TAB_LOADER).createTLoader(tabtitle, url, (sTabKey||"$NEW"), "");
					}
				}
				,projectFormInit : function (_opt) {
					return _projectForm.init(_opt);
				}
				,ReturnProjectSave : function () {
					console.log(RETURN_DOC);
					RETURN_DOC.Close();
				}
			};
		}//End of PROJECT_OBJ
	};//End of $OBJ

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
