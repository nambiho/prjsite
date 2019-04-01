/*
//***********************************************************************/
// class name : _request
// create : 2012-08-01
// coder : Moon
//***********************************************************************/
// */
//*
var _request_datachgreq = function (){
	var lineTemplate = "<td#{rowspan}>#{step}</td>" +
		"<td#{rowspan}>#{kind}</td>" +
		"#{select}" +
		"<td#{rowspan}>#{date}</td>" +
		"<td#{rowspan}>#{status}</td>" +
		"<td#{rowspan}>#{op}</td>";
	
	var trTemplate = "<tr id=\"tr_#{id}\">#{trtemplate}</tr>";
	
	var flatTemplate = "<td id=\"#{nameid}\">#{userinfo}</td><td id=\"#{deptid}\">#{dept}</td>";
	
	var userinfoTemplate = "<span class=\"usericon\" empno=\"#{empno}\"></span>" +
		"<span class=\"userinfo\" notesid=\"#{notesid}\">#{name}</span>";
	
	var hiddenflatTemplate = "<td id=\"#{nameid}\">#{name}</td><td id=\"#{deptid}\">#{dept}</td>";
	var selectTemplate = "<td colspan=2 id=\"record#{idx}\" class=\"first\">" +
		"<table class=\"frm_edit_no_oln_type2\"><tr><td>" +
		"#{select}" +
		"</td><td width=\"27\">" +
		"#{orgicon}" +
		"</td></tr></table>" +
		"</td>";
	
	var orgTemplate = "<div id=\"org_#{idx}\" reqstatus=\"#{reqstatus}\"><span class=\"orgbtn btn_user_icon fr\"></span></div>";

	var inputTemplate = "<td colspan=2 id=\"record#{idx}\" class=\"first\">" +
		"<table class=\"frm_edit_no_oln_type2\"><tr><td>" +
		"<input type=\"text\" id=\"#{id}\" style=\"width:100%\">" +
		"</td><td width=\"27\">" +
		"<span class=\"btn_user_icon fr\"></span>" +
		"</td></tr></table>" +
		"</td>";
		
	var opTemplate = "<div onclick=\"request.viewOpinion('#{reqstatus}');\" style=\"cursor:pointer\">보기</div>";
	
	var _this = null
	, space = "-"
	, nbsp = "&nbsp;"
	, comboname = "reqcombo"
	, inputname = "reqinput"
	, _selectHookFunc = "SelectUser_"
	, _active = null
	, _class = null
	, _action = ""
	, _commentflag = false
	, _hiddenline = {}
	, _hidden = "";
		
	var _apr = {
		action : ""
	,	commentflag : true
	,	processCallBack : null
	,	passwordCallBack : null
	,	opinionCallBack : null
	};
	
	/* 보조양식에서 설정하고 init 함수에서 extend
	var doc = {};
	var profile = {};
	var apprInfo = {};
	// */
	
	function _setUser(src){
		var tmp = src.split("{`");
		if (tmp.length != 9){
			tmp = "{`{`{`{`{`{`-{`-{`-".split("{`");
		}
		return {
			korname : tmp[0]
		,	empno : tmp[1]
		,	post : tmp[2]
		,	groupname : tmp[3]
		,	groupcode : tmp[4]
		,	notesid : tmp[5]
		,	reqdate : tmp[6].split(" ")[0]
		,	reqstatus : tmp[7]
		,	reqopinion : tmp[8]
		}
	}
	/*
	 * replace method
	// */
	function __RX__(X_, json){
		var tmp = X_ || "";
		for (s in json) 
			tmp = tmp.replace(new RegExp("#{" + s + "}", "g"), json[s]);
		return tmp;
	}
	/* 
	 * hidden 라인이 선택 되어야 할 때 처리 
	// */
	function _drawHiddenLine(status, kind, setstep){
		var _button_ = ""
		, _actions_ = "";
			
		if ( _class ){
			select = __RX__( hiddenflatTemplate, {
				nameid : "name_" + status
			,	deptid : "dept_" + status
			,	name : nbsp
			,	dept : nbsp
			});
							
			_hiddenline[status] = {line : "", line_kind : kind, setstep : setstep};
			_button_ = "_" + status;
			_actions_ = $("#frm_action_lft", _active).attr("actions") + "," + _button_;
			
			$("#frm_action_lft", _active).attr("actions", _actions_);
			_class.formButtons[_button_] = {
				text 	: kind + "선택" , highlight	: true
			,	click	: function (doc){
					_class[_button_] ? _class[_button_](doc, status, kind) : openOrg(false, _addUser, {doc:doc,status:status,kind:kind});
				}
			}
		}
		return select;
	}
	/* 
	 * _replaceRecord select, hidden의 데이터를 선택 했을 때 변경 시 auto로 변경 
	// */
	function _replaceRecord(i){
		var inputrecord = $("input[name=LineRecord]", _active).val().split(", ")
		, sep = inputrecord[i].split("{`");

		sep[3] = "auto";
		sep[4] = space;
		inputrecord[i] = sep.join("{`");

		$("input[name=LineRecord]", _active).val( inputrecord.join(", ") );
	}
	/* 
	 * ajax select options 
	// */
	function _ajaxSelectOptions(selectid, src){
		var url = new GF.CURL("/" + _this.profile.profileDb + "/seloptions?openagent", {
			usertype : src.usertype
		,	user : src.user
		,	reqkey : _this.profile.reqKey
		});
		
		GF.ajax({
			url : url.url
		,	dataType: "html"
		,	type : "GET"
		,	async : true
		,	cache : false
		,	success : function (data,textStatus,xhr){
				var userlist = data.trim().split("^")
				, options = ""
				, reqstatus = $("#" + selectid, _active).attr("reqstatus")
				, draftinfo = _this.apprInfo.draftField[reqstatus] || "";
				$.each(userlist, function (index, userinfo){
					var user = _setUser(userinfo);
					options += "<option value=\"" + userinfo + "\""+ (userinfo==draftinfo ? " selected" : "") +">"
					+ user.korname + " " + user.post + " " + user.groupname + "</option>";
				});
				$(options).appendTo("#" + selectid);
			}
		,	error : function (xhr,textStatus) {
				GF.log("load error",textStatus);
			}
		});
	}
	/* 
	 * ajax password function 
	// */
	function _ajaxPassword(val, callBack){
		/* default callBack : _resultPass */
		if (val.trim() == ""){alert("비밀번호를 입력 해 주세요."); return}
		
		GF.ajax({
			url : (new GF.CURL("/" + _this.profile.profileDb + "/checkpwd?openagent&id=" + GC.user.userid + "&pw=" + val)).url
		,	dataType: "html"
		,	type : "GET"
		,	async : true
		,	cache : false
		,	success : function(data,textStatus,xhr) {
				var __active = GC.active();
				if(1==data){
					$( __active ).dialog("close");
					
					if( callBack ) callBack(true);
					else {
						if( _apr.commentflag || ( _apr.action=="revise" )){
							_this.inputOpinion( _apr.action, function(opinion){
								$(GC.active()).dialog("close");
								( _apr.processCallBack || _process)( getParam(opinion) );
							});
						} else {
							( _apr.processCallBack || _process)( getParam() );
						}
					}
				} else {
					if( callBack ) {callBack(false); $( __active ).dialog("close");}
					else alert("비밀번호가 틀렸습니다.");
				}
			}
		,	error : function(xhr,textStatus) {
				GF.log("load error",textStatus);
			}
		});
	}
	/* 
	 * rocess Call function 
	// */
	function _process(param, __callback){
		if ( _this.doc.isedit ) 
			$(_active).doc().submit(
				function (xhr,data,textStatus){
					(__callback||returnData)(data);
				}
			);
		else {
			var url = new GF.CURL("/" + _this.profile.reqDbPath + "/reqproc" + (_this.profile.reqForm == "fm_reqdatachange1" ? "" : "2") + "?openform&reqkey=" + _this.profile.reqKey);
			GF.ajax({
				url : url.url
			,	type : "POST"
			,	data : param
			,	cache : false
			,	success : function (data,textStatus,xhr){
					(__callback || returnData)(data);
				}
			,	error : function (xhr,textStatus){
					alert("textStatus : " + textStatus);
					GF.log("load error",textStatus);
					ret = false;
				} 
			});
		}
	}
	/*
	 * check _hidden line
	// */
	function _checkHidden(){
		var hiddencheck = true
		, vHidden = [];
		
		for (x in _hiddenline){
			if ( _hiddenline[x].setstep == "hidden" ){
				if ( _hiddenline[x].line.trim() == "" ){
					alert("\"" + _hiddenline[x].line_kind + "\" 지정이 되지 않았습니다.");
					hiddencheck = false;
					break;
				}
			}
			
			vHidden[vHidden.length] = x + ":" + _hiddenline[x].line;
		}
		
		if (hiddencheck)
			if ( _this.doc.isedit ) $("input[name=hiddenLine]", _active).val( vHidden.join(";") );
			else _hidden=vHidden.join(";");
		
		return hiddencheck;
	}
	/*
	 * 사용자 추가
	// */
	function _addUser(argv, o){
		var members = o.members();
		if (members.length == 0) return;
		var sUser = 	members[0].info.korname + "{`" +
						members[0].info.empno + "{`" +
						members[0].info.dsppost + "{`" +
						members[0].info.dspgroupname + "{`" +
						members[0].info.groupcode + "{`" +
						members[0].info.notesid + "{`" +
						"-{`-{`-";
		_hiddenline[argv.status].line = sUser;
		
		$("#name_" + argv.status, _active).text( members[0].info.korname + " " + members[0].info.dsppost);
		$("#dept_" + argv.status, _active).text(members[0].info.dspgroupname);
	}
	/*
	 * select box 에 사용자 추가 또는 항목에 있는 사용자이면 선택
	// */
	function _selectBox(key, o){
		var members = o.members();
		if(members.length == 0) return;
		
		var sUser = members[0].info.korname + "{`" +
		members[0].info.empno + "{`" +
		members[0].info.dsppost + "{`" +
		members[0].info.dspgroupname + "{`" +
		members[0].info.groupcode + "{`" +
		members[0].info.notesid + "{`" +
		"-{`-{`-"
		, flag = true;
		
		if (_class[_selectHookFunc + key]){
			flag = _class[_selectHookFunc + key](sUser, key);
		}

		if (flag){
			var size = $("#" + comboname + key + " option", _active).size();
			
			for (var i=0;i<size;i++){
				if ($("#" + comboname + key + " option:eq(" + i + ")", _active).val() == sUser){
					$("#" + comboname + key + " option:eq(" + i + ")", _active).attr("selected", "selected");
					return true;
				}
			}
						
			$("<option></option>")
			.attr("selected", "selected")
			.attr("value", sUser)
			.text(members[0].info.korname + " " + members[0].info.dsppost + " " + members[0].info.dspgroupname)
			.appendTo("#" + comboname + key, _active);
		}
	}
	
	function _inputBox(key, o){
		var members = o.members();
		if(members.length == 0) return;
		
		var sUser = members[0].info.korname + "{`" +
		members[0].info.empno + "{`" +
		members[0].info.dsppost + "{`" +
		members[0].info.dspgroupname + "{`" +
		members[0].info.groupcode + "{`" +
		members[0].info.notesid + "{`" +
		"-{`-{`-"
		, flag = true;
		
		if (_class[_selectHookFunc + key])
			flag = _class[_selectHookFunc + key](sUser, key);
		
		if (flag){
			$("#" + inputname + key, _active)
			.val(members[0].info.korname + " " + members[0].info.dsppost + " " + members[0].info.dspgroupname)
			.attr("userinfo", sUser);
		}
	}	
	/*
	 * 결재라인 그리기
	// */
	function drawLine(_info){
		var lineinfo = {org : {}, hook : {}};
		$.extend(lineinfo, _info);
		lineinfo.hook.chgUser && lineinfo.hook.chgUser();
		
		var linerecord = _this.profile.reqLineRecord;
		if ( linerecord.length == 0 ) return;
		
		var apprlist = ( _this.apprInfo.apprList || _this.profile.reqUserInfo ).split(";")
		, tr = ""
		, td = ""
		, user = {}
		, select = ""
		, status = ""
		, kind = ""
		, setstep = ""
		, usertype = ""
		, combojson = {}
		, ulist = []
		, rowspan = "";
		
		for ( var idx = 0 ; idx < linerecord.length ; idx++, td="", select="", ulist=[], rowspan="" ){
			status = linerecord[idx].reqStepStatus;
			kind = linerecord[idx].reqKind;
			setstep = linerecord[idx].reqSetStep;
			usertype = linerecord[idx].reqUserType;
			
			ulist = apprlist[idx].split("^");

			if ( setstep=="auto" ){
				var usertable = "";
				
				if (ulist.length>1) rowspan = " rowspan=\"" + ulist.length + "\"";
				
				for (var i=0; i < ulist.length; i++){
					user = _setUser(ulist[i]);

					if (i == 0){
						tr += __RX__( trTemplate , {
							trtemplate : __RX__( lineTemplate, {
								rowspan : rowspan
							,	step : linerecord[idx].reqStep
							,	kind : linerecord[idx].reqKind
							,	select : __RX__( flatTemplate, {
										userinfo : user.empno == "" ? "" : __RX__(userinfoTemplate, {
											empno : user.empno
										,	notesid : user.notesid
										,	name : user.korname + " " + user.post
										})
									,	nameid : "name_" + status
									,	deptid : "dept_" + status
									,	dept : user.groupname
								})
							,	date : (ulist.length > 1) || !user.reqdate || (user.reqdate == space) ? nbsp : user.reqdate || nbsp
							,	status : (ulist.length > 1) || !user.reqstatus || (user.reqstatus == space) ? nbsp : user.reqstatus || nbsp
							,	op : (ulist.length > 1) || !user.reqopinion || (user.reqopinion == space) ? nbsp : __RX__( opTemplate, {
																							reqstatus : linerecord[idx].reqStepStatus
																						})
							})
						,	id : status
						});
					} else {
						tr += __RX__( trTemplate , {
							trtemplate : user.empno == "" ? "" : __RX__( flatTemplate, {
								userinfo : __RX__(userinfoTemplate, {
									empno : user.empno
								,	notesid : user.notesid
								,	name : user.korname + " " + user.post
								})
							,	nameid : "name_" + status
							,	deptid : "dept_" + status
							,	dept : user.groupname
							})
						,	id : status
						});
					}
				}
			} else {
				/* auto와 trtemplate이 다르기 때문에 elseif 하지 않고 else를 사용함 */
				if ( setstep=="select" ){
					if ( _this.doc.isedit ){
						if ( linerecord[idx].reqHiddenSet == space || linerecord[idx].reqHiddenSet == _this.apprInfo.reqstatus) {
							var combo = "<select id=\"" + comboname + idx + "\" style=\"width:100%\" " +
									"reqstatus=\"" + linerecord[idx].reqStepStatus + "\">";
							combo += "<option>-- " + linerecord[idx].reqKind + " 선택 --";
							
							if (usertype == "1"){
								var linelist = apprlist[idx].split("^");
								$.each(linelist, function (index, src){
									user = _setUser(src);
									combo += "<option value=\"" + src + "\">" + user.korname + " " + user.post + " " + user.groupname;
								});
							} else if (usertype == "2" || usertype == "4"){
								combojson[comboname + idx] = {
									usertype : usertype
								,	user : apprlist[idx].replace("-", $("input[name='DeptCode']", _active).val())
								};
							} else if (usertype == "3"){
								combojson[comboname + idx] = {usertype:usertype, user:apprlist[idx]};
							}
							combo += "</select>";
							select = __RX__( selectTemplate, {
								idx : idx
							,	orgicon : ( lineinfo.org[status] ? __RX__( orgTemplate, {
									idx : idx
								,	reqstatus : status
								}): "")
							,	select : combo
							});
						}
					} else {
						if ( _this.apprInfo.reqstatus == "DRAFT" ){
							var draftinfo = _this.apprInfo.draftField[status] || "";
							if (draftinfo == "") continue;
							else user = _setUser(draftinfo);
						} else 	user = _setUser(ulist[0]);
						select = __RX__( flatTemplate, {
							userinfo : __RX__(userinfoTemplate, {
								empno : user.empno
							,	notesid : user.notesid
							,	name : user.korname + " " + user.post
							})
						,	nameid : "name_" + status
						,	deptid : "dept_" + status
						,	dept : user.groupname
						});
					}
				} else if ( setstep=="hidden" ) {
					user = _setUser(ulist[0]);
					if ( _this.apprInfo.reqstatus == linerecord[idx].reqHiddenSet ){
						select = _drawHiddenLine(status, kind, setstep);
					} else 	continue;
				} else {
					select = __RX__( selectTemplate, {
						idx : idx
					,	orgicon : ( lineinfo.org[status] ? __RX__( orgTemplate, {
							idx : idx
						,	reqstatus : status
						}): "")
					,	select : "&nbsp;"
					});
				}
				
				tr += __RX__( trTemplate , {
					trtemplate : __RX__( lineTemplate, {
						rowspan : rowspan
					,	step : linerecord[idx].reqStep
					,	kind : linerecord[idx].reqKind
					,	select : select
					,	date : (ulist.length > 1) || !user.reqdate || (user.reqdate == space) ? nbsp : user.reqdate || nbsp
					,	status : (ulist.length > 1) || !user.reqstatus || (user.reqstatus == space) ? nbsp : user.reqstatus || nbsp
					,	op : (ulist.length > 1) || !user.reqopinion || (user.reqopinion == space) ? nbsp : __RX__( opTemplate, {
																							reqstatus : linerecord[idx].reqStepStatus
																						})
					})
				,	id : status
				});
			}
		}
		
		/* 결재 라인 테이블 */
		$("#ApprLineTBODY").html(tr);
		/* select 리스트 처리 */
		//*
		$.each(combojson, function (selectid, src){
			_ajaxSelectOptions(selectid, src);
		});
		// */

		/* 추가개발 */
		//if(_this.profile.reqForm == "fm_reqdatachange1" & _this.doc.adddev == "YES"){
		if(_this.profile.reqForm == "fm_reqdatachange1" & ((_this.doc.adddev == "YES" && !_this.doc.isedit) || (_this.doc.isedit))){
			var linerecord2 = _this.profile.reqLineRecord2;
			if ( linerecord2.length == 0 ) return;
			
			var apprlist2 = ( _this.apprInfo.apprList2 || _this.profile.reqUserInfo2 ).split(";")
			, tr2 = ""
			, td = ""
			, user = {}
			, select = ""
			, status = ""
			, kind = ""
			, setstep = ""
			, usertype = ""
			, combojson2 = {}
			, ulist = []
			, rowspan = "";			
			
			for ( var idx = 0 ; idx < linerecord2.length ; idx++, td="", select="", ulist=[], rowspan="" ){
				status = linerecord2[idx].reqStepStatus;
				kind = linerecord2[idx].reqKind;
				setstep = linerecord2[idx].reqSetStep;
				usertype = linerecord2[idx].reqUserType;

				ulist = apprlist2[idx].split("^");
				
				if ( setstep=="auto" ){
					/*
					var usertable = "";
					
					if (ulist.length>1) rowspan = " rowspan=\"" + ulist.length + "\"";
					
					for (var i=0; i < ulist.length; i++){
						user = _setUser(ulist[i]);

						if (i == 0){
							tr2 += __RX__( trTemplate , {
								trtemplate : __RX__( lineTemplate, {
									rowspan : rowspan
								,	step : linerecord2[idx].reqStep
								,	kind : linerecord2[idx].reqKind
								,	select : __RX__( flatTemplate, {
											userinfo : user.empno == "" ? "" : __RX__(userinfoTemplate, {
												empno : user.empno
											,	notesid : user.notesid
											,	name : user.korname + " " + user.post
											})
										,	nameid : "name_" + status
										,	deptid : "dept_" + status
										,	dept : user.groupname
									})
								,	date : (ulist.length > 1) || !user.reqdate || (user.reqdate == space) ? nbsp : user.reqdate || nbsp
								,	status : (ulist.length > 1) || !user.reqstatus || (user.reqstatus == space) ? nbsp : user.reqstatus || nbsp
								,	op : (ulist.length > 1) || !user.reqopinion || (user.reqopinion == space) ? nbsp : __RX__( opTemplate, {
																								reqstatus : linerecord2[idx].reqStepStatus
																							})
								})
							,	id : status
							});
						} else {
							tr2 += __RX__( trTemplate , {
								trtemplate : user.empno == "" ? "" : __RX__( flatTemplate, {
									userinfo : __RX__(userinfoTemplate, {
										empno : user.empno
									,	notesid : user.notesid
									,	name : user.korname + " " + user.post
									})
								,	nameid : "name_" + status
								,	deptid : "dept_" + status
								,	dept : user.groupname
								})
							,	id : status
							});
						}
					}
					*/
				}else{ 
					if ( setstep=="select" ){
						if ( _this.doc.isedit ){
							if ( linerecord2[idx].reqHiddenSet == space || linerecord2[idx].reqHiddenSet == _this.apprInfo.reqstatus) {
								var combo2 = "<select id=\"" + comboname + "2" + idx + "\" style=\"width:100%\" " +
										"reqstatus=\"" + linerecord2[idx].reqStepStatus + "\">";
								combo2 += "<option>-- " + linerecord2[idx].reqKind + " 선택 --";
								
								if (usertype == "1"){
									var linelist = apprlist2[idx].split("^");
									$.each(linelist, function (index, src){
										user = _setUser(src);
										combo2 += "<option value=\"" + src + "\">" + user.korname + " " + user.post + " " + user.groupname;
									});
								} else if (usertype == "2" || usertype == "4"){
									combojson2[comboname + "2" + idx] = {
										usertype : usertype
									,	user : apprlist2[idx].replace("-", $("input[name='DeptCode']", _active).val())
									};
								} else if (usertype == "3"){
									combojson2[comboname + "2" + idx] = {usertype:usertype, user:apprlist2[idx]};
								}
								combo2 += "</select>";
								select = __RX__( selectTemplate, {
									idx : idx
								,	orgicon : ( lineinfo.org[status] ? __RX__( orgTemplate, {
										idx : idx
									,	reqstatus : status
									}): "")
								,	select : combo2
								});
							}
						} else {
							if ( _this.apprInfo.reqstatus == "DRAFT" ){
								var draftinfo = _this.apprInfo.draftField[status] || "";
								if (draftinfo == "") continue;
								else user = _setUser(draftinfo);
							} else 	user = _setUser(ulist[0]);
							
							select = __RX__( flatTemplate, {
								userinfo : __RX__(userinfoTemplate, {
									empno : user.empno
								,	notesid : user.notesid
								,	name : user.korname + " " + user.post
								})
							,	nameid : "name_" + status
							,	deptid : "dept_" + status
							,	dept : user.groupname
							});
							
						}
					} else if ( setstep=="hidden" ) {
						user = _setUser(ulist[0]);
						if ( _this.apprInfo.reqstatus == linerecord2[idx].reqHiddenSet ){
							select = _drawHiddenLine(status, kind, setstep);
						} else 	continue;
					} else {
						select = __RX__( selectTemplate, {
							idx : idx
						,	orgicon : ( lineinfo.org[status] ? __RX__( orgTemplate, {
								idx : idx
							,	reqstatus : status
							}): "")
						,	select : "&nbsp;"
						});
					}
				}
				
				tr2 += __RX__( trTemplate , {
					trtemplate : __RX__( lineTemplate, {
						rowspan : rowspan
					,	step : linerecord2[idx].reqStep
					,	kind : linerecord2[idx].reqKind
					,	select : select
					,	date : (ulist.length > 1) || !user.reqdate || (user.reqdate == space) ? nbsp : user.reqdate || nbsp
					,	status : (ulist.length > 1) || !user.reqstatus || (user.reqstatus == space) ? nbsp : user.reqstatus || nbsp
					,	op : (ulist.length > 1) || !user.reqopinion || (user.reqopinion == space) ? nbsp : __RX__( opTemplate, {
																							reqstatus : linerecord2[idx].reqStepStatus
																						})
					})
				,	id : status
				});
			}

			/* 추가 결재 라인 테이블 */
			$("#ApprLineTBODY2").html(tr2);

			/* select 리스트 처리 */
			//*
			
			$.each(combojson2, function (selectid, src){
				_ajaxSelectOptions(selectid, src);
			});
			// */
		}		
		
		
		

		/* 신청서 공용 조직도 div */
		$("<div></div>")
			.attr("id", _this.doc.unid)
			.attr("style", "display:none")
			.appendTo(_active);
		/* setstep이 select 에서 나오는 아이콘 이벤트 처리 */
		$("[id*='org_']", _active).click(function (){
			//var key = $(this).attr("id").right("org_");
			//openOrg(false, _selectBox, key);           /* 결재자 조직도 */
			//openOrg(false, _selectBox, key, false);     /* 일반 조직도   */
			var key = $(this).attr("id").right("org_")
			, status = lineinfo.org[$(this).attr("reqstatus")];
			openOrg(false, _selectBox, key, (status && status == "aprv" ? true : false));		
		});
	}
	/*
	 * 조직도를 각 문서의 한개만 생성
	 * 옵션 설정 하고
	 * argv : ismulti를 정의 하거나 또는 eugp의 option을 정의
	 * drawfunc : ismulti를 정의 했을 경우 draw 함수
	 * param : drawfunc의 인수로 사용하는 값, json, string 등 drawfunc에서 개발자가 사용
	 * req : true request form, false 일반 조직도, 기본값은 true
	 * divid : 개발자가 만든 div를 만들었을 때 사용
	 * loadfunc : 조직도가 표시 될 때 사용 되는 함수. 기본적으로 멤버를 초기화 시킴
	// */
	function openOrg(argv, drawfunc, param, req, divid, loadfunc){
		var reqOrg = ( typeof req == typeof __$dummy$__ ? true : req );
		var _opt = ( typeof argv == typeof true ) ? {
			ismulti : argv
		,	isedit : _this.doc.isedit
		,	aprv : reqOrg ? {
				aprvopt : "1"
			,	aprvcode : _this.profile.reqKey
			} : {}
		,	draw : function (o){
				drawfunc && drawfunc(param, o);
			}
		} : argv ;
		
		(reqOrg ?
			$.extend(
				_opt
			,	{	dlgurl : "/" + GC.site.librarypath + "/win_org_req?readform&"
				,	dlgTabs : {
						tab1 : {
							text : "결재자"
						,	click : 
								function (o){ o.actTabs("tab1"); }
						,	dspid	: "TAB_1"
						,	tree	: {
								type:{display : "dept", select : "all"}
							,	def : {
									key : GC.user.groupfullcode.split(GC.site.fieldsep)
								,	title : GC.user.groupfullname.split(GC.site.fieldsep)
								}
							,	dy_options : {checkbox : false}
							,	dwid : "tabs_1"
							}
						}
					}
				}
			)
		: null);
		
		var selector = "#" + (divid || _this.doc.unid)
		, __active = GC.active(); /* 팝업에서는 active를 다시 잡아야되기 때문에 */
		var local_eugp = $(selector, __active).eugp() ?
				$(selector, __active) :
				$(selector, __active).eugp({});
		local_eugp.eugp().load( function (o){
			loadfunc ? loadfunc(o) : o.setMembers([]);
		});
		local_eugp.eugp().showOrg(_opt);
	}
	/*
	 * 신청
	// */
	function request(){
		/* check hidden line */
		if ( !_checkHidden() ) return false;
		
		var apprUserList = []
		, optIndex = 0
		, linerecord = _this.profile.reqLineRecord
		, line = _this.profile.reqUserInfo.split(";");
		
		if (_this.profile.isNoApprover){
			if (line[0].indexOf(GC.user.empno) != -1){
				alert("신청자가 승인자로 선택 될 수 없는 서식 입니다.");
				return false;
			}
		}
		
		/* 전체 라인 */
		for ( var i = 0 ; i < linerecord.length ; i++ ){
			if (!$("#tr_"+linerecord[i].reqStepStatus, _active).is(":hidden")){
				if ( linerecord[i].reqSetStep=="hidden" ){
					if ( linerecord[i].reqHiddenSet == _this.apprInfo.reqstatus ){
						apprUserList.push( _hiddenline[linerecord[i].reqStepStatus].line );
						_replaceRecord(i);
					} else {
						apprUserList.push( space );
					}
				} else if (linerecord[i].reqSetStep=="auto"){
					apprUserList.push( line[i] );
				} else {
					if ( linerecord[i].reqHiddenSet == space || linerecord[i].reqHiddenSet == _this.apprInfo.reqstatus){
						optIndex = $("#" + comboname + i + " option:selected", _active).index();
						/* [S][변경태그] */
						///if ( optIndex == 0 ){
						///	alert(linerecord[i].reqStep + ">" + linerecord[i].reqKind + "를 지정 하십시오.");
						///	return false;
						///}
						if(_this.profile.reqForm == "fm_reqdatachange1"){
							var chk_appr = false;
							chk_appr = true;
							if ( optIndex == 0 ){
								if(chk_appr){
									alert(linerecord[i].reqStep + ">" + linerecord[i].reqKind + "를 지정 하십시오.");
									return false;
								}
							}
						}else{
							var chk_usr = $("input[name='EmpNo']", _active).val().substring(0, 1);
							var chk_appr = false;
							if(linerecord[i].reqStepStatus.indexOf("N") == -1){
								if ( optIndex == 0 ){
									if(chk_usr == "5"){
										if(linerecord[i].reqStepStatus == "O1" || linerecord[i].reqStepStatus == "O2" || linerecord[i].reqStepStatus == "R1"){
											chk_appr = true;
										}
									}else{
										if(linerecord[i].reqStepStatus == "O2" || linerecord[i].reqStepStatus == "R1"){
											chk_appr = true;
										}
									}
								}
								if(chk_appr){
									alert(linerecord[i].reqStep + ">" + linerecord[i].reqKind + "를 지정 하십시오.");
									return false;
								}
							}
						}
						/* [E][변경태그] */
						
						apprUserList.push( $("#" + comboname + i, _active).val() );
						_replaceRecord(i);
					} else {
						apprUserList.push( line[i] );
					}
				}
			} else apprUserList.push( line[i] )
		}

		$("input[name=ApprList]", _active).val( apprUserList.join(";") );
		//return true;

		
		/* 추가개발 */
		if(_this.profile.reqForm == "fm_reqdatachange1"){
			var chk_adddev = $("input[name=AddDev]", _active);
			if(chk_adddev[1].checked){
				var apprUserList2 = []
			            		, optIndex = 0
			            		, linerecord2 = _this.profile.reqLineRecord2
			            		, line = _this.profile.reqUserInfo2.split(";");
				
				for ( var i = 0 ; i < linerecord2.length ; i++ ){
					if (!$("#tr_"+linerecord2[i].reqStepStatus, _active).is(":hidden")){
						if ( linerecord2[i].reqSetStep=="hidden" ){
							if ( linerecord2[i].reqHiddenSet == _this.apprInfo.reqstatus ){
								apprUserList2.push( _hiddenline[linerecord2[i].reqStepStatus].line );
								_replaceRecord(i);
							} else {
								apprUserList2.push( space );
							}
						} else if (linerecord2[i].reqSetStep=="auto"){
							apprUserList2.push( line[i] );
						} else {
							if ( linerecord2[i].reqHiddenSet == space || linerecord2[i].reqHiddenSet == _this.apprInfo.reqstatus){
								optIndex = $("#" + comboname + "2" + i + " option:selected", _active).index();
								var chk_appr = false;
								if ( optIndex == 0 ){
									if(linerecord2[i].reqStepStatus == "R3" || linerecord2[i].reqStepStatus == "R5"){
										chk_appr = true;
									}
								}
								if(chk_appr){
									alert(linerecord2[i].reqStep + ">" + linerecord2[i].reqKind + "를 지정 하십시오.");
									return false;
								}

								apprUserList2.push( $("#" + comboname + "2" + i, _active).val() );
								_replaceRecord(i);
							} else {
								apprUserList2.push( line[i] );
							}
						}
					} else apprUserList2.push( line[i] )
				}
				$("input[name=ApprList2]", _active).val( apprUserList2.join(";") );
			}
		}
		
		return true;	
	}

	
	/*
	 * 승인, 접수
	// */
	function approve(argv, __callback){
		if ( typeof(argv)==typeof("") ) _apr.action = argv;
		else _apr = argv
		
		if ( _apr.action != "revise" ){
			/* check hidden line */
			if ( !_checkHidden() ) return;
			
			if ( _this.doc.isedit ){
				$("select[id*=" + comboname + "]", _active).each( function (index, o){
					var linerecord = _this.profile.reqLineRecord
					, i = parseInt(o.id.right(comboname))
					, optIndex = $("#" + comboname + i + " option:selected", _active).index()
					, apprlist = _this.apprInfo.apprList.split(";");

					if ( optIndex == 0 ){
						alert(linerecord[i].reqStep + ">" + linerecord[i].reqKind + "를 지정 하십시오.");
						return false;
					} else {
						apprlist[i] = $(o).val();
						$("input[name=ApprList]", _active).val( apprlist.join(";") );
						_replaceRecord(i);
					}
				});
			}
		}

		/* Call Password Check */
		_this.checkPass(null, __callback);
	}
	/*
	 * 비밀번호 화면 출력
	// */
	function checkPass(callBack, __callBack){
		// callBack : 패스워드 체크 후
		// __callBack : approve 최종 실행 후
		function _complete(data){
			var __active = GC.active(true);
			if (data){
				$( __active ).dialog("close");
				
				if ( callBack ) callBack(true, __callBack);
				else {
					if ( _apr.commentflag || ( _apr.action=="revise" || _apr.action=="reject" )){
						_this.inputOpinion( _apr.action, function (opinion){
							$(GC.active()).dialog("close");
							( _apr.processCallBack || _process)( getParam(opinion), __callBack );
						});
					} else {
						( _apr.processCallBack || _process)( getParam(), __callBack );
					}
				}
			}
		}
		
		if ( _apr.passwordCallBack ){ _apr.passwordCallBack( _complete ); return }
		GF.CHKPW.doChk(_complete);
	}
	/*
	 * 의견 화면 출력
	// */
	function inputOpinion(action, callBack){
		if ( _apr.opinionCallBack ){ _apr.opinionCallBack( _process ); return }
		GF.dialog({
			content:{
				url : (new GF.CURL("/" + _this.profile.profileDb + "/opinion?openform")).url
			}
		,	onload : function (){
				$("textarea[name='reqopinion']", GC.active()).focus();
			}
		,	title : "의견 입력"
		,	isactive : true
		,	width : 260
		,	height : 200
		,	resizable : false
		,	buttons : [
				{ text: "확인", click : function (){
						if ($("textarea[name='reqopinion']", GC.active()).val().trim() == ""){
							alert("공백 내용으로 되어 있습니다.");
							return;
						}
						callBack($("textarea[name='reqopinion']", GC.active()).val());
					}
				}
			,	{ text: "취소", click : function (){
						if (action != "")
							if (action != "revise")
								if (confirm("의견을 저장 하지 않고 승인 하시겠습니까?"))
									callBack($("textarea[name='reqopinion']", GC.active()).val());
						$(this).dialog("close");
						
					} 
				}
			]
		});
	}
	/*
	 * view opinion
	// */
	function viewOpinion(status){
		var param = {
			unid : _this.doc.unid
		,	applcode : _this.doc.applcode
		,	reqkey : _this.profile.reqKey
		,	status : status
		};
		
		var url = new GF.CURL("/" + _this.profile.profileDb + "/viewOpinion?openform", param);
		GF.dialog({
			content : {
				url : url.url
			}
		,	onload : function (){
				var __active = GC.active()
				, apprlist = _this.apprInfo.apprList.split(";")
				, shtml = ""
				, tmp = []
				, x = "";
	
				$.each(apprlist, function (idx, src){
					if (src.split("^").length > 1) return;
					if ( _this.profile.reqLineRecord[idx].reqSetStep == "hidden" ) return;
					var user = _setUser(src);
					var x = _this.profile.reqLineRecord[idx].reqStepStatus;
					shtml += ( user.reqopinion && user.reqopinion!=space ) ? "<tr" + (x==status?" style=\"background:#f1fff9\"":"") +">"+
							"<td class=\"top_txt\">" + user.korname + " " + user.post + "</td>"+
							"<td>" + _this.apprInfo.reqOpinion[x] + "</td>"+
							"</tr>" : "";
				});
				
				$("#tOpinion", __active).append(shtml);
			}
		,	title : "의견 보기"
		,	isactive : true
		,	width : 350
		,	height : 400
		,	resizable : false
		});
	}
	/* 
	 * get param 
	// */
	function getParam(opinion){
		return {
			unid : _this.doc.unid
		,	applcode : _this.doc.applcode
		,	action : _apr.action
		,	opinion : (opinion || "")
		,	hidden : _hidden
		,	json : _this.apprJSON
		,	__Click : "0"
		};
	}
	/* 
	 * get to String from json 
	// */
	function toString(json){
		var ret = [];
		$.each(json, function (name, value){
			var data = "";
			switch (typeof value){
			case "string":
				data = "\"" + value + "\"";
				break;
			case "number": case "boolean": case "function":
				data = value;
				break;
			case "object":
				data = _this.toString(value);
				break;
			}
			ret[ret.length] = "\"" + name + "\" : " + data;
		});
		return "{" + ret.join(",") + "}";
	}
	/* 
	 * process 
	// */
	function process(param, __callback){
		_process(param || getParam(""), __callback);
	}
	/* 
	 * deleteDocument 
	// */
	function deleteDocument(param, __callback){
		try{
		var url = new GF.CURL("/" + _this.profile.reqDbPath + "/reqproc?openform&reqkey=" + _this.profile.reqKey);
		param.action = "del";
		GF.ajax({
			url : url.url
		,	type : "POST"
		,	data : param
		,	cache : false
		,	success : function (data,textStatus,xhr){
				(__callback || returnData)(data);
			}
		,	error : function (xhr,textStatus){
				GF.log("load error",textStatus);
				return false;
			} 
		});
		} catch(e) {alert(e)}
	}
	/*
	 * draftDocument
	// */
	function draftDocument(){
		var draftField = [];
		$("select[id*='" + comboname + "']", _active).each( function (idx, o){
			if ($("option:selected", this).index() !== 0){
				draftField[draftField.length] = "\"" + $(this).attr("reqstatus") + "\":\"" + $(this).val() + "\"";
			}
		});
		$("input[name='draftField']", _active).val(draftField.join(","));
		return true;
	}
	/*
	 * returnData
	// */
	function returnData(data, tag){
		try{
			var jsonData = (typeof(data) == typeof("") ? $.parseJSON(data) : data);
			if (!jsonData.bflag){
				alert(jsonData.msg.replace(/\\n/gi,"\n"));
			} else {
				if (jsonData.msg == "") alert((tag ||"처리") + " 되었습니다.");
				else alert(jsonData.msg.replace(/\\n/gi,"\n"));
				_active.doc("close");
			}
		} catch(e){ alert(e); GF.log("error", _class + " error > " + e)}
	}
	/*
	 * initialzie
	// */
	function init(argv, __class){
		try{
		_this = this;
		$.extend( _this, argv );
		_class = ( __class || null );
		_active = GC.active(_this.doc.isedit?true:null);
		} catch (e){GF.log("request init error", e)}
	}

	return {
		apprJSON : ""	/* Property */
	,	init : init		/* Method */
	,	drawLine : drawLine
	,	request : request
	,	approve : approve
	,	inputOpinion : inputOpinion
	,	checkPass : checkPass
	,	viewOpinion : viewOpinion
	,	getParam : getParam
	,	openOrg : openOrg
	,	toString : toString
	,	process : process
	,	deleteDocument : deleteDocument
	,	draftDocument : draftDocument
	, 	returnData : returnData
	,	RX : __RX__
	};
} ;

// */
