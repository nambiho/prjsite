function ws4707() { }

ws4707.title = {
}

ws4707.formButtons = {
	draft 	: {	
		text 	: "임시저장"
	,	click	: function(doc) {
			if(request.draftDocument()){
				doc.submit(
					function(xhr,data,textStatus) {
						request.returnData(data,"임시저장");
					}
				)
			}
		}
	}
,	request 	: {	
		text 	: "신청", highlight	: true	
	,	click	: function(doc) {
			if(request.request()){
					if ( confirm("신청하시겠습니까?")) {
						doc.submit( function(xhr,data,textStatus) {
							request.returnData(data,"신청");
						});
				}
			}
		}
	}
,	edit 	: {	
		text 	: "편집"
	,	click	: function(doc) {
			doc.edit();
		}
	}
,	rewrite 	: {	
		text 	: "재작성"
	,	click	: function(doc) {
			if(!confirm("문서를 재작성 하시겠습니까?")) return;
	
			var url = new GF.CURL("/"+doc.getOption("dbpath")+"/dc_rnw?openagent");
	
			GF.ajax({
				url : url.url
				,dataType: "text"
				,type : "GET"
				,data:{
					docid : doc.getOption("unid")
					,applcode : doc.getOption("applcode")
				}
				,async : false
				,cache : false
				,success : function(data,textStatus,xhr) {
					var jobj = $.parseJSON(data);
					if(jobj.bflag == false){
						alert(jobj.msg);
						return;
					} else {
						var unid = jobj.msg;
						var _isundock = doc.getOption("isundock");
						var objUrl = new GF.CURL("/"+doc.getOption("dbpath")+"/0/"+unid+"?editDocument" + (_isundock ? "&isundock=1" : "")); 
						GF.load(GC.active(true),objUrl.url);
						_isundock = null;
						objUrl = null;
					}
				}
				,error : function(xhr,textStatus) {
					alert("오류 :: "+textStatus)
					return;
				} 
			});
		}
	}
,	approve 	: {	
		text 	: "승인", highlight	: true
	,	click	: function(doc) {
			if(!confirm("승인하시겠습니까?")) return;
			ws4707.callApprove(doc, "approve", "승인");
		}
	}
,	reject 	: {	
		text 	: "반려"
	,	click	: function(doc) {
			if(!confirm("반려하시겠습니까?")) return;
			ws4707.callApprove(doc, "reject", "반려");
		}
	}
,	del_temp		: {	
		text 	: "삭제"
	,	click	: function(doc) {
			if(!confirm("삭제하시겠습니까?")) return;
			request.deleteDocument(request.getParam());
		}
	}
} 

ws4707.callApprove = function (doc, param, tag, callback){
	request.approve(
		param
	,	callback || function (data){
			request.returnData(data, tag);
		}
	);
}

ws4707.formInit = function(opts) {
	var act = GC.active(true);

	ws4707.contentName = opts.req_subject;
	ws4707.title.requestTitle = request.profile.reqTitle;
	
	opts.buttons = ws4707.formButtons; 
	opts.htitle = ws4707.title;
	$(act).doc(opts); 

}


function ws4707_mot() { }

ws4707_mot.title = {
		requestTitle : ""
}

ws4707_mot.formInit = function(opts) {
	ws4707_mot.contentName = opts.req_subject;
	ws4707_mot.title.requestTitle = request.profile.reqTitle;
	
	opts.buttons = ws4707_mot.formButtons;
	opts.htitle = ws4707_mot.title;
	
	ws4707_mot.formInitThis(opts);
	
 	$(GC.active(true)).doc(opts);
 	
 	// MOT 정보 라인 그리기
 	ws4707_mot.drawTeamTable();
 	ws4707_mot.tableData();
}

ws4707_mot.opinion_formInit = function(opts) {
 	$(GC.active(true)).doc(opts);
 	ws4707_mot.ApproverSet("approveUser", opts); 	
}

ws4707_mot.ApproverSet = function(targetField, opts){
	var active = GC.active(true);
	var key = request.profile.reqKey;
	var middledeptcode = GC.user.middledeptcode;

	ws4707_mot.getUserlist({usertype : "2", user : middledeptcode, fieldname : targetField}, ws4707_mot.setSelectOption);
}


ws4707_mot.formInitThis = function(opts){
	var act = GC.active(true);
	
	ws4707_mot.motObj = GF.getValue("motObj", act);
	ws4707_mot.dspReqInfo = GF.getValue("dspReqInfo", act);
	
	if ( opts.docStatus != "COMPLETE" ){
		request.apprInfo.apprList = ws4707_mot.dspReqInfo.DspApprList;
		request.profile.linerecord = ws4707_mot.dspReqInfo.DspLineRecord;
		request.profile.reqLineRecord = ws4707_mot.dspReqInfo.DspLineJson;
		request.apprInfo.reqOpinion = ws4707_mot.dspReqInfo.DspOpinion;
	}
	request.drawLine();
	ws4707_mot.setMotObj();
}

ws4707_mot.setMotObj = function(motObj){
	if ( motObj == null ) request.apprJSON = request.toString(ws4707_mot.motObj);
	 else request.apprJSON = request.toString(disuseObj);
}

ws4707_mot.setSelectOption = function (data, fieldname, __callback){
	if (data.trim() == "") return;
	var userlist = data.trim().split("^")
	, options = "";
	
	$.each(userlist, function (index, userinfo){
		var user = request.setUser(userinfo);
		options += "<option value=\"" + userinfo + "\">" + user.korname + " " + user.post + "</option>";
	});
	$(options).appendTo("select[name^='" + fieldname + "']", GC.active(true));
	__callback && __callback();
}
ws4707_mot.getUserlist = function (src, callback, __callback){
	var url = new GF.CURL("/" + request.profile.profileDb + "/seloptions?openagent", {
		usertype : src.usertype
	,	user : src.user
	,	reqkey : request.profile.reqKey
	});

	GF.ajax({
		url : url.url
	,	dataType: "html", type : "GET", async : true, cache : false
	,	success : function (data,textStatus,xhr){
			callback && callback(data, src.fieldname, __callback);
		}
	,	error : function (xhr,textStatus) {
			GF.log("load error",textStatus);
		}
	});
}
ws4707_mot.formButtons = {
		rewrite 	: {	
			text 	: "재작성"
		,	click	: function(doc) {
				if(!confirm("문서를 재작성 하시겠습니까?")) return;
		
				var url = new GF.CURL("/"+doc.getOption("dbpath")+"/dc_rnw?openagent");
		
				GF.ajax({
					url : url.url
					,dataType: "text"
					,type : "GET"
					,data:{
						docid : doc.getOption("unid")
						,applcode : doc.getOption("applcode")
					}
					,async : false
					,cache : false
					,success : function(data,textStatus,xhr) {
						var jobj = $.parseJSON(data);
						if(jobj.bflag == false){
							alert(jobj.msg);
							return;
						} else {
							var unid = jobj.msg;
							var _isundock = doc.getOption("isundock");
							var objUrl = new GF.CURL("/"+doc.getOption("dbpath")+"/0/"+unid+"?editDocument" + (_isundock ? "&isundock=1" : "")); 
							GF.load(GC.active(true),objUrl.url);
							_isundock = null;
							objUrl = null;
						}
					}
					,error : function(xhr,textStatus) {
						alert("오류 :: "+textStatus)
						return;
					} 
				});
			}
		}
	,	cmplt_opinion : { 
			text : "결과입력", highlight : true
		,	click : function(doc) {
				var url = new GF.CURL({
						base : "/"+doc.getOption("dbpath")+"/win_proc?openform"
					,	ParentUNID		: doc.getOption("unid")
					,	action				: "cmplt_opinion"
					,	ReqFormType		: ws4707_mot.motObj.ReqFormType
					,	ClonKey				: ws4707_mot.motObj.ClonKey
				});
				GF.dialog({
					title : "처리일정 및 내역입력" 
					,content : { 
						url : url.url
						,async : false
					}
					,open : function() {
						$(this).css({"overflow":"hidden"});
						$(this).nextAll().find("button").eq(0).focus();
					}
					,isactive : true
					,modal : false
					,resizable : false
					,buttons : [
					            {	text : "확인"
					            	, highlight : true
					            	, click : function() {
					            			var dlg = $(this);
					            			var d_doc = dlg.doc();
					            			var ret = ws4707_mot.opinion_validation(d_doc);
					            			if(!ret) return;
					            			var json = {
					            				ReqFormType :  d_doc.getOption("reqformtype")
											,	ClonKey : d_doc.getOption("clonkey")
					            			};
					            			d_doc.setField("json", request.toString(json));
											d_doc.submit(
												function(xhr,data,textStatus) {
													d_doc.close();
													request.returnData(data);
											});
					            	}
					            }
					            ,{	text : "취소"
					            	, highlight : false
					            	, click : function(){
					            		$(this).dialog("close");
					            	}
					            }
					]
					,height : 280
					,width : 600
				});
			}
		}
	,	approve 	: {	
			text 	: "승인", highlight	: true
		,	click	: function(doc) {
				if(!confirm("승인하시겠습니까?")) return;
				ws4707_mot.callApprove(doc, "approve", "승인");
			}
		}
	,	reject 	: {	
			text 	: "반려"
		,	click	: function(doc) {
				if(!confirm("반려하시겠습니까?")) return;
				ws4707_mot.callApprove(doc, "reject", "반려");
			}
		}
	,	del_temp		: {	
			text 	: "삭제"
		,	click	: function(doc) {
				if(!confirm("삭제하시겠습니까?")) return;
				request.deleteDocument(request.getParam());
			}
		}
	} 

	ws4707_mot.callApprove = function (doc, param, tag, callback){
		request.approve(
			param
		,	callback || function (data){
				request.returnData(data, tag);
			}
		);
	}

ws4707_mot.opinion_validation = function(doc){
	var today = new Date();
	var todayNum = parseInt(today.format("yyyymmdd"), 10);
	var selDateNum = parseInt(doc.getField("completeDate").replace(/-/gi, ""), 10);
	var completeContent = doc.getField("completeContent");
	var approveUser = doc.getField("approveUser");
	
	if ( todayNum > selDateNum ){
		alert("처리 일정을 다시 입력하여 주십시오");
		return false;
	} else if ( completeContent == "" ){
		alert("처리 내역을 입력하여 주십시오.");
		return false;
	} else if ( approveUser == 0 ){
		alert("승인자를 선택하여 주십시오.");
		return false;
	} else {
		return true;
	}
}

ws4707_mot.sectionControl = function(act){
	$(".section_close,.section_open", act).each(function(){
		$(this).click(function(){
			$(this).attr("class")=="section_close" ?
				$(this).attr("class","section_open").next("#section").show() : $(this).attr("class","section_close").next("#section").hide()
		}).attr("class")=="section_close"?$(this).next("#section").hide():""
	});
}

ws4707_mot.drawTeamTable = function (){
	var active = GC.active(true);
	var doc = $(active).doc()
	, _h, txt1, txt2, txt3, txt4, txt5;
	var tp = doc.getOption("reqteamprofile");
	_h = txt1 = txt2 = txt3 = txt4 = txt5 = "";
	
	$.each(tp, function (idx, o){
		_h += "<div class=\"pt4\" />";
		_h += "<table border=\"0\" cellspacing=\"0\" cellpadding=\"0\" class=\"frm_edit_outline_type1\">";
		_h += "<colgroup>";
		_h += "<col width=\"100\">";
		_h += "<col width=\"100\">";
		_h += "<col width=\"100\">";
		_h += "<col width=\"100\">";
		_h += "<col>";
		_h += "</colgroup>";
		
		if (idx == 0 )
			_h += "<tr><th>팀</th><th>파트</th><th>구분</th><th>담당자</th><th>체크리스트</th></tr>";
		
		for (var i = 0 ; i < o.partcnt ; i++){
			_h += "<tr>";
			if (i == 0) _h += "<th rowspan=\"" + o.partcnt + "\">" + o.teamname + "</th>";
			_h += "<th>파트" + (i+1) + "</th>";
			_h += "<th>" + "설계자" + (i+1) + "</th>";
			_h += "<td id=\"td_"+ "user" + (idx + 1) + i + "\">&nbsp;</td>";
			_h += "<td id=\"td_motcl" + (idx + 1) + i + "\">&nbsp;</td>";
			_h += "</tr>";
		}
		_h += "</table>";
	});
	
	$("#div_team", active).html(_h);
}

ws4707_mot.tableData = function (){
	var active = GC.active(true);
	var doc = $(active).doc();
	/* 담당자 */
	$("#users input", active).each(function (idx, o){
		$("#td_" + o.name.toLowerCase(), active).html(GF.notesName(o.value, "cn"));
	});
	/* 연결문서 */
	$("#docids input", active).each(function (idx, o){
		$("<span></span>")
		.attr("class", "btn_small_type_a")
		.html("<span>YES</span>").off("click")
		.on("click", function (){
			ws4707_mot.viewData(doc, $(o).val());
			//ws4705.openAttachRead(o.value, o.name);
		}).appendTo("#td_" + o.name.toLowerCase(), active);
	});
}

ws4707_mot.viewData = function (doc, args){
	var active = GC.active(true);
	var _active = null, _doc = null;
	
	function _load(){
		_active = GC.active(true);
		var motcl = $("input[name='motcl']", _active).val();
		for(var i = 0 ; i < motcl.length ; i++){
			$("#mot_checklist" + (i+1), _active).text(motcl.charAt(i));
		}
	}
	
	var url = new GF.CURL("/" + doc.getOption("dbpath") + "/mot_checklist?openform"
	, {motcl : args});

	GF.dialog({
		content : {url : url.url}
	,	title : "MOT 체크리스트", isactive : true, width : 650, height : 420, resizable : false
	,	onload : _load
	,	buttons : [
			{text: "닫기", click : function (){$(this).dialog("close")}}
		]
	});
}

