function ORGDLG_REQ() { }
ORGDLG_REQ.orgInit = function($dlgobj){
	/* dialog org창 호출시 정의한 option 정의 */
	var $opt = {
		info : $dlgobj.dialog("option" , "wopt")
	};
	var a = $dlgobj.find("div:first").orgdlg($opt , $dlgobj);
	//*
	//-- orgdlg class에 대해 extend. 각 필요에 따라 재정의 또는 확장시 정의함.
	function aExtCls () {
		//-- a.actAddBtn()에 대해 재정의. 
		this.actAddBtn = function() {
			//alert(arguments.callee.caller);
			//결재에서의 [추가]버튼
			
			if (_$eorg.getDlgKind() == "basic_single"){
				var _nodes = a.ctree().getSelectedNodes();
				
				if (_nodes.length <= 0) {return;}
				//request.__(_nodes[0].data);
				var select_node = $.map(_nodes, function(node){
					/* alert( node.data.title + "-" + node.data.info.korname ); */
					return node;
				});
				_$eorg.dlgTreeNodeSelect( null, null, select_node[0]);
				return;
			}
			if (_$eorg.getIsSearch()) _$eorg.dlgAddSearchNode();
			else _$eorg.dlgAddNode();
			return;
		}
	}
	
	$.extend( true , a , new aExtCls());
	// */
	/* dialog TAB에 대한 재정의 부분 */
	var _dlgtab = $opt.info.dlgTabs;
	if (_dlgtab) {
		var b = { tabs : _dlgtab };
		$.extend(true , $opt , b);
		a.setOptions($opt);
	}
	/* new eugp extend */
	var _$eorg = null;
	function _eugpinit() {
		var _$arry = a.actEUGPInit();
		_$eorg = _$arry[0];
		var ea = new ORGDLG_REQ.eorg(_$arry[1], _$arry[2]);
		$.extend(true , _$eorg , ea );
		_$eorg.dlgInfoInit();
	}
	
	_eugpinit();
	/* dialog org 수행 */
	a.actDoInit();
	//ORG 초기화 후 부서원리스트 가져오기
	_$eorg.dlgTreeNodeSelect( null, null, null, GC.user.groupcode);
}


ORGDLG_REQ.eorg = function (a , b){
	var _$me = a;
	var _$this = b;
	var _$dw = $(".organ_select_area" , _$me).find(".organ_select");
	var _$dwt = $(".organ_chart_area" , _$me).find(".appr_info_sel_result");
	var _$dws = $(".organ_chart_area" , _$me).find("#org_sel_result_area");
	var _dlgmembers = [];
	var _searchdata = [];
	var _isSearch = false;
	var _dlg_kind = "request";		/* org dialog 호출 종류 (ex : basic , basic_single , ...) */
	this.dummy = "";	
	
	this.dlgInfoInit = function (){
		var _o = _$this.getOption("info");
		if (_o.member) {
			if ( _o.member.length > 0) {
				var __a = [];
				for (var i = 0 ; i < _o.member.length ; i++) {
					__a[__a.length] = _o.member[i].info;
				}
				this.addDlgMember( __a );
			}
		}
		_dlg_kind = _o.orgkind;
		this.showSelectList();
	}
	this.dlgAddNode = function (){
	//선택된 사용자 찾기 & DlgMemer추가
		var selectList = [];
		var targetarea = _$dwt.find(".result_list");
		targetarea.find("input[name='result_target_chk']:checked")
				.each(function(){
					selectList[selectList.length] = $(this).parents("ul").data("search_node_obj");
				});
		this.addDlgMember(selectList);
		this.showSelectList();
	}
	this.addDlgMember = function (m){
		if ( _dlg_kind == "basic_single" ) { _dlgmembers = []; }
		var entry = null;
		for (var i = 0 ; i < m.length ; i++) {
			entry = this.getEntry(m[i]);
			/*
			$.extend( true , entry , nnn); 
			*/
			if ( this.dlgCheckDuplcate(entry.info) ){
				_dlgmembers[_dlgmembers.length] = entry.info;
			}
		}
	}
	this.dlgCheckDuplcate = function (e){
		if (_dlgmembers.length <= 0){return true;}
		for (var i = 0 ; i < _dlgmembers.length ; i++) {
			if (e.kind == _dlgmembers[i].kind) {
				switch (e.kind) {
					case "user":
						if (e.notesid == _dlgmembers[i].notesid) return false;
						break;
					case "group":
						if (e.groupcode == _dlgmembers[i].groupcode) return false;
						break;						
				}
			}
		}
		return true;
	}
	this.delSelectList = function (){
		var _a = [];
		_$dw.find("input[type='checkbox']:not(:checked)")
				.each(function(){
					_a[_a.length] = _dlgmembers[parseInt( $(this).attr("value") ,10)];
				});
		_dlgmembers = [];
		_dlgmembers = _a;
	}
	this.delAllList = function (){
		_dlgmembers = [];
	}
	this.showSelectList = function (){
		_$dw.empty();
		if ( _dlgmembers.length <= 0 ){_$dw.end().find("span.organ_select_area_count").text( _dlgmembers.length );return;}
		for (var i = 0 ; i < _dlgmembers.length ; i++) {
			var html = "";
			html += '<ul class="choice_target">';
			html += '<li class="first">';
			if ( _dlg_kind != "basic_single" ) { html += '<input name="" type="checkbox" value="' + i + '" />'; }
			html += '</li>';
			switch (_dlgmembers[i].kind) {
				case GC.eugp.user:
					html += '<li class="second">' + _dlgmembers[i].korname + '</li>';
					html += '<li class="third">' + _dlgmembers[i].dsppost + '</li>';
					html += '<li class="fourth">' + _dlgmembers[i].dspgroupname + '</li>';
					break;
				case GC.eugp.group:
					html += '<li class="fifth">' + _dlgmembers[i].dspgroupname + '</li>';
					break;
				case GC.eugp.publicgroup:
					
					break;
				case GC.eugp.person:
					
					break;				
				case GC.eugp.persongroup:
					break;
			}

			html += '</ul>';
			var o = $(html);
			_$dw.append(o);
		}
		_$dw.end().find("span.organ_select_area_count").text( _dlgmembers.length );
	}
	this.rtnDlgInfo = function (){ return _dlgmembers }
	this.getDlgKind = function (){ return _dlg_kind }
	this.getIsSearch = function (){return _isSearch }
	this.setDlgInfo = function (a){ _dlgmembers = a; return }
	this.doDlgSearch = function (){
		var _sea = $("div.organ_search" , _$me);
		var _sel = _sea.find("#organ_select option:selected");
		var _inp = _sea.find("input[name='organ_search_input']");
		if ( $.trim(_inp.val()) == "") {
			return false;
		}
		var __a = _$this.getOption("info");
		var __s = {
				partial : __a.partialsearch ? "1" : "0"
				, scope : _sel.attr("kind")
				, keyword : _inp.val().replace(/,/gi , "^")
				, empno : GC.user.empno
				, aprvopt : __a.aprv.aprvopt
				, aprvcode : __a.aprv.aprvcode
		};

		this.dlgSearch(__s);
		_inp.val("");
	}
	this.dlgSearch = function (__s , _callbackfunc){
		var _this = this;
		var entry = null;
	
		GF.ajax({
			url : "/" + GC.site.librarypath + "/(srch_usr_grp)?openagent"
			,dataType: "html"
			,type : "GET"
			,async : "true"
			,cache : false
			,data: __s
			,success : function(data,textStatus,xhr) {
				_searchdata = [];
				var datas = $.parseJSON(data);

				if (datas.key != "NODATA") {
					for (var i = 0 ; i < datas.length ; i++) {
						for (var d = 0 ; d < datas[i].data.length ; d++) {
							entry = _this.getEntry( $.extend( true , datas[i].data[d] , {"kind":datas[i].kind} ) );
							_searchdata[_searchdata.length] = entry.info;
						}
					}
				}

				_callbackfunc && _callbackfunc();
				_this.dlgSearchShow();
			}
			,error : function(xhr,textStatus) {
				GF.log("dlgSearch load error",textStatus);
				return;
			} 
		});
	}
	this.dlgSearchInit = function (a){
		if (a) {
			_$dwt.hide();
			_$dws.empty();
			_$dws.show();
			_$this.setCSearch(true);
			_isSearch = true;
		} else {
			_$dwt.show();
			_$dws.empty();
			_$dws.hide();
			_searchdata = [];
			_$this.setCSearch(false);
			_isSearch = false;
		}
	}
	this.dlgSearchShow = function (){
		var _this = this;
		this.dlgSearchInit( true );
		
		var h = "";
		h += '<div class="title_area">';
		h += '<div class="title"><span class="font_bold">검색결과</span> (총 ' + _searchdata.length + '명)</div>';
		h += '    <span class="btn_right_close fr r6 t9"></span>';
		h += '</div>';
		h += '<div class="result_list"></div>';
		var o = $(h);
		_$dws.append(o)
				.find("span.btn_right_close")
				.click(function(){
					_this.dlgSearchInit( false );
					return;
				});
		
		h = "";
		if (_searchdata.length <= 0) {
			_$dws.find(".result_list").append('<ul class="result_target"><li style="width:100%;text-align:center;;">검색 결과가 없습니다.</li></ul>');
			return;
		}
		
		var _hsr = _$dws.find(".result_list");
		h += '<ul class="result_target_title">';
		if ( _dlg_kind != "basic_single" ) {
			h += '<li class="first">';
			h += '<input name="allchk" type="checkbox" value="" />';
			h += '</li>';
		}
		h += '<li class="second">성명</li>';
		h += '<li class="third">직위</li>';
		h += '<li class="sisth">상태</li>';  
		h += '<li class="fifth"></li>';
		
		h += '</ul>';
		_hsr.append(h);

		for (var i = 0 ; i < _searchdata.length ; i++) {
			h = "";
			h += '<ul class="result_target">';
			h += '<li class="first"><input name="result_target_chk" type="' + (_dlg_kind == "basic_single" ? "radio" : "checkbox") + '" value="" /></li>';
			
			jobtitle = _searchdata[i].dsppost;
			//if(typeof(jobtitle)=="undefined" || jobtitle=="undefined" || jobtitle=="") jobtitle =  _searchdata[i].post; 
			
			userStatus = _searchdata[i].userstatus;
			if(userStatus=="" || userStatus == "undefined") userStatus = "&nbsp;";
			h = "";
			h += '<ul class="result_target">';
			h += '<li class="first"><input name="result_target_chk" type="' + (_dlg_kind == "basic_single" ? "radio" : "checkbox") + '" value="" /></li>';
			h += '<li class="second">' + _searchdata[i].korname + '</li>';
			h += '<li class="seventh">' + jobtitle + '</li>';
			h += '<li class="sisth">' + userStatus + '</li>';
			//h += '<li class="fifth"><span class=\"btn_mandator\" title=\"위임자정보\"></span></li>';
			h += '</ul>';
			
			_hsr.append(h).find("ul:last")
							.data("search_node_obj" , _searchdata[i])
							.click(function(){
							/*
								if ( _dlg_kind == "basic_single" ) {
									$(this).find("input[name='result_target_chk']").attr("checked","checked");
									_this.dlgAddSearchNode();
									return;
								}
								*/
							});
		}
		_hsr.find("input[type='radio']")
			.click(function(){
				var selectList = [];
				selectList[selectList.length] = $(this).parents("ul").data("search_node_obj");
				_this.addDlgMember(selectList);
				_this.showSelectList();
			});
		
		_hsr.find("ul.result_target_title")
			.find("input[type='checkbox']")
			.click(function(){
				var _tinp = _hsr.find("input[name='result_target_chk']");
				if ( $(this).is(":checked") ) {
					_tinp.attr("checked","checked");
				} else {
					_tinp.removeAttr("checked","checked");
				}
			});
	}
	this.dlgAddSearchNode = function (){
		var selectList = [];
		_$dws.find(".result_list")
				.find("input[name='result_target_chk']:checked")
				.each(function(){
					selectList[selectList.length] = $(this).parents("ul").data("search_node_obj");
				});

		this.addDlgMember(selectList);
		this.showSelectList();
	}
	/* act tree function */
	this.dlgTreeNodeSelect = function ( tree,flag,dtnode,dcode ){
		//선택부서원(결재권한자) 가져오기
		var eugp_obj = this;
		_deptMembers = [];
		var entry = null;
		var col_1=null; col_2=null; col_3=null;
		
		if (dtnode==null) { var deptKey = dcode; }
		else { var deptKey = dtnode.data.info.deptcode; }

		GF.getApproverList(deptKey, request.profile.reqKey, function(jsonObj) {
				if (jsonObj == null){
					_deptMembers = [];
				} else {
					for(var i = 0 ; i < jsonObj.length ; i++) {
						_deptMembers[_deptMembers.length] = $.extend( true ,  jsonObj[i] , {"kind":"user"} );
					}
				}
				eugp_obj.dlgMemberShow();
		})
	}
	this.dlgMemberShow = function (){
		var _this = this;
		var h = "";
		var _hsr = _$dwt;
		_hsr.empty();
		
		h += '<div class="result_list"></div>';
		_hsr.append(h);
		
		h = "";
		h += '<ul class="result_target_title">';
		h += '<li class="first">';
		h += '<input name="allchk" type="checkbox" value="" />';
		h += '</li>';
		h += '<li class="second">성명</li>';
		h += '<li class="third">직위</li>';
		h += '<li class="sisth">상태</li>';  
		h += '<li class="fifth"></li>';
		h += '</ul>';
		var _hsr = _$dwt.find(".result_list");
		_hsr.append(h);

		for (var i = 0 ; i < _deptMembers.length ; i++){
			jobtitle = _deptMembers[i].dsppost;
			//if(typeof(jobtitle)=="undefined" || jobtitle=="undefined" || jobtitle=="") jobtitle = _deptMembers[i].post; 
			
			userStatus = _deptMembers[i].userstatus;
			if(userStatus=="" || userStatus == "undefined") userStatus = "&nbsp;";
			
			h = "";
			h += '<ul class="result_target">';
			h += '<li class="first"><input name="result_target_chk" type="' + (_dlg_kind == "basic_single" ? "radio" : "checkbox") + '" value="" /></li>';
			h += '<li class="second" id="autochk">' + _deptMembers[i].korname + '</li>';
			h += '<li class="seventh" id="autochk">' + jobtitle + '</li>';
			h += '<li class="sisth" id="autochk">' + userStatus + '</li>';
			//h += '<li class="fifth"><span class=\"btn_mandator\" title=\"위임자정보\"></span></li>';
			h += '</ul>';

			_hsr.append(h).find("ul:last")
					.data("search_node_obj" , _deptMembers[i])
					.click(function(){
							var chk = $(this).find("input[name='result_target_chk']");
							//if ( chk.is(":checked") ) { chk.attr("checked",false); }
							//else { chk.attr("checked",true); }
					});
		}
		
		_hsr.find("input[type='radio']")
			.click(function(){
				var selectList = [];
				selectList[selectList.length] = $(this).parents("ul").data("search_node_obj");
				_this.addDlgMember(selectList);
				_this.showSelectList();
			});
		
		_hsr.find("ul.result_target_title")
			.find("input[type='checkbox']")
			.click(function(){
				var _tinp = _hsr.find("input[name='result_target_chk']");
				if ( $(this).is(":checked") ) {
					_tinp.attr("checked","checked");
				} else {
					_tinp.removeAttr("checked","checked");
				}
			});
	}
	
	/* tree tab 이외의 tab 클릭시 */
	this.dlgEtcTabInit = function (tabid){
		
	}
}
