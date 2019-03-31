var bbs_insight = (function ($comm){
	"use strict";
	
	var $insight = {}
	,_ui = $ep.ui
	,_postdata = {max : 4}
	,_mainpageview = "mainsearch"
	,_newpostview = "newPost"
	;
	
	// 언어팩 상속, prefix 설정
	$ep.inheritStatic ( $insight , "BBS.INSIGHT" );
	
	function _newpost (_data) {
		var __ret = []
		,_active = _ui.active()
		,__current = $comm.getcurrent()
		;
		$.each(_data, function (idx, data) {
			var date = data._dateofnotice.isoToDate()
			,__html = ""
			+"<li>"
			+"	<dl class=\"col-list-wrap\">"
			+"		<dt class=\"cate\">" + data._dockind.replace(/"/g, "\"") + "</dt>"
			+"		<dd class=\"info\">"
			+"			<span class=\"subject\">" + data._subject.replace(/"/g, "\"") + "</span>"
			+"		</dd>"
			+"		<dd class=\"date\" unid=\"" + data["@unid"] + "\">" + date.format ("fullDate") + "</dd>"
			+"	</dl>"
			+"</li>"
			;
			__ret.push(__html);
		});
		
		$(".list-inner", _active).append("<ul>" + __ret.join("") + "</ul>").find(".date").on("click", function () {
			var _unid = $(this).attr("unid")
			;
			_ui.loadPageLang (
				_active
				,"/" + __current.dbpath + "/" + _newpostview + "/" + _unid + "?opendocument" //&viewtitle={LNB.NEWPOST}"
				,$comm
			);
		});
		
		// 슬라이드
		$ep.ui.initLNBLayout();
		var _carousel = $(".list-inner ul", _active).owlCarousel({
			items : 1
			,scrollPerPage : true
			,itemsCustom : [[0, 1], [490, 2], [720, 3], [960, 4], [1200, 5], [1440, 6], [1680, 7], [1920, 8]]
			,responsive : true
			,dragBeforeAnimFinish : true
			//,responsiveBaseWidth : $("#ep_content_body")
			,responsiveBaseWidth : $($ep.ui.active())
			,navigation: true
			,pagination : false
			//,itemsScaleUp : false
		}).data("owlCarousel");
	}
	
	function _tags (_data) {
		var __ret = []
		,_active = _ui.active()
		,__current = $comm.getcurrent()
		;

		$.each(_data, function (idx, data) {
			var __html = "<li class=\"" + (data.readcount>20 ? "keyword-lv03" : (data.readcount > 10 ? "keyword-lv02" : "keyword-lv01")) + "\">" + data.tag + "</li>"
			;
			__ret.push(__html);
		});
		
		$(".tag-keyword-list", _active).html("<ul>" + __ret.join("") + "</ul>").find("li").on("click", function () {
			var __tagtext = $(this).text()
			,__query = "[tag]=\"" + __tagtext + "\""
			;
			$.when (
				_ui.loadPageLang(
					_active
					,$ep.util.CURI(
						"/" + __current.dbpath + "/viewpage?readform"
						,{
							alias : _mainpageview
							,viewtitle : "{LNB.MAINSEARCH}"
							,cd : __current.appcode
							,comcode : __current.comcode
							,searchtxt : __tagtext
							,searchkey : "tag"
							,search : __query
						}
					).encode().url
					,$comm
				)
				,$comm.process ( { dbpath : __current.doc.dbpath, param : __tagtext ,action : "tagreadcount" } )
			);
		});
	}
	
	$insight.main = function ( _opt ) {
		var __current = $comm.getcurrent()
		,_active = _ui.active()
		
		// doc init
		,__doc = _ui.doc ($( ".formpage" , _active ), $.extend(__current.doc, _opt), $comm)
		;

		function __dosearch (__val) {
			var __query = arguments.length > 1 ? "["+arguments[1]+"]" + __val : __val
			;
			_ui.loadPageLang(
				_active
				,$ep.util.CURI (
					"/" + __current.dbpath + "/viewpage?readform"
					,{
						alias : _mainpageview
						,viewtitle : "{LNB.MAINSEARCH}"
						,cd : __current.appcode
						,comcode : __current.comcode
						,searchtxt : __val
						,searchkey : "subject:author:body:tag"
						,search : __query
					}
				).encode().url
				,$comm
			)
		}
		
		function __docClickEvent ( row, col, data ) {
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
					,viewtitle : this.options.viewtitle
				});
			}
		}
		
		function __closeSearchEvent () {
			var __current = $comm.getcurrent()
			,__referer = $ep.ui.getReferer()
			,__url = __referer || $ep.util.CURI("/" + __current.dbpath + "/main?readform", {cd : __current.appcode, comcode : __current.comcode}).url
			;
			$ep.ui.loadPageLang(_active ,__url ,$comm);
			return false;
		}
		
		//$ep.ui.setReferer( __doc.url() );
		
		// 검색을 하거나 태그를 눌렀을 때 검색하는 보기 설정
		__current.customView = {
			mainsearch : {
				column : $comm.getViewColumn("_attach|_subject|_kindcategory|_groupname|_dateofnotice|_readcount")
				,events : {
					closesearch : __closeSearchEvent
					,click : __docClickEvent
				}
			}
			,categoryView : {
				column : $comm.getViewColumn("_attach|_subject|_groupname|_dateofnotice|_readcount")
				,events : {
					closesearch : __closeSearchEvent
					,click : __docClickEvent
				}
			}
		};
		$.extend ( __current.customView, {extcount : $comm.viewentries});
		// 메인에서 문서를 열 때 태그 클릭 하면 처음 보기가 없음
		__current.searchview = {
			alias : _mainpageview
			,viewtitle : "{LNB.MAINSEARCH}"
			,cd : __current.appcode
			,comcode : __current.comcode
		};
		
		// 검색 넣기
		$ep.ui.input( $(".sch_input",_active) , {
			icon : "search"
			,name : "squery"
			,width : "100%"
			,icoClick : function () {__dosearch(this.val());}
			,placeholder : "{MAIN.ALLTEXT}"
			,event : "keydown"
			,eventHandler : function(e) {
				if(e.keyCode != 13) {return;}
				__dosearch(this.val());
			}
		}, $insight );
		
		// 최근 게시물 가져오기와 태그 가져오기 
		$.when (
			// tags
			$ep.util.ajax({
				url : "/" + __current.dbpath + "/api/data/collections/name/tagcount?restapi&page=0&ps=30"
				,type : "get"
				,success : _tags
			})
			// 최근 게시물
			,$ep.util.ajax({
				url : "/" + __current.dbpath + "/api/data/collections/name/" + _mainpageview + "?restapi&page=0&ps=8"
				,type : "get"
				,success : _newpost
			})
		);
	}
	return $insight;
})(bbs_comm);