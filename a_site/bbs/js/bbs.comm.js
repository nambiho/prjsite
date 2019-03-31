var bbs_comm = (function (){
	"use strict";
	
	var $comm = {}
	,_ui = $ep.ui
	,_current = []
	,_currentid = ""
	,_applicationcode = ""
	,_comcode = ""
	,_mngApp = null
	,_taskqueue=[]
	
	,_ACTION = {
		draft : "draft"
		,notice : "notice"
		,aftersave : "aftersave"
		,simplesave : "simplesave"
	}
	
	,_CONST = {
		mngCode : "bbs.bbsmng"
		,langprefix : "BBS.COMM"
		,viewclass : ".viewpage"
		,formclass : ".formpage"
		,sidemenuclass : ".epSideMenu"
		//,sidemenuclass : ".epSideMenu_sub"
		,menulistview : "bbs.menulist"
		,categorylistview : "bbs.categorylist"
		,logcode : "bbs.log"
	}
	;
	// 언어팩 상속, prefix 설정
	$ep.inheritStatic ( $comm , _CONST.langprefix, "bbs.comm" );
	
	// task queue 의 내용 실행
	function _runtask(){
		// FIFO
		var __splice = _taskqueue.splice(0,1)
		,__f=null
		;
		if (__splice.length>0){
			__f = __splice[0];
			
			if ($.isFunction(__f)) __f();
			else if ($.isArray(__f)) __f[0].apply(null, Array.prototype.slice.call(__f, 1)); //__f.splice(1, __f.length));
			
			_runtask();
		} else { return false; }
	}
	// ep.method get
	function _$epMethod(){
		var __event = $.Event("ep.method");
		$( ".ep-bodycontent", $ep.ui.active() ).trigger( __event , ["getInstance"] );
		return __event.result || {};
	}
	// 실행 되어진 페이지(문서나 보기)의 current 정보
	function _setCurrentCode (_config) {
		_applicationcode = _config.appcode;
		_comcode = _config.comcode;
		_currentid = _comcode + "." + _applicationcode;
	}
	function _setNullCurrentCode(){
		_applicationcode = "";
		_comcode = "";
		_currentid = "";
	}
	// current object
	function _setCurrentObject ( _config ) {
		if (typeof _config === "undefined" || _config.appcode == "") {
			_setNullCurrentCode ();
			return;
		}
		_setCurrentCode(_config);
		
		// create current array object
		if ( !( _currentid  in _current) ) _current [ _currentid ] = {};
		//$comm.log(
		$.extend ( _current [ _currentid ] , _config, {
			view : {}
			,customView : {}
			,searchview : {}
			,breadcrumb : ""
			,items : []
			,doc : {}
			,iseditable : (_config.isMyCompany && _config.isInEditList) //|| _config.ismanager
		})
		//)
		;
	}
	function __CURI (_uri, _param) {
		return $ep.util.CURI(_uri
			,$.extend(
				{
				cd : _applicationcode
				//,appcode : _applicationcode
				,comcode : _comcode
				}
				,_param
			)
		).url;
	}
	function _getCurrentObject () {
		return ( _currentid in _current ) ? _current [ _currentid ] : {} ;
	}
	function _setConfig ( _config, _callback ) {
		_setCurrentObject(_config);

		// 동기로 받을 때
		//_mngApp = $ep.util.getApp(_CONST.mngCode, _config.comcode, null, {async:false});
		// 비동기로 받을 때
		$ep.util.getApp(_CONST.mngCode, _config.comcode, function (_data){
			_mngApp = _data;
			
			var __current = _getCurrentObject();
			
			( "appcode" in __current )
			&& ( "comcode" in __current )
			&& !( "appInfo" in __current )
			&& ( 
				$ep.util.getApp ( __current.appcode, __current.comcode, function (_data) {
					__current.appInfo=_data;
					// js 로딩
					("jsurl" in __current) && __current.jsurl != "" && $ep.script ( __current.jsurl ).wait();
					
					// langpack 로딩
					if (("langpack" in __current) && __current.langpack != "") {
						$ep.loadLangPack ( __current.langpack ).wait(
							function () {
								//$ep.inheritStatic ( $comm , __current.langpack.toUpperCase() );
							}	
						);
					}
					_callback && $.isFunction(_callback) && _callback ();
				}) 
			);
		});
	}
	
	
	///////////////////////////
	// 개별 함수들
	///////////////////////////
	function _getSearchCategoryString (_c ){
		if ( !_c || _c == "" ) return "";
		var _v = _c.split("^")
		;
		return ( (_v[0] ? "[DocKind]=\"" + _v[0] + "\"" : "") + (_v[1] ? "&[Category]=\"" + _v[1] + "\"" : "") ) || "" ;
	}
	function _process (_data, _callback) {
		var __current = _getCurrentObject()
		;
		$ep.util.ajax ({
			url : "/" + ("dbpath" in _data ? _data.dbpath : __current.dbpath) + "/process?openform"
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
	function _categoryData (nm) {
		var __active = $ep.ui.active()
		,__sel = $( "select[name="+nm+"]", __active )
		,__data = _ui.select(__sel).getSelectedData()
		;
		return __data;
	}
	function _categoryTextSave () {
		var __active = $ep.ui.active()
		,__data = _categoryData("Category")
		,__kinddata = _categoryData("DocKind")
		;
		if (!(__kinddata.isChild)) return true;
		if (!(__data) || (typeof __data.text==="undefined")) return false;
		else {
			$( "input[name=CategoryText]", __active ).val ( __data.text );
			$( "input[name=CategoryLangCode]", __active ).val ( __data.langcode );
			return true;
		}
	}
	function _dockindTextSave () {
		var __active = $ep.ui.active()
		,__data = _categoryData("DocKind")
		;
		if (!(__data) || (typeof __data.text==="undefined")) return false;
		else {
			$( "input[name=DocKindText]", __active ).val ( __data.text );
			$( "input[name=DocKindLangCode]", __active ).val ( __data.langcode );
			return true;
		}
	}
	function _checkCompany ( ) {
		var __active = $ep.ui.active()
		,__current = _getCurrentObject()
		,__doc = __current.doc
		,__dockind = _categoryData("DocKind")
		,__category = _categoryData("Category")
		,companytext = []
		,companycode = []
		;
		$(":checkbox[name=SelectCompany]:checked", __active ).each ( function () {
			if ($(this).val() != __current.comcode) {
				companycode.push( $(this).val() );
			}
			companytext.push(__doc.companylist[$(this).val()]);
		});
		// 카테고리의 companycheck 옵션이 1이면 자신의 회사 외에 다른 계열사를 선택 해야함
		if (__dockind.companycheck=="1" || __category.companycheck=="1") {
			if (companycode.length == 0) {
				$ep.util.toast($comm.LangString("VALIDATE.SELECTCOMPANY"), 1500);
				return false;
			}
		}
		$( "input[name=CompanyNames]", __active ).val ( companytext.join ( ";" ) );
		return true;
	}
	function _noticeTermTextSave ( ) {
		var __active = $ep.ui.active()
		,__sel = $( "select[name=NoticeTerm]", __active )
		,__data = _ui.select(__sel).getSelectedData()
		;
		$( "input[name=NoticeTermText]", __active ).val ( __data.text );
	}
	// TODO
	// 최근게시물에 안보이게 저장
	function _noRecentSave () {
		var __active = $ep.ui.active()
		,__dockind = _categoryData("DocKind")
		,__category = _categoryData("Category")
		;
		$( "input[name=NoRecent]", __active ).val ( __dockind.norecent || __category.norecent || "" );
	}
	function _selectoptions ( nm, items, selected ) {
		var __active = $ep.ui.active()
		,_opttag = []
		,__sel = $( "select[name="+nm+"]", __active )
		,__inst = _ui.select(__sel)
		,__list = []
		;
		if ( typeof items === "undefined" ) {
			$(__sel).empty() && __inst._addItem({});
			__inst.refresh();
			return true;
		}
		if ( items.length == 1 ){
			(selected!="") && (items[0].code!=selected) && (__sel.empty()) && __inst._addItem({});
		} else {
			$(__sel).empty() && __inst._addItem({});
		}
		$.each ( items, function ( idx, data ) {
			__list.push({
				text : data.text
				,id : data.code
				,langcode : data.langcode
				
				// TODO
				// 최근 게시물에서 안보이게 하는 필드 적용 할 부분
				,norecent : data.norecent
				
				,companycheck : data.companycheck
				,isChild : data.isChild
				,selected : (data.code==selected)
			});
		});
		_ui.select(__sel).addItems(__list);
	}
	function _newpost (_param) {
		// ep.method 이벤트를 실행 시켜 수행 할 때
		var __active = $ep.ui.active()
		,__result = _$epMethod()
		,__modulename = ("moduleName" in __result) ? __result.moduleName : ""
		;
		if ( __modulename.indexOf ( "view" ) != -1 ) {
			_ui.view( _CONST.viewclass, __active ).openForm ( "post", $.extend({ cd : _applicationcode, comcode : _comcode } , _param) );
		} else {
			_ui.loadPageLang (
				__active
				,__CURI("/" + _getCurrentObject().dbpath + "/post?openform", _param)
				,$comm
			);
		}
		// Openform을 바로 실행 시킬려면
		//$(".ep-bodycontent",_ui._active()).trigger( "ep.method", ["openForm", "post" , { cd : $comm.getcurrentappcode() } ] );
	}
	function _submit ( _action ) {
		var __active = $ep.ui.active()
		,__current = _getCurrentObject()
		,__doc = __current.doc
		,__info = __current.bbsinfo //__doc.docinfo
		,__bValid = true
		;
		//*
		if ( _action == _ACTION.draft ){
			// Draft Doc
			// dokkind 저장
			_dockindTextSave();
			// category 저장
			_categoryTextSave();
			// not validate
			__bValid = false;
		} else {
			if ( __doc.isResForm ){
				// Response Doc...
			} else {
				// TODO
				// 최근게시물에 안보이게 저장
				_noRecentSave ()
				
				//게시기간 저장
				__info.chkperiod && _noticeTermTextSave ( );
				$( "input[name=tag]", __active ).val( function ( idx, data ) {
					return data.replace ( $comm.special , "" );
				});
				if (__info.chkcompany)	if(!_checkCompany()) return false;
			}
		}
		
		$( "input[name=Action]", __active ).val ( _action );
		
		switch ( _action ) {
		default:
			break;
		}
		// */
		this.submit( __bValid );
	}
	function _createmenuItem ( elem ) {
		var ret = {}
		,__current = _getCurrentObject()
		;

		function _href (_path) {
			var __category = (function(){
				return (elem._usecategory == "1" ?
					(elem._categorytype=="2" ?
						{category : __current.notesid}
					: {category : elem._code + (elem._code2 == "" ? "" : "^" + elem._code2)}	) 
				: {} );
			})()
			,__param = $.extend({
					viewtitle : encodeURIComponent(ret.text)
					,cd : (elem._dbappcode == "" ? __current.appcode : elem._dbappcode)
				}
				,__category
			)
			;
			return __CURI((_path.charAt(0) == "/" ? "" : "/" )
				+ _path
				+ ( elem._action.charAt(0) == "/" ? "" : "/" )
				+ elem._action
			, __param
			)
			;
		}
		
		ret.text = (elem._langcode == "" ? elem._name : $comm.LangPatternString(elem._langcode));
		ret.langcode = elem._langcode || "";
		
		// TODO
		// 최근 게시물에서 안보이게 하는 필드 적용 할 부분
		ret.norecent = elem._norecent || "";
		
		ret.companycheck = elem._companycheck || "0";
		ret.code = elem["@indent"] == 1 ? elem._code : elem._code2;
		if ( elem._active == "1" ) ret.isactive = true ;
		if ( elem._actiontype == "1" ) {
			var fn ;
			eval("fn = function () { "+elem._action+"; }");
			ret.click = fn;
		}
		if ( elem._actiontype == "2" ) {
			if ( elem._dbappcode != "" ) {
				ret.href = _href ( $ep.util.getApp ( elem._dbappcode, __current.appInfo.companycode, null, {async:false} ).sysdir );
			} else {
				ret.href = _href ( __current.dbpath );
			}
		}
		return ret;
	}
	function _getFolderList ( _option, _callback ) {
		var items = []
		,__ischild = false
		;
		
		$ep.util.ajax ({
			url : __CURI ( _mngApp.sysdir + "/api/data/collections/name/" + _option.view, { "ps" : 999, "category" : _option.key } )
			,type : "get"
			,success : function ( data, txt, xhr ) {
				var ret = []
				;
				$( data ).each ( function () {
					var elem = arguments[1]
						,isexist = false
					;
					
					if ( elem["@indent"] == 1 ) {
						ret.push ( _createmenuItem ( elem ) );
						return true;
					}
					for ( var i = 0 ; i < ret.length ; i++ ) {
						isexist = ( ret[i].code == elem._code );

						if ( isexist ) {
							if ( elem["@indent"] == 1 ) { break; }
							else {
								if ( !("items" in ret[i]) ) ret[i].items = [];
								ret[i].items.push ( _createmenuItem ( elem ) ) ;
							}
						}
					}
				});
				// 하위 폴더가 없는 아이템 삭제
				$(ret).each(function (idx, data) {
					if ( !__ischild ) __ischild = ("items" in data);
					data.isChild = ("items" in data);
					if (("items" in data) || ("click" in data) || ("href" in data)) {
						items.push(data);
					}
				});
				_callback && _callback ( items, __ischild );
			}
			,error : function ( data, txt, xhr ) { $ep.log("error", txt) }
		});
	}
	///////////////////////////
	// Action 관련 함수들
	///////////////////////////
	function _write () {
		var __current = _getCurrentObject()
		,__categoryString = ( "category" in __current.view ? __current.view.category : "" )
		;
		_newpost ({
			"category" : __categoryString
		});
	}
	function _simplesave () {
		_submit.call ( this, _ACTION.simplesave );
	}
	function _draftsave () {
		_submit.call ( this, _ACTION.draft );
	}
	function _aftersave () {
		_submit.call ( this, _ACTION.aftersave );
	}
	function _notice () {
		_submit.call ( this, _ACTION.notice );
	}
	function _edit () {
		this.editDocument( );
	}
	function _suggest () { /*추천*/ }
	function _response () {
		var __active = $ep.ui.active() 
		,__current = _getCurrentObject()
		;
		$ep.ui.loadPageLang( __active, __CURI("/" + __current.doc.dbpath + "/resPost?openform", {parentunid :__current.doc.unid}) , $comm);
	}
	function _forward () {
		var __active = $ep.ui.active()
		,__current = _getCurrentObject()
		,__HeadHtml = $("#tableheader", __active).html()
		//,__mimeHeader = "MIME-Version: 1.0\ncontent-type:text/html;charset=UTF-8\n\n"
		,html = $(".frm_page_scroll", __active).outerHTML().replace(/\<\!\-\-[\S\s]*?\-\-\>/g, "")
		,elem = $(html)
		,body = $("#ep_richbody", elem)
		;
		if(body.length > 0){
			body.empty();
			$ep.util.ajax({
				url : $ep.util.CURI("/" + __current.dbpath + "/EditBodyHtml?OpenAgent", {
					unid : __current.doc.unid
				}).url
				,type : "get"
				,dataType : "text"
				,async : false
				,success : function(_res, txtStatus) {
					var _body_html = _res
					,oldImageRegExp = null
					,img_key = __current.doc.MIME_IMG_LINK_KEY||"[a-zA-Z0-9\_\:]+"
					;
					if(_body_html.search(/<body/i) != -1){
						var bi = _body_html.match(/<body[\S\s]*?>([\S\s]*?)<\/body>/i);
						_body_html = bi[1];
					}
					eval("(oldImageRegExp = /[\"'][^\"']*\\?OpenElement(?:\\&amp;|\\&)linked\\=" + img_key + "_OLD(?:\\&amp;|\\&)cid\\=([^\"']*)[\"']/gi)");
					_body_html = _body_html.replace(oldImageRegExp, function(a, b){
						return "\"cid:" + b + "\"";
					});
					body.html(_body_html);
				}
			});
		}
		
		_process({
			dbpath : __current.dbpath
			,action : "forward"
			,unids : __current.doc.unid
			,mimeBody : __HeadHtml + body.html()
			,agent : "process_webuser"
		}, function (_data, _result, _object) {
			if (_data.result == "success"){
				var __new = $.winOpen( "/"+_data.mailpath+"/0/"+_data.unid+"?editdocument", "_new" );
				__new.focus();
			} else {
				if ( _data.result == "fail" ) {
					$ep.util.toast( $comm.LangString( _data.message, 1500 ) );
				}
			}
		});
	}
	function _close () { this.close (); }
	function _delete () {
		var __o = this.getSelected()
		,__unids=[]
		,__length = __o.length
		;
		if ( !__o.length ) { $ep.util.toast ( $comm.LangString("VALIDATE.SELECT_DELETE_DOC") /*"삭제할 문서를 선택해 주세요."*/ ); return; }
		
		__unids = $ep.Array( __o ).datafilter ( function ( idx, val ) { return val.data["@unid"]; } );
		
		_process({dbpath : _getCurrentObject().dbpath, action : "docdelete", unids : __unids.join("|")}, (function (_self) {
			return function () {
				$ep.util.toast ( $comm.LangString("VIEW.DELETE_COUNT").replace(/\{1\}/g, __length) );
				_self.refresh ();
			}
		})(this));
	}
	function _docdelete () {
		var __self = this
		,__active = $ep.ui.active()
		,__current = _getCurrentObject()
		;
		_process({dbpath : __current.dbpath, action : "docdelete", unids : __current.doc.unid}, function (_data) {
			if (_data.indexOf("success") != -1) {
				$ep.util.toast ( "document has been deleted" );
				__self.close();
			}
		});
	}
	function _getactions ( _actionlist , _app ) {
		var __lists = _actionlist.split ( "|" )
		,__current = _getCurrentObject()
		,__info = __current.bbsinfo
		,__return = {}
		,__actions = {
			// 작성
			write : {show : __current.iseditable ? true : false, text : "{ACTION.WRITE}", click:_write}
			// 본문만저장
			,simplesave : {show : true,text : "{ACTION.SIMPLESAVE}",click : _simplesave}
			// As-Is 에서 저장이었는데 , 임시저장으로 바꿈
			,draftsave : {show : true,text : "{ACTION.DRAFTSAVE}",click : _draftsave}
			// 공지후저장 , 게시물 공지 이후에 편집 저장 할 때
			,aftersave : {show : true,text : "{ACTION.AFTERSAVE}",click : _aftersave}
			// As-Is 에서 공지는 저장 역할
			,notice : {show : true,text : "{ACTION.ANNOUNCE}",click : _notice}
			// 본인만 편집
			,edit : {show : true, text : "{ACTION.EDIT}",click : _edit}
			// 임시저장 된 내 문서 삭제
			,"delete" : {show : true,text : "{ACTION.DELETE}",click : _delete}
			// 문서에서 관리자 삭제
			,"docdelete" : {show : true,text : "{ACTION.DELETE}",click : _docdelete}
			// 응답
			,response : {show : true,text : "{ACTION.RESPONSE}",click : _response}
			// 추천
			,suggest : {show : true,text : "{ACTION.SUGGEST}",click : _suggest}
			// 회송
			,forward : {show : true,text : "{ACTION.FORWARD}",click : _forward}
			// 닫기
			,close : {show : true,text : "{ACTION.CLOSE}",click : _close}
			// test
			,test : {show : false, text : "test", click : function () { _process({db:__current.dbpath, action:"test"}); }}
		}
		;
		for (var i = 0 ; i < __lists.length ; i++) __return[__lists[i]] = ( _app || __actions) [__lists[i]]
		return _actionlist ? { "action" : __return } : __actions;
	}
	///////////////////////////
	// LNB 관련 함수들
	///////////////////////////
	function _lnbinit ( folder_key ) {
		var _activenav = $ep.ui.activeNav()
		//,createMenuItem
		,__current = _getCurrentObject()
		,__key = __current.sharecode || folder_key
		,__defaultmenu = {
			text : "{LNB.NEWPOST}"
			,isactive : true
			,href : $ep.util.CURI("/" + __current.dbpath + "/viewpage?readform", {
				"alias" : "newPost"
				,"cd" : __current.appcode
				,"comcode" : __current.comcode
				,"viewtitle" : $comm.LangString("LNB.NEWPOST")
			}).encode().url
		}
		;
		
		if (!__current) return;
		
		_getFolderList(
			{
				view : _CONST.menulistview
				,key : __key //folder_key
			}
			,function ( items ) {
				__current.items = items;
				_ui.sidemenu (
					$(_CONST.sidemenuclass, _activenav)
					,$.extend(
						{items : __current.bbsinfo && __current.bbsinfo.chkusedefaultmenu ? [__defaultmenu].concat(__current.items) : __current.items}
						//{items : [__defaultmenu].concat(__current.items)}
						,__current.iseditable ? {
							//같은 회사이고 편집권한이 있을 경우와 관라자 일 경우 작성 버튼 보임
							button : [{
								text : "{ACTION.LNBWRITE}"
								,show : true
								,highlight : true
								,click : function () { _newpost(); }
							}]
						} : {}
					)
					,$comm
				);
				$(_CONST.sidemenuclass, _activenav ).css({display:"block"});
			}
		);
	}
	///////////////////////////
	// VIEW 관련 함수들
	///////////////////////////
	function _setViewList (_view) {
		return $.extend(_viewOptions, _view);
	}
	function _attachrender ( tr, td, data, col ) {
		if ( data._attach != 0 ) return '<p class="ep-icon attachment" />';
	}
	function _datetime ( tr, td, data, col ) {
		var todate = new Date()
		,date = data._dateofnotice.isoToDate()
		,created = data._created.isoToDate()
		,istoday = (todate.getDate() == date.getDate()) && (todate.getMonth() == date.getMonth()) && (todate.getFullYear() == date.getFullYear())
		;
		return istoday ? created.format ("today") : date.format ("fullDate");
	}
	function _kindCategory ( tr, td, data, col ) {
		var __text = data._category == "" ? _getDocKindText(tr, td, data, col) : _getCategoryText(tr, td, data, col)
		;
		return __text;
	}
	function _viewentries (_callback) {
		var __current = _getCurrentObject()
		,__view = __current.view
		;
		this.options.query.search ? 
			_callback ( undefined )
		:
			_process ({
				dbpath : __current.dbpath
				,param : (__view.alias + "|" + (__view.category ? __view.category : "") + "|" + (__view.search ? __view.search : ""))
				,action : "viewentries"
				,agent : "process_webuser"
			},function (_cnt) {
				var __numeric = /^[0-9]*$/g
				;
				_callback( __numeric.test(_cnt) ? _cnt : "0" );
			})
		;
	}
	function _getDocKindText ( tr, td, data, col ) {
		return data._dockindlangcode ? (data._dockindlangcode == "" ? data._dockind : $comm.LangString(data._dockindlangcode.replace(/^\{|\}$/g, "")) ) :  data._dockind;
	}
	function _getCategoryText ( tr, td, data, col ) {
		return data._categorylangcode ? (data._categorylangcode == "" ? data._category : $comm.LangString(data._categorylangcode.replace(/^\{|\}$/g, "")) ) : data._category;
	}
	function _subjectText ( tr, td, data, col ) {
		return data._subject + 
			(data._replycount ?
				(data._replycount=="" || data._replycount=="0") ? "" : (" [" + data._replycount + "]")
			:
				""
			);
	}
	function _viewColumn (_colList, _app) {
		var __lists = _colList ? _colList.split ( "|" ) : ["_attach","_kindcategory","_subject",/*"_replycount",*//*"_dockind",*/"_author" /*,"_groupname"*/, "_dateofnotice","_readcount"]
		,__return = {}
		,__columns = {
			// 첨부
			_attach : { css : { width : "20px" }, render : _attachrender }
			// 제목
			,_subject : { title : "{VIEW.COLUMN.SUBJECT}", type : "multilevel" }
			// 댓글 갯수
			,_replycount : {css : {width:"20px"}, render : function ( tr, td, data, col) { return data._replycount == "" ? "" : "[" + data._replycount + "]" ; }}
			// 종류
			,_dockind : { title : "{VIEW.COLUMN.DOCKIND}", css : { width : "100px" }, hidewidth : true, render : _getCategoryText }
			// 분류
			,_category : { title : "{VIEW.COLUMN.CATEGORY}", css : { width : "100px" }, hidewidth : true, render : _getCategoryText }
			// 분류를 기본으로 보여주고 분류가 없을 경우 종류를 보여줌
			,_kindcategory : { title : "{VIEW.COLUMN.CATEGORY}", css : { width : "100px" }, hidewidth : true, render : _kindCategory }
			// 작성자
			,_author : { title : "{VIEW.COLUMN.AUTHOR}", css : { width : "100px" }, type : "userinfo", userinfo : "nameonly" }
			// 그룹명
			,_groupname : { title : "{VIEW.COLUMN.GROUPNAME}", css : { width : "150px" } }
			// 게시일
			,_dateofnotice : { title : "{VIEW.COLUMN.DATEOFNOTICE}", sortable : {ascending:true}, css : { width : "90px" }, render : _datetime }
			// 작성일
			,_created : { title : "{VIEW.COLUMN.CREATEDDATE}", sortable : {ascending:true}, css : { width : "90px" }, render : _datetime }
			// 조회수
			,_readcount : { title : "{VIEW.COLUMN.READCOUNT}", sortable : true, css : { width : "60px", "text-align":"center" } }
		}
		;
		for (var i = 0 ; i < __lists.length ; i++) __return[__lists[i]] = ( _app || __columns) [__lists[i]]
		return __return;
	}
	function _viewList ( _alias ) {
		var __current = _getCurrentObject()
		,__default = _viewColumn ()
		// viewOptions
		, _viewOptions = {
			// 최근게시물
			newPost : { column : __default , actions : _getactions ( "test" )}
			// 종류 게시물
			,dockindView : { actions :_getactions ( "write" ), column : _viewColumn("_attach|_subject|_author|_dateofnotice|_readcount") }
			// 카테고리 게시물
			,categoryView : { actions :_getactions ( "write" ), column : _viewColumn("_attach|_subject|_author|_dateofnotice|_readcount") }
			// 작성중인 글
			,draft : {
				actions : _getactions ( "write|delete" )
				,column : {
					selectable : "checkbox"
					, _dockind : { title : "{VIEW.COLUMN.DOCKIND}", css : { width : "90px" } }
					,_subject : { title : "{VIEW.COLUMN.SUBJECT}" }
					,_created_date : { title : "{VIEW.COLUMN.DATEOFNOTICE}", css : { width : "90px" }, type : "isodate", dateformat : "fullDate" }
				}
			}
			// 내 작성 글
			,myPost : { column : __default }
			//그룹
			,group : {
				actions : _getactions ( "write" )
				,column : __default
			}
		}
		,__custom = _alias && __current.customView [_alias ]
		;
		return (__custom && $.extend(__custom, {extcount : _viewentries})) || (_alias ? $.extend ( _viewOptions[ _alias ], {extcount : _viewentries}) : _viewOptons);
	}
	function _viewinit ( _opt ) {
		var __queryString = _opt.url.split("&")
		,__vQueryString = "", __indexof = 0 , __current = _getCurrentObject()
		,__searchitems = $.extend({
			"subject" : "{FORM.SUBJECT}", "authorinfo" : "{FORM.AUTHOR}", "body" : "{FORM.BODY}", "dockind:category":"{FORM.SEARCHCATEGORY}", "subject:author:body:tag" : "{FORM.SEARCHALL}"
		},__current.bbsinfo.chktag ? {"tag" : "{FORM.TAG}"} : {})
		,__search = {
			search : {
				select : {
					items :	 __searchitems
					,width : 100
				}
			}
		}
		,__events = {
			click : function ( row, col, data ) {
				if ( data._openpage=="1" ) {
					$ep.util.openPage(this.getDocumentUrl(data["@unid"]));
				} else {
					_opt.alias == "draft"
					? this.editDocument(data["@unid"], {comcode : _opt.comcode, appcode : _opt.appcode})
					: this.openDocument(data["@unid"], {
						position : data["@position"]
						,isNav : ("query" in this.options && this.options.query.search)?"0":"1"
						,comcode : _opt.comcode
						,cd : _opt.appcode
						,viewtitle : encodeURIComponent(_opt.viewtitle)
					});
				}
			}
		}
		,__searchheader = _opt.query.category ? {searchheader : (function (c) {var r=c.split("^"); return "[DocKind]=" + r[0] + (r[1] ? " And [Category]=" + r[1] : ""); })(_opt.query.category)} : {}
		,__viewlist = _viewList (_opt.alias)
		,__searchdefault = __viewlist.column._dateofnotice ? {searchdefault : {sortorder : "descending", sortcolumn : "_dateofnotice"}} : {}
		,__options = $.extend (
			_opt
			,{events : __events}
			,__searchheader
			,__search
			,__searchdefault
			,__viewlist
		)
		;
		//$comm.log(__viewlist);
		// view에 category 가 있으면 삭제 - 정확한 보기 정보를 위해서
		__current.view = {};
		// url 의 param 내용을 current 오브젝트의 view에 저장
		for ( var i = 1 ; i < __queryString.length ; i++){
			__indexof = __queryString[i].indexOf ( "=" );
			__vQueryString = __queryString[i].slice( 0, __indexof );
			if ( __vQueryString != "_ver" ) {
				__current.view [ __queryString[i].slice( 0, __indexof ) ] = __queryString[i].slice( __indexof+1 );
			}
		}
		$comm.view = _ui.view ( _CONST.viewclass, __options, $comm );
	};
	///////////////////////////
	// DOC 관련 함수들
	///////////////////////////
	function _subcategory ( nm, val, items, selected ) {
		for (var i=0; i<items.length;i++){
			if ( val == items[i].code ) {
				_selectoptions ( nm, items[i].items, selected );
				break;
			}
		}
	}
	function _doccounthtml ( _data ) {
		if ( _data.length == 0 ) return "";
		var __active = $ep.ui.active()
		,__content = []
		,__ele =$('<span></span>')
		;
		$.each ( _data, function ( idx, d ) {
			__content.push ( { user : d.user, datetime : d.datetime} );
		}) ;
		
		$(__ele).epviewlist({
			column : { user : {}, datetime : {} }
			,hideheader : true
			,dataset : __content
		});
		return __ele;
	}
	function _doccount (_opt) {
		var __active = $ep.ui.active()
		;
		$( "#readcount", __active )
		.off ( "click" ).on ( "click", function ( ) {
			$ep.util.getApp ( _CONST.logcode, _comcode, function (loginfo) {
				$ep.util.ajax ({
					url : $ep.util.CURI (( loginfo.sysdir.charAt(0) == "/" ? "" : "/" ) + loginfo.sysdir + "/api/data/collections/name/doccountview",{
							category : _opt.documentkey //_opt.unid
							,ps : 2000
						}).url
					,type : "get"
					,success : function ( data, txt, xhr ) {
						_ui.dialog ({
							title : "조회자", width : 500, height : 400
							,content : {html : _doccounthtml ( data )}
						});
					}
					,fail : function ( data, txt, xhr ) {  }
				});
			});
		}).css ({ "cursor" : "pointer" }) ;
	}
	function _tagsearch (_opt) {
		var __active = $ep.ui.active()
		,__current = _getCurrentObject()
		;
		$( "."+_opt.tagclassname , __active ).off("click").on("click", function () {
			var __tagtext = $(this).text()
			,__query = "[tag]=\"" + __tagtext + "\""
			,__categorystring = _getSearchCategoryString( __current.view.category )
			,__searchview = ("alias" in __current.view ? __current.view : "alias" in __current.searchview ? __current.searchview : {
				alias : "newPost"
				,viewtitle : "{LNB.NEWPOST}"
				,cd : __current.appcode
				,comcode : __current.comcode
			})
			;
			
			(__categorystring != "") && (__query += ("&" + __categorystring));
			
			$.when (
				_ui.loadPageLang(
					__active
					,$ep.util.CURI (
						"/" + __current.dbpath + "/viewpage?readform"
						,$.extend( __searchview, { searchtxt : __tagtext, searchkey : "tag", search : __query })
					).encode().url
					,$comm
				)
				, _process ( { dbpath : __current.doc.dbpath, param : __tagtext ,action : "tagreadcount" } )
			);
		}).css("cursor", "pointer");
	}
	// 응답문서 편집
	function _resDocEdit() {
		var __actions = {}
		,__current = _getCurrentObject()
		,__opt = __current.doc
		;
		if ( __opt.isResForm ) __actions = _getactions( "close|notice" );
		return { "actions" : __actions||{} };
	}
	// Edit 함수
	function _docEdit ( ) {
		var __active = $ep.ui.active()
		,__actions = {}
		,__current = _getCurrentObject()
		,__opt = __current.doc
		,__key = __current.sharecode || (__opt.comcode + "^" + __opt.appcode)
		;
		if ( !__opt.isResForm ) {
			_getFolderList ( {view : _CONST.categorylistview, key : __key}, function ( items, ischild ) {
				_selectoptions ( "DocKind", items, __opt.dockindcode );
				//하위 category 넣기
				if ( ischild ) {
					_ui.select($("select[name=Category]", __active )).show();
					_subcategory ( "Category", __opt.dockindcode || (items.length == 1 ? items[0].code : "") , items, __opt.categorycode ) ;
					// selectmenu ui 에 이벤트 설정
					_ui.select( $("select[name=DocKind]", __active ) ).setOptions({
						selectchange : function ( e, ui ) {
							_subcategory ( "Category", ui.item.value, items, "" ) ;
						}
					});
				}
			});
		}
		// 버튼 처리
		if ( __opt.isnewdoc || ( __opt.docstatus == "draft" ) ) __actions = _getactions ( "close|draftsave|notice" );
		else __actions = _getactions ( "close|aftersave" );
		
		return { "actions" : __actions };
	}
	function _prev_next_doc () {
		var __active = $ep.ui.active()
		,__current = _getCurrentObject()
		,__doc = __current.doc
		,__view = __current.view
		,__ele = $(".frm_navigate", __active)
		;
		__doc.isNav=="1" ?
			_process({
				action : "navigatedoc"
				,unids : __doc.unid
				,param : __view.alias+"|"+(__view.category||"")+"|"+__doc.position
				,agent : "process_webuser"
			}, function (_data) {
				var _html=""
					,__div = null
				;
				// 이전글
				if (_data.prev) {
					_html = ""
						+"<li class=\"view-prev\">"
						+"	<em>" + $comm.LangPatternString("{FORM.PREVDOC}") + "</em>"
						+"	<span class=\"subject\" data-unid=\"" + _data.prev.unid + "\" data-position=\""+ _data.prev.position +"\">" + decodeURIComponent(_data.prev._subject) + "</span>"
						+"	<span class=\"wt-info\">"
						+"		<span class=\"part\" eptype=\"userinfo\" epdata=\"" + decodeURIComponent(_data.prev._author) + "\"></span>"
						+"		<span class=\"date\">" + _data.prev._dateofnotice.isoToDate().format("fullDate") + "</span>"
						+"	</span>"
						+"</li>"
						;
				}
				// 다음글
				if (_data.next) {
					_html += ""
						+"<li class=\"view-next\">"
						+"	<em>" + $comm.LangPatternString("{FORM.NEXTDOC}") + "</em>"
						+"	<span class=\"subject\" data-unid=\"" + _data.next.unid + "\" data-position=\""+ _data.next.position +"\">" + decodeURIComponent(_data.next._subject) + "</span>"
						+"	<span class=\"wt-info\">"
						+"		<span class=\"part\" eptype=\"userinfo\" epdata=\"" + decodeURIComponent(_data.next._author) + "\"></span>"
						+"		<span class=\"date\">" + _data.next._dateofnotice.isoToDate().format("fullDate") + "</span>"
						+"	</span>"
						+"</li>"
						;
				}
				
				// html 생성
				__div = $(__ele).append($("<div class=\"view-pagenav\"><ul>" + _html + "</ul></div>"));
				// 제목 클릭시 이동
				$(".subject", __div).on("click", function (e) {
					var _unid = $(this).attr("data-unid")
					,_position = $(this).attr("data-position")
					;
					_ui.loadPageLang (
						__active
						,__CURI("/" + __current.dbpath + "/" + __current.view.alias + "/" + _unid + "?opendocument", {position:_position, isNav:__doc.isNav})
						,$comm
					);
				});
				// 사용자 정보 넣기
				$(".part", __active).each(function () {_ui.fieldSetUserInfo( this , __doc.server );})
			})
		:
			$(__ele).append($("<div class=\"view-pagenav\"><ul></ul></div>"));
		;
	}
	// 응답문서 열람
	function _resDocRead() {
		var __actions = {}
		,__current = _getCurrentObject()
		,__doc = __current.doc
		;
		// 이전 다음
		_prev_next_doc ();
		// 권한에 따라 버튼 처리 해야함
		if ( __current.isMyCompany && (__doc.isAuthor || __current.ismanager) ) __actions = _getactions ( "close|edit|response" );
		//else if ()
		else __actions = _getactions ( "close|response" );
		
		return { "actions" : __actions };
	}
	// 게시물 열람
	function _docRead ( ) {
		var __active = $ep.ui.active()
		,__actions = {}
		,__current = _getCurrentObject()
		,__doc = __current.doc
		,__info = __current.bbsinfo //__doc.docinfo
		;
		// 조회수 클릭
		( __current.ismanager && ( __current.comcode == __doc.comcode ) ) && _doccount (__doc);
		
		// 태그 클릭
		__info.chktag && _tagsearch ( __doc );
		// 이전 다음
		_prev_next_doc ();
		
		// 게시기간
		__info.chkperiod && $("#textnoticeterm", __active).text(__doc.retention[__doc.noticeterm]);
		
		// 권한에 따라 버튼 처리 해야함
		//if ( __current.isMyCompany && (__doc.isAuthor || __current.ismanager) ) __actions = _getactions( "close|edit|response|forward" );
		
		if ( __current.isMyCompany && __current.ismanager ) __actions = _getactions( "close|edit|response|docdelete|forward" );
		else if ( __current.isMyCompany && __doc.isAuthor ) __actions = _getactions( "close|edit|response|forward" );
		//else if ()
		else __actions = _getactions( "close|response|forward" );
		
		return { "actions" : __actions };
	}
	
	function _docinit ( _opt ) {
		var __active = $ep.ui.active()
		,__docInfo = {}
		,__current = _getCurrentObject()
		,__viewtitle = _opt.viewtitle || _opt.categorytext || _opt.dockindtext || "{LNB.NEWPOST}" //("view" in __current ? (__current.view.viewtitle || "{LNB.NEWPOST}") : "{LNB.NEWPOST}")
		;
		// 현재 문서 정보를 current 오브젝트의 doc 에 저장
		$.extend(__current.doc, _opt);
		
		// 편집, 읽기, 응답 문서 의 경우에 프로그램 호출
		__docInfo = _opt.isResForm 
		? (_opt.isedit ? _resDocEdit() : _resDocRead())
		: (_opt.isedit ? _docEdit() : _docRead());
		
		// 양식타이틀 넣기, 빵조각 넣기
		//$comm.log("111", __viewtitle);
		$(".frm_title", __active).text ( __current.doc.breadcrumb = (
			_opt.isedit ? $comm.LangPatternString(_opt.isResForm ? "{FORM.WRITERESPONSE}" : "{FORM.NEWPOST}") 
			: $comm.LangPatternString(__viewtitle)
		));
		
		// Document 만들기
		$comm.doc = _ui.doc ( $( _CONST.formclass , __active ), $.extend ( true, {
			actions : ( "actions" in __docInfo ) ? __docInfo.actions : {}
			,validator : {
				"dateOfNotice":{
					type : "date"
					,message : "{VALIDATE.VALIDATE_DATE}"
				}
				,"DocKind" : {
					message : "{VALIDATE.ENTER_DOCKIND}"
					,validate : function (_ele, _val) {
						return _dockindTextSave();
					}
				}
				,"Category" : {
					message : "{VALIDATE.ENTER_CATEGORY}"
					,validate : function (_ele, _val) {
						return _categoryTextSave();
					}
				}
				,"Subject" : {
					type : "text"
					,message : "{VALIDATE.ENTER_SUBJECT}"
				}
			}
			,resultType : "json"
			,events : {
				afterSubmit : function ( xhr, data, ui ) {
					if ( !$.isPlainObject( data ) || data.result !== "success")  {
						ui && ui.unblock && ui.unblock();
						$ep.util.toast ( data.message||$comm.LangString("ERROR.SAVE_ERROR"), "click");
						return false;
					}
					this.close();
				}
				,afterSubmitError : function ( xhr, data, ui ) {
					ui && ui.unblock && ui.unblock();
					$ep.util.toast ( $comm.LangString("ERROR.SAVE_ERROR"), "click");
					return false;
				}
				,beforeundock : function () {
					return {viewtitle : encodeURIComponent(_opt.viewtitle)}
				}
			}
		}, __current.doc ), $comm );
	}
	///////////////////////////
	// 메소드
	///////////////////////////
	function _openlnb ( _opt ) {
		function __after (argv) {
			_lnbinit( _opt.menukey );
			_runtask();
		}
		if (_opt.comcode + "." + _opt.appcode in _current) {
			_setCurrentCode( _current [ _opt.comcode + "." + _opt.appcode ] );
			__after();
		} else {
			$comm.setConfig(_opt.config, __after);
		}
	}
	function _openview ( _opt ) {
		var __current = _getCurrentObject()
		;
		function __after (argv) {
			__current = _getCurrentObject();
			$.extend ( __current, { alias : _opt.alias });
			_viewinit ( _opt );
			_runtask();
		}
		
		if (_opt.comcode + "." + _opt.appcode in _current) {
			_setCurrentCode( _current [ _opt.comcode + "." + _opt.appcode ] );
			__after();
		} else {
			$comm.setConfig(_opt.config, __after);
		}
	}
	function _opendoc (_opt) {
		var __current = _getCurrentObject()
		;
		function __after () {
			__current = _getCurrentObject();
			//$.extend ( __current, { docinfo : _opt.docinfo } );
			_docinit( _opt );
			_runtask();
		}
		if (_opt.comcode + "." + _opt.appcode in _current) {
			_setCurrentCode( _current [ _opt.comcode + "." + _opt.appcode ] );
			__after();
		} else {
			$comm.setConfig(_opt.config, __after);
		}
	}
	
	function _settask (_task) {_taskqueue.push(_task);}
	function _getsearchview () { return _getviewlist() }
	
	$.extend( $comm, {
		setConfig : _setConfig
		,current : _current
		,openlnb : _openlnb
		,openview : _openview
		,opendoc : _opendoc
		,viewList : _viewList
		,getcurrent : _getCurrentObject
		,getViewColumn : _viewColumn
		,getViewList : function (alias) {this.viewList (alias);}
		,getActions : _getactions
		,newPost : _newpost
		,process : _process
		,testFunction : function () { $ep.util.toast("This Function is TEST. Authority have \"$Domino_Admin\" and \"$Domino_Dev\"", "click") }
		,setTask : function () {_settask( Array.prototype.slice.call ( arguments, 0 ));}
		,viewentries : _viewentries
		,log : function() {
			if (window.console == undefined) { window.console = {log : function(){}};}
			var _argv = arguments
			,_l = _argv.length
			,_0 = _argv[0]
			,_A = Array.prototype.slice.call(_argv, (_l>1?1:0))
			;
			if (typeof console.log == "function") {console.log.apply(console, ( _l>1 ? [_0 + " = "].concat( _A ): _A) );}
			else {console.log( (_l>1 ? _0 + " = " : ""), _A.join(" ") );}			
			return;
		}
	});
	
	return $comm;
})();

(function ($comm) {
	"use strict";
	
	function $comment(_opt) {
		var _page = {
			pagecount : 5 // 한 페이지에 보여줄 문서 수
			,pagesize : 5 // 한 페이지에 보여줄 네비게이션 숫자 수
			,maxpage : 0 // 전체 페이지 수
			,currentpage : 1 // 현재 페이지
			,totdoccount : 0 // 전체 문서수
			,maxdepth : 2 // 0 이면 무한
			,setMaxPage : function () {
				this.maxpage = Math.ceil(this.totdoccount / this.pagecount);
			}
		}
		;
		function __padding (x, __isnew) {
			return "style=\"padding-left:" + (15 + (45*(x-(__isnew?1:2)))) + "px\"";
		}
		function _newComment (_sel, _sub, _pid, _ind) {
			var __current = $comm.getcurrent()
			,_confirmstring = $comm.LangString("FORM.CONFIRM")
			,_cancelstring = $comm.LangString("FORM.CANCEL")
			,__html = ""
			+"<span id=\"new_comment_wrap\">"
			+"<table class=\"rep-input" + (_sub?" recomment":"") + "\" " + (_sub?__padding(_ind, true):"") + ">"
			+"	<colgroup><col /><col /><col /></colgroup>"
			+"	<tbody>"
			+"		<tr>"
			+"			<td class=\"photo\">"
			+"				<span class=\"ep-name\">"
			+"					<span class=\"ep-photo\">"
			+"						<span class=\"thum_border\"></span>"
			+"						<img src=\"/"+__current.server+"/photo/" + encodeURIComponent(__current.notesid) + "\" />"
			+"					</span>"
			+"				</span>"
			+"			</td>"
			+"			<td class=\"ip-msg\"><textarea class=\"comment_area\" " + (_pid?"pid="+_pid:"") + "></textarea></td>"
			+"			<td class=\"bt\">"
			+"				<span class=\"bt-ok\">" + _confirmstring +"</span>"
			+				(_sub ? "<span class=\"bt-cancel\">" + _cancelstring + "</span>" : "")
			+"			</td>"
			+"		</tr>"
			+"	</tbody>"
			+"</table>"
			+"</span>"
			
			,__writecomment = _sel.append(__html)
			;

			// photo
			$(".ep-photo img", __writecomment).one("error", function(){
				$(this).attr("src", "/" + __current.server + "/photo/no_profile");
			});
			
			// ok
			$(".bt-ok", __writecomment).on("click", function () {
				var __textarea = $(this).parent(".bt").siblings(".ip-msg").find(".comment_area")
				,__current = $comm.getcurrent()
				;
				if (__textarea.val().trim() == "") {
					$ep.util.toast($comm.LangString("VALIDATE.INPUTCOMMENT"), 1000);
					return;
				}
				bbs_comm.process ({
					unids : __current.doc.unid
					,action : "savecomment"
					,param : __textarea ? __textarea.attr("pid") : ""
					,comment : __textarea.val().replace(/\n/g, "<br>").replace(/\s/g, "&nbsp;")
				}, function (_data) {
					if (_data.result == "success") {
						!_sub && (_page.currentpage = 1);
						_commentlist();
						!_sub && __textarea.val("");
					}
				});
			});

			// cancel
			$(".bt-cancel", __writecomment).on("click", function () {
				var __parent = $(this).parents("#new_comment_wrap")
				;
				__parent.size()>0 && __parent.remove();
			});
		}
		function _drawList (_data) {
			var __active = $ep.ui.active()
			,__current = $comm.getcurrent()
			,__view = $("#commentview", __active)
			,__html = ""
			;
			
			__view.empty();
			
			$.each(_data, function (i, item) {
				var __isodate = item._createdate.isoToDate()
				;
				__html = item._isremove == "1"
				?
				(
				""
				+"<span id=\""+item["@unid"]+"\">"
				+"	<table class=\"rep-list" + (item._res!=""?" recomment":"") + "\" " + (item._res!="" ? __padding(item["@indent"]) : "" ) + "><tbody><tr><td>"
				+$comm.LangString("FORM.ISDELETEDOC")
				+"	</td></tr></tbody></table>"
				+"</span>"
				)
				:
				(
				""
				+"<span id=\""+item["@unid"]+"\">"
				+"<table class=\"rep-list" + (item._res!=""?" recomment":"") + "\" " + (item._res!="" ? __padding(item["@indent"]) : "" ) + ">"
				+"<colgroup><col /><col /><col /></colgroup>"
				+"<tbody>"
				+"	<td class=\"info\">"
				+"		<span class=\"ep-name\">"
				+"			<span class=\"ep-nameinfo\" eptype=\"userinfo\" hasphoto epdata=\"" + item._authorinfo + "\"></span>"
				+"			<em>" + __isodate.format("fullDateTime") + "</em>"
				+"		</span>"
				+"		<span class=\"rep-msg\">" + item._comment + "</span>"
				+"	</td>"
				+"	<td class=\"bt\" style=\"width:125px\">"
				//maxdepth 에 따라
				+( typeof _page.maxdepth===null || typeof _page.maxdepth === undefined || _page.maxdepth < 0 ? "" :
					(_page.maxdepth==0) || item["@indent"]>=_page.maxdepth ?
						""
					: "		<span class=\"bt-rep\" ind=\"" + item["@indent"] + "\" " +
					"unid=\"" + item._unid+"\" res=\"" + item._res + "\"><span>" +
					$comm.LangString("FORM.ANANSWER") + "</span></span>" 
				)
				+(
					__current.notesid == item._userid 
					?
						("<span class=\"bt-del\" unid=\"" + item._unid + "\"><span>" + $comm.LangString("FORM.DELETE") + "</span></span>")
					:
						""
					)
				+"	</td>"
				+"</tbody>"
				+"</table>"
				+"</span>"
				)
				;

				$(__view).append($(__html));
			});
			return $(__view);
		}
		function _authorinfo (_sel) {
			$(_sel).each(function (i, item){
				$ep.ui.fieldSetUserInfo(item , $comm.getcurrent().server );
			});
		}
		function _answerEvent (_sel) {
			_sel.on("click",function(){
				var __unid = $(this).attr("unid")
				,__commentitem = $(this).parents( "#"+__unid )
				,__writecomment = $("#new_comment_wrap", $("#commentview", $ep.ui.active()))
				;
				// 이전 삭제
				if (__writecomment.size()>0) __writecomment.remove();
				// 추가
				_newComment (__commentitem, true, __unid, $(this).attr("ind"))
			});
		}
		function _deleteEvent (_sel) {
			_sel.on("click",function(){
				var __self = this
				;
				bbs_comm.process({
					action : "commentdelete"
					,param : $(__self).attr("unid")
				},function (_data) {
					if(_data.result == "success") {
						if (_data.removeFlag == "") {
							--_page.totdoccount;
							_page.setMaxPage();
							_page.currentpage = _page.currentpage==1 ? 1 : (_page.maxpage<_page.currentpage ? _page.maxpage : _page.currentpage)
						}
						_commentlist();
					} else $ep.log("fail", ("message" in _data)?_data.message:"nothing message : delete error");
				});
			})
		}
		function _nav (_sel) {
			var __nav = $("#commentnav", _sel)
			;
			if (_page.totdoccount == 0) {
				if (__nav.size() > 0) __nav.remove();
				return;
			} 
			if (__nav.size() > 0){
				$(__nav).eppagenavigator("setMaxPage", _page.maxpage ,true);
				$(__nav).eppagenavigator("setPage", _page.currentpage ,true);
				return;
			}
			$(_sel).append("<div id=\"commentnav\"></div>");
			$("#commentnav", _sel).eppagenavigator({
				page : _page.currentpage
				,pageSize : _page.pagesize
				,maxPage : _page.maxpage
				,title : {
					prev : $ep.LangString("PGNAVI.PREV")
					,next : $ep.LangString("PGNAVI.NEXT")
					,prevpage : $ep.LangString("PGNAVI.PREVPAGE")
					,nextpage : $ep.LangString("PGNAVI.NEXTPAGE")
				}
				,change : function(e,page) {
					_page.currentpage = page;
					_commentlist();
				}
			});
		}
		function _commentlist (_opt) {
			var __current = $comm.getcurrent()
			;
			$ep.util.ajax({
				url : "/"+__current.dbpath+"/api/data/collections/name/comment"
				,data : {
					category : __current.doc.unid
					,ps : _page.pagecount
					,page : _page.currentpage-1
				}
				,type : "get"
				,error : function () {
					$ep.log("comment running", arguments);
				}
				,success : function (_data, _result, _xhr) {
					var __active = $ep.ui.active()
					
					// 데이터 그리기
					,__resultview = _drawList(_data)
					,__range = (_xhr.getResponseHeader("Content-Range") || "")
					;
					
					// 댓글 총 갯수
					_page.totdoccount = (__range.match( /^items\s([0-9]{1,})-([0-9]{1,})\/([0-9]{1,})/g )) ? parseInt(RegExp.$3, 10) : 0;
					_page.setMaxPage();
					// 댓글 전체 갯수 넣기
					$("#comment_count", __active).text(_page.totdoccount);
					// 네비게이션
					_nav($(".commentnavwrap", __active));
					// 사용자 정보 표시
					_authorinfo($(".ep-nameinfo", __resultview));
					// 답글 클릭 
					_answerEvent($(".bt-rep", __resultview));
					// 삭제 클릭
					_deleteEvent($(".bt-del*", __resultview));
				}
			});
		}
		
		function _initialize (_sel, _opt) {
			//$.extend(_page, _opt);
			
			_page.pagecount = _opt.pagecount||_page.pagecount;
			_page.pagesize = _opt.pagesize||_page.pagesize;
			
			_newComment( $("#commentnew", _sel) );
			_commentlist(_opt);
		}
		
		return {
			init : function (_sel, _opt) {
				_opt.bAfterLoad ? $comm.setTask ( _initialize , _sel, _opt ) : _initialize(_sel, _opt);
			}
			//,pageinfo : _page
		}
	}
	
	$.extend($comm, {
		commentInit : function _commentInit (_opt) {
			new $comment().init($(".reply-wrap", $ep.ui.active()), _opt);
		}
	});
	
})(bbs_comm);
