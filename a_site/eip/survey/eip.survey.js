function eip_survey () {}
(function ( $sv ) {
	"use strict";
	
	var _$view
	,_$doc
	,_$lnb
	,_$block
	,_$delay
	,_prefix = "EIP.SURVEY"
	,_docstatus = {
		draft : "작성중"
		,registed : "등록"
	}
	,_exceptionKey = [8, 9, 16, 17, 18, 33, 34, 35, 36, 37, 38, 39, 40, 45, 46]
	;
	
	$ep.inheritStatic ( $sv, _prefix );
	
	$sv.options = {
		doc : {}
		,view : {}
		,lnb : {}
	};
	
	/////////////////////////////////////////////////////////////////////////////
	// Functions 
	/////////////////////////////////////////////////////////////////////////////
	function _block () {
		_$delay = $ep.util.delay(); 
		_$delay.run(function() { _$block = $ep.util.blockUI({message : $sv.LangString("MESSAGE.PROCESSING")});},300);
	}
	function _unblock () {
		_$delay && _$delay.clear();
		_$block && _$block.unblock();
		_$block = null;
		_$delay = null;
	}
	function _process (_data, _callback) {
		$ep.util.ajax ({
			url : "/" + _data.dbpath + "/process?openform"
			,type : "post"
			,data : $.extend({}, _data, {__Click:"0"})
			,success : function (_res,_txt,_o) {
				_callback && $.isFunction(_callback) && _callback( typeof _res == "object" ? _res : _res.replace(/\n/g, "") , _txt, _o);
			}
			,error : function (_res,_txt,_o) {
				_callback && $.isFunction(_callback) && _callback( typeof _res == "object" ? _res : _res.replace(/\n/g, "") , _txt, _o);
			}
		});
	}
	// 숫자 체크
	function _numcheck(){
		var _numeric = /^[0-9]*$/g
		;
		return _numeric.test($(this).val());
	}
	function _validate() {
		var __active = $ep.ui.active() 
		,__donotify = $(":radio[name=DoNotify]:checked", __active).val()
		,__select_notify = $(":radio[name=select_notify]:checked", __active).val()
		,__doc = $sv.options.doc
		;
		if ( __donotify == "1" ) {
			if ( __select_notify == "1" ) {
				if ($("[name=bbs_default]", __active).val() == "") {
					$ep.util.toast( $sv.LangString("MESSAGE.SELECTBBS"), 1500 );
					return false;
				}
			} else if ( __select_notify == "2" ) {
				if ( __doc.grid.getValue().length == 0 ) {
					$ep.util.toast( $sv.LangString("MESSAGE.SELECTUSER"), 1500 );
					return false;
				}
			}
		}
		return true;
	}
	function _regist (_bValid) {
		var __active = $ep.ui.active()
		,__listString = ""
		,__doc = $sv.options.doc
		,__donotify = $(":radio[name=DoNotify]:checked", __active).val()
		,__select_notify = $(":radio[name=select_notify]:checked", __active).val()
		;
		// 게시판 정보
		
		// 메일 정보
		if ( __donotify == "1" && __select_notify == "2" ) {
			// 메일 보낼 때 결재와 같은 방식으로 에이전트 처리
			$("[name=recipient_name_list]", __active).val(
				$(__doc.grid.getValue()).map(function(){return this.notesid;}).get().join(",")
			);
			$("[name=recipient_info_list]", __active).val(__doc.grid.getArrayString().join(","));
		}
		// 문제 리스트 가져오기
		__listString = _makeQuestionListString(_bValid);
		if ( __listString ) {
			$("[name=questionlist]", __active).val(__listString);
		} else return false;
		
		return true;
	}
	function _checkSurveyItem() {
		// 아이템 검사
		var __active = $ep.ui.active()
		,__questionlist = $sv.options.doc.questionlist
		,__splitList = __questionlist.split("##")
		,__beforeValue
		,__returnArray = []
		,__return = true
		;
		$.each(__splitList, function (_idx, _entry) {
			if(_entry == "") return;
			var __entries = _entry.split("^")
			,__index = _idx + 1
			,__json = _getJsonEntry(__entries, __index)
			,__table = $("#question_table" + __index, __active)
			,__items
			,__dataitem, __dataitemvalue="", __etcItem, __etcvalue=""
			,__kindMap = function () {
				if ( $(this).attr("data-etc") == "1" ) {
					__etcItem = $("[name=dspetcitem"+__json.index+"]", __table);
					__etcvalue = __etcItem.val();
					return __etcvalue;
				}
				return this.value;
			}
			;
			
			if ( __json.itemkind == "1" ){
				__items = $(":radio", __table);
				__dataitem = __items.filter(":checked");
				__dataitemvalue = __dataitem.val()||"";
			} else if ( __json.itemkind == "2" ) {
				__items = $(":radio", __table);
				__dataitem = __items.filter(":checked");
				__dataitemvalue = __dataitem.map(function () {
					return __kindMap.call ( this );
				}).get().join("");
			} else if ( __json.itemkind == "3" ) {
				__items = $(":checkbox", __table);
				__dataitem = __items.filter(":checked");
				__dataitemvalue = __dataitem.map(function () {
					return __kindMap.call ( this );
				}).get().join(":");
			} else if ( __json.itemkind == "4" ) {
				__items = $("input:text", __table);
				__dataitem = __items;
				__dataitemvalue = __dataitem.val()||"";
			}
			
			// 필수항목이고 체크 된게 없으면
			if ( __dataitemvalue == "" && __json.itemval == "1" ) {
				$ep.util.toast(
					__RX__(
						$sv.LangString("MESSAGE.CHECKITEM1")
						,{"1" : __index}
					)
					,1500
				); // __index 번 항목을 누락 되었습니다.
				return __return=false;
			}
			
			//분기 했을 때
			if ( __json.itemsel == "1" ) {
				if ( __beforeValue == "" && __json.itemval == "1" ) {
					$ep.util.toast(
						__RX__(
							$sv.LangString("MESSAGE.CHECKITEM1")
							,{"1" : __index}
						)
						,1500
					); // __index 번 항목을 누락 되었습니다.
					return __return=false;
				}
			}

			//기타 입력시
			if ( __json.itemkind=="2" || __json.itemkind=="3" ) {
				if ( $(__etcItem).size() > 0 ) {
					if ( __etcvalue == "" ) {
						$ep.util.toast(
							__RX__(
								$sv.LangString("MESSAGE.CHECKITEM2")
								,{"1" : __index}
							)
							,1500
						); // __index + "번 기타사항을 입력하십시오."
						return __return=false;
					} else {
						if ( /^[0-9]+$/.test ( __etcvalue ) ) {
							$ep.util.toast( $sv("MESSAGE.CHECKITEM3"), 1500 ); // "기타입력은 숫자로만 입력될 수 없습니다."
							return __return=false;
						}
					}
				}
			}
			
			//최대입력 수 제한 체크
			if ( __json.itemkind=="4" ) {
				if ( __json.itemmax != "0" && parseInt( __json.itemmax ) < __dataitem.size() ) {
					$ep.util.toast(
						__RX__(
							$sv.LangString("MESSAGE.CHECKITEM2")
							,{"1" : __index, "2":__json.itemmax}
						)
						,1500
					); //__index + "번 최대 답변 갯수는 " + __json.itemmax + "개입니다."
					return __return=false;
				}
			}
			
			__beforeValue = __dataitem.parent().text()||"";
			__returnArray.push("no=" + __json.index + "^itemkind=" + __json.itemkind + "^itemcount=" + __items.size() + "^itemresult=" + __dataitemvalue + "^");
		});

		return __return && {result : __returnArray.join("##") , etcresult : ""};
	}
	
	function _select_bbs(_mngbbs){
		var __active = $ep.ui.active()
		,__key = $sv.options.doc.companycode + "^bbs.ent"
		,__bbscode = "", __bbstitle = "", __bbsunid = ""
		;
		$ep.util.ajax ({
			url : $ep.util.CURI ( _mngbbs.sysdir + "/api/data/collections/name/bbs.categorylist.other", { "ps" : 999, "category" : __key } ).url
			,type : "get"
			,resultType : "json"
			,success : function (_data, _txt, _xhr) {
				//리스트 그리기
				var __ele = $('<span></span>')
				,__tree = [], __children=[], __temp
				;
				$.each(_data, function (_idx, _entry) {
					if ( _entry["@indent"] == "1" ) {
						__temp = {
							title : _entry._name
							,folder : true
							,iscategory : _entry._actiontype=="3" ? false : true
							,code : _entry._code + (_entry._code2 ? "^"+_entry._code2 : "")
							,unid : _entry["@unid"]
						};
						__tree.push(__temp);
					} else {
						!("children" in __tree[__tree.length-1]) && ($.extend(__tree[__tree.length-1],{children:[]}));
						__tree[__tree.length-1].children.push({
							title : _entry._name
							,folder : false
							,iscategory : _entry._actiontype=="3" ? false : true
							,code : _entry._code + (_entry._code2 ? "^"+_entry._code2 : "")
							,unid : _entry["@unid"]
						});
					}
				});
				$(__ele).eptree({
					source : __tree
					,autoCollapse : true
					,init : function (_e, _o) {
						var _child = _o.tree.getRootNode().children[0]
						;
						_child && _child.setExpanded(true);
					}
					,click : function (_e, _o) {
						if (_o.targetType=="expander") return;
						var __node = _o.node
						;
						if ( __node.data.iscategory ) {
							__bbscode = __node.data.code;
							__bbsunid = __node.data.unid;
							__bbstitle = __node.title;
							$($ep.ui.active()).epdialog("close", {isvalue : true});
							return;
						}
						( __node.folder ) && __node.toggleExpanded(__node.isExpanded());
					}
				});
				$ep.ui.dialog({
					title : "{FORM.TITLESELECTBBS}", width : 300, height : 400
					,content : {html : __ele}
					,buttons : [ {text : "{FORM.CANCEL}", click : function () { $($ep.ui.active()).epdialog("close");}} ]
					,close : function (_e, _o) {
						if ( __bbstitle == "" ) return;
						$("[name=bbs_default]", __active).val(__bbstitle);
						$("[name=bbs_default_unid]", __active).val(__bbsunid);
						$("[name=bbs_default_code]", __active).val(__bbscode);
						// 게시판 디렉토리는 To-Be 에서 삭제 됨
						//$("[name=bbs_default_path]", __active).val( /*게시판 디렉토리*/ );
					}
				}, $sv);
			}
		});
	}
	function _createOrgan () {
		var __active = $ep.ui.active()
		,__doc = $sv.options.doc
		;
		__doc.grid = $ep.ui.organgrid (
			$( ".organ_result_grid", __active )
			,{
			display : "all"
			,select : "all"
			,server : $sv.options.doc.server
			,expandTree : $sv.options.doc.companycode + "^" + $sv.options.doc.curAllGroupCode
			,hideupdown : true
			,grid : {
				classes : ""
				,height : 150
				,draggable : false
			}
			,dataset : function() {
				return $ep.util.stringToObject(__doc.recipient_info_list);
			}
		});
	}
	/////////////////////////////////////////////////////////////////////////////
	// Action List 
	/////////////////////////////////////////////////////////////////////////////
	function _submit (_action) {
		var __active = $ep.ui.active()
		,__bValid = true
		;
		switch(_action){
		case "regist":
			if ( !_validate()) {
				return false;
			} else {
				if (!_regist(__bValid)) {
					return false;
				}
			}
			break;
		case "draft":
			_regist(__bValid = false);
			break;
		}
		
		// 문항수 저장
		$("input[name=questioncount]", __active).val($sv.options.doc.tmpquestioncount);
		
		$("[name=Action]", __active).val(_action);
		this.submit(__bValid);
	}
	function _resend () {
		var __active = $ep.ui.active()
		,__doc = $sv.options.doc
		;
		_process({
			action : "resend"
			,dbpath : __doc.dbpath
			,unids : __doc.unid
		}, function (_data, _result, _xhr) {
			if (_data.result == "success") {
				$ep.util.toast ( $sv.LangString("MESSAGE.RETRANSMIT"), 1500, function () {
					_$doc.close();
				});
			} else {
				$ep.util.toast ( $sv.LangString("ERROR.RETRANSMIT"), 1500);
			}
		});
	}
	function _viewdelete () {
		var __o = this.getSelected()
			,__unids=[]
			,__length = __o.length
		;
		if ( !__o.length ) { $ep.util.toast ( $sv.LangString("VALIDATE.SELECT_DELETE_DOC") ); return; }
		
		__unids = $ep.Array( __o ).datafilter ( function ( idx, val ) { return val.data["@unid"]; } );
		
		_process({dbpath : $sv.options.view.dbpath, action : "viewdelete", unids : __unids.join("|")}, (function (_self) {
			return function () {
				$ep.util.toast ( $sv.LangString("MESSAGE.DELETE_COUNT").replace(/\{1\}/g, __length) );
				_self.refresh ();
			}
		})(this));
	}
	function _docdelete () {
		// 문서에서 삭제 처리
		_process({dbpath : this.options.dbpath, action : "docdelete", unids : this.options.unid}, (function (_self) {
			return function (_txt) {
				if (_txt.indexOf("success") > -1)
					$ep.util.toast ( $sv.LangString("MESSAGE.DOC_DELETE"), 1500, function () {_self.close()});
				else {/*_self.close();*/}
			}
		})(this));
	}
	function _viewresult (_unid, _appcode) {
		var __options = this.options
		,__url = "/" + __options.dbpath + "/viewresult/" + (_unid||__options.unid) + "?opendocument"
		;
		_block();
		$ep.ui.loadPageLang($ep.ui.active(), __url, $sv, {
			before : function () {
				//__block.unblock();
			}
		});
	}
	function _submitsurvey () {
		var __saveData = _checkSurveyItem()
		;
		if ( !__saveData ) {
			return false;
		}
		_process({
			dbpath : $sv.options.doc.dbpath, action : "submitsurvey", unids : $sv.options.doc.unid
			,questionresult : __saveData.result
			,questionetcresult : __saveData.etcresult
		}, (function (_self) {
			return function ( _data, _result, _object ) {
				if ( _data.result == "success" ) {
					$ep.util.toast ( $sv.LangString("MESSAGE.THANKS"), 1500, function () {
						_self.close();
					});
				} else {
					$ep.util.toast ( $sv.LangString(_data.message), 1500 );
				}
			}
		})( _$doc ));
	}
	function _statistic () {
		var __active = $ep.ui.active()
		,__url = "/" + $sv.options.doc.dbpath + "/getExcelStr?Openagent&docid=" + $sv.options.doc.unid + "&lang=" + $ep.lang()
		,__iframe = $("<iframe style=\"display:none\" src=\""+__url+"\" />").appendTo(__active)
		;
		setTimeout ( function () { __iframe.remove(); }, 2000 + ($sv.options.doc.questionresult.count * 6.5) );
	}
	function _prolongation () {
		// TODO
		$ep.ui.dialog({
			title : "{FORM.EXPIRATIONEXTENDED}"
			,height : 230
			,width : 400
			,content : {
				url : "/res/ngw/eip/survey/html/prolongation.html"
			}
			,buttons : [
				{text : "{FORM.CONFIRM}", highlight : true, click : function () {
					var __active = $ep.ui.active()
					,__doc = $sv.options.doc
					,__edate = $(".prolongation [name=edate]", __active)
					;
					$(this).epdialog("close");
					
					_process({
						action : "prolongation"
						,dbpath : __doc.dbpath
						,param : __edate.val()
						,unids : __doc.unid
					}, function (_data, _result, _xhr) {
						if (_data.result == "success") {
							$ep.util.toast ( $sv.LangString("MESSAGE.CHANGECOMPLETE") , 1200, function () {
								_$doc.reload();
							});
						} else {
							$ep.util.toast ( $sv.LangString("ERROR.RETRANSMIT"), 1500);
						}
					});
				}}
				,{text : "{FORM.CANCEL}", click : function () { $(this).epdialog("close"); }}
			]
		}, $sv);
	}
	function _getactions ( _actionlist , _app ) {
		var __lists = _actionlist.split ( "|" )
		,__return = {}
		,__actions = {
			// 편집
			edit : { show : true, text : "{ACTION.EDIT}", click : function () { this.editDocument (); } }
			// 닫기
			,close : { show : true, text : "{ACTION.CLOSE}", click : function () { this.close (); } }
			// 문서에서 삭제
			,docdelete : { show : true, text : "{ACTION.DELETE}", click : _docdelete}
			// 새로운문서
			,newdoc : { show : true, text : "{ACTION.CREATE}", click : function () { $sv.newDoc (); } }
			// 보기에서 삭제
			,viewdelete : { show : true, text : "{ACTION.DELETE}", click : _viewdelete }
			// 재발송
			,resend : { show : true, text : "{ACTION.RESEND}", click : function () { _resend(); } }
			// 결과보기
			,viewresult : { show : true, text : "{ACTION.VIEWRESULT}", click : function () { _viewresult.call (this); } }
			// 설문응답
			,submitsurvey : { show : true, text : "{ACTION.SUBMITSURVEY}", click : function () { _submitsurvey(); /*_submit.call (this, "submitsurvey");*/ } }
			// 설문등록
			,regist : { show : true, text : "{ACTION.REGIST}", click : function () { _submit.call (this, "regist"); } }
			// 임시저장
			,draft : { show : true, text : "{ACTION.DRAFT}", click : function () { _submit.call (this, "draft"); } }
			// 통계-엑셀
			,statistic : { show : true, text : "{ACTION.STATISTIC}", click : function () { _statistic() } }
			// 기간연장
			,prolongation : { show : true, text : "{ACTION.PROLONGATION}", click : function () { _prolongation() } }
		}
		;
		for (var i = 0 ; i < __lists.length ; i++) __return[__lists[i]] = ( _app || __actions) [__lists[i]]
		return _actionlist ? { "action" : __return } : __actions;
	}
	/////////////////////////////////////////////////////////////////////////////
	// Method
	/////////////////////////////////////////////////////////////////////////////
	$.extend($sv, {
		set_notify : function (val) {
			$("#DIV_NOTIFY_TARGET", $ep.ui.active()).css("display" , val=="1" ? "block" : "none");
		}
		,change_notify : function (val) {
			var __active = $ep.ui.active()
			;
			$("#show_bbs", __active).css("display" , val=="1" ? "block" : "none");
			$("#show_org", __active).css("display" , val!="1" ? "block" : "none");
		}
		,select_bbs : function () {
			$ep.util.getApp( "bbs.bbsmng", $sv.options.doc.companycode, function (data) {
				_select_bbs(data);
			});
		}
		,newDoc : function(_opt){
			$ep.ui.loadPageLang(
				$ep.ui.active()
				,$ep.util.CURI("/" + _opt.dbpath + "/fSurvey?Openform", {cd:_opt.appcode, comcode:_opt.comcode}).url
				,this
			);
		}
		,addQuestion : function () {
			_addQuestion ($("#question", $ep.ui.active()), ++this.options.doc.tmpquestioncount);
			$("[name=tmpquestioncount]", $ep.ui.active()).val(this.options.doc.tmpquestioncount);
		}
		,saveQuestionList : function () {
			_saveQuestionList();
		}
		,eventCountField : function () {
			var __active = $ep.ui.active()
			,__tmpcount = $sv.options.doc.tmpquestioncount // 현재 보여지는 개수
			,__count = parseInt($("[name=tmpquestioncount]", __active).val() , 10)||0 // 변경 입력 한 개수
			;
			if ( __tmpcount != __count ) {
				$sv.create_question();
			}
		}
		,create_question : function () {
			var __active = $ep.ui.active()
			,__tmpcount = $sv.options.doc.tmpquestioncount // 현재 보여지는 개수
			,__count = parseInt($("[name=tmpquestioncount]", __active).val() , 10)||0 // 변경 입력 한 개수
			,__sel = $("#question", __active)
			,__start = 1
			,__new = true
			;
			if ( __count > __tmpcount ) {
				if ( confirm( $sv.LangString("MESSAGE.CONFIRM1") ) ) { //기존 문제를 유지하시고 신규 문제를 추가하시겠습니까?\n([취소]일 경우 기존문제는 삭제됩니다)
					__start = (__tmpcount + 1);
					__new = false;
				}
			} else if ( __tmpcount == __count ) {
				if ( !confirm( $sv.LangString("MESSAGE.CONFIRM2") ) ) { //신규 작성할 문제수와 기존 문제수가 동일합니다.\n전체를 신규로 작성하시겠습니까?
					return false;
				}
			} else {
				if ( confirm( $sv.LangString("MESSAGE.CONFIRM3") ) ) { //기존 문제수가 신규 문제수보다 더 많습니다.\n([취소]일 경우 기존문제를 삭제됩니다)
					for ( var i = __tmpcount-1 ; i > __count-1 ; i--){
						_removeQuestion( $sv.question[i].selector );
					}
					$sv.options.doc.tmpquestioncount = __count;
					return false;
				}
			}
			__new && __sel.empty();
			for (var i = __start ; i <= __count ; i++) {
				_addQuestion ($("#question", __active), i) ;
			}
			$sv.options.doc.tmpquestioncount = __count;
		}
	});
	/////////////////////////////////////////////////////////////////////////////
	// Question functions
	/////////////////////////////////////////////////////////////////////////////
	function __RX__(X_, json){
		var tmp = X_ || ""
		,s
		;
		for (s in json) 
			tmp = tmp.replace(new RegExp("#\\{" + s + "\\}", "g"), json[s]);
		return tmp.replace(/\#\{[a-zA-Z0-9]*\}/g, "");
	}
	function _getJsonEntry (_entries, _idx) {
		var __entry = {}
		;
		$.each(_entries, function (_idx, _data) {
			var __split = _data.split("=")
			;
			if ( __split.length > 1 ) {
				__entry[__split[0]] = __split[1];
			}
		});
		if ( _idx !== undefined ) __entry.index = _idx;
		return __entry;
	}
	function _getDisplayForItem (_entry) {
		var __html = ""
		,__splitItemContents
		,__itemContent = ""
		;
		
		var _table = "<table class=\"frm_tbl\" id=\"#{id}\"><colgroup><col width=\"110px\" /><col /></colgroup><tbody>#{tr}</tbody></table>"
		,_contentspan = "<p><span class=\"#{classname}\" style=\"width:100%\">#{content}</span></p>"
		,_radio = "<label><input type=\"radio\" name=\"dspitem#{index}\" value=\"#{value}\" #{checked} data-etc=\"#{etc}\">#{label}</label>"
		,_checkbox = "<label><input type=\"checkbox\" name=\"dspitem#{index}\" value=\"#{value}\" #{checked} data-etc=\"#{etc}\">#{label}</label>"
		,_contentTd = "<td>#{item}#{content}</td>"
		,_input = "<input type=\"text\" style=\"width:#{width};\" name=\"#{name}\" value=\"#{value}\">"
		;
		
		__html += ("<th>" + _entry.index + " " + (_entry.itemval=="1" ? "*" : "") + "</th>");
		
		switch ( _entry.itemkind ) {
		case "1":
			__itemContent = __RX__(_radio, {
				index : _entry.index
				,value : "yes"
				,label : $sv.LangString("FORM.YES")
				,checked : ""
			}) + "<br /><br />" + __RX__(_radio, {
				index : _entry.index
				,value : "no"
				,label : $sv.LangString("FORM.NO")
				,checked : ""
			});
			
			__html += __RX__(_contentTd, {
				item : "<p>"+_entry.item+"</p>"
				,content : __RX__(_contentspan, {
					content : __itemContent
					,classname : "radio-area"
				})
			});
			break;
		case "2":
			if ( _entry.itemcontent != "" ) {
				__splitItemContents = _entry.itemcontent.split ( ";" );
				$.each(__splitItemContents, function (__idx, __data) {
					if ( __data == "" ) return true;
					
					__itemContent += __RX__(_radio, {
						index : _entry.index
						,value : __idx+1
						,label : __data
						,checked : ""
						,etc : ((__idx == (__splitItemContents.length-1)) && (_entry.itemetc=="1") ? "1" : "")
					});
					if ( (__idx == (__splitItemContents.length-1)) && (_entry.itemetc=="1") ) {
						__itemContent += "&nbsp;&nbsp;" + __RX__(_input, {
							name : "dspetcitem" + _entry.index
							,value : ""
							,width : "60%"
						});
					}
					(__idx < (__splitItemContents.length-1)) && (__itemContent += "<br /><br />");
				});
				__html += __RX__(_contentTd, {
					item : "<p>"+_entry.item+"</p>"
					,content : __RX__(_contentspan, {
						content : __itemContent
						,classname : "radio-area"
					})
				});
			}
			break;
		case "3":
			if ( _entry.itemcontent != "" ) {
				__splitItemContents = _entry.itemcontent.split ( ";" );
				$.each(__splitItemContents, function (__idx, __data) {
					if ( __data == "" ) return true;
					
					__itemContent += __RX__(_checkbox, {
						index : _entry.index
						,value : __idx+1
						,label : __data
						,checked : ""
						,etc : ((__idx == (__splitItemContents.length-1)) && (_entry.itemetc=="1") ? "1" : "")
					});
					if ( (__idx == (__splitItemContents.length-1)) && (_entry.itemetc=="1") ) {
						__itemContent += "&nbsp;&nbsp;" + __RX__(_input, {
							name : "dspetcitem" + _entry.index
							,value : ""
							,width : "60%"
						});
					}
					(__idx < (__splitItemContents.length-1)) && (__itemContent += "<br /><br />");
				});
				__html += __RX__(_contentTd, {
					item : "<p>"+_entry.item+"</p>"
					,content : __RX__(_contentspan, {
						content : __itemContent
						,classname : "chkbox-area"
					})
				});
			}
			break;
		case "4":
			__html += __RX__(_contentTd, {
				item : "<p>"+_entry.item+"</p>"
				,content : "<p>" + __RX__(_input, {
					name : "dspitem" + _entry.index
					,value : ""
					,width : "100%"
				}) + "</p>"
			});
			break;
		}
		
		return __RX__(_table, {
			tr : "<tr>"+__html+"</tr>"
			,id : "question_table" + _entry.index
		})
	}
	
	function _forDisplay () {
		var __active = $ep.ui.active()
		,__list = $sv.options.doc.questionlist
		,__splitList = __list.split("##")
		,__sel = $("#question", __active)
		;
		if ( __list == "" ) { return true; }
		else {
			$.each(__splitList, function (_idx, _data) {
				var __entries = _data.split("^")
				,__json = _getJsonEntry(__entries, _idx+1)
				;
				if (_data != "") {
					__sel.append(_getDisplayForItem(__json));
				}
			});
		}
	}
	
	function _getQuestionHTML(_index){
		var __table_class = "frm_tbl"
		,__bodyhtml = ""
		,__index = _index||1
		,__questiontableid = "questiontable" + __index
		,__itemAttribute = {
			itemkind : "class=\"questionitem itemkind\" data-name=\"itemkind\" name=\"itemkind"+__index+"\""
			,item : "class=\"questionitem item\" data-name=\"item\" name=\"item"+__index+"\""
			,itemcontent : "class=\"questionitem itemcontent\" data-name=\"itemcontent\" name=\"itemcontent"+__index+"\""
			,itemetc : "class=\"questionitem itemetc\" data-name=\"itemetc\" name=\"itemetc"+__index+"\""
			,itemval : "class=\"questionitem itemval\" data-name=\"itemval\" name=\"itemval"+__index+"\""
			,itemmax : ""
			,max_answer : "class=\"questionitem max_answer chknum\" data-name=\"max_answer\" name=\"max_answer"+__index+"\""
			,itemsel : ""
			,itemselcontent : ""
			,selectitemkind : "class=\"questionitem selectitemkind\" data-name=\"selectitemkind\" name=\"selectitemkind"+__index+"\""
			,selectnumber : "class=\"questionitem selectnumber\" data-name=\"selectnumber\" name=\"selectnumber" + __index + "\""
			,select_ex : "class=\"questionitem select_ex\" data-id=\"select_ex\" id=\"select_ex" + __index + "\""
			,show_select : "class=\"questionitem show_select\" data-id=\"show_select\" id=\"show_select" + __index + "\""
			,show_select1 : "class=\"questionitem show_select1\" data-id=\"show_select1_\" id=\"show_select1_" + __index + "\""
			,show_select2 : "class=\"questionitem show_select2\" data-id=\"show_select2_\" id=\"show_select2_" + __index + "\""
			,show_itemcontent : "class=\"questionitem show_itemcontent\" data-id=\"show_itemcontent\" id=\"show_itemcontent" + __index + "\""
		}
		;
		
		__bodyhtml = ""
			+"<table id=\"" + __questiontableid + "\" class=\""+__table_class+"\">"
			+"	<colgroup>"
			+"		<col style=\"width:110px;\" />"
			+"		<col style=\"width:100px;\" />"
			+"		<col />"
			+"	</colgroup>"
			+"	<tbody>"
			+"		<tr>"
			+"			<th rowspan=\"6\" class=\"txtC verticalT\">"
			+"				<p>"
			+"					<span id=\"seq_question\">"+__index+"</span> <span class=\"ep-icon delete verticalM ml10\"></span>"
			+"				</p>"
			+"			</th>"
			+"			<td class=\"txtC\">{FORM.TYPE}</td>"
			+"			<td>"
			+"				<p class=\"radio-area\" style=\"margin-right:35px;\">"
			+"					<label><input type=\"radio\" " + __itemAttribute["itemkind"] + " value=\"1\" /> {FORM.YES}/{FORM.NO}</label>"
			+"					<label><input type=\"radio\" " + __itemAttribute["itemkind"] + " value=\"2\" /> {FORM.ONEANSWER}</label>"
			+"					<label><input type=\"radio\" " + __itemAttribute["itemkind"] + " value=\"3\" /> {FORM.MULTIANSWERS}</label>"
			+"					<label><input type=\"radio\" " + __itemAttribute["itemkind"] + " value=\"4\" /> {FORM.DESCRIPTIVE}</label>"
			+"				</p>"
			+"				<p class=\"chkbox-area\">"
			+"					<label><input type=\"checkbox\" " + __itemAttribute["itemval"] + " /> {FORM.REQUIRED}</label>"
			+"				</p>"
			+"			</td>"
			+"		</tr>"
			+"		<tr>"
			+"			<td class=\"txtC\">{FORM.QUESTION}</td>"
			+"			<td><input type=\"text\" style=\"width:100%;\" "+__itemAttribute["item"]+" /></td>"
			+"		</tr>"
			+"		<tr "+__itemAttribute["show_itemcontent"]+" style=\"display:none;\">"
			+"			<td class=\"txtC verticalT\"><p style=\"margin-top:23px;\">{FORM.ITEM}</p></td>"
			+"			<td>"
			+"				<p>"
			+"					<span class=\"chkbox-area\">"
			+"						<label><input type=\"checkbox\" "+__itemAttribute["itemetc"]+" /> {FORM.USEOTHOR}</label>"
			+"					</span>"
			+"					<span class=\"ml20 multimax\" style=\"display:none\">"
			+"						* {FORM.RESTRICTION} : <input type=\"text\" style=\"text-align:center;width:40px;\" value=\"\" "+__itemAttribute["max_answer"]+" />"
			+"					</span>"
			+"				</p>"
			+"				<textarea style=\"width:100%; height:70px;\" " + __itemAttribute["itemcontent"] + "></textarea>"
			+"				<p style=\"color:#7a9ccc;\">※ {FORM.USESEMICOLON}</p>"
			+"			</td>"
			+"		</tr>"
			+"		<tr " + __itemAttribute["show_select"] + " style=\"display:" + (__index==1 ? "none" : "table-row") + ";\">"
			+"			<td class=\"txtC\">{FORM.BRANCH}</td>"
			+"			<td>"
			+"				<p class=\"radio-area\">"
			+"					<label><input type=\"radio\" " + __itemAttribute["selectitemkind"] + " value=\"1\" /> {FORM.YES}</label>"
			+"					<label><input type=\"radio\" " + __itemAttribute["selectitemkind"] + " value=\"2\" checked /> {FORM.NO}</label>"
			+"				</p>"
			+"			</td>"
			+"		</tr>"
			+"		<tr " + __itemAttribute["show_select1"] + " style=\"display:none;\">"
			+"			<td class=\"txtC\">{FORM.TARGETNUMBER}</td>"
			+"			<td><input type=\"input\" readonly " + __itemAttribute["selectnumber"] + " value=\""+(__index-1)+"\" style=\"text-align:center;width:40px\" /></td>"
			+"		</tr>"
			+"		<tr " + __itemAttribute["show_select2"] + " style=\"display:none;\">"
			+"			<td class=\"txtC\"><span class=\"btn-view-sel-ex\"></span></td>"
			+"			<td><span " + __itemAttribute["select_ex"] + "></span></td>"
			+"		</tr>"
			+"	</tbody>"
			+"</table>"
		;
		
		return __bodyhtml||"";
	}
	function _removeQuestion ( _table ) {
		var __active = $ep.ui.active()
		,__thisIndex = parseInt($("#seq_question", _table).text(), 10)
		,__idx = __thisIndex - 1
		,__entry
		,__questionitems
		,__seq
		;
		
		if ( isNaN(__thisIndex) ) return false;
		
		_table.remove();
		
		$sv.question.splice(__idx, 1);
		
		for ( ; __idx < $sv.question.length ; __idx++){
			__entry = $sv.question[__idx];
			__questionitems = $(".questionitem", __entry.selector);
			__seq = (__idx+1);
			
			__entry.tableid = ("questiontable" + __seq);
			$("#seq_question", __entry.selector).text(__seq);
			
			__entry.selector.attr("id", __entry.tableid);
			
			$(__questionitems).each(function () {
				var __d = $(this)
				,__dataName = __d.attr("data-name")
				,__dataId = __d.attr("data-id");
				;
				!!__dataName && __d.attr("name", __dataName + __seq);
				!!__dataId && __d.attr("id", __dataId + __seq);
			});
			$("[name=selectnumber"+__seq+"]", __entry.selector).val(__idx);
			
			if ( __idx == 0 ) {
				$("[name=selectitemkind1][value=2]", __entry.selector).prop("checked",true);
				$("[id=show_select1], [id=show_select1_1], [id=show_select2_1]", __entry.selector).css("display", "none");
				$("[id=select_ex1]", __entry.selector).text("");
			}
		}
		
		$("input[name=tmpquestioncount]", __active).val(--$sv.options.doc.tmpquestioncount);
	}
	function _addQuestion (_sel, _index, _entry) {
		var __active = $ep.ui.active()
		,__questiontable = $( $sv.LangPatternString(_getQuestionHTML(_index)) ).appendTo(_sel)
		;
		
		if ( !__questiontable.size() ) return false;
		
		// 초기값
		if ( _entry ) {
			// 형식
			$(".itemkind[value="+_entry.itemkind+"]", __questiontable).prop("checked", true);
			// 문제
			$(".item", __questiontable).val ( _entry.item );
			// 필수
			_entry.itemval=="1" && $(".itemval", __questiontable).prop("checked", true);
			// 형식 단답형, 다답형
			if ( _entry.itemkind == "2" || _entry.itemkind == "3" ) {
				//단답형, 다답형 보이기
				$(".show_itemcontent", __questiontable).css("display", "table-row");
				//답변 내용
				$(".itemcontent", __questiontable).val ( _entry.itemetc=="0" ? _entry.itemcontent : (function (_d) {
					var _dSplit = _d.split(";");
					return Array.prototype.slice.call(_dSplit, 0, _dSplit.length-1).join(";");
				})(_entry.itemcontent));
				// 기타 설정
				_entry.itemetc=="1" && $(".itemetc", __questiontable).prop("checked", true);
				// 최대 선택 수
				_entry.itemkind == "3" && $(".multimax", __questiontable).css("display", "inline");
				_entry.itemkind == "3" && $(".max_answer", __questiontable).val(_entry.itemmax);
			}
			// 분기
			$(".selectitemkind[value="+_entry.itemsel+"]", __questiontable).prop("checked", true);
			if ( _entry.itemsel == "1" ) {
				//분기 테이블 보이기
				$(".show_select1, .show_select2", __questiontable).css("display", "table-row");
				//분기 내용
				$(".select_ex", __questiontable).text ( _entry.itemselcontent );
			}
		} else {
			$(".itemkind[value=1]", __questiontable).prop("checked", true);
		}
		
		// 이벤트 처리
		// 단답형, 다답형
		$(".itemkind", __questiontable).on("click", function () {
			var _thisIndex = parseInt($("#seq_question", __questiontable).text(), 10)
			;
			$("#show_itemcontent" + _thisIndex, __questiontable).css("display", "2,3".indexOf(this.value) > -1 ? "table-row" : "none");
			$(".multimax", __questiontable).css("display", this.value=="3" ? "inline" : "none");
		});
		
		// 분기
		$(".selectitemkind", __questiontable).on("click", function () {
			var _thisIndex = parseInt($("#seq_question", __questiontable).text(), 10)
			,_prev = $(".selectitemkind", $("#questiontable"+(_thisIndex-1), __active))
			,_next = $(".selectitemkind", $("#questiontable"+(_thisIndex+1), __active))
			;
			
			if (_prev.size() > 0) {
				if ( _prev.filter(":checked").val() == "1" ) {
					$ep.util.toast(
						__RX__( $sv.LangString("MESSAGE.ADDQUESTION1"), {"1" : (_thisIndex-1)} //(_thisIndex-1) + "번 문제가 분기설정되었기 때문에 분기설정할 수 없습니다."
						), 1500	
					);
					
					$(".selectitemkind", __questiontable).filter("[value='2']").prop("checked", true);
					return;
				}
			}
			if (_next.size() > 0) {
				if ( _next.filter(":checked").val() == "1" ) {
					$ep.util.toast(
						__RX__( $sv.LangString("MESSAGE.ADDQUESTION1"), {"1" : (_thisIndex+1)} //(_thisIndex+1) + "번 문제가 분기설정되었기 때문에 분기설정할 수 없습니다."
						), 1500	
					);
					$(".selectitemkind", __questiontable).filter("[value='2']").prop("checked", true);
					return;
				}
			}
			$("[id^=show_select1_], [id^=show_select2_]", __questiontable).css("display", this.value=="1"?"table-row":"none");
		});
		
		$(".chknum", __questiontable).bind({
			"keyup": function (e) {
				if ((Array.prototype.indexOf ? _exceptionKey : $ep.Array(_exceptionKey)).indexOf(e.which || e.keyCode) != -1 ) return true;
				if(!_numcheck.call(this)){
					this.select();
					$ep.util.toast($sv.LangString("VALIDATE.ONLY_NUMBER"), 1500);
				}
			}
		});
		
		// 삭제
		$(".ep-icon.delete", __questiontable).on("click", function () {
			var _thisIndex = parseInt($("#seq_question", __questiontable).text(), 10)
			;
			$ep.ui.dialog({
				title : "{ACTION.DELETE}"
				,height : 160
				,width : 340
				,content : {
					html : __RX__($sv.LangString("MESSAGE.QUESTIONDELETE"), {"1" : _thisIndex}) //_thisIndex + "번 문제를 삭제하시겠습니까?"
				}
				,buttons : [
					{text : "{FORM.CONFIRM}", highlight : true, click : function () {
						$(this).epdialog("close");
						_removeQuestion(__questiontable);
					}}
					,{text : "{FORM.CANCEL}", click : function () { $(this).epdialog("close"); }}
				]
			}, $sv);
		});
		
		// 버튼
		// 보기선택
		$(".btn-view-sel-ex", __questiontable).epbutton({
			text : $sv.LangString("FORM.ITEMSELECT")
			,show : true
			,click : function () {
				var _selectNumber = $(".selectnumber", __questiontable).val()
				,_selKind = $(".itemkind", $("#questiontable"+_selectNumber, __active))
				,_selContent = $(".itemcontent", $("#questiontable"+_selectNumber, __active))
				,_thisIndex = parseInt($("#seq_question", __questiontable).text(), 10)
				,_kind
				,_width = 400
				,_height = 300
				,_html = ""
				,_split = []
				;
				if( _selKind.size() > 0 ) {
					_kind = _selKind.filter(":checked").val();
					if ( !_kind ) {
						$ep.util.toast( __RX__($sv.LangString("MESSAGE.SELECTTYPE"), {"1" : _selectNumber}), 1500 );
						return false;
					}
					if ( _kind == "4" ) {
						$ep.util.toast( __RX__($sv.LangString("MESSAGE.NOSELECTITEM"), {"1" : _selectNumber}), 1500 );
						return false;
					}
					
					_html += "<div class=\"ip-sel-wrap\">";
					_html += "<table class=\"frm_tbl\"><colgroup><col width=\"100px\"><col /></colgroup><tbody><tr>";
					_html += "<th>" + $sv.LangString("FORM.ITEM") + "</th><td>";
					
					if ( _kind == "1" ){
						_html += "<div class=\"radio_area\">"
							+"<label><input type=\"radio\" class=\"dspitem\" name=\"dspitem\" value=\"" + $sv.LangString("FORM.YES") + "\" /> " + $sv.LangString("FORM.YES") + "</label><br />"
							+"<label><input type=\"radio\" class=\"dspitem\" name=\"dspitem\" value=\"" + $sv.LangString("FORM.NO") + "\" /> " + $sv.LangString("FORM.NO") + "</label>"
							+"</div>"
						;
					} else {
						_split = _selContent.val().split(";");
						_html += "<div class=\"chkbox_area\">";
						for ( var i = 0 ; i < _split.length ; i++) {
							if ( _split[i] != "" ) {
								_html += "<label><input type=\"checkbox\" class=\"dspitem\" name=\"dspitem\" value=\""+_split[i]+"\" /> "+_split[i]+"</label><br />";
							}
						}
						_html += "</div>";
					}
					
					_html += "</td></tr></tbody></table>";
					_html += "</div>";
					
					$ep.ui.dialog({
						title : "{FORM.SELECT}"
						,width : _width
						,height : _height
						,content : {
							html : _html
						}
						,create : function (_e, _ui) {$ep.log("", _ui)}
						,buttons : [
							{text : "{FORM.CONFIRM}", highlight : true, click : function () {
								var _checkditem = $(".dspitem:checked", $ep.ui.active())
								;
								if ( _checkditem.size() <= 0 ) { $ep.util.toast($sv.LangString("MESSAGE.SELECTITEM"), 1500); return true; }
								$(".select_ex", __questiontable).text(_checkditem.map(function () { return this.value ; }).get().join(";"));
								$(this).epdialog("close");
							}}
							,{text : "{FORM.CANCEL}", click : function () { $(this).epdialog("close"); }}
						]
					}, $sv);
				}
			}
		});
		$sv.question.push({
			selector : __questiontable
		});
	}
	function _createQuestion () {
		var __active = $ep.ui.active()
		,__list = $sv.options.doc.questionlist
		,__isList = (__list != "")
		,__splitList = (__isList ? __list.split("##") : null)
		,__sel = $("#question", __active)
		,__tmpquestioncount = $sv.options.doc.tmpquestioncount
		;
		if ( __isList ) {
			$.each(__splitList, function (_idx, _data) {
				var __entries = _data.split("^")
				,__json = _getJsonEntry(__entries, _idx+1)
				;
				
				if (_data != "") {
					_addQuestion(__sel, __json.index, __json);
				}
			});
		} else {
			for (var i = 1 ; i <= __tmpquestioncount ; i++) {
				_addQuestion(__sel, i);
			}
		}
	}
	
	// 저장
	function _makeQuestionListString (_bValid) {
		var __active = $ep.ui.active()
		,__divString = "##"
		,__false = true
		,__list = []
		;
		
		$.each($sv.question, function (_idx, _entry) {
			var __sel = _entry.selector
			,__itemkind, __item, __itemcontent, __itemval, __itemsel, __itemetc, __itemmax_answer, __itemselect_ex, __etc
			,__itemArray = []
			;
			// 입력 데이터
			__itemkind = $(".itemkind:checked", __sel).val(); //형식
			__item = $(".item", __sel).val(); //문제
			__itemcontent = $(".itemcontent", __sel).val().trim(); //답변리스트
			__itemval = $(".itemval", __sel).is(":checked"); //필수입력
			__itemsel = $(".selectitemkind:checked", __sel).val(); //분기여부
			__itemetc = $(".itemetc", __sel).is(":checked"); //기타설정
			__itemmax_answer = $(".max_answer", __sel).val(); //최대 선택 수
			__itemselect_ex = $(".select_ex", __sel).text(); //분기 항목
			
			if ( _bValid ) {
				if ( __item.trim() == "" ) {
					$ep.util.toast( __RX__($sv.LangString("MESSAGE.MAKEQUESTION1"), {"1" : (_idx+1)}), 1500 );
					__false = false;
					return false;
				}
				if ( __itemkind == "2" || __itemkind == "3" ) {
					if ( __itemcontent == "" ) {
						$ep.util.toast( __RX__($sv.LangString("MESSAGE.MAKEQUESTION2"), {"1" : (_idx+1)}), 1500 );
						//alert((_idx+1) + "번째 문제의 예제가 누락되었습니다.");
						__false = false;
						return false;
					}
				}
			}
			
			// 내용을 배열에 넣기
			__itemcontent = __itemcontent.trim().charAt(__itemcontent.length-1)==";"?__itemcontent.substr(0, __itemcontent.length-1):__itemcontent;
			__itemcontent = __itemcontent.replace(/\n/, "");
			__itemArray[__itemArray.length] = "itemkind=" + __itemkind;
			__itemArray[__itemArray.length] = "item=" + __item;
			__itemArray[__itemArray.length] = "itemcontent=" + (__itemkind=="1"||__itemkind=="4" ? "none" : __itemcontent) + (__itemetc ? ";" + $sv.LangString("FORM.ETC") : "");
			__itemArray[__itemArray.length] = "itemetc=" + (__itemkind=="1"||__itemkind=="4" ? "0" : (__itemetc?"1":"0"));
			__itemArray[__itemArray.length] = "itemval=" + (__itemval?"1":"0");
			__itemArray[__itemArray.length] = "itemmax=" + (__itemkind=="3" ? __itemmax_answer : "");
			__itemArray[__itemArray.length] = "itemsel=" + __itemsel ;
			__itemArray[__itemArray.length] = "itemselcontent=" + __itemselect_ex;
			
			// 전체 배열에 넣기
			__list[__list.length] = __itemArray.join("^");
		});
		
		return __false && __list.join(__divString);
	}
	/////////////////////////////////////////////////////////////////////////////
	// view init
	/////////////////////////////////////////////////////////////////////////////
	function _viewentries (_callback) {
		var _option = this.options
		;
		
		_option.query.search ? 
				_callback ( undefined )
		:
			_process ({
				dbpath : _option.dbpath
				,param : (_option.alias + "|" + (_option.query.category ? _option.query.category : "") + "|" + (_option.query.search ? _option.query.search : ""))
				,action : "viewentries"
				,agent : "process_webuser"
			},function (_cnt) {
				var __numeric = /^[0-9]*$/g
				;
				_callback( __numeric.test(_cnt) ? _cnt : "0" );
			})
		;
	}
	function _attachrender ( tr, td, data, col ) {
		if ( data._attach != 0 ) return '<p class="ep-icon attachment" />';
	}
	function _viewColumn (_colList, _app) {
		var __lists = _colList ? _colList.split ( "|" ) : ["_attach","_subject","_date","_status","_author"]
		,__return = {}
		,__columns = {
			// 첨부
			_attach : { css : { width : "20px" }, render : _attachrender }
			// 제목
			,_subject : { title : "{VIEW.COLUMNS.SUBJECT}", type : "multilevel" }
			// 날짜
			,_date : { title : "{VIEW.COLUMNS.DATE}", css : { width : "150px" }, hidewidth : true }
			// 상태
			,_status : { title : "{VIEW.COLUMNS.STATUS}", css : { width : "90px", "text-align":"center" }, hidewidth : true }
			// 작성자
			,_author : { title : "{VIEW.COLUMN.AUTHOR}", css : { width : "150px" }, type : "userinfo" }
		}
		;
		for (var i = 0 ; i < __lists.length ; i++) __return[__lists[i]] = ( _app || __columns) [__lists[i]]
		return __return;
	}
	function _viewList ( _alias ) {
		var
		__default = _viewColumn ("_subject|_date")
		// viewOptions
		, _viewOptions = {
			// 최근게시물
			progress : { column : __default }
			// 카테고리 게시물
			,complete : { column : __default }
			// 작성중인 글
			,alldoc : { column : _viewColumn("_subject|_date|_status") }
			// 내 작성 글
			,draft : { column : $.extend({selectable:"checkbox"}, __default), actions : _getactions("viewdelete") }
		}
		;
		return $.extend(_viewOptions[ _alias ], {extcount : _viewentries});
	}
	$sv.viewInit = function (_opt) {
		$sv.options.view = _opt;
		
		var _options = $.extend ( true, {}, _viewList (_opt.alias), _opt , {
			search : {
				select : {
					items :	{
						"subject" : "{SEARCH.SUBJECT}"
					}
					,width : 100
				}
			}
			,events : {
				click : function ( row, col, data ) {
					switch(_opt.alias){
					case "draft":
						//this.editDocument( data["@unid"], {comcode : _opt.comcode, appcode : _opt.appcode});
						this.openDocument ( data["@unid"], {comcode : _opt.comcode, appcode : _opt.appcode});
						break;
					/*
					case "complete":
						$ep.ui.setReferer(this.url());
						_viewresult.call(this, data["@unid"], _opt.appcode);
						break;
					*/
					default:
						this.openDocument ( data["@unid"], {cd : _opt.appcode});
						break;
					}
				}
			}
		});
		
		_$view = $ep.ui.view(".viewpage", _options, $sv);
	}
	/////////////////////////////////////////////////////////////////////////////
	// lnb init
	/////////////////////////////////////////////////////////////////////////////
	$sv.sideInit = function (_opt) {
		$sv.options.lnb = _opt;
		
		/*function _viewopen (_n) {
			$ep.ui.loadPageLang("/" + _opt.dbpath + "/viewpage?readform&alias=" + _n + "&cd=" + _opt.appcode + "&comcode=" + _opt.comcode, $sv);
		}*/
		_$lnb = $ep.ui.sidemenu(
			$(".epSideMenu", $ep.ui.activeNav() ),
			{
			button : [{
				text : "{LNB.WRITE}"
				,click : function () {
					_$view.options && _$view.options.dbpath && $ep.ui.setReferer( "/" + _$view.options.dbpath + "/viewpage?" + _$view.options.url );
					$sv.newDoc(_opt);
				}
				,show : true
				,highlight : true
			}]
			,items : [
				{text : "{LNB.MENU01}", isactive : true
				,href : "/" + _opt.dbpath + "/viewpage?readform&alias=progress&cd=" + _opt.appcode + "&comcode=" + _opt.comcode
				}
			    ,{text : "{LNB.MENU02}"
			    ,href : "/" + _opt.dbpath + "/viewpage?readform&alias=complete&cd=" + _opt.appcode + "&comcode=" + _opt.comcode
				}
			    ,{text : "{LNB.MENU03}"
			    ,href : "/" + _opt.dbpath + "/viewpage?readform&alias=alldoc&cd=" + _opt.appcode + "&comcode=" + _opt.comcode
				}
			    ,{text : "{LNB.MENU04}"
			    ,href : $ep.util.CURI("/" + _opt.dbpath + "/viewpage?readform", {
			    	alias : "draft"
			    	,cd : _opt.appcode
			    	,comcode : _opt.comcode
					,category : _opt.notesid
			    }).encode().url
			    }
			]
		}, $sv );	
	}
	/////////////////////////////////////////////////////////////////////////////
	// Doc init
	/////////////////////////////////////////////////////////////////////////////
	function _editdoc (_opt) {
		var __active = $ep.ui.active()
		,__action = _getactions(
			"close"
			+(_opt.docstatus==_docstatus.draft && (_opt.isowner || _opt.ismanager) && !_opt.isnewdoc ? "|docdelete" : "")
			+(_opt.docstatus==_docstatus.draft || _opt.isnewdoc ? "|draft" : "")
			+(_opt.docstatus==_docstatus.draft && _opt.isowner ? "|regist" : "")
			+(_opt.ismanager && _opt.specMailOk != "F" ? "|resend" : "")
		)
		;
		// 게시판 선택
		$(".btn-bbs", __active).epbutton({
			text : $sv.LangString("FORM.BBS")
			,css : {width:"70px"}
			,show : true
			,click : function () { $sv.select_bbs(); }
		});
		
		// 문제 추가
		$(".btn-addquestion", __active).epbutton({
			text : $sv.LangString("FORM.ADD_QUESTION")
			,show : true
			,click : function () { $sv.addQuestion(); }
		});
		
		// 숫자 필드들 처리
		$(".chknum", __active).bind({
			"keyup": function (e) {
				if ((Array.prototype.indexOf ? _exceptionKey : $ep.Array(_exceptionKey)).indexOf(e.which || e.keyCode) != -1 ) return true;
				//if ( _exceptionKey.indexOf ( e.which || e.keyCode ) != -1 ) return true;
				if(!_numcheck.call(this)){
					this.select();
					$ep.util.toast($sv.LangString("VALIDATE.ONLY_NUMBER"), 1500);
				}
			}
		});
		
		// 카운트 입력
		function _tmpCount () { $sv.eventCountField(); }
		$(".tmpcount", __active).bind({
			"blur" : _tmpCount
			,"keydown" : function (e) {
				if (e.keyCode == 13) {
					$(this).off("blur");
					$sv.eventCountField();
					$(this).on("blur", _tmpCount);
				}
			}
		});
		
		// 조직도 처리 $ep.ui.organ
		_createOrgan();
		
		// 문제 그리기
		_createQuestion();
		
		return {action : __action};
	}
	function _readdoc (_opt) {
		var _action = _getactions(
			"close"
			+(_opt.docstatus==_docstatus.draft && _opt.isowner ? "|edit" : "")
			+(_opt.docstatus==_docstatus.draft && (_opt.isowner || _opt.ismanager) ? "|docdelete" : "")
			+(!((_opt.docstatus ==_docstatus.draft || (_opt.select_open=="0" && !_opt.isowner)) && !_opt.ismanager) ? "|viewresult" : "")
			+(_opt.docstatus==_docstatus.registed && !_opt.isdone ? "|submitsurvey" : "")
			+(_opt.ismanager && _opt.specMailOk != "F" ? "|resend" : "")
			+(_opt.docstatus==_docstatus.registed && (_opt.isowner || _opt.ismanager) ? "|prolongation" : "")
		)
		;
		
		_forDisplay(); //읽기 일 때 질문 그리기
		return {action : _action};
	}
	$sv.docInit = function (_opt) {
		var __active = $ep.ui.active()
		,__info = {}
		;
		$sv.options.doc = _opt;
		$sv.question = [/*
			tableid : "questiontableid" + __index
			,selector : __questiontable
		*/];
		__info = (_opt.isedit ? _editdoc(_opt) : _readdoc(_opt));
		
		_$doc = $ep.ui.doc(
			$(".formpage", __active)
			,$.extend(
				_opt
				,{actions : __info.action}
				,{validator:{
					subject : {type:"text", message:"설문주제를 입력 해 주십시오."}
					,tmpquestioncount : {type:"text", message:"문제가 생성 되지 않았습니다.", validate:function (_ele, _val) {
						return !(_val===""||_val==="0"||_val===0);
					}}
				}
				,resultType : "json"
				,events : {
					afterSubmit : function ( xhr, data, ui ) {
						if ( !$.isPlainObject( data ) || data.result !== "success")  {
							ui && ui.unblock && ui.unblock();
							$ep.util.toast ( data.message||$sv.LangString("ERROR.SAVE_ERROR"), "click");
							return false;
						}
						this.close();
					}
					,afterSubmitError : function ( xhr, data, ui ) {
						ui && ui.unblock && ui.unblock();
						$ep.util.toast ( $sv.LangString("ERROR.SAVE_ERROR"), "click");
						return false;
					}
				}}
			)
		,$sv);
	}
	/////////////////////////////////////////////////////////////////////////////
	// Doc Result init
	/////////////////////////////////////////////////////////////////////////////
	function _drawReault (_opt) {
		var __active = $ep.ui.active()
		,__table = ""
		,__html = []
		,__name
		;
		
		if( !("entries" in _opt.questionresult) ) return;
		
		// 기타 내용, 백분율 처리, 색깔 처리
		$.each(_opt.questionresult.entries, function (_idx, _entry) {
			var __list = [] //_entry.itemcontent.split(";")
			,__shortanswer = []
			,__percentage
			,__valueNumiric
			;
			
			if (_entry.itemkind == "1") {
				__list[0] = $sv.LangString("FORM.YES");
				__list[1] = $sv.LangString("FORM.NO");
			} else {
				__list = _entry.itemcontent.split(";");
			}
			
			__html[_idx] = "<tr>";
			__html[_idx] += "<th colspan=\"3\">{FORM.QUESTION} " + (_idx+1) + ". " + _entry.item + "</th>"
			__html[_idx] += "</tr>";
			
			for(var i = 0 ; i < _entry.data.length ; i++){
				if (_entry.itemkind == "4"){
					// 에이전트에서 &^& 로 넘김
					__shortanswer = _entry.data[i].value.split("&^&");
					
					for (var j = 0 ; j < __shortanswer.length ; j++){
						__html[_idx] += "<tr>";
						__html[_idx] += "<td colspan=\"3\">";
						__html[_idx] += "{FORM.DESCRIPTIVE} " + (j+1) + ") " + __shortanswer[j];
						__html[_idx] += "</td>";
						__html[_idx] += "</tr>";
					}
				} else {
					if ( _entry.data[i].tag == "etc" ) {
						if (_entry.data[i].value != "" ) {
							__shortanswer = _entry.data[i].value.split("&^&");
							__valueNumiric = __shortanswer.length;
						} else __valueNumiric = 0;
					} else {
						__valueNumiric = parseInt(_entry.data[i].value, 10);
					}
					
					__percentage = ( __valueNumiric / parseInt(_opt.questionresult.count, 10) ) * 100;
					if (isNaN(__percentage)) {
						__percentage = 0
					} else {
						__percentage = Math.round ( __percentage );
					}
					
					__html[_idx] += "<tr>";
					__html[_idx] += "<td>";
					__html[_idx] += __list[i]
					__html[_idx] += "</td>";
					__html[_idx] += "<td>";
					__html[_idx] += (__percentage==0?"":__percentage+"%")
					__html[_idx] += "</td>";
					__html[_idx] += "<td>";
					__html[_idx] += "<div class=\"process-area\">";
					__html[_idx] += "<span class=\"brown\" style=\"width:" + __percentage + "%;color:white\"></span>";
					__html[_idx] += "</div>";
					__html[_idx] += "</td>";
					__html[_idx] += "</tr>";
					
					if ( _entry.data[i].tag == "etc" ) {
						for (var k = 0 ; k < __valueNumiric ; k++) {
							if ( __shortanswer[k] != "" ) {
								__html[_idx] += "<tr>";
								__html[_idx] += "<td>";
								__html[_idx] += "</td>";
								__html[_idx] += "<td colspan=\"2\">";
								__html[_idx] += "{FORM.ANSWER} " + (k+1) + ") " + __shortanswer[k];
								__html[_idx] += "</td>";
								__html[_idx] += "</tr>";
							}
						}
					}
				}
			}
		});
		__table = "<table class=\"frm_tbl\"><colgroup><col style=\"width:100px;\" /><col style=\"width:50px\"/><col /></colgroup><tbody>"+__html.join("")+"</tbody></table>";
		return $("#question", __active).html( $sv.LangPatternString(__table)); //$(__table.append(__html.join(""))).appendTo();
	}
	$sv.docResultInit = function ( _opt ) {
		var __active = $ep.ui.active()
		;
		
		$sv.options.doc = _opt;
		
		$("#response_count_table", __active).css("display","table-row");
		$("#response_count_span", __active).html(_opt.questionresult.count||"0");

		_drawReault(_opt);

		_$doc = $ep.ui.doc(
			$(".formpage", __active)
			,$.extend(
				_opt
				,{disableicon : ["link","","copy","fold"]}
				,{actions : _getactions("close"
				+ ((_opt.isowner || _opt.ismanager) ? "|statistic" : "")
				)}
				,{events : {
					loadcompleted : function () {
						_unblock();
					}
				}}
			)
		,$sv);
	}
	
	// log function : will delete
	function L() {
		if (window.console == undefined) { window.console = {log : function(){}};}
		var _argv = arguments
		,_l = _argv.length
		,_0 = _argv[0]
		,_A = Array.prototype.slice.call(_argv, (_l>1?1:0))
		;
		if (typeof console.log === "function") {console.log.apply(console, ( _l>1 ? [_0 + " = "].concat( _A ): _A) );}
		else {console.log( (_l>1 ? _0 + " = " : ""), _A.join(" ") );}
		return;
	}
})( eip_survey );