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
	
	function _getDate(_source) {
		var _reg = null, _date;
		return _reg = /(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2}),\d{2}([+-]\d*)/g, _reg.lastIndex = 0, _date = /\d{8}T\d{6},\d{2}[+-]\d*/.test(_source) ? (function (_r) {return new Date(_r[1], _r[2], _r[3], _r[4], _r[5], _r[6]); })(_reg.exec(_source)) : new Date(_source), _date.getFullYear() + "-" + _date.getMonth() + "-" + _date.getDate() + " " + _date.getHour() + ":" + _date.getMinute();
	}
	
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
//		ORGINFO_LOADER.showOrgBasicWindow(
//			parent.parent
//			,sCollectionName
//			,sDivName
//			,sKind
//			,sfunction
//			,sIsSingle
//		);
		ORGINFO_LOADER.showOrgSimpleWindow(
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
	 * 양식 필드 처리, 변수
	 *******************************************************************/
	var _detailformX = "950"
	,_detailformY = "533";
	
	function _formdataProcessing (sAction) {
		var _fm = window.fm||document.forms[0];
		
		switch (fm.name) {
		case "_itemdoc":
			//완료율 숫자 체크, 100넘는지 체크, 100프로 일 때 완료 할 것 인지?
			if(DOC_STATUS == STATUS_REGISTER) {
				if(_fm.ItemRate) {
					if (/\D/.exec(_fm.ItemRate.value)) {
						_fm.ItemRate.focus();
						PUBLIC_JS.Alert(msg_rate_enter);
						return false;
					}
					if (parseInt(_fm.ItemRate.value) > 100) {
						_fm.ItemRate.focus();
						PUBLIC_JS.Alert(msg_rate_over, "Modified");
						return false;
					}
					if (_fm.ItemRate.value == "100" && _fm.ItemStatus.value == "ing") {
						if(confirm(msg_rate_confirm_100)) { //"완료율이 100% 입니다.\n상태를 완료로 변경 하시겠습니까?"
							_fm.ItemStatus.value = "complete";
						}
					}
				}
			}
			
			//설명 필드
			var _descriptText = getElementName("DescriptionText")[0]
			,_descript = getElementName("Description")[0]
			,_indexof=["\n","\t"," "]
			,_ret = ["<br>","&nbsp;&nbsp;&nbsp;&nbsp;", "&nbsp;"];
			_descriptText.value=_descript.value.replace(/[\s]/g, function (arr) {
				return _ret[_indexof.indexOf(arr[0])]||arr[0];
			});
			//멤버
			ORGSELECT_OBJ.BasicSave("MemberInfo", "Member", MEMBER_COLLECTION);
			ORGSELECT_OBJ.EmpNoSave("MemberInfo", "MemberEmpno", MEMBER_COLLECTION);
			break;
		}
		return true;
	}
	/*******************************************************************
	 * TODO go to the __pattern
	 *******************************************************************/
	var __pattern = {
		category : "<div class=\"category_area open_cat\" data-key=\"{{@key}}\" data-position=\"{{@position}}\" id=\"{{@key}}_category\">"+
			"<h5 class=\"category_title\">{{@title}}</h5>"+
			"<div class=\"category_bt\" data-key=\"{{@key}}\" data-title=\"{{@attrtitle}}\" data-unid=\"{{@unid}}\" data-position=\"{{@position}}\">"+
			"<span class=\"popupview_btn popup_btn\"></span>"+
			"<span class=\"modify_btn popup_btn\"></span>"+
			"</div></div>"+
			"<div class=\"row-table\" id=\"{{@key}}_items\">"+
			"</div>"
			
		,tr_column : "<div class=\"td-column\">"+
			"<div class=\"column-4\"></div><div class=\"column-gap\"></div>"+
			"<div class=\"column-4\"></div><div class=\"column-gap\"></div>"+
			"<div class=\"column-4\"></div><div class=\"column-gap\"></div>"+
			"<div class=\"column-4\"></div>"+
			"</div>"
			
		,tr_row : "<div class=\"tr-row\">{{@items}}</div><div class=\"clearfix\"></div>"
			
		,item : "<div  id=\"item_{{@unid}}\" data-unid=\"{{@unid}}\" class=\"col-4\">" +
			"<div style=\"position:absolute; top:0; height:5px; width:{{@rate}}; background:green; opacity:0.3; pointer-events:none\"></div>"+
			"<h6 class=\"title_name\"><span class=\"link_st\" data-unid=\"{{@unid}}\" style=\"z-index:99\">{{@subject}}</span></h6>" +
			"<ul class=\"list_data\">"+
			"<li><b>{{@lbl_status}}</b>{{@status}} ({{@rate}})</li>" +
			"<li><b>{{@lbl_period}}</b>{{@startdate}} ~ {{@enddate}}</li>" +
			"<li><b>{{@lbl_manager}}</b>{{@member}}</li></ul></div>"
			
		,cal_Checkbox : "<li><input type=\"checkbox\" data-key=\"{{@key}}\" id=\"check_box{{@index}}\" class=\"line_check\">"+
			"<label for=\"check_box{{@index}}\">{{@name}}</label>"+
			"<span class=\"plan_color\" style=\"background:{{@color}}\"></span>"+
			"</li>"
				
		,checklist : "<li>"+
			"<input type=\"checkbox\" data-text=\"{{@text}}\" id=\"{{@id}}\" class=\"line_check\" {{@checked}}>"+
			"<label for=\"{{@id}}\">{{@text}}</label>"+
			"<span class=\"btnarea\"><a href=\"#\" class=\"delete_icon_bt\" title=\"Delete\"></a></span>"+
			"</li>"
		
		,file_box : "<div class=\"list_box file_area\" data-query=\"file_{{@unid}}\">{{@filehtml}}</div>"
		
		,file_depth : "<div class=\"depth_area\" data-query=\"file_{{@unid}}\">{{@filehtml}}</div>"
		
		,file : "<p class=\"record_data\">"+
			"<span class=\"name_data\">{{@writername}} {{@post}} [{{@dept}}]</span>"+
			"<span class=\"time_data\">{{@created}}</span></p>"+
			"<p class=\"main_data\"><span class=\"update_data\">{{@filename}} [{{@filesizemb}}]</span>"+
			"<span class=\"btnarea\" "+
			"data-query=\"file_{{@unid}}\" "+
			"data-punid=\"{{@punid}}\" "+
			"data-rootunid=\"{{@rootunid}}\" "+
			"data-filename=\"{{@filename}}\" "+
			"data-filesize=\"{{@filesize}}\" "+
			"data-type=\"{{@contenttype}}\" "+
			"data-unid=\"{{@unid}}\">"+
			"<a href=\"#\" onclick=\"PROJECT_NODE.fileDownload(this)\" title=\"File Download\" class=\"down_icon_bt\"></a>"+
			"{{@buttons}}"+
			"</span>"+
			"</p>"
		
		,file_button_add : "<a href=\"#\" onclick=\"PROJECT_NODE.fileAppend(this)\" title=\"File Add\" class=\"plus_icon_bt\"></a>"
		
		,file_button_delete : "<a href=\"#\" onclick=\"PROJECT_NODE.fileDelete(this)\" title=\"File Delete\" class=\"delete_icon_bt\"></a>"
		
		,comment : "<div class=\"list_box comment_area\" data-unid=\"{{@unid}}\" data-query=\"comment_{{@unid}}\">"+
			"<p class=\"record_data\">"+
			"<span class=\"name_data\">{{@writername}} {{@post}} [{{@dept}}]</span>"+
			"<span class=\"time_data\">{{@created}}</span>"+
			"<span class=\"btnarea\">{{@buttons}}</span></p>"+
			"</p>"+
			"<p class=\"main_data\">"+
			"<span class=\"update_data\">{{@description}}</span>"+
			//"<span class=\"btnarea\">{{@buttons}}</span></p>"+
			"</div>"
			
		,comment_btn_delete : "<a href=\"#\" onclick=\"PROJECT_NODE.commentDelete(this)\" data-unid=\"{{@unid}}\" title=\"comment Delete\" class=\"delete_icon_bt\"></a>"
		
		,appendwrap : "<div id=\"add_frame\" class=\"table_form add_frame\">"+
			"<input type=\"text\" class=\"input_middle\" name=\"dispAppendFilePath\" id=\"dispAppendFilePath\">"+
			"<span class=\"icon_btn upload_icon\" data-method=\"fileSelect\"></span>"+
			"<span class=\"btn_st input_bt btn_small\" data-method=\"fileSave\">{{@strsave}}</span>"+
			"<span class=\"btn_st input_bt btn_small\" data-method=\"removeAddFrame\">{{@strcancel}}</span>"+
			"</div>"

		,file_item : "<div class=\"category_area\" style=\"margin-bottom:5px; background:#55b5db\">{{@subject}}</div>"+
			"<div id=\"item_{{@unid}}\" class=\"list_area\">"+
			"</div>"
		
		,aprv_record : "<tr>"+
			"<td>{{@docnumber}}</td>"+
			"<td>{{@doctype}}</td>"+
			"<td class=\"title_pr_td\" data-unid=\"{{@unid}}\" data-index=\"{{@index}}\">"+
			"<span class=\"link_st\" onclick=\"location.href='#;'\">{{@subject}}</span>"+
			"</td>"+
			"<td>{{@writer}}</td>"+
			"<td>{{@created}}</td>"+
			"<td>{{@completed}}</td>"+
			"</tr>"
	};
	
	function _navClass () {}
	_navClass.prototype = {
		editProjectDocument : function () {
			var _info = _project.data.projectInfo
			,_url = "/" + _project.data.Project_Main_DbPath + "/view_project_by_user/" 
				+_info.UNID + "?"+(CURUSER_INFO.NotesId==_info.Manager?"editdocument":"opendocument")
				+"&openroom=" + _info.ProjectCode;
			TAB_LOADER.createTLoader(msg_setting,  _url, "project_edit", "");
		}
		,reloadAllTab : function (openroom) {
			var contents = getElementId.call(parent.document, "TabContents")
			,frames = getElementTagName.call(contents, "iframe")
			,_collection=[];
			
			frames.forEach(function (_frame) {
				var _content = _frame.contentDocument
				,_window = _frame.contentWindow
				,_detail = getElementClassName.call(_frame, "detail_area");
				if (!isFalse(_detail) && _window.PROJECT_NODE) {
					_collection.push({
						func : _window.PROJECT_NODE.ReloadProject
						,async : true
					});
				}
			});
			_runtask(_collection).run();
		}
	};
	var _nav = new _navClass();
	
	
	
	function _projectClass () {}
	_projectClass.prototype = {
		data : null
		,init : function (_d) {
			_d&&this.setProject(_d, [{
				func : this._drawProjectInfo
			}]);
		}
		,reload : function () {
			this.data&&this.setProject (this.data, [{
				func : this._drawProjectInfo
			}]);
		}
		,setProject : function (_d, _cc) {
			if (isFalse(_d)) return;
			this.data = _d;
			this._loadProject (_cc);
		}
		,_drawProjectInfo : function () {
			var _this = _this||_project;
			var _bodydiv = getElementId("PROJECT_BODY_DIV")
			,_manager = getElementId("Project_Manager")
			,_managerInfo = (function (_d) {
				if (isFalse(_d)) return [];
				return _d.split("|")[1].split("^");
			})(_this.data.projectInfo.ManagerInfo)
			,_subject = getElementId("Project_Subject")
			,_period = getElementId("Project_Period");
			
			_bodydiv&&(_bodydiv.innerHTML = _this.data.projectInfo.body);
			_subject&&(_subject.innerHTML = _this.data.projectInfo.Subject);
			_manager&&(_manager.innerHTML = _managerInfo[1]);
			_period&&(_period.innerHTML = _this.data.projectInfo.StartDate + " ~ " + _this.data.projectInfo.EndDate);
		}
		,_loadProject : function (_cc) {
			var _this = this;
			function _getFieldValue (_s,_n) {
				var _reg=null,_exec=null;
				return _reg=new RegExp("<\\!--FIELD:"+_n+"-->([\\W\\d\\D]+)<\\!--"+_n+"-->"),
				_exec=_reg.exec(_s), _exec&&RegExp.$1;
			}
			function _laodContents () {
				var _url = new CURL("/" + _this.data.Project_Main_DbPath + "/for_project_contents/" + _this.data.ProjectCode + "?opendocument");
				$.ajax(_url.url, {
					dataType : "html"
				}).done(function (_response, _status, _xhr) {
					if (isFalse(_response)) return;
					var _str = _response.toString()
					,_json,_htmlbody,_body, _exec;
					
					_json = _getFieldValue(_str, "JSON");
					_body = _getFieldValue(_str, "BODY");
					_htmlbody = _getFieldValue(_str, "HTMLBODY");
					
					if (isFalse(_json&&_body&&_htmlbody)) return;
					
					_this.data.projectInfo = JSON.parse(_json);
					
					_exec = /\ssrc="(?=([\d\D\W]+OpenElement)"\s)/.exec(_body);
					if (!isFalse(_exec)) {
						var _src = RegExp.$1
						,_iframeAttr = "id=\"DISPLAY_IFRAME_BODY\" "
							+"name=\"DISPLAY_IFRAME_BODY\" "
							+"WIDTH=100% "
							+"HEIGHT=100% "
							+"FRAMEBORDER=0 "
							+"SCROLLING=auto";
						if(document.domain.toLowerCase() != location.hostname.toLowerCase()){
							var crossdomainsuffix = "&crossdomainsuffix=" + PUBLIC_JS.URLEncode(document.domain);
							_src = "/" + LIB_PATH + "/DomainProxy?Readform&requestiframe="+PUBLIC_JS.URLEncode(_src)+crossdomainsuffix;
						}
						_this.data.projectInfo.body = ("<IFRAME SRC=\"" + _src + "\" " + _iframeAttr +"></IFRAME>");
					} else _this.data.projectInfo.body="";
					_cc&&_processqueue.call(_this,_cc);
				});
			}
			_AfterJQuery.call(_this, _laodContents);
		}
	};
	var _project = new _projectClass();	
	
	/*
	 * TODO file class
	 * */
	function _fileClass () {}
	_fileClass.prototype = {
		fileWrap : null
		,commentWrap : null
		,items : null
		,viewdata : {}
		,allFlag : ""
		,callbacklist : {}
		,ie : PUBLIC_JS.BrowserInfo().mozilla||PUBLIC_JS.BrowserInfo().ie
		,init : function () {
			this.fileWrap = getElementId("File_Warp");
			this.commentWrap = getElementId("Comment_wrap");
			this.loadFileList([
				{func : this.draw, argv:[UNID, null]}
			]);
		}
		,_callback : function (_fn) {
			(_fn in this.callbacklist) && isFunction(this.callbacklist[_fn]) && this.callbacklist[_fn]();
		}
		,_drawItemLine : function (_items) {
			var _html="";
			_items&&_items.entry.forEach(function (_item) {
				_html += _RX.call({
					subject : _item.Subject
					,unid : _item.unid
				}, __pattern.file_item);
			});
			this.fileWrap.innerHTML = _html;
		}
		,loadAll : function (_flag) {
			var _this = this;
			this.allFlag = _flag;
			
			if (this.allFlag == "file")
				this.fileWrap=getElementId("File_Wrap");
			else if (this.allFlag == "comment")
				this.fileWrap=getElementId("Comment_Wrap");
			
			function _loadItem() {
				_getViewEntries({
					dbPath : DB_PATH
					,viewname : "openitem"
				}, [
				    {func : function (_data) {
				    	_this.items=_viewdataParse(_data);
				    	_this.items&&_this.items.entry.forEach(function (_item) {
							_item.json = JSON.parse(_item.Col_Data);
						});
					}}
				    ,{func : function _drawItemLine () {
				    	_this._drawItemLine(_this.items);
				    }}
					,{func : function _getFileList() {
						_processqueue.call(_this, _this.items.entry.map(function (_entry, _idx) {
							return {
								func : _this.loadFileList
								,async : true
								,argv : [{func : _this.drawAll, argv:[_entry.unid, null]}, _entry.unid]
							};
						}));
					}}
				])
			};
			
			_AfterJQuery(_loadItem);
		}
		,drawAll : function (_unid, _fileunid) {
			var _itemObj = this.viewdata[_unid];
			var _viewdata = (_fileunid?{_fileunid: _itemObj[_fileunid]} : _itemObj)
			,_itemdom = getElementId("item_"+_unid), _parent;
			
			for(var x in _viewdata) {
				if(_viewdata[x].filehtml != "") {
					if (_unid == _viewdata[x].punid) {
						_itemdom.insertAdjacentHTML("beforeend", _RX.call({
							filehtml : _viewdata[x].filehtml
							,unid : _viewdata[x].unid
						}, __pattern.file_box));
					} else {
						_parent = query.call(_itemdom, "[data-query=\"file_" + _viewdata[x].punid + "\"]");
						_parent&&_parent.insertAdjacentHTML("beforeend", _RX.call({
							filehtml : _viewdata[x].filehtml
							,unid : _viewdata[x].unid
						}, __pattern.file_depth));
					}
				}
				
				if (this.allFlag=="comment") {
					if(_viewdata[x].commenthtml != "") {
						_itemdom.insertAdjacentHTML("beforeend", _viewdata[x].commenthtml);
					}
				}
			}
		}
		,loadFileList : function (_arrCall, _unid) {
			var _this = this
			,_call = [{func : _this.render, argv:[_unid||UNID]}];
			_call = _call.concat(_arrCall||[]);
			
			_AfterJQuery(function () {
				_getViewEntries.call(_this, {
					dbPath : DB_PATH
					,viewname : "filelist"
					,restricttocategory : _unid||UNID
				}, _call);
			});
		}
		,render : function (_unid, _data,_status,_xhr) {
			var _viewdata = _viewdataParse(_data), _entries={}, _entry
			,_fileadd="", _filedelete="", _commentdelete="";
			
			if (isFalse(this.allFlag)) {
				_fileadd = _RX.call({stradd:msg_project_addfile}, __pattern.file_button_add);
				_filedelete = __pattern.file_button_delete;
				_commentdelete = __pattern.comment_btn_delete;
			}
			
			for(var i=0;i<_viewdata.entry.length;i++){
				_entry = _viewdata.entry[i];
				_entries[_entry.unid] = _entry;
				
				
				_entries[_entry.unid].filehtml = (isFalse(_entry.filename)?"":_RX.call({
					writername : _entry.writername
					,post : _entry.writerpost
					,dept : _entry.writerdeptname
					,created : _entry.created
					,filename : _entry.filename
					,filesize : _entry.filesize
					,filesizemb : (function (_size) {var _ret=1; return _ret=Math.floor(_size/1024), (_ret>1?_ret:1)+"kb";} (parseInt(_entry.filesize)))
					,unid : _entry.unid
					,punid : _entry.punid
					,rootunid : _entry.rootunid
					,contenttype : _entry.contenttype
					,buttons : _fileadd+(CUR_USER==_entry.writer ? _RX.call({strdelete:msg_delete}, _filedelete) : "")
				}, __pattern.file));
				
				_entries[_entry.unid].commenthtml =  (isFalse(_entry.description)?"":_RX.call({
					writername : _entry.writername
					,post : _entry.writerpost
					,dept : _entry.writerdeptname
					,created : _entry.created
					,description : _entry.description
					,unid : _entry.unid
					,buttons : (CUR_USER==_entry.writer ? _RX.call({unid : _entry.unid}, _commentdelete) : "")
				}, __pattern.comment));
			}
			this.viewdata[_unid]||(this.viewdata[_unid]={});
			extend(this.viewdata[_unid], _entries);
		}
		,draw : function (_unid, _fileunid) {
			var _itemObj = this.viewdata[_unid];
			var _viewdata = (_fileunid?{_fileunid: _itemObj[_fileunid]} : _itemObj), _parent, _indent
			,filecnt=0, commentcnt=0;
			
			for(var x in _viewdata) {
				if (_viewdata[x].filehtml != "") {
					filecnt++;
					if (UNID == _viewdata[x].punid) {
						this.fileWrap.insertAdjacentHTML("beforeend", _RX.call({
							filehtml : _viewdata[x].filehtml
							,unid : _viewdata[x].unid
						}, __pattern.file_box));
						
						this.commentWrap.insertAdjacentHTML("beforeend", _RX.call({
							filehtml : _viewdata[x].filehtml
							,unid : _viewdata[x].unid
						}, __pattern.file_box));
					} else {
						_parent = query.call(this.fileWrap, "[data-query=\"file_" + _viewdata[x].punid + "\"]");
						_parent&&_parent.insertAdjacentHTML("beforeend", _RX.call({
							filehtml : _viewdata[x].filehtml
							,unid : _viewdata[x].unid
						}, __pattern.file_depth));
						
						_parent = query.call(this.commentWrap, "[data-query=\"file_" + _viewdata[x].punid + "\"]");
						_parent&&_parent.insertAdjacentHTML("beforeend", _RX.call({
							filehtml : _viewdata[x].filehtml
							,unid : _viewdata[x].unid
						}, __pattern.file_depth));
					}
				}
				
				if (_viewdata[x].commenthtml != "") {
					this.commentWrap.insertAdjacentHTML("beforeend", _viewdata[x].commenthtml);
				}
			}
			this.emptyList(this.fileWrap, "emptyFile");
		}
		,emptyList : function (_wrap, _id) {
			var _empty = getElementId(_id)
			,_list_box = getElementClassName.call(_wrap, "list_box");
			
			if (_list_box.length === 0) {
				_empty.style.display = "inline";
			} else {
				_empty.style.display = "none";
			}
		}
		,completeUpload : function (_fileunid) {
			var _this = this;
			_getViewEntries.call(_this, {
				dbPath : DB_PATH
				,viewname : "filelist_flat"
				,startkey : _fileunid
				,count : "1"
			}, [
			    {func : _this.render, argv : [UNID]}
				,{func : _this.draw, argv : [UNID, _fileunid]}
			]);
		}
		,removeAddFrame : function () {
			var _addFrame = getElementId("add_frame");
			if (_addFrame) _addFrame.parentNode.removeChild(_addFrame);
		}
		,append : function (_btn) {
			var _parent = _btn.parentNode;
			if(isFalse(_parent)) return;
			_file.removeAddFrame();
			
			var _unid = _parent.getAttribute("data-unid");
			_parent.insertAdjacentHTML("afterend", _RX.call({
				strcancel : msg_cancel
				,strsave : msg_file_save
			},__pattern.appendwrap));
			
			var _addFrame = getElementId("add_frame");
			getElementTagName.call(_addFrame, "span").forEach(function (_node) {
				PUBLIC_JS.AddListener(_node, "click", function () {
					var _method = this.getAttribute("data-method");
					_file[_method]("fileAppendFrame", "dispAppendFilePath", _unid);
				});
			});
		}
		,fileSelect : function (_frame, _inputname, _punid) {
			var _fileframe = getElementId(_frame)
			,_win = _fileframe.contentWindow
			,_doc = _fileframe.contentDocument
			,_fileCtl = getElementClassName.call(_doc, "btnUpload")[0];
			_punid && (_doc.forms[0].ParentUNID.value = _punid);
			_win.fileUpload.inputname = _inputname;
			_fileCtl&&_fileCtl.click();
		}
		,fileSave : function (_frame, _inputname, _punid) {
			var _dispFilePath = getElementId(_inputname)
			,_descriptText = getElementId("description");
			
			if (_frame == "fileCommentFrame") {
				if (isFalse(_dispFilePath.value) && isFalse(_descriptText.value)) return;
			} else if (isFalse(_dispFilePath.value)) return;
			
			var _fileframe = getElementId(_frame)
			,_doc = _fileframe.contentDocument
			,_form = _doc.forms[0];
			
			if (_frame == "fileCommentFrame") {
				var _description = _form.description
				,_indexof=["\n","\t"," "]
				,_ret = ["<br>","&nbsp;&nbsp;&nbsp;&nbsp;", "&nbsp;"];
				_description.value=_descriptText.value.replace(/[\s]/g, function (arr) {
					return _ret[_indexof.indexOf(arr[0])]||arr[0];
				});
				_descriptText.value="";
			}
			_file.removeAddFrame();
			_dispFilePath.value="";
			_form.submit();
		}
		,download : function (_btn) {
			var _parent = _btn.parentNode;
			if (isFalse(_parent)) return;
			
			var _unid = _parent.getAttribute("data-unid")
			,_filename = _parent.getAttribute("data-filename")
			,_frame = getElementId("attachdownframe");
			
			if (_file.ie) {
				_frame.src = "/" + DB_PATH + "/iedownload/" + _unid + "?opendocument";
			} else {
				var _document = _frame.contentDocument
				,_location = _document.createElement("a");
				_location.setAttribute("href", "/" + DB_PATH + "/filelist/" + _unid + "/$file/" + _filename);
				_location.setAttribute("download", _filename);
				_location.click();
			}
		}
		,deleteFile : function (_btn) {
			var _this = this
			,_parent = _btn.parentNode;
			
			if(isFalse(_parent)) return;
			var _unid = _parent.getAttribute("data-unid");
			
			_formActionProcess({
				UNID : _unid
				,Action : "delete_file"
			}, function (_result) {
				var _fileRec=null;
				if (_result.Status == "100") {
					_fileRec = query.call(_this.fileWrap, "[data-query=\"file_" + _unid + "\"]");
					_fileRec&&_fileRec.parentNode.removeChild(_fileRec);
					_fileRec = query.call(_this.commentWrap, "[data-query=\"file_" + _unid + "\"]");
					_fileRec&&_fileRec.parentNode.removeChild(_fileRec);
					_this.emptyList(_this.fileWrap, "emptyFile");
				}
			});
		}
		,deleteComment : function (_btn) {
			var _this = this;
			var _unid = _btn.getAttribute("data-unid");
			
			_formActionProcess({
				UNID : _unid
				,Action : "delete_comment"
			}, function (_result) {
				var _commentRec=null;
				if (_result.Status == "100") {
					_commentRec = query.call(_this.commentWrap, "[data-query=\"comment_" + _unid + "\"]");
					_commentRec&&_commentRec.parentNode.removeChild(_commentRec);
				}
			});
		}
	};
	var _file = new _fileClass ();
	/*
	 * TODO itemdoc
	 * */
	function _itemDocOpenClass () {}
	_itemDocOpenClass.prototype = {
		init : function (_opt) {
			//탭 이벤트		
			this._tabEvent(_opt&&_opt.on);
			//결재
			this._yearSelect();
			//this._drawApproval ();
			//체크리스트
			this._drawCheckList ();
			//파일 리스트
			_file.init();
			//멤버
			ORGSELECT_OBJ.setBasicCollection("MEMBER_COLLECTION", "MEMBER_LIST"
				, document.getElementById("MEMBER_INIT_DATA").innerHTML);
		}
		,_replyListInit : function () {
			ReplyListInit();
		}
		,_yearSelect : function () {
			var _this = this
			,_date = new Date()
			,_year = _date.getFullYear()
			,_firstYear = isFalse(StandardRepositoryYear) ? _year : parseInt(StandardRepositoryYear)
			,_gap = (_year-_firstYear) + 1
			,_oSelect = getElementId("year_select")
			,_label = getElementId("year_label")
			,_option="";
			
			if (isFalse(_oSelect)) return;
			
			for (var i=0 ; i<_gap ; i++){
				_option+="<option value=\"" + (_year-i) + "\" " + (i==0?"selected":"") + ">" + (_year-i) + "</option>";
			}
			_oSelect.innerHTML = _option;
			
			_selectBoxEvent(_oSelect, _label, {
				change : function () {_this._drawApproval(_oSelect.value);}
			});
		}
		,_drawApproval : function (_year) {
			var _date = new Date(), _viewdata={}, _this = this
			,_aprvPath = APRV_INDEX_DB_SOURCE.replace(/YYYY/, _year||_date.getFullYear());
			
			function _render (_data) {
				_viewdata = _viewdataParse(_data);
				
				for (var i=0;i<_viewdata.entry.length;i++) {
					(function () {
						this.html = _RX.call({
							docnumber : this.msg_v_docnumber
							,doctype : this.msg_v_formtitle
							,unid : this.unid
							,subject : this.msg_v_subject
							,writer : this.msg_v_writername.split(COLUMN_SEP)[0]
							,created : this.msg_v_created.split(" ")[0]
							,completed : this.msg_v_compdatetime.split(" ")[0]
							,index : i
						}, __pattern.aprv_record);
					}).call(_viewdata.entry[i]);
				}
			}
			
			function _draw () {
				var _html="", _aprv_tbody;
				for (var i=0;i<_viewdata.entry.length;i++) {
					_html += _viewdata.entry[i].html;
				}
				_aprv_tbody = getElementId("aprv_tbody");
				_aprv_tbody.innerHTML = _html;
				
				var _span = getElementTagName.call(_aprv_tbody, "span");
				_span&&_span.forEach(function (_entry) {
					PUBLIC_JS.AddListener(_entry, "click", function () {
						var nWidth = 960
						,_index = this.parentNode.getAttribute("data-index")
						,_arrData = _viewdata.entry[parseInt(_index)]
						,_aDocno = _arrData.$DocNo.split(COLUMN_SEP)
						,_path = _aDocno[0]
						,_url = new CURL("/" + _path + "/repositorydoc_by_uniquekey/" + _aDocno[1] + "?opendocument", {
							readtype:"popup"
							,ui:"webmail"
						});
						PUBLIC_JS.OpenSubwin(_url.url, nWidth, 768, "yes", "_blank", "yes");
					});
				});
			}
			
			_getViewEntries({
				dbPath : _aprvPath
				,viewname : "view_by_projectcode"
				,restricttocategory : UNIQUE_KEY //CUR_USER
			}, [
			    {func : _render}
			    ,{func : _draw}
			], function () {
				_viewdata.entry=[];
				_draw();
			});
		}//end of _drawApproval
		,_drawCheckList : function () {
			var _this = this
			,_area = getElementId("CheckListArea"), _checkitem, _split, _html="";
			
			for (var i=0; i<CHECKLIST.length;i++){
				_checkitem = CHECKLIST[i];
				if (isFalse(_checkitem)) continue;
				_split = _checkitem.split("|");
				_html += _RX.call({
					checked : (_split[1]=="1"?"checked":"")
					,id : ("check_list_"+i)
					,text : _split[0]
				}, __pattern.checklist);
			}
			_area.innerHTML = _html;
			
			var _a = queryall.call(_area, "span a");
			_a.forEach(function (_t, _idx) {
				PUBLIC_JS.AddListener(_t, "click", function () {
					var _li = _area.childNodes[_idx];
					_li&&_area.removeChild(_li);
					_this.saveCheckList(function (_result) {
						if (_result.Status == "100") {
							//저장
						}
					});
				});
			});
		}
		,_tabEvent : function (_on) {
			//TAB
			var _tabwrap = getElementClassName("tab_cont")
			,_tabs = getElementTagName.call(_tabwrap[0], "li")
			,_divwrap = getElementClassName("tab_cont_con")
			,_divs = _divwrap[0].children
			,_view = null;
			_tabs.forEach(function (_li, _idx) {
				PUBLIC_JS.AddListener(_li, "click", function () { //mouseover
					var _active = query.call(_tabs, ".ui-tabs-active");
					_active&&_active.setAttribute("class", "");
					this.setAttribute("class", "ui-tabs-active");
					_view&&(_view.style.display="none");
					_divs[_idx].style.display="block";
					_view=_divs[_idx];
				});
			});
			_trigger(_tabs[_on||0], "click"); //mouseover
		}
		,saveCheckList : function (_call) {
			var _checklist = queryall("#CheckListArea input[type='checkbox']")
			,_listString=[];
			_checklist.forEach(function (_check, _idx) {
				_listString[_idx] = _check.getAttribute("data-text") + "|" + (_check.checked?"1":"")
			});
			_formActionProcess({
				"CheckListString" : _listString.join(COLUMN_SEP)
				,"UNID" : UNID
				,"Action" : "save_checklist"
			}, function (_result) {
				if (_call) {_call(_result); return;}
				if (_result.Status == "100") {
					alert(msg_comment_save);
				}
			});
		}
		,deleteItem : function (_unid) {
			if (confirm(msg_confirm_delete)) {
				_formActionProcess({
					"Action" : "itemdoc_delete"
					,"UNID" : _unid
				}, function (_result) {
					//_result -> category code
					if(_result.Status == "100") {
						alert(msg_delete_complete);
						_home.tab().PROJECT_NODE.reloadItemList(_result.Url);
						parent.TAB_LOADER.removeTLoader("TB_" + _unid, "TC_" + _unid, "");
					}
				});
			}
		}
		,addCheckList : function _addCheckList () {
			var _this=this
			,_val = getElementName("add_check_item")[0];
			if (isFalse(_val.value)) return;
	
			_formActionProcess({
				"CheckItem" : _val.value
				,"UNID" : UNID
				,"Action" : "add_checklist"
			}, function (_result) {
				if (_result.Status == "100") {
					CHECKLIST = _result.Url.split(COLUMN_SEP);
					_val.value = "";
					_this._drawCheckList ();
					//window.console&&console.log("_itemdoc.addCheckList", _result);
				}
			});
		}
	};
	var _itemdoc = new _itemDocOpenClass();
	
	function _calendarClass () {}
	_calendarClass.prototype = {
		flatData : [] //전체 데이터
		,groupData : {} //멤버별 데이터
		,color : ["#7ac7ef", "#f8640c", "#8d80ec", "#a14d5a", "#4a8740"
		          ,"#a7b311", "#342fb8", "#c7a34d", "#349ba2", "#cb9bf4"
		          ,"#e1809f", "#abb61c", "#32816d", "#a02a0d", "#47acfe"]
		,viewData : {}
		,rndColor : function () {
			var _v, i=0;
			while((_v="#"+Math.floor(Math.random()*0xffffff).toString(16)).length!=7){
				i++; if (i > 10) break;
			} return _v;
		}
		,init : function () {
			var _this = this;
			function _renderData (_data, _s, _x) {
				var _tag="", _entry, _parse, _length, _json, _idx=0, _name, _color;
				_this.viewdata=_viewdataParse(_data);
				_entry=_this.viewdata.entry;
				
				for (var i=0;i<_entry.length;i++){
					if ( isArray(_entry[i].Member) ) {
						_tag = PUBLIC_JS.GetOU(_entry[i].Member[0][0]);
						_name = PUBLIC_JS.GetCN(_entry[i].Member[0][0]);
					} else {
						_tag = PUBLIC_JS.GetOU(_entry[i].Member);
						_name = PUBLIC_JS.GetCN(_entry[i].Member);
					}
					_parse = JSON.parse(_entry[i].Col_Data);
					
					if ( isFalse(_this.groupData[_tag]) ) {
						_color=(_idx>14?_this.rndColor():_this.color[_idx]);
						_this.groupData[_tag]={
							index : _idx
							,name : _name
							,color : _color
							,data : []
						};
						_idx++;
					}
					
					_length=_this.groupData[_tag].data.length;
					_json = {
						start_date : _parse.StartDate
						,end_date : _parse.EndDate
						,text : _parse.Subject
						,tag : _tag
						,color : _this.groupData[_tag].color //_this.color[_this.groupData[_tag].index]
						,textColor : "white"
						,data : _parse
					};
					_this.groupData[_tag].data[_length] = _json;
					_this.flatData[i] = _json;
				}
			}
			_getViewEntries.call(_this, {
				dbPath : DB_PATH
				,viewname : "calendarview"
			}, [
				{func : _renderData}
				,{func : _this._schedulerInit}
				,{func : _this._drawMember}
				,{func : _this.drawAllData}
				,{func : _this.setEvent}
			]);
		}
		,_schedulerInit : function () {
			PROJECT_SCH.init({
				drag_create:0
				,drag_move:0
				,details_on_create:true
				,timeout_to_display : 50
				,delta_x : 15
				,delta_y : -20
				,className : 'dhtmlXTooltip tooltip'
			});
			//이벤트
			PROJECT_SCH.setEvent({
				"onBeforeEventChanged" : function () {
					//return false로 하고 양식 호출
					return false;
				}
				,"onClick" : function (id, event) {
					var _event = scheduler.getEvent(id)
					,_data = _event.data
					,_url = "/" + DB_PATH + "/openitem/" + _data.Unid + "?opendocument";
					(window.TAB_LOADER||parent.TAB_LOADER).createTLoader(_data.Subject, _url, _data.Unid, "");
					return false;
				}
				,"onEventLoading" : function (ev) {
					ev._timed = false;
					return true;
				}
			});
			//템플리트
			var _format = PROJECT_SCH.getsch().date.date_to_str("%Y-%m-%d");
			PROJECT_SCH.setTemplate({
				"tooltip_text" : function(start,end,ev){
				    return "<b>" + msg_item_title + " : " + ev.text + "</b>" + "<br/>"+
				    "<b>" + msg_item_status + " : " + window["msg_item_status_" + ev.data.ItemStatus] + "</b><br/>" +
				    "<b>" + msg_project_period + " : " + _format(start) + " ~ " + _format(end) + "</b>"
				}
				,"event_class" : function(start,end,ev){
				    return "dhx_cal_event_line dhx_cal_event_line_start dhx_cal_event_line_end";
				}
				,"event_bar_date" : function(start,end,ev){
					return ""; //ev.text;
				}
			});
		}
		,_drawMember : function () {
			var _this = this
			,_listcheck = getElementId("list_check")
			,_html="";
			
			for(var x in this.groupData) {
				_html += _RX.call({
					index : this.groupData[x].index
					,name : this.groupData[x].name
					,color : this.groupData[x].color
					,key : x
				}, __pattern.cal_Checkbox);
			}
			_listcheck.insertAdjacentHTML("beforeend", _html);
		}
		,drawAllData : function () {
			PROJECT_SCH.clearAll().parse(this.flatData);
		}
		,setEvent : function () {
			var _this = this
			,_allCheckbox = getElementId("check_box_all")
			,_list_check = getElementId("list_check")
			,_itemCheckBox = getElementTagName.call(_list_check, "input")
			;
			PUBLIC_JS.AddListener(_allCheckbox, "change", function () {
				if (this.checked) {
					_itemCheckBox.forEach(function (_cb) {
						_cb.checked = false;
					});
					_this.drawAllData()
				} else {
					PROJECT_SCH.clearAll();
				}
			});
			_itemCheckBox.forEach(function (_cb) {
				PUBLIC_JS.AddListener(_cb, "change", function () {
					var _d=[]
					,_checked = queryall.call(_list_check, "input:checked");
					
					if (_allCheckbox.checked) _allCheckbox.checked=false; 
					for (var i=0;i<_checked.length;i++) {
						_d=_d.concat(_this.groupData[_checked[i].getAttribute("data-key")].data);
					}
					PROJECT_SCH.clearAll().parse(_d);
				});
			});
		}
	};
	var _calendar = new _calendarClass();
	
	function _TimelineClass () {}
	_TimelineClass.prototype = {
		flatData : [] //전체 데이터
		,viewdata : null
		,parseData : []
		,init : function () {
			var _this = this, _projectinfo = _home.tab().PROJECT_NODE.getProjectInfo();
			
			_projectinfo&&_this.flatData.push({
				id : "projectmain"
				,data : _projectinfo
				,text : _projectinfo.Subject
				,type : "project"
				,start_date : _projectinfo.StartDate
				//,end_date : _parse.EndDate
				,duration : ((new Date(_projectinfo.EndDate) - new Date(_projectinfo.StartDate))/864e5) + 1 //24*60*60*1000
				,progress : parseInt(_projectinfo.CompleteRate||"0")/100
				,open:true
			});
			
			function _renderData (_data, _s, _x) {
				var _entry, _parse, _sd, _ed;
				_this.viewdata=_viewdataParse(_data);
				_entry=_this.viewdata.entry;
				
				for (var i=0;i<_entry.length;i++){
					_this.parseData[i] = _parse = JSON.parse(_entry[i].Col_Data);
					_sd = new Date(_parse.StartDate);
					_ed = new Date(_parse.EndDate);
					_this.flatData.push({
						id : (i+1)
						,data : _parse
						,text : _parse.Subject
						,start_date : _parse.StartDate
						//,end_date : _parse.EndDate
						,duration : ((_ed - _sd)/864e5) + 1 //24*60*60*1000
						,progress : parseInt(_parse.ItemRate||"0")/100
						,open:true
					});
				}
			}
			_getViewEntries.call(_this, {
				dbPath : DB_PATH
				,viewname : "json_item_flat"
			}, [
				{func : _renderData}
				,{func : _this._ganttInit}
				,{func : _this.drawAllData}
			]);
		}
		,_ganttInit : function () {
			PROJECT_GANTT.init({
				xml_date : "%Y-%m-%d"
				,scale_unit : "month"
				,date_scale : "%F"
				,scale_height : 54
				,min_column_width : 50
				,drag_move : false
				,drag_progress : false
				,drag_resize : false
				,drag_links : false
				
				,timeout_to_display : 50
				,delta_x : 15
				,delta_y : -20
				,className : 'dhtmlXTooltip tooltip'
				
				,subscales : [
					{unit:"day", step:1, date:"%d"}
				]
				,columns : [
					{name:"text", label:"Task name", width:"250", tree:true}
				]
			});
			var _format = PROJECT_GANTT.getsch().templates.tooltip_date_format;
			PROJECT_GANTT.setTemplate({
				"tooltip_text" : function(start,end,ev){
					var _status = window["msg_item_status_" + (ev.type==="project"? ev.data.ProjectStatus : ev.data.ItemStatus)];
						
				    return "<b>" + msg_item_title + " : " + ev.text + "</b>" + "<br/>"+
				    "<b>" + msg_item_status + " : " + _status + "</b><br/>" +
				    "<b>" + msg_project_period + " : " + _format(start) + " ~ " + _format(end) + "</b>"
				}
			});
			PROJECT_NODE.resizeDisplay(0, function(){gantt.setSizes();});
		}
		,drawAllData : function () {
			PROJECT_GANTT.parse({
				data : this.flatData
			});
		}
	};
	var _timeline = new _TimelineClass();
	
	function _homeClass () {}
	_homeClass.prototype = {
		categories : []
		,items : []
		,tab : function () {
			var contents = contents = getElementId.call(
				(window.name == "BODY_IFRAME")?document:parent.document
				,"TabContents"
			)
			,frames = getElementTagName.call(contents, "iframe")
			,frame = frames[0];
			return {
				frame : frame
				,window : frame.contentWindow
				,document : frame.contentDocument
				,PROJECT_NODE : frame.contentWindow.PROJECT_NODE
				,PROJECT_NODE_NAV : frame.contentWindow.PROJECT_NODE_NAV
			};
		}
		,init : function () {
			this.loadPage();
			this._setHomeButton();
		}
		,loadPage : function () {
			var _this=this, _idx=null;
			function _renderData (_data) {
				var _viewdata=_viewdataParse(_data);
				_this.categories = _viewdata.entry;
			}
	
			function _laodContents () {
				_getViewEntries.call(_this, {
					dbPath : DB_PATH
					,viewname : "category_all"
				}, [
					{func : _renderData}
					,{func : _this._drawCategory, argv:[_idx]}
					,{func : _this._loadItem}
				]);
			}
			
			_AfterJQuery.call(_this, _laodContents);
		}
		,_drawCategory : function (_idx) {
			var _html="";
			function _makeHtml (_entry) {
				return _RX.call({
					"key":_entry.uniquekey
					,"attrtitle":_entry.title.replace(/"/g, "&quot;")
					,"title":_entry.title
					,"unid":_entry.unid
					,"position":_entry.position
				}, __pattern.category);
			}
			if (isFalse(_idx)) {
				for(var i=0;i<this.categories.length;i++){
					_html += (function (_entry) {
						return _makeHtml(_entry);
					}(this.categories[i]));
				}
			} else {
				_html = (function (_entry) {
					return _makeHtml(_entry);
				}(this.categories[_idx]));
			}
			this._categoryInsertDom(_html);
		}
		,_categoryInsertDom : function (_domString) {
			var _section = getElementId("category_list_section");
			_section.insertAdjacentHTML("beforeend", _domString);
			
			// 이벤트 추가
			var btn_item_add = getElementClassName("popupview_btn");
			btn_item_add.forEach(function(_entry, _idx){
				if (_entry.hasAttribute("data-loaded")) return;
				_entry.setAttribute("data-loaded","end");
				
				PUBLIC_JS.AddListener(_entry, "click", function () {
					var _code = this.parentNode.getAttribute("data-key")
					,_url =  (new CURL("/" + DB_PATH + "/itemdoc?openForm", {
						readtype : "pdivbox"
						,code : _code
					})).url;
					PUBLIC_JS.ModalSubwin(_url, msg_new_item_popup, _detailformX, _detailformY, null, true);
				});
			});
			
			var modify_btn = getElementClassName("modify_btn");
			modify_btn.forEach(function(_entry, _idx){
				if (_entry.hasAttribute("data-loaded")) return;
				_entry.setAttribute("data-loaded","end");
				
				PUBLIC_JS.AddListener(_entry, "click", function () {
					var _code = this.parentNode.getAttribute("data-key")
					,_title = this.parentNode.getAttribute("data-title")
					,_unid = this.parentNode.getAttribute("data-unid")
					,_position = this.parentNode.getAttribute("data-position")
					,_items = getElementId(_code+"_items")
					,_tr_row = getElementClassName.call(_items, "tr-row")
					,_url = (new CURL("/" + DB_PATH + "/categoryEdit?readForm", {
						title : _title
						,categoryunid : _unid
						,position : _position
						,uniquekey : _code
						,child : (_tr_row.length>0?"1":"0")
					})).url;
					PUBLIC_JS.ModalSubwin(_url, msg_category_edit, "550", "153", null, true);
				});
			});
		}
		,_loadItem : function () {
			var _this = this;
			_processqueue.call(this, this.categories.map(function (_entry) {
				return {
					func : _this._getItems
					,async : true
					,argv : [_entry.uniquekey, true]
				};
			}));
		}
		,deleteItem : function _deleteItemNode (unid) {
			var _item = getElementId("item_" + unid);
			_item&&_item.remove();
		}
		,reloadItems : function (_categorycode) {
			this._getItems(_categorycode, true);
		}
		,refreshItems : function (_categorycode) {
			// 변경 된 내용만 처리 하려고 했는데, 전체 리프레시로 변경
			// 원본 : this._getItems(_categorycode);
			this._getItems(_categorycode, true);
		}
		,_getItems : function (_categorycode, _loadding) {
			var _this=this;
			_getViewEntries.call(this, {
				dbPath : DB_PATH
				,viewname : "json_item_bycategorycode"
				,restricttocategory : _categorycode
			}, [
				{func : _this._renderItem, argv : [_categorycode, _loadding]}
			]);
		}
		,_renderItem : function (_categorycode, _loadding, _data) {
			var _this=this;
			function _json_data (_viewdata) {
				//필드 정보가 많기 때문에, 보기에서 json_data 를 String으로 사용
				for(var i=0;i<_viewdata.length;i++){
					(function (_entry) {
						_entry.json = JSON.parse(_entry.Col_Data);
						
						var _memberinfo = _entry.json.MemberInfo.split(ROW_SEP)
						,_membername = _memberinfo.map(function (_d) {
							var _split = _d.split(SUB_SEP);
							return _split[1];
						});
						_entry.html = _RX.call({
							unid:_entry.json.Unid
							,subject:_entry.json.Subject
							,startdate : _entry.json.StartDate
							,enddate : _entry.json.EndDate
							,member : _membername.join(", ")
							,status : window["msg_item_status_" + _entry.json.ItemStatus]||""
							,rate : (_entry.json.ItemRate||"0") + "%"
							,lbl_period : msg_project_period
							,lbl_manager : msg_project_manager
							,lbl_status : msg_item_status
						}, __pattern.item);
						
					}(_viewdata[i]));
				}
				return _viewdata;
			}// end of _json_data
			
			var _viewdata = _viewdataParse(_data)
			,_viewentry = null, _items = null, _eq = false, _index;
			
			if (_loadding) {
				this.items[_categorycode] = _json_data(_viewdata.entry);
				this._itemInsertDom(_categorycode,_loadding);
			} else {
				//하나씩 비교 하려고 만든 코드
				//_loadding이 무조건 true 이기 때문에 이 부분은 수행 하지 않음
				_items = this.items[_categorycode];
				_viewentry = _json_data(_viewdata.entry);
				for (var i=0; i<_items.length; ) {
					_eq = _viewentry.some(function (_entry, _idx) {
						return (_items[i].unid == _entry.unid) && _viewentry.splice(_idx, 1);
					});
					if (_eq) {_eq=false; i++;}
					else {
						_items.splice(i, 1);
						this.deleteItem (_items[i].unid);
					}
				}
				this.items[_categorycode]=_items.concat(_viewentry);
				this._itemInsertDom (_categorycode, _loadding, _viewentry);
			}
		}
		,_itemInsertDom : function (_code,_loadding,_entries) {
			var _this=this,_html="", _row, _temphtml="", _idx;
			_entries = _entries||this.items[_code];
			
			for(var i=0;i<_entries.length;i++){
				_idx = i+1;
				_row = (_idx%4 == 0);
				_temphtml += (function (_entry) {
					return _entry.html + (_row|| _idx==_entries.length?"":"<div class=\"gap-col\"></div>");
				}(_entries[i]));
				
				if (_row || _idx==_entries.length) {
					_html+=_RX.call({
						items : _temphtml
					}, __pattern.tr_row);
					_temphtml="";
				}
			}
			
			if (!isFalse(_html)) {
				var _item_ul = getElementId(_code + "_items");
				if (_loadding) _item_ul.innerHTML = __pattern.tr_column; //td-column 부분
				_item_ul.insertAdjacentHTML("beforeend", _html);
				//Click Event
				var _items = queryall.call (_item_ul, ".link_st:not([data-loaded=\"end\"])");
				_items&&_items.forEach(function (_item, _idx) {
					//세부사항 문서 열기
					PUBLIC_JS.AddListener(_item, "click", function () {
						var _unid = this.getAttribute("data-unid");
						var _subject = this.innerText;
						var _url = "/" + DB_PATH + "/openitem/" + _unid + "?opendocument";
						(window.TAB_LOADER||parent.TAB_LOADER).createTLoader(_subject, _url, _unid, "");
					});
					_item.setAttribute("data-loaded","end");
				});
			}
		}
		,categoryNameChange : function (_title, _key, _unid, _position) {
			var _this = this;
			_formActionProcess({
				"UNID" : _unid
				,"Title" : _title
				,"UniqueKey" : _key
				,"Action" : "edit_category"
			}, function (_result) {
				var _pos=parseInt(_position)-1, _elCategory=null, _dom=null;
				if (_result.Status == "100") {
					//_home category array 에서 변경
					var _jsonData = JSON.parse(_result.Url);
					_this.categories[_pos] = _jsonData;
					//dom 에서 title 변경
					_elCategory = getElementId(_key+"_category");
					if (_elCategory) {
						_dom = getElementClassName.call(_elCategory, "category_title")[0];
						_dom&&(_dom.innerText=_title);
						_dom = getElementClassName.call(_elCategory, "category_bt")[0];
						_dom&&(_dom.setAttribute("data-title",_title));
					}
					//msgbox 닫기
					parent.MSG_OBJ.Close();
				} else {console.log("fail", _result);}
			});
		}
		,categoryDelete : function (_key, _unid, _position) {
			var _this = this;
			_formActionProcess({
				"UNID" : _unid
				,"UniqueKey" : _key
				,"Action" : "delete_category"
			}, function (_result) {
				var _pos=parseInt(_position)-1, _dom=null;
				if (_result.Status == "100") {
					//_home category array 에서 삭제
					_this.categories.splice(_pos, 1);
					//화면의 dom 삭제
					_dom = getElementId(_key+"_category");
					_dom&&_dom.parentNode.removeChild(_dom); //.removeNode();
					_dom = getElementId(_key+"_items");
					_dom&&_dom.parentNode.removeChild(_dom);
					
					//msgbox 닫기
					parent.MSG_OBJ.Close();
				} else {console.log("fail", _result);}
			});
		}
		,_setHomeButton : function () {
			//분류 추가
			var _this=this
			,_title = getElementId("category_title")
			,_add = getElementId("btn_add");
			
			_title&&PUBLIC_JS.AddListener(_title, "click", function () {
				var _parent = this.parentNode
				,_class = _parent.className;
				if (_class == "category_add") {
					_class += " input_view";
				} else _class = "category_add"
				_parent.className = _class;
			});
			
			_add&&PUBLIC_JS.AddListener(_add, "click", function () {
				var _textbox = getElementName("AddCategoryText")[0];
				if (isFalse(PUBLIC_JS.Trim(_textbox.value))) {
					PUBLIC_JS.Alert(msg_empty_category, "");
					return;
				}
				_formActionProcess({
					"Title" : _textbox.value
					,"Action" : "category_save"
				}, function (_result) {
					var _jsonData = JSON.parse(_result.Url);
					_this.categories[_this.categories.length] = _jsonData;
					_this._drawCategory(_this.categories.length-1);
					_title.click();
					_textbox.value="";
				});
			});
		}
	};
	var _home = new _homeClass();
	/*******************************************************************
	 * 
	 * $OBJ
	 * Will Return
	 * Object Group
	 * 		PROJECT_NODE_NAV : nav menu object
	 * 		PROJECT_NODE : node object
	 * 
	 *******************************************************************/
	var $OBJ = {
		PROJECT_NODE_NAV : function () {
			return {};
		}
		,PROJECT_NODE : function () {
			return {
				HomeInit : function (project_data) {
					_project.init(project_data);
					_home.init();
				}
				,SetProject : function (project_data, callback_collection) {_project.setProject(project_data, callback_collection);}
				,ReloadProject : function () {
					_project.init(_project.data);
				}
				,ItemSave : function (sAction) {	
					if (!_formdataProcessing(sAction)) return;
					DOC_OBJ.Save(sAction);
				}
				,reloadItemList : function (categorycode) {
					_home.reloadItems(categorycode);
				}
				,ClosePopup : function () {parent.MSG_OBJ.Close();}
				,ItemDocInit : function (project_data) {
					_project.init(project_data);
					_itemdoc.init(project_data);
				}
				,ItemDocEdit : function () {
					PUBLIC_JS.ModalSubwin("/" + DB_PATH + "/0/" + UNID + "?editdocument", SUBJECT, _detailformX, _detailformY, null, true);
				}
				,ItemDocDelete : function () {
					_itemdoc.deleteItem(UNID);
				}
				,saveCheckList : function () {_itemdoc.saveCheckList();}
				,addCheckList : function () {_itemdoc.addCheckList ();}
				,showOrg : function (sCollectionName, sDivName, sKind, sIsSingle, sfunction) {
					_showOrg(sCollectionName, sDivName, sKind, sIsSingle, sfunction);
				}
				,returnProcess : function (_calltype, _argv) {
					//팝업으로 에이전트 처리시에 Url 호출 하여 사용
					//popup_close_process 양식 에서 호출
					switch(_calltype){
					case "itemdoc_newsave": //Item Doc 새로운 등록
						_processqueue.call(_home, [{
							func : _home.refreshItems
							,async : true
							,argv : _argv.categorycode
						}]);
						break;
					case "itemdoc_editsave": //Item Doc 편집
						if ("subject" in _argv) {
							var _nowTab = getElementId.call(parent.document, "span_" + parent.TAB_LOADER.nowTLoaderID)
							,_titleTd = _nowTab.parentNode
							,_labelSpan = _nowTab.firstChild;
							_labelSpan&&(_labelSpan.textContent = (_argv.subject.length > 8 ? _argv.subject.substring(0, 6)+"...": _argv.subject));
							_titleTd&&_titleTd.setAttribute("title", _argv.subject);
						}
						location.reload();
						_home.tab().PROJECT_NODE.reloadItemList(_argv.categorycode);
						break;
					}
				}
				,EditProjectDocument : function () {
					_nav.editProjectDocument();
				}
				,ProjectFileList : function (project_data) {
					_project.init(project_data);
					_file.loadAll("file");
				}
				,ProjectCommentList : function (project_data) {
					_project.init(project_data);
					_file.loadAll("comment");
				}
				,ProjectComment : function (project_data) {
					_project.init(project_data);
					_file.loadAll("comment");
				}
				,CalendarView : function (project_data) {
					_project.init(project_data);
					_calendar.init();
				}
				,TimelineView : function (project_data) {
					_project.init(project_data);
					_timeline.init();
				}
				,afterProjectSave : function (openroom) {
					_nav.reloadAllTab(openroom);
				}
				,designEvent : function () {
					// 디자인에 사용된 jquery 대용 이벤트 처리
					// 콤보박스
					var ItemStatus = getElementName("ItemStatus")[0]
					,ItemStatus_label = getElementId("ItemStatus_label");
					_selectBoxEvent(ItemStatus, ItemStatus_label, {
						before : function () {
							for (var i=0; i<this.options.length;i++) {
								if (this.options[i].value == ITEM_STATUS){
									this.selectedIndex=i; break;
								}
							}
						}
					});
				}
				,categoryNameChange : function (_title, _key, _unid, _position) {
					_home.categoryNameChange(_title, _key, _unid, _position);
				}
				,categoryDelete : function (_key, _unid, _position) {
					_home.categoryDelete(_key, _unid, _position);
				}
				,getHome : function () {
					//home 화면 변경 시에 호출
					//
					return _home.tab();
				}
				,getProjectInfo : function () {
					return _project.data.projectInfo;
				}
				,resizeDisplay : function (_otherHeight, _func) {
					var _topHeight=18+37+21
					,_tabHeight = 45
					,_borderzoneHeight = 5
					,_detailarea = getElementClassName("detail_area")[0]
					,_detailHeight = _detailarea.clientHeight
					,_gap=30
					,_padding=10+10
					,_height = _topHeight+_borderzoneHeight+_tabHeight+_detailHeight+_gap+_padding+(_otherHeight||0);
					
					var _resizeBody=getElementClassName("resize_area")[0];
					_resizeBody.style.height = top.innerHeight - _height;
					
					_func&&_func();
				}
				
				//File 관련 메소드 -------------------
				,fileDownload : function (filebtn) {_file.download(filebtn);}
				,fileAppend : function (filebtn) {_file.append (filebtn);}
				,fileCompleteUpload : function (uid) {_file.completeUpload (uid);}
				,fileDelete : function (filebtn) {_file.deleteFile(filebtn);}
				,commentDelete : function (filebtn) {_file.deleteComment(filebtn);}
				,fileSelect : function (_frame, _inputname, _punid) {_file.fileSelect(_frame, _inputname, _punid);}
				,fileSave : function (_frame, _inputname) {_file.fileSave(_frame, _inputname);}
				
				
				,testFunction : function () {
					
				}
			};
		}//End of PROJECT_NODE
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