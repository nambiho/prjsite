/*
 * *********************************************************
 * function ws47
 * writer : Moon
 * *********************************************************
 * */
function ws47(){}
ws47.active = null;
ws47.doc = null;
ws47.title = {
	requestTitle : ""
,	monthmgrform : "의뢰서 월별조회"
};
ws47.info = {};
ws47.callFunction = null; /* 설계요소에서 바로 호출 할 때 */
ws47.docOption = {
	"isedit" : true
,	"isnewnote" : true
,	"unid" : ""
,	"dbpath" : ""
,	"applcode" : ""
,	"disableunload" : false
};
/*
 * *********************************************************
 * function set
 * *********************************************************
 * */
ws47.reload = function (){
	ws47.doc.reload();
}
ws47.setDocOption = function (opt){
	/* 팝업용 doc 옵션 */
	ws47.docOption = opt;
}
ws47.returnAlert = function (msg, ret){
	alert(msg); return ret;
}
ws47.setSelectOption = function (data, fieldname, __callback){
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
ws47.getUserlist = function (src, callback, __callback){
	var url = new GF.CURL("/" + request.profile.profileDb + "/seloptions?openagent", {
		usertype : src.usertype
	,	user : src.user
	,	reqkey : ws47.info.reqmainkey || request.profile.reqKey
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
ws47.makeReasonRequest = function (){
	ws47.reasonRequest = {};
	$.each(ws47.info.reasonRequest, function (index, o){
		var vSrc = o.split("|")
		, sText = vSrc[0]
		, sCode = vSrc[1]
		, vCode = sCode.split(".")
		, json = {
			fullCode : sCode
		,	reasonCode : vCode[3]
		,	text : sText
		}
		, index = ws47.reasonRequest[vCode[2]] ? ws47.reasonRequest[vCode[2]].length : (ws47.reasonRequest[vCode[2]] = []).length;
		ws47.reasonRequest[vCode[2]][index] = json;
	});
}
ws47.ApproverSet = function (opts){
	/*
	- opts 정보 : 
	deptcode : GC.user.groupcode
	,	delegate : request.profile.reqKey
	,	field : "BRChief"
	,	val : _doc.getOption("brchief")
	// */
	var _active = GC.active(true)
	, approveuser = $("select[name='" + opts.field + "']", _active);
	
	GF.getApproverList(opts.deptcode, opts.delegate, function (jsonObj){
		var _h = ""
		, sUser = ""
		, bSelect = false;
		
		if (jsonObj == null){return}
		
	 	for (var i = 0 ; i < jsonObj.length ; i++){
	 		sUser = jsonObj[i].korname + "{`" +
				jsonObj[i].empno + "{`" +
				jsonObj[i].dsppost + "{`" +
				jsonObj[i].dspgroupname + "{`" +
				jsonObj[i].groupcode + "{`" +
				jsonObj[i].notesid + "{`" +
				"-{`-{`-";
	 		bSelect = (sUser === opts.val);
			_h += "<option value='" + sUser + "'" + (bSelect?" selected" : "") + ">" + jsonObj[i].korname + " " + jsonObj[i].dsppost + "</option>";
		}
	 	approveuser.append(_h);
	});
	return approveuser;
}
ws47.callApprove = function (doc, param, tag, callback){
	request.approve(
		param
	,	callback || function (data){
			request.returnData(data, tag);
		}
	);
}
ws47.chkITSecurity = function (_active){ /* 검토 기준 체크 */
	var u = [], flag = true, json = {};
	$(":radio[name^='ITSecurity']", _active).each(function (index, _o){
		u[u.length] = this.name;
	});
	u = u.unique();
	$.each(u, function (i, _f){
		var value = $(":radio[name='" + _f + "']:checked", _active).val();
		if (!value){
			flag = false;
		} else {
			json[_f] = value;
		}
	});
	if ( !flag ) return null;
	else return json;
}
ws47.openIntegTestDoc = function (urlopt){
	//*
	var url = new GF.CURL("/" + ws47.info.dbpath[6] + "/0/" + ws47.info.itintegtestdocid + "?editdocument"
	, $.extend({isundock : 1}, urlopt));

	var w = GF.winContent(url.url, {
		location:"0"
	,	resizable : "1"
	,	status: "1"
	,	menubar:"0"
	,	scrollbars:"0"
	,	width : "800"
	});
}
ws47.span_open_click_event = function (span_id, _active, doc){
	switch (span_id){
	case "span_itsecurity":
		$("#span_itsecurity", _active).off("click").on("click", function (){
			var url = new GF.CURL("/" + ws47.info.dbpath[3] + "/itsecurity_fd?readform"
			, {isundock : 1});
			var w = GF.winContent(url.url, {
				location:"0", resizable : "1", status: "1", menubar:"0", scrollbars:"0", width : "680", height : "350"
			});
		});
		break;
	case "span_catefd":
		$("#span_catefd", _active).off("click").on("click", function (){
			var url = new GF.CURL("/" + ws47.info.dbpath[3] + "/request_categoryfd?readform"
			, {isundock : 1});
			var w = GF.winContent(url.url, {
				location:"0", resizable : "1", status: "1", menubar:"0", scrollbars:"0", width : "520", height : "400"
			});
		});
		break;
	case "span_risk_fd":
		$("#span_risk_fd", _active).off("click").on("click", function (){
			var url = new GF.CURL("/" + ws47.info.dbpath[3] + "/risk_table_fd?readform"
			, {isundock : 1});
			var w = GF.winContent(url.url, {
				location:"0", resizable : "1", status: "1", menubar:"0", scrollbars:"0", width : "700", height : "500"
			});
		});
		break;
	case "span_risk_test":
		$("#span_risk_test", _active).off("click").on("click", function (){
			var url = new GF.CURL("/" + ws47.info.dbpath[3] + "/risk_test_fd?readform"
			, {isundock : 1});
	
			var w = GF.winContent(url.url, {
				location:"0", resizable : "1", status: "1", menubar:"0", scrollbars:"0", width : "500", height : "400"
			});
		});
		break;
	case "span_rdd":
		$("#span_rdd", _active).off("click").on("click", function (){
			ws47.brResearchDb(doc, "risk");
		});
		break;
	}
}
/*
 * *********************************************************
 * request
 * *********************************************************
 * */
ws47.request_validation = function (doc){
	var isAtt = (GF.chkIsAttachment(doc.options())[0] > 0)
	, str = ["완료희망일","인수완료예정일","정규반영예정일"]
	, chk = [];
	
	if (!isAtt && doc.getField("TestRequestContent")=="") 
		if (confirm("인수테스트 시나리오를 작성하지 않으셨습니다.\n\n작성 후 상신하시겠습니까?")) return false;	

	//if (!ws47.request_validation(doc)) return false;
	/* 공휴일 체크 시작 */
	chk = [doc.getField("WishDate"), doc.getField("AcceptDate"), doc.getField("RegularDate")];
	chk = GF.isHoliday(chk);
	$(chk).each(function (index, data){
		if (data === "1"){
			if (!confirm("입력 하신 " + str[index] + "은 공휴일 (또는 휴무일) 입니다.\n\n진행하시겠습니까?")){
				return false;
			}
		}
	});
	var msg = "";
	//*
	if (!doc.getField("ChkCis")) msg = "고객정보보안확인을 체크하여 주십시오.";
	else if (!doc.getField("ChkMng")) msg = "경영정보확인을 체크하여 주십시오.";
	else if (!doc.getField("ChkFp")) msg = "FP.com 업무확인을 체크하여 주십시오.";
	else if (!doc.getField("ChkLog")) msg = "로그기록대외제공확인을 체크하여 주십시오.";
	else if (doc.getField("ChkCis") == "YES" && doc.getField("CIS_Check") == "")
		msg = "고객정보보안확인 내용을 입력하여 주십시오.\n\n※ 고객정보보안확인 항목의 'YES'를 클릭하시면 됩니다.";
	else if (doc.getField("ClassRequest") == "class0") msg = "요청분류를 선택하여 주십시오.";
	else if ((doc.getField("ClassRequest").indexOf("class30") == -1) && (doc.getField("ReasonRequest") == "reason0"))
		msg = "요청사유를 선택하여 주십시오.";
	else if (doc.getField("WishDate") == "") msg = "완료희망일을 입력하여 주시기 바랍니다.";
	else if (ws47.info.nowdate > doc.getField("WishDate")) msg = "완료희망일자를 조정하십시오.";
	else if (doc.getField("AcceptDate") == "") msg = "인수완료예정일을 입력하여 주시기 바랍니다.";
	else if (ws47.info.nowdate > doc.getField("AcceptDate") || doc.getField("WishDate") > doc.getField("AcceptDate"))
		msg = "인수완료예정일을 조정하십시오.";
	else if (doc.getField("RegularDate") == "") "정규반영예정일을 입력하여 주시기 바랍니다.";
	else if (ws47.info.nowdate > doc.getField("RegularDate") || doc.getField("AcceptDate") > doc.getField("RegularDate"))
		msg = "정규반영예정일을 조정하십시오.";
	else if (doc.getField("Subject") == "") msg = "제목을 입력 해 주십시오.";
	// */
	
	if (msg == "") return true;
	else {alert(msg); return false}
}
ws47.request = function (doc){
	if (!ws47.request_validation(doc)) return false;
	/* 공휴일 체크 끝 */
	if (!confirm("신청 하시겠습니까?")) return false;
	if (request.request()){
		doc.submit(
			function (xhr,data,textStatus){
				request.returnData(data);
			}
		);
	}
}
ws47.requestAgain = function (doc){
	if (!ws47.request_validation(doc)) return false;
	doc.submit(
		function (xhr,data,textStatus){
			request.returnData(data);
		}
	);
}
ws47.reMake = function (doc){
	param = request.getParam("");
	param.action = "remake";
	
	request.process(param, function (data){
		try{
			var jsonData = $.parseJSON(data);
			if ( jsonData.bflag ){
				GF.load(ws47.active, (new GF.CURL("/" + doc.getOption("dbpath") + "/view_by_unid/" + jsonData.msg + "?editdocument")).url);
				//doc.reload();
			} else alert(jsonData.msg.replace(/\\n/gi,"\n"));
		} catch (e){alert(e)}
	});
}
/*
 * *********************************************************
 * 임시저장
 * *********************************************************
 * */
ws47.draftDoc = function (doc){
	if (request.draftDocument()){
		doc.submit(
			function (xhr,data,textStatus){
				var jsonData = $.parseJSON(data);
				if ( !jsonData.bflag ){
					alert(jsonData.msg.replace(/\\n/gi,"\n"));
				} else alert("저장 되었습니다.");
				doc.close();
			}
		)
	}
}
/*
 * *********************************************************
 * 임시저장 문서 삭제
 * *********************************************************
 * */
ws47.removeDoc = function (doc){
	request.deleteDocument(request.getParam());
}
/*
 * *********************************************************
 * 접수
 * *********************************************************
 * */
ws47.receive = function (doc){
	var param = null;
	switch (request.apprInfo.reqstatus){
	case "BR1": case "S1":
		param = request.getParam("");
		param.action = "receive";
		request.process(param, function (data){
			try{
				var jsonData = $.parseJSON(data);
				if ( jsonData.bflag ){
					alert("접수 되었습니다.");
					doc.reload();
				} else alert(jsonData.msg.replace(/\\n/gi,"\n"));
			} catch (e){alert(e)}
		});
		break;
	}
}
/*
 * *********************************************************
 * 미접수
 * *********************************************************
 * */
ws47.receiveBack = function (doc){
	var param = null;
	switch (request.apprInfo.reqstatus){
	case "BR1": case "S1":
		if (confirm("미접수 하시겠습니까?")){
			param = request.getParam("");
			param.action = "receiveback";
			request.process(param, function (data){ request.returnData(data, "미접수") });
		}
		break;
	}
}
/*
 * *********************************************************
 * 반려
 * *********************************************************
 * */
ws47.reject = function (doc){
	switch (request.apprInfo.reqstatus){
	case "BR11":
		if (confirm("반려 하시겠습니까?")){
			ws47.callApprove(doc, "brchiefopinion", "반려");
		}
		break;
	default:
		ws47.callApprove(doc, "reject", "반려");
	}
}
/*
 * *********************************************************
 * 협의승인
 * *********************************************************
 * */
ws47.discuss = function (doc){
	ws47.callApprove(doc, "approve", "협의");
}
/*
 * *********************************************************
 * 승인
 * *********************************************************
 * */
ws47.approve = function (doc){
	var param = null
	, tag = "승인";
	
	switch (request.apprInfo.reqstatus){
	case "O1":
		if (ws47.info.nowdate > ws47.info.wishdate){
			if (confirm("결재일자가 완료희망일자를 초과합니다. 담당자에게 반려합니다.")){
				param = "reject";
				tag = "반려";
			} else return;
		} else param = {action:"approve", commentflag:false};
		ws47.callApprove(doc, param, tag);
		break;
	case "BR11":
		ws47.callApprove(doc, {action:"approve", commentflag:false}, tag);
		break;
	case "D3":
		if (ws47.info.csec != "Y") return ws47.returnAlert("문서보안적용 첨부문서 체크를 해주십시오.", false);
		if (confirm("승인 하시겠습니까?")){
			ws47.callApprove(doc, {action:"approve", commentflag:false}, "승인");
		}
		break;
	case "P3":
		/* 파트장 승인 화면 호출 */
		ws47.itPartChiefApprove(doc);
		break;
	/* 승인에서 확인으로 변경
	case "P7":
		ws47.callApprove(doc, {action:"fieldapprove", commentflag:false}, tag);
		break;
	// */
	case "P9":
		/* 파트장 승인 화면 호출 */
		ws47.systemCheckList(doc);
		break;
	case "O3":
		/* 인수 완료 후 정규 반영 승인 */
		ws47.regularApproval(doc);
		break;
	}
}
/*
 * *********************************************************
 * 보완요청
 * *********************************************************
 * */
ws47.revise = function (doc){
	switch (request.apprInfo.reqstatus){
	case "R1":case "R2":case "R3":case "R4":case "R5":case "BR1":
		ws47.callApprove(doc, "revise", "보완요청");
		break;
	case "P5":
		if (confirm("설계내역에 대해서 보완요청을 하시겠습니까?")){
			request.inputOpinion("", function (data){
				var param = request.getParam(data);
				param.action = "revise";
				request.process(param, function (data){ request.returnData(data, "설계보완요청") });
			});
		}
		break;
	case "O2":
		request.inputOpinion("", function (data){
			var str = "보완요청은 IT시스템지원 인수테스트 전 당초 요건이 제대로 반영되지 않았을 때 하는 것입니다.\n\n" + 
         	"인수테스트 당시 요건 변경은 IT시스템지원 문서를 새로 작성하여 주시기 바랍니다.\n\n" +
    	    "보완요청을 하시겠습니까?";
			
			if(confirm(str)){
				var param = request.getParam(data);
				param.action = "revise";
				request.process(param, function (data){ request.returnData(data) });
			}
		});
		break;
	case "BR5":
		ws47.changeRequestRevise(doc);
		break;
	}
}
/*
 * *********************************************************
 * 변경요청 - BR->개발자
 * *********************************************************
 * */
ws47.changeRequestRevise = function (doc){
	var _active = null, _doc = null;
	
	function _confirm(){
		if ($("input[name='Opinion']", _active).val() == "") return ws47.returnAlert("보완요청 의견을 입력하여 주시기 바랍니다.", false);
		if (!_doc.getField("ChangeReason2")) return ws47.returnAlert("변경사유를 선택하여 주시기 바랍니다.", false);
		if (_doc.getField("ChangeReason") == "") return ws47.returnAlert("변경내역을 입력하여 주시기 바랍니다.", false);
		
		date = _doc.getField("TmpDevelopDate");
		if (date == "") return ws47.returnAlert("변경 완료예정일을 입력하여 주시기 바랍니다.", false);
		if (date < _doc.getField("DisDevelopDate"))  return ws47.returnAlert("변경 완료예정일을 다시 입력하여 주시기 바랍니다.", false);
		if (GF.isHoliday([date])[0] === "1")
			if (!confirm("입력 하신 변경 완료예정일은 공휴일 (또는 휴무일) 입니다.\n\n진행하시겠습니까?"))
				return false;
		
		date = _doc.getField("TmpAcceptDate");
		if (date == "") return ws47.returnAlert("변경 인수완료예정일을 입력하여 주시기 바랍니다.", false);
		if (date < _doc.getField("DisAcceptDate"))  return ws47.returnAlert("변경 인수완료예정일을 다시 입력하여 주시기 바랍니다.", false);
		if (GF.isHoliday([date])[0] === "1")
			if (!confirm("입력 하신 변경 인수완료예정일은 공휴일 (또는 휴무일) 입니다.\n\n진행하시겠습니까?"))
				return false;
		
		date = _doc.getField("TmpRegularDate");		
		if (date == "") return ws47.returnAlert("변경 정규반영예정일을 입력하여 주시기 바랍니다.", false);
		if (date < _doc.getField("DisRegularDate"))  return ws47.returnAlert("변경 정규반영예정일을 다시 입력하여 주시기 바랍니다.", false);
		if (GF.isHoliday([date])[0] === "1")
			if (!confirm("입력 하신 변경 정규반영예정일은 공휴일 (또는 휴무일) 입니다.\n\n진행하시겠습니까?"))
				return false;
		
		if (_doc.getField("TmpDevelopDate") > _doc.getField("TmpAcceptDate") ||
		_doc.getField("TmpAcceptDate") > _doc.getField("TmpRegularDate"))
			return ws47.returnAlert("예정일을 조정하십시오.", false);
		
		_doc.submit(function (xhr,data,textStatus){ _doc.close(); request.returnData(data, ("보완요청")) });
	}
	function _load(){
		_active = GC.active(true);
		_doc = $(_active).doc(ws47.docOption).doc();
	}
	/* 다이얼로그 열기 */
	var url = new GF.CURL("/" + doc.getOption("dbpath") + "/ChangeRequestRevise?openform"
	,	{parentunid : doc.getOption("unid")}
	);
	GF.dialog({
		content : {url : url.url}
	,	title : "보완요청", isactive : true, width : 490, height : 360, resizable : false
	,	onload : _load
	,	buttons : [
			{text: "확인", click : _confirm}
		,	{text: "취소", click : function (){$(this).dialog("close")}}
		]
	});
}
/*
 * *********************************************************
 * 협의팀 결졍 화면
 * *********************************************************
 * */
ws47.brDiscuss = function (doc){
	var _active = null
	, _doc = null;
	function _Confirm(o){
		var itTeam = _doc.getField("ITTeamPost")
		, itTeamProfile = []
		, json = {
				MOT : _doc.getField("MOT")
			,	DesignerDistribute : _doc.getField("DesignerDistribute")
			,	ITTeamPost : itTeam.join("^")
			,	ClassRequest : _doc.getField("ClassRequest")
			,	ReasonRequest : _doc.getField("ReasonRequest")
		};
		//*
		if (itTeam.length == 0) return ws47.returnAlert("협의팀을 선택하여 주시기 바랍니다.", false);
		if (json.DesignerDistribute == "YES") {
			if (itTeam.length > 1) 
				return ws47.returnAlert("설계 배분 건은 협의팀을 하나만 선택하실 수 있습니다.", false);
			if (json.ClassRequest.indexOf("class10") != -1) 
				return ws47.returnAlert("요청분류가 '시스템 개발/변경'인 경우 설계 배분 건으로 진행할 수 없습니다.", false);
		}
		if (json.ClassRequest == "class0") return ws47.returnAlert("요청분류를 선택하여 주시기 바랍니다.", false);
		if ((json.ClassRequest.indexOf("class30") == -1) && (json.ReasonRequest == "reason0")) return ws47.returnAlert("요청사유를 선택하여 주시기 바랍니다.", false);
		// */
		var param = request.getParam(_doc.getField("TestContent"));
		param.action = "brdiscuss";
		//param.extraRich = _doc.getField("TestContent");
		param.json = request.toString(json);

		//request.process(param, function (data){ $(_active).dialog("close"); request.returnData(data, "협의 요청") });
		request.process(param, function (data){
			$(_active).dialog("close");
			try{
				var jsonData = (typeof(data) == typeof("") ? $.parseJSON(data) : data);
				if (!jsonData.bflag){
					alert(jsonData.msg.replace(/\\n/gi,"\n"));
				} else {
					if (jsonData.msg == "") alert("협의 요청 되었습니다.");
					else alert(jsonData.msg.replace(/\\n/gi,"\n"));
					doc.reload();
				}
			} catch (e){ alert(e); GF.log("error", _class + " error > " + e)}
		});
	}
	function _Event_initialize(){
		ws47.form_Event_classrequest(_active);
		
		$("input[name='MOT']", _active).off("click").on("click", function (){
			if (this.value == "YES")
				$("input:radio[name='DesignerDistribute']", _active)
				.attr("disabled", true)
				.filter("[value='NO']")
				.prop("checked", true);	
			else
				$("input:radio[name='DesignerDistribute']", _active)
				.attr("disabled", false);
		});
	}
	function _load(){
		var _h = "";
		
		_active = GC.active(true);
		_doc = $(_active).doc(ws47.docOption).doc();
		_Event_initialize();
		
		/* 협의팀 */
		$.each(ws47.info.reqteamprofile, function (idx, _o){
			_h += "<input name=\"ITTeamPost\" type=\"checkbox\" value=\"" + _o.teamcode + "\"/>" + _o.teamname;
		});
		$("#div_teampost", _active).html(_h);
			
		/* 요청분류 / 사유 */
		$("select[name='ClassRequest']", _active)
		.val(ws47.info.classrequest)
		.attr("selected", "selected")
		.change();

		$("select[name='ReasonRequest']", _active)
		.val(ws47.info.reasonrequest)
		.attr("selected", "selected");
	}
	/* 다이얼로그 열기 */
	var url = new GF.CURL("/" + doc.getOption("dbpath") + "/brDiscuss?openform");
	GF.dialog({
		content : {url : url.url}
	,	title : "협의팀 결정", isactive : true, width : 490, height : 360, resizable : false
	,	onload : _load
	,	buttons : [
			{text: "확인", click : _Confirm}
		,	{text: "취소", click : function (){$(this).dialog("close")}}
		]
	});
}
/*
 * *********************************************************
 * BR검토의견 화면
 * *********************************************************
 * */
ws47.brCheckOpinion = function (doc, isedit){
	var _active = null, _doc = null, is_dicussafter = (ws47.info.itstatus == "BR_DISCUSSTEAMSELECT"); /* is_dicussafter = (request.apprInfo.reqstatus == "BR_DISCUSSAFTER"); */
	
	function _submit(action, tag){
		var act = $("input[name='Action']", _active);
		
		if (act.length > 0) act.val(action);
		else {
			act = $("<input name='Action' type='hidden'>").appendTo(_active).val(action);
		}
		//_doc.submit(function (xhr,data,textStatus){ _doc.close(); request.returnData(data, (tag || "저장")) });
		_doc.submit(function (xhr,data,textStatus){
			_doc.close();
			try{
				var jsonData = (typeof(data) == typeof("") ? $.parseJSON(data) : data);
				if (!jsonData.bflag){
					alert(jsonData.msg.replace(/\\n/gi,"\n"));
				} else {
					if (jsonData.msg == "") alert((tag || "저장") + " 되었습니다.");
					else alert(jsonData.msg.replace(/\\n/gi,"\n"));
					doc.reload();
				}
			} catch (e){ alert(e); GF.log("error", _class + " error > " + e)}
		});
	}
	function _Request(){
		if (confirm("상신 하시겠습니까?")){
			if (_doc.getField("BRChief") == "0"){
				alert("승인자를 선택 하여 주십시오.");
				return false;
			}
			_submit("request", "상신");
		}
	}
	function _Save(){
		if (confirm("BR검토의견을 저장 하시겠습니까?")){
			_submit("save", "저장");
		}
	}
	function _load(){
		if (!isedit) return;
		_active = GC.active(true);
		_doc = _active.doc();
		/* 의뢰서 정보 셋팅 시작 */
		_doc.setField("OrigDocID", doc.getOption("unid"));
		_doc.setField("ReqDbPath", doc.getOption("dbpath"));
		_doc.setField("ReqApplCode", doc.getOption("applcode"));
		/* 의뢰서 정보 셋팅 끝 */
		ws47.ApproverSet({
			deptcode : GC.user.groupcode
		,	delegate : request.profile.reqKey
		,	field : "BRChief"
		,	val : _doc.getOption("brchief")
		});
	}
	/* 다이얼로그 열기 */
	var url = new GF.CURL("/" + ws47.info.dbpath[2] + "/" + 
	( isedit ? 
		(ws47.info.rdddocid == "" ? "brCheckOpinion?openform" : "view_by_unid/" + ws47.info.rdddocid + "?editdocument") : 
		"view_by_unid/" + ws47.info.rdddocid + "?opendocument"
	))
	, buttons = (isedit ? 
		(is_dicussafter ? 
			[{text: "저장", click : _Save}] : 
			[{text: "저장", click : _Save},{text: "상신", click : _Request }]) : 
		[]
	);
	buttons.push( {text: "닫기", click : function (){$(this).dialog("close")}} );
	
	GF.dialog({
		content : {url : url.url}
	,	title : "BR검토의견", isactive : true, width : 530, height : 480, resizable : false
	,	onload : _load
	,	buttons : buttons
	});
}
/*
 * *********************************************************
 * BR 접수중환원
 * *********************************************************
 * */
ws47.brBeforeReceive = function (doc){
	if (confirm("BR의 접수중 문서로 환원하시겠습니까?\n\n※ 각 팀의 모든 복제 문서가 삭제됩니다.")){
		request.approve({
			action : "brbeforereceive"
		,	commentflag : false
		});
	}
}
/*
 * *********************************************************
 * BR협의요청
 * *********************************************************
 * */
ws47.discussRequest = function (doc){
	var _active = null
	, _doc = null
	, distribute = (ws47.info.designerdistribute == "YES")
	, partcnt = (distribute ? 1 : ws47.info.teamprofile.partcnt);
	
	function _Event_initialize(){
		$("#reset_radio", _active).off("click").on("click", function (){
			$(":radio[name='MainITPart']", _active).prop("checked", false);
		});
	}
	function _designer(){
		/* 지정 되어 있을 경우 사용자 선택 및 주설계자 파트 설정 */
		if (ws47.info.itpartdesigner.length != 0){
			$.each(ws47.info.itpartdesigner, function (index, _o){
				$("select[name='ITPartDesigner" + (index+1) + "']", _active)
				.val(_o)
				.attr("selected", "selected")
			});
		}
	}
	function _load(){
		_active = GC.active(true);
		_doc = $(_active).doc(ws47.docOption).doc();
		
		var radioInput = []
		, comboInput = []
		, comboTemplate = "<span>#{idx}.<select name=\"ITPartDesigner#{idx}\">" +
				"<option value=\"0\">[내부설계 담당자]</option></select></span> ";
		
		/* ITPartDesigner 콤보를 js 에서 그리기 */
		for (var i = 1 ; i <= partcnt ; i++)
			comboInput.push(request.RX(comboTemplate, {idx : i}));
		$("#span_itpartdesigner", _active).html(comboInput.join(""));
		
		/* MainITPartDesigner 를 js 에서 그리기 */
		var _h = "";
		for (var i = 1 ; i <= (!distribute ? partcnt : 1) ; i++){
			_h = "<input name=\"MainITPart\" type=\"radio\" value=\"" + i + 
			"\""+(ws47.info.mainitpart && (ws47.info.mainitpart == i) ? " checked" : "") + "> " + i + " ";
			radioInput.push(_h);
		}
		
		$("#sel_Main_Designer", _active).html(radioInput.join(""));
		
		if (ws47.info.mainitpart != ""){
			$("input[name='MainITPart']", _active).prop("disabled", "disabled");
			$("#reset_radio", _active).prop("disabled", "disabled");
		}
		/* ITPartDesigner 콤보의 사용자 입력 */
		ws47.getUserlist({usertype : "3", user : "designer_" + ws47.info.teamcode, fieldname : "ITPartDesigner"}, ws47.setSelectOption, _designer);
		ws47.getUserlist({usertype : "3", user : "agent_89920002", fieldname : "DisFieldAgent"}, ws47.setSelectOption);
		
		/* 팀명 */
		$("#teamname", _active).text(ws47.info.teamname);
		/* 이벤트 초기화 */
		_Event_initialize();
	}
	function _confirm(){
		var itpartchiefcount = 0, itpartchief = [], tmpidx = null, infolength = ws47.info.partdocinfo.length;
		$("select[name*='ITPartDesigner']", _active).each(function (index, o){
			if (this.value == "0") tmpidx = index;
			else {
				if (tmpidx != null){ itpartchiefcount = 0; return false }
				itpartchief.push(this.value);
				itpartchiefcount++;
			}
		});
		
		if (infolength != 0 && infolength != itpartchiefcount){
			return ws47.returnAlert("설정 된 내용과 다릅니다. 다시 설정 해 주십시오.", false);
		}
		//if (itpartchief.length > itpartchief.unique().length)
		//	return ws47.returnAlert("같은 설계자가 설정 되었습니다.", false);
		if (itpartchiefcount == 0) return ws47.returnAlert("내부설계 담당자 선택 및 번호순으로 지정하여 주십시오.", false);
		
		var chkitem = $("input[name='MainITPart']", _active).is(":checked");
		if (ws47.info.mainitpartdesigner == ""){
			if (!chkitem) return ws47.returnAlert("주설계자가 결정되지 않았습니다.", false);
		} else {
			//if (chkitem != ws47.info.mainitpart){
			if (_doc.getField("MainITPart") != ws47.info.mainitpart){
				if (chkitem) return ws47.returnAlert("이미 다른 주설계자가 결정되었습니다.", false);
			}
		}
		var tmpField = $(":radio[name='MainITPart']:checked", _active).val();
		if ($("select[name='ITPartDesigner" + tmpField + "']").val() == "0"){
			return ws47.returnAlert("주설계자를 잘 못 지정하셨습니다.", false);
		}
		
		var json = {
			MainITPart : tmpField||""
		,	DisFieldAgent : $("select[name*='DisFieldAgent']", _active).val()
		,	ITPartChiefCount : itpartchiefcount
		};
		for (var i = 1 ; i <= partcnt ; i++)
			json["ITPartDesigner" + i] = $("select[name*='ITPartDesigner" + i + "']", _active).val();
		
		//*
		var param = request.getParam("");
		param.action = "discussrequest";
		param.json = request.toString(json);
		
		//request.process(param, function (data){ $(_active).dialog("close"); request.returnData(data, "협의 요청") });
		request.process(param, function (data){
			$(_active).dialog("close");
			try{
				var jsonData = (typeof(data) == typeof("") ? $.parseJSON(data) : data);
				if (!jsonData.bflag){
					alert(jsonData.msg.replace(/\\n/gi,"\n"));
				} else {
					if (jsonData.msg == "") alert("협의 요청 되었습니다.");
					else alert(jsonData.msg.replace(/\\n/gi,"\n"));
					doc.reload();
				}
			} catch (e){ alert(e); GF.log("error", _class + " error > " + e)}
		});
		// */
	}
	/* 다이얼로그 열기 */
	var url = new GF.CURL("/" + doc.getOption("dbpath") + "/brDiscussRequest?openform", 
		{dd : ws47.info.designerdistribute}
	)
	, buttons = [{text: "확인", click : _confirm}, {text: "닫기", click : function (){$(this).dialog("close")}}];
	
	GF.dialog({
		content : {url : url.url}
	,	title : "협의요청", isactive : true, width : 720, height : 320, resizable : false
	,	onload : _load
	,	buttons : [
			{text: "확인", click : _confirm}
		,	{text: "닫기", click : function (){$(this).dialog("close")}}
		]
	});
}
/*
 * *********************************************************
 * 영향도 분석 화면
 * *********************************************************
 * */
ws47.brResearchDb = function (doc, type){
	var _active = null;
	/* 다이얼로그 열기 */
	var docurl = "", title = "", param = {type : type};
	switch (type){
	case "risk":
		docurl = "/research_view/" + ws47.info.itmonitordocid;
		title = "영향도분석";
		break;
	case "security":
		docurl = "/research_view/" + ws47.info.itmonitordocid;
		title = "IT보안성검토";
		break;
	}
	
	//var url = new GF.CURL("/" + ws47.info.dbpath[3] + "/"+fname+"?openform", params)
	var url = new GF.CURL("/" + ws47.info.dbpath[3] + docurl + "?opendocument", param)
	, buttons = [];
	buttons.push( {text: "닫기", click : function (){$(this).dialog("close")}} );
	
	GF.dialog({
		content : {url : url.url}
	,	title : title, isactive : true, width : 700, height : 480, resizable : false
	,	onload : function (){
			_active = GC.active(true);
			ws47.span_open_click_event("span_risk_test", _active);
			ws47.span_open_click_event("span_itsecurity", _active);
		}
	,	buttons : buttons
	});
}
/*
 * *********************************************************
 * BR 인수확인내용 편집
 * *********************************************************
 * */
ws47.brAcceeptConfirmContent = function (doc){
	var _active = null; _doc = null;
	
	function _confirm(){
		_doc.submit(function (xhr,data,textStatus){
			try{
				_doc.close();
				var jsonData = $.parseJSON(data);
				if ( jsonData.bflag ){
					doc.reload();
				} else alert(jsonData.msg.replace(/\\n/gi,"\n"));
			} catch (e){alert(e)} 
		});
	}
	function _load(){
		_active = GC.active(true);
		_doc = $(_active).doc();
	}
	/* 다이얼로그 열기 */
	var url = new GF.CURL("/" + ws47.info.dbpath[2] + 
			(ws47.info.brtordocid == "" ? 
			"/brDiscussOpinion?openform": 
			"/view_by_unid/" + ws47.info.brtordocid + "?editdocument")
	,	{
		parentunid : doc.getOption("unid")
	,	reqapplcode : doc.getOption("applcode")
	});
	
	GF.dialog({
		content : {url : url.url}
	,	title : "BR 의견 문서", isactive : true, width : 530, height : 480, resizable : false
	,	onload : _load
	,	buttons : [
			{text: "등록", click : _confirm}
		,	{text: "닫기", click : function (){$(this).dialog("close")}}
		]
	});
}
/*
 * *********************************************************
 * BR 인수확인내용 열람
 * *********************************************************
 * */
ws47.brAcceeptConfirmContentRead = function (doc){
	/* 다이얼로그 열기 */
	var url = new GF.CURL("/" + ws47.info.dbpath[2] + "/view_by_unid/" + ws47.info.brtordocid + "?opendocument");
	
	GF.dialog({
		content : {url : url.url}
	,	title : "BR 의견 문서", isactive : true, width : 530, height : 480, resizable : false
	,	buttons : [
			{text: "닫기", click : function (){$(this).dialog("close")}}
		]
	});
}
/*
 * *********************************************************
 * 설계자 테스트 내역
 * *********************************************************
 * */
ws47.designComment = function (doc){
	var _active = null;
	function _load(){
		_active = GC.active(true);
	}
	function _confirm(){
		var param = request.getParam("");
		param.action = "designcomment";
		param.extraField = $("textarea[name='TestContent']", _active).val();

		request.process(param, function (data){
			$(_active).dialog("close");
			try{
				var jsonData = $.parseJSON(data);
				if ( jsonData.bflag ){
					doc.reload();
				} else alert(jsonData.msg.replace(/\\n/gi,"\n"));
			} catch (e){alert(e)}
		});
	}
	var url = new GF.CURL("/" + doc.getOption("dbpath") + "/designerTestComment?openform"
	,	{"parentunid" : doc.getOption("unid")}
	);
	GF.dialog({
		content : {url : url.url}
	,	title : "(설계자)테스트 요청 내역입력", isactive : true, width : 500, height : 250, resizable : false
	,	onload : _load
	,	buttons : [
			{text: "확인", click : _confirm}
		,	{text: "닫기", click : function (){$(this).dialog("close")}}
		]
	});
}
/*
 * *********************************************************
 * 설계자 업무공유
 * *********************************************************
 * */
ws47.itPartChargeJointOwner = function (doc){
	var _active = null;
	function _load(){
		ws47.getUserlist({usertype : "4", user : ws47.info.teamcode+"^89920002", fieldname : "ITPartCharge"}, ws47.setSelectOption);
		_active = GC.active(true);
	}
	function _confirm(){
		var param = request.getParam("")
		, json = {
			itpartcharge : $("select[name='ITPartCharge']", _active).val()
		,	commonopinion : $("input[name='CommonOpinion']", _active).val()
		}
		param.action = "itpartchargejointowner";
		param.json = request.toString(json);

		request.process(param, function (data){
			$(_active).dialog("close");
			try{
				var jsonData = $.parseJSON(data);
				if ( jsonData.bflag ){
					doc.close();
				} else alert(jsonData.msg.replace(/\\n/gi,"\n"));
			} catch (e){alert(e)}
		});
	}
	var url = new GF.CURL("/" + doc.getOption("dbpath") + "/itPartChargeJointOwner?openform");
	GF.dialog({
		content : {url : url.url}
	,	title : "업무공유", isactive : true, width : 500, height : 250, resizable : false
	,	onload : _load
	,	buttons : [
			{text: "통보", click : _confirm}
		,	{text: "닫기", click : function (){$(this).dialog("close")}}
		]
	});
}
/*
 * *********************************************************
 * 설계자 협의회신
 * *********************************************************
 * */
ws47.consultation = function (doc){
	var _active = null
	, _doc = null
	, distribute = (ws47.info.designerdistribute == "YES");
	
	function _common_Validate(){
		var ret = true;
		
		$("input[name^='ResearchItem']", _active).each(function (){
			if (this.value == ""){
				ret = false;
				return false;
			}
		});
		
		if (_doc.getField("ClassRequest") == "class0")
			return ws47.returnAlert("요청분류를 선택하여 주십시오.", false);
		
		if ((_doc.getField("ClassRequest").indexOf("class30") == -1) && (_doc.getField("ReasonRequest") == "reason0"))
			return ws47.returnAlert("요청사유를 선택하여 주십시오.", false);
		
		if (!ret) return ws47.returnAlert("모니터링 항목을 선택하여 주십시오.", false);
		else return true;
	}
	function _confirm_distribute(){
		var completedate = ""
		, acceptdate = ""
		, regulardate = "";
		
		if (!_common_Validate()) return false;
		
		completedate = _doc.getField("DevelopDate") //$("input[name='DevelopDate']", _active).val();
		if (completedate == "" ) return ws47.returnAlert("완료가능일을 입력하여 주시기 바랍니다.", false);
		if (completedate < ws47.info.createddate) return ws47.returnAlert("완료가능일자를 조정하십시오.", false);
		if (GF.isHoliday([completedate])[0] === "1")
			if (!confirm("입력 하신 완료가능일은 공휴일 (또는 휴무일) 입니다.\n\n진행하시겠습니까?"))
				return false;
		
		acceptdate = _doc.getField("AcceptDate") //$("input[name='AcceptDate']", _active).val();
		if (acceptdate < completedate) return ws47.returnAlert("인수완료예정일을 조정하십시오.", false);
		if (GF.isHoliday([acceptdate])[0] === "1")
			if (!confirm("입력 하신 인수완료예정일은 공휴일 (또는 휴무일) 입니다.\n\n진행하시겠습니까?"))
				return false;
		
		regulardate = _doc.getField("RegularDate") //$("input[name='RegularDate']", _active).val();
		if (regulardate < acceptdate) return ws47.returnAlert("정규완료예정일을 조정하십시오.", false);
		if (GF.isHoliday([regulardate])[0] === "1")
			if (!confirm("입력 하신 정규완료예정일은 공휴일 (또는 휴무일) 입니다.\n\n진행하시겠습니까?"))
				return false;
		
		if (!$(":radio[name='AuroraInfluence']", _active).is(":checked")) 
			return ws47.returnAlert("오로라 반영여부를 선택하여 주시기 바랍니다.", false);
		
		if (_doc.getField("ClassRequest").indexOf("class10") > -1) 
			return ws47.returnAlert("설계배분 의뢰서는 요청분류를 '시스템 개발/변경'으로 선택할 수 없습니다.", false);
		
		if (distribute && _doc.getField("ReasonRequest").indexOf("reason70") > -1)
			if (_doc.getField("CREtc") == "")
				return ws47.returnAlert("요청분류/사유가 '단순변경/기타변경'인 경우 구분사유를 필수로 입력하여 주십시오.", false);
		
		if (_doc.getField("ITPartChief") == "0")
			return ws47.returnAlert("파트장을 선택하여 주십시오.", false);
		
		if (confirm("배분 하시겠습니까?")){
			_doc.submit(function (xhr,data,textStatus){ _doc.close(); request.returnData(data) });
		}
	}
	function _confirm(){
		var ret = true
		, completedate = ""
		, mot_chk = false
		, mot_chk_list = "";
		
		if (!_common_Validate()) return false;

		if ($(":radio[name='Influence']:checked", _active).val() == "YES"){
			completedate = $("input[name='CompleteEstimatedDatePart']", _active).val();
			if (completedate == "" ) return ws47.returnAlert("완료가능일을 입력하여 주시기 바랍니다.", false);
			if (completedate < ws47.info.createddate) return ws47.returnAlert("완료가능일자를 조정하십시오.", false);
			if (GF.isHoliday([completedate])[0] === "1")
				if (!confirm("입력 하신 완료가능일은 공휴일 (또는 휴무일) 입니다.\n\n진행하시겠습니까?"))
					return false;
			if ($("select[name='ConsultationChargePart']", _active).val() != "0")
				if ($("input[name='ConsultationDatePart']", _active).val() == "")
					return ws47.returnAlert("협의일자를 선택하여 주시기 바랍니다.", false);
		} else {
			ret = confirm("내부설계자 및 파트장이 잘 못 지정된 경우 재배분 요청을 하시기 바랍니다.\n\n" +
	            				"반영불가인 현재의 문서는 협의회신 후 삭제됩니다. 진행 하시겠습니까?");
			if (!ret){ return false }
			if ($("textarea[name='ImproprietyReasonPart']", _active).val() == "")
				return ws47.returnAlert("반영불가 사유를 입력하여 주시기 바랍니다.", false);
		}
		/* MOT check */
		if ($(":radio[name='MOTPart']:checked", _active).val() == "YES"){
			$(":checkbox[name^='mot_checklist']", _active).each(function (){
				if ($(this).is(":checked")){
					mot_chk = true;
					mot_chk_list += "Y";
				} else mot_chk_list += "N";
			});
			if (!mot_chk) return ws47.returnAlert("MOT관련 체크 항목을 선택하여 주십시오.", false);
			$("input[name='MOTCL']", _active).val(mot_chk_list);
		}
		/* submit */
		if (confirm("협의회신 하시겠습니까?")) {
			_doc.submit(function (xhr,data,textStatus){ _doc.close(); request.returnData(data) })
		}
	}
	function _Event_initialize(){
		ws47.form_Event_classrequest(_active);
		ws47.form_Event_Research(_active);
		
		if (distribute){
			$("select[name='ReasonRequest']", _active).off("change").on("change", function (){
				var bFlag = this.value.indexOf("reason70") != -1;
				$("#idcretc", _active)[(bFlag ? "show" : "hide")]();
			});
		} else {
			$(":radio[name='MOTPart']", _active).off("click").on("click", function (){
				var bFlag = (this.value == "YES");
				$("#div_mot", _active)[(bFlag ? "show" : "hide")]();
			});
			
			$(":radio[name='InfluencePart']", _active).off("click").on("click", function (){
				$("textarea[name='ImproprietyReasonPart']", _active).prop("disabled", (this.value == "YES" ? "disabled" : ""));
			});
		}
		ws47.span_open_click_event("span_catefd", _active);
	}
	function _load(){
		var userParam = (
			distribute
		?	{usertype : "2", user : GC.user.groupcode, fieldname : "ITPartChief"} 
		:	{usertype : "3", user : "system_test", fieldname : "ConsultationChargePart"}
		);
		
		_active = GC.active(true);
		_Event_initialize();
		 
		ws47.getUserlist(userParam, ws47.setSelectOption);
		
		/* 요청분류 / 사유 */
		$("select[name='ClassRequest']", _active)
		.val(ws47.info.classrequest)
		.attr("selected", "selected")
		.change();

		$("select[name='ReasonRequest']", _active)
		.val(ws47.info.reasonrequest)
		.attr("selected", "selected");
		
		_doc = $(_active).doc(ws47.docOption).doc();
	}
	
	var url = new GF.CURL("/" + doc.getOption("dbpath") + "/discussReply" + (distribute?"_distribute":"") + "?openform"
	, {parentunid : doc.getOption("unid")});
	GF.dialog({
		content : {url : url.url}
	,	title : "협의회신", isactive : true, width : 650, height : 550, resizable : false
	,	onload : _load
	,	buttons : [
			{text: "확인", click : (distribute ? _confirm_distribute : _confirm)}
		,	{text: "닫기", click : function (){$(this).dialog("close")}}
		]
	});
}
/*
 * *********************************************************
 * 설계자 재배분요청
 * *********************************************************
 * */
ws47.reDistribute = function (doc){
	request.inputOpinion("", function (data){
		var param = request.getParam(data);
		param.action = "redistribute";
		request.process(param, function (data){ request.returnData(data) });
	});
}
/*
 * *********************************************************
 * BR 배분
 * *********************************************************
 * */
ws47.distribute = function (doc){
	var _active = null, _doc = null;
	function _drawTable(){
		var subj = [
			"반영여부"
		,	"테스트유형"
		,	"완료가능일"
		,	"소요기간"
		,	"오로라/MOT 반영"
		,	"요청 분류 / 사유"
		,	"파&nbsp;트&nbsp;장"
		,	"I/F"
		,	"순&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;번"
		];
		var profile = ws47.info.reqteamprofile
		, profile_len = profile.length
		, distributeinfo = ws47.info.__distributeinfo
		, teamcode = ""
		, _html = ""
		, tr = "<tr>" +
			"<th>구&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;분</th>" +
			"<th>의견 및 설정</th>" +
			"#{th_part_title}" +
			"</tr>"
		, th_part_title = "<th>파&nbsp;트&nbsp;#{idx}</th>"
		, top_title = "";
		
		$(profile).each(function (i, _o){
			top_title = "";
			_html += "<table border=\"0\" cellspacing=\"0\" cellpadding=\"0\" class=\"frm_edit_outline_type1\">";
			_html += "<colgroup><col width=80><col width=80>";
			for (var k = 0 ; k < profile[i].partcnt ; k++){
				_html += "<col>";
				top_title += request.RX(th_part_title, {idx : (k+1)});
			}
			_html += "</colgroup>";
			_html += request.RX(tr, {th_part_title : top_title});
			_html += "<tr><th rowspan=\""+subj.length+"\">시스템"+(i+1)+"팀</th>";
			
			$(subj).each(function (j, __o){
				_html += ((j == 0 ? "" : "<tr>") + "<th>"+__o+"</th>");
				for (var k = 1 ; k <= profile[i].partcnt ; k++){
					_html += "<td class=\"first\"><div id=\"data" + (i+1) + k + j + "\"></div></td>";
				}
				_html += (j == (subj.length-1) ? "" : "</tr>");
			});
			_html += "</tr>";
			_html += "</table><div class=\"pt10\"></div>";
		});
		$("#part_table", _active).html(_html);
		
		var partinfo = null
		, partnum;
		
		$(profile).each(function (i, _o){
			teamcode = _o.teamcode;
			partinfo = distributeinfo["t_" + teamcode];
			if (partinfo){
				$(partinfo).each(function (index, __o){
					for( x in __o ){
						partnum = x.substr("part".length, x.length);
						$("#data" + (i+1) + partnum + "0", _active).html(__o[x].Influence);
						$("#data" + (i+1) + partnum + "1", _active).html(__o[x].testtype);
						$("#data" + (i+1) + partnum + "2", _active).html(__o[x].completeestimateddate);
						$("#data" + (i+1) + partnum + "3", _active).html(__o[x].requireday);
						$("#data" + (i+1) + partnum + "4", _active).html(__o[x].aurora + " / " + __o[x].mot);
						$("#data" + (i+1) + partnum + "5", _active).html(__o[x].classrequest + " / " + __o[x].reasonrequest);
						$("#data" + (i+1) + partnum + "6", _active).html(
							"<select name=\"ITPartChief" + (i+1) + partnum + "\" style=\"width:100%\">" +
							"<option selected value=\"0\">[파트장 선택]" +
							"</select>"
						);
						$("#data" + (i+1) + partnum + "7", _active).html(
							"<input type=\"checkbox\" name=\"IFChk" + (i+1) + partnum + "\"> 반영"
						);
						$("#data" + (i+1) + partnum + "8", _active).html(
							"<select name=\"SeqNum" + (i+1) + partnum + "\">" +
							"<option selected>" +
							"<option>1" + "<option>2" + "<option>3" + "<option>4" + "<option>5" +
							"<option>6" + "<option>7" + "<option>8" + "</select>"
						);
					} 
				});
			}
			i++;
		});
		
		$(profile).each(function (i, _o){
			ws47.getUserlist( { usertype : "2", user : _o.teamcode, fieldname : "ITPartChief" + (i+1) } , ws47.setSelectOption);
		});
	}
	function _confirm(){
		/*
		 * 파트장 선택 했는지 확인
		 * 다른 문서의 완료예정일 비교해서 앞이면 확인
		 * */
		var completedate = ""
		, acceptdate = ""
		, regulardate = ""
		, nRisk = []
		, ret = true
		, fRisk = true;
		
		//alert(ws47.info.createddate);
		
		completedate = _doc.getField("DevelopDate");
		if (completedate == "" ) return ws47.returnAlert("완료가능일을 입력하여 주시기 바랍니다.", false);
		if (completedate < ws47.info.createddate) return ws47.returnAlert("완료가능일자를 조정하십시오.", false);
		if (GF.isHoliday([completedate])[0] === "1")
			if (!confirm("입력 하신 완료가능일은 공휴일 (또는 휴무일) 입니다.\n\n진행하시겠습니까?"))
				return false;
		
		acceptdate = _doc.getField("AcceptDate"); //$("input[name='AcceptDate']", _active).val();
		if (acceptdate < completedate) return ws47.returnAlert("인수완료예정일을 조정하십시오.", false);
		if (GF.isHoliday([acceptdate])[0] === "1")
			if (!confirm("입력 하신 인수완료예정일은 공휴일 (또는 휴무일) 입니다.\n\n진행하시겠습니까?"))
				return false;
		
		regulardate = _doc.getField("RegularDate"); //$("input[name='RegularDate']", _active).val();
		if (regulardate < acceptdate) return ws47.returnAlert("정규완료예정일을 조정하십시오.", false);
		if (GF.isHoliday([regulardate])[0] === "1")
			if (!confirm("입력 하신 정규완료예정일은 공휴일 (또는 휴무일) 입니다.\n\n진행하시겠습니까?"))
				return false;
		
		if (_doc.getField("AuroraInfluence") == undefined) return ws47.returnAlert("오로라반영여부를 선택하여 주시기 바랍니다.", false);
		if (_doc.getField("MOT") == "") return ws47.returnAlert("MOT 반영여부를 선택하여 주시기 바랍니다.", false);
		if (_doc.getField("ClassRequest") == "class0") return ws47.returnAlert("요청분류를 선택하여 주십시오.", false);
		if ((_doc.getField("ClassRequest").indexOf("class30") == -1) && (_doc.getField("ReasonRequest") == "reason0")) return ws47.returnAlert("요청사유를 선택하여 주십시오.", false);
		
		if (_doc.getField("ReasonRequest").indexOf("reason70") > -1)
			if (_doc.getField("CREtc") == "")
				return ws47.returnAlert("요청분류/사유가 '단순변경/기타변경'인 경우 구분사유를 필수로 입력하여 주십시오.", false);
		
		if (_doc.getField("ClassRequest").indexOf("class10") > -1){
			$("input:radio[name^='RiskTest']", _active).each(function (){
				nRisk[nRisk.length] = $(this).attr("name").trim();
			});
			nRisk = nRisk.unique();
			$.each(nRisk, function (i, _f){
				if (!$(":radio[name='" + _f + "']:checked", _active).val()){
					fRisk = false;
				}
			});
			if (!fRisk) return ws47.returnAlert("영향도 측정을 체크하여 주십시오.", false);
			if ($("input[name='ITSecurity']", _active).val() == "") return ws47.returnAlert("IT보안검토의 중요도를 체크하여 주십시오.", false);
		}
		
		$("select[name^='ITPartChief'] option:selected", _active).each(function (){
			if ($(this).val() == "0"){
				return ret = false;
			}
		});
		if (!ret) return ws47.returnAlert("파트장을 선택 해 주십시오.", false);
		
		var itpartchieflist = {}
		, chklist = {}
		, seqlist = {};
		
		/* 파트장, I/F, 순번을 리스트 필드에 저장 */
		$("select[name^='ITPartChief']", _active).each(function (i, _o){
			var idseq = this.name.substr("ITPartChief".length) //, this.name.length)
			, itpart = {}
			, chk = {}
			, seqnum = {};
			
			itpartchieflist[this.name.toLowerCase()] = this.value;
			chklist[("IFChk" + idseq).toLowerCase()] = $(":checkbox[name='IFChk" + idseq + "']", _active).is(":checked");
			seqlist[("SeqNum" + idseq).toLowerCase()] = $("select[name='SeqNum" + idseq + "']", _active).val();
		});
		
		$("input[name='ITPartChiefList']", _active).val(request.toString(itpartchieflist));
		$("input[name='IFChkList']", _active).val(request.toString(chklist));
		$("input[name='SeqNumList']", _active).val(request.toString(seqlist));
		
		if (confirm("배분 하시겠습니까?")){
			_doc.submit(function (xhr,data,textStatus){ _doc.close(); request.returnData(data, "배분") });
		}
	}
	function _Event_initialize(){
		ws47.form_Event_classrequest(_active);
		
		$("select[name='ReasonRequest']", _active).off("change").on("change", function (){
			var bFlag = this.value.indexOf("reason70") > -1;
			$("#idcretc", _active)[(bFlag ? "show" : "hide")]();
		});
		$("select[name='ClassRequest']", _active).bind("change", function (){
			var bFlag = this.value.indexOf("class10") > -1;
			$("#trRiskTable", _active)[(bFlag ? "show" : "hide")]();
			$("#trITSecuTable", _active)[(bFlag ? "show" : "hide")]();
		});
		$(":radio[name='idITSecu']", _active).off("click").on("click", function (){
			$("input[name='ITSecurity']", _active).val(this.value);
		});
		$(":radio[name='RiskTest23']", _active).off("click").on("click", function (){
			if (this.value == "5"){
				alert("'재무적 영향도' 항목의 스코어링 기준을 참고해서 다시 선택하세요");
				this.checked = false;
			}
		});
		$(":radio[name='RiskTest24']", _active).off("click").on("click", function (){
			if (this.value == "3"){
				alert("'영향을 미치는 계층' 항목의 스코어링 기준을 참고해서 다시 선택하세요");
				this.checked = false;
			}
		});
		$("select[name^='SeqNum']", _active).off("change").on("change", function (){
			var idseq= this.name.substr('SeqNum'.length)
			, _o = this
			, ret = true;
			if (this.selectedIndex == 0){
				$(":checkbox[name='IFChk" + idseq + "']", _active).attr("checked", false).attr("disabled", false);
				return false;
			}
			$("select[name^='SeqNum']", _active).each(function (idx, __o){
				if (_o.name != __o.name){
					if (_o.selectedIndex == __o.selectedIndex) {return ret = ws47.returnAlert("순번을 잘 못 지정 하셨습니다.", false)}
				}
			});
			if (!ret) {
				$(":checkbox[name='IFChk" + idseq + "']", _active).attr("checked", false).attr("disabled", false);
				this.selectedIndex = 0;
				return false;
			}
			$(":checkbox[name='IFChk" + idseq + "']", _active).attr("checked", true).attr("disabled", true);
		});
		
		ws47.span_open_click_event("span_itsecurity", _active);
		ws47.span_open_click_event("span_catefd", _active);
		ws47.span_open_click_event("span_risk_fd", _active);
	}
	function _load(){
		_active = GC.active(true);
		_doc = $(_active).doc(ws47.docOption).doc();
		_drawTable();
		_Event_initialize();
		
		/* 요청분류 / 사유 */
		$("select[name='ClassRequest']", _active)
		.val(ws47.info.classrequest)
		.attr("selected", "selected")
		.change();

		$("select[name='ReasonRequest']", _active)
		.val(ws47.info.reasonrequest)
		.attr("selected", "selected");
	}
	
	var url = new GF.CURL("/" + doc.getOption("dbpath") + "/brDistribute?openform"
	, {parentunid : doc.getOption("unid")});
	
	GF.dialog({
		content : {url : url.url}
	,	title : "배분", isactive : true, width : 780, height : 480, resizable : false
	,	onload : _load
	,	buttons : [
			{text: "확인", click : _confirm}
		,	{text: "닫기", click : function (){$(this).dialog("close")}}
		]
	});
}
/*
 * *********************************************************
 * IT보안검토
 * *********************************************************
 * */
ws47.itSecurity = function (doc){
	var _active = null, _doc = null;
	
	function _confirm(){
		var json = ws47.chkITSecurity(_active);
		if ( !json ) return ws47.returnAlert("검토기준에 대해서 확인하여 주십시오.", false);
		
		json["ITSecurity15"] = $("input[name='ITSecurity15']", _active).val();
		if (!confirm("확인 하시겠습니까?")) return false; 
		var param = request.getParam("");
		param.action = "itsecurity";
		param.json = request.toString(json);

		request.process(param, function (data){ $(_active).dialog("close"); request.returnData(data) });
	}
	function _load(){
		_active = GC.active(true);
	}
	var url = new GF.CURL("/" + doc.getOption("dbpath") + "/itsecurityReview?openform"
	, {parentunid : doc.getOption("unid")});
	
	GF.dialog({
		content : {url : url.url}
	,	title : "IT보안검토", isactive : true, width : 750, height : 480, resizable : false
	,	onload : _load
	,	buttons : [
			{text: "확인", click : _confirm}
		,	{text: "닫기", click : function (){$(this).dialog("close")}}
		]
	});
}
/*
 * *********************************************************
 * 설계접수
 * *********************************************************
 * */
ws47.designAccept = function (doc){
	var _active = null, _doc = null, seq = null;
	
	function _validation(){
		/* 동일 담당자 확인 */
		var selectcharge = $("select[name='ITPartCharge']", _active).val()
		, flag = true;
		$.each(ws47.docOption.itpartchargelist, function (team, partobj){
			$.each(partobj, function (idx, _o){
				if (selectcharge == _o.charge){
					return flag = ws47.returnAlert("담당자를 중복 선택하실 수 없습니다.\n\n선택 된 담당자를 확인 해 주세요.", false);
				}
			});
			return flag;
		});
		if ( !flag ) return false;
		
		if (_doc.getField("DCDate") == "") return ws47.returnAlert("설계완료예정일을 입력하여 주십시오.", false);
		if (_doc.getField("DTCDate") == "") return ws47.returnAlert("테스트완료예정일을 입력하여 주십시오.", false);
		if (_doc.getField("DTCODate") == "") return ws47.returnAlert("테스트확인예정일을 입력하여 주십시오.", false);
		
		if (_doc.getField("DCDate") > _doc.getField("DTCDate") ||
			_doc.getField("DTCDate") > _doc.getField("DTCODate") ||
			_doc.getField("DTCODate") > _doc.getOption("developdate"))
			return ws47.returnAlert("예정일을 다시 입력하여 주십시오.", false);
		
		if (_doc.getField("ITPartChief") == "0") return ws47.returnAlert("파트장을 선택하여 주십시오.", false);
		if (_doc.getField("ITPartCharge") == "0") return ws47.returnAlert("개발자를 선택하여 주십시오.", false);
		
		if (_doc.getField("FieldAgentCheck") == "T"){
			if (_doc.getField("DisFieldAgent") == "0") return ws47.returnAlert("현장대리인을 선택하여 주십시오.", false);
			_doc.setField("FieldAgent", _doc.getField("DisFieldAgent"));
		}
		
		var nRisk = []
		, fRisk = true;
		
		if (_doc.getField("Check_RiskTest") == "0"){
			$("input:radio[name^='RiskTest']", _active).each(function (){
				nRisk[nRisk.length] = $(this).attr("name").trim();
			});
			nRisk = nRisk.unique();
			$.each(nRisk, function (i, _f){
				if (!$(":radio[name='" + _f + "']:checked", _active).val()){
					fRisk = false;
				}
			});
			if (_doc.getField("ClassRequest").indexOf("class10") > -1){
				if (!fRisk) return ws47.returnAlert("영향도 측정을 체크하여 주십시오.", false);
			}
		}
		
		if (ws47.docOption.itsecurity == "2"){
			if ( !ws47.chkITSecurity(_active) ) return ws47.returnAlert("검토기준에 대해서 확인하여 주십시오.", false);
		}
		return true;
	}
	function _confirm(){
		if (_validation()){
			_doc.setField("ActionFlag", "confirm");
			_doc.submit(function (xhr,data,textStatus){ _doc.close(); request.returnData(data, "접수") });
		}
	}
	function _draft(){
		if (_validation()){
			_doc.setField("ActionFlag", "draft");
			_doc.submit(function (xhr,data,textStatus){ _doc.close(); request.returnData(data, "임시저장"); });
		}
	}
	function _Event_initialize(){
		$(":radio[name='RiskTest23']", _active).off("click").on("click", function (){
			if (this.value == "5"){
				alert("'재무적 영향도' 항목의 스코어링 기준을 참고해서 다시 선택하세요");
				this.checked = false;
			}
		});
		$(":radio[name='RiskTest24']", _active).off("click").on("click", function (){
			if (this.value == "3"){
				alert("'영향을 미치는 계층' 항목의 스코어링 기준을 참고해서 다시 선택하세요");
				this.checked = false;
			}
		});
		$("select[name='ITPartCharge']", _active).off("change").on("change", function (){
			var flag = false
			, user = null;
			
			if (this.value != "0"){
				user = request.setUser(this.value);
				flag = user.empno.substr(0, 1) == "5";
			}
			
			$("#trFieldAgent", _active)[(flag ? "show" : "hide")]();
			$("input[name='FieldAgentCheck']", _active).val(flag ? "T" : "");
		}).change();
		
		ws47.span_open_click_event("span_risk_fd", _active);
		ws47.span_open_click_event("span_rdd", _active, doc);
	}
	
	function _partchief(){
		/* 파트장 선택 */
		var partchief = ws47.docOption.itpartchief //itpartchieflist["itpartchief" + seq];
		_doc.setField("ITPartChief" , partchief);
	}
	
	function _load(){
		_active = GC.active(true);
		_doc = $(_active).doc(ws47.docOption).doc();
		
		var teamcode = ws47.docOption.teamcode
		, kicoCode = _doc.getField("kicoCode");
		
		//if (ifchk){
		if (ws47.docOption.ifchk != ""){
			$("#span_if_num_string", _active).html("<font style='color:blue ;font-weight:bold;'>" +
					"※ 본 의뢰서는 인터페이스 처리건이므로 각 담당설계자와 <br>" +
					"반드시 일정을 협의하시기 바랍니다.</font>");
		}
		
		/* 콤보 리스트 가져오기 */
		ws47.getUserlist( { usertype : "2", user : teamcode, fieldname : "ITPartChief" } , ws47.setSelectOption, _partchief);
		ws47.getUserlist( { usertype : "4", user : teamcode + "^" + kicoCode, fieldname : "ITPartCharge" } , ws47.setSelectOption);
		ws47.getUserlist( { usertype : "3", user : "agent_89920002", fieldname : "DisFieldAgent" } , ws47.setSelectOption);
		
		/* 다른 파트의 선택 된 개발담당자 보이기 */
		var _h = [];
		$.each(ws47.docOption.itpartchargelist, function (team, partobj){
			$.each(partobj, function (idx, _o){
				var len = _h.length
				, user = request.setUser(_o.charge);
				
				_h[len] = "시스템" + team.substr("team".length) + "팀 > ";
				_h[len] += (_o.part + " : " + user.korname + " " + user.post);
			});
		});
		if (_h.length > 0){
			$("#trChargelist", _active).show();
			$("#tdChargelist", _active).show().html(_h.join("<br>"));
		}
		_Event_initialize();
	}
	
	var url = new GF.CURL("/" + doc.getOption("dbpath") + "/designAccept?openform"
	, {parentunid : doc.getOption("unid")});
	
	GF.dialog({
		content : {url : url.url}
	,	title : "설계접수", isactive : true, width : 680, height : 480, resizable : false
	,	onload : _load
	,	buttons : [
			{text: "확인", click : _confirm}
		,	{text: "취소", click : function (){$(this).dialog("close")}}
		,	{text: "임시저장", click : _draft}
		]
	});
}
/*
 * *********************************************************
 * 예정일변경요청
 * *********************************************************
 * */
ws47.dateChgRequest = function (doc){
	var _active = null; _doc = null;
	
	function _confirm(){
		var compareDate = "", adate = [], json={}, ret = true;
		$.each(ws47.docOption.changes, function (index, _o){
			compareDate = $("input[name='" + _o.field + "']", _active).val();
			if (compareDate == "") return ret = ws47.returnAlert(_o.str + "을 입력하여 주십시오.", false);
			if (compareDate < ws47.info.nowdate) return ret = ws47.returnAlert("예정일 변경요청 기간이 지났습니다.", false);
			/* 선택일이 완료예정일보다 이후 이면 */
			if (compareDate > ws47.docOption.developdate) return ret = ws47.returnAlert("예정일을 다시 입력하여 주십시오.", false);
			/* 설계예정일 > 테스트예정일 > 테스트확인예정일 이면 */
			if (adate.length > 0) if (adate[index-1] > compareDate) return ret = ws47.returnAlert("예정일을 다시 입력하여 주십시오.", false);
			json[_o.field] = compareDate;
		});
		
		if (!ret) return false;
		
		if (!confirm("입력 확인 하시겠습니까?")) return false;
		var param = request.getParam("");
		param.action = "datechangerequest";
		param.json = request.toString(json);
		request.process(param, function (data){ $(_active).dialog("close"); request.returnData(data) });
	}

	function _load(){
		_active = GC.active(true);
		_doc = $(_active).doc(ws47.docOption).doc();
	}
	
	var url = new GF.CURL("/" + doc.getOption("dbpath") + "/dateChangeRequest?openform"
	, {parentunid : doc.getOption("unid")});
	
	GF.dialog({
		content : {url : url.url}
	,	title : "예정일변경요청", isactive : true, width : 600, height : 230, resizable : false
	,	onload : _load
	,	buttons : [
			{text: "확인", click : _confirm}
		,	{text: "취소", click : function (){$(this).dialog("close")}}
		]
	});
}
/*
 * *********************************************************
 * 예정일변경동의, 거부 처리
 * *********************************************************
 * */
ws47.ChangeDate = function (doc, flag){
	var _active = GC.active(true)
	, json = { "yn" : flag };
	
	if (ws47.info.dcdate < ws47.info.nowdate) return ws47.returnAlert("예정일 변경기간이 지났습니다.", false);
	
	var param = request.getParam("");
	param.action = "yn_changedate";
	param.json = request.toString(json);

	request.process(param, function (data){ request.returnData(data) });
}
/*
 * *********************************************************
 * 설계문서등록
 * *********************************************************
 * */
ws47.registDesign = function (doc){
	var opts = {			
		teampartnum : ws47.info.teampartnum
	,	parentunid : doc.getOption("unid")
	,	curfield : "ITPartDesigner" + ws47.info.teampartnum
	,	docidfield : "SD" + ws47.info.teampartnum
	,	creq : (ws47.info.da == "NO" ? "steptext" : "")
	,	flag : "edit"
	};
	ws47.openIntegTestDoc(opts);
}
/*
 * *********************************************************
 * 설계완료
 * *********************************************************
 * */
ws47.completeDesign = function (doc){
	var _active = null, _doc = null;
	if (ws47.info.designcompletedocid != "Y") return ws47.returnAlert("설계문서를 등록 하지 않았습니다. 등록하여 주십시오.", false)
	
	function _draft(){
		if (confirm("임시저장 하시겠습니까?")){
			_doc.setField("ActionFlag", "draft");
			_doc.submit(function (xhr,data,textStatus){ _doc.close(); request.returnData(data, "임시저장") });
		}
	}
	function _confirm(){
		var tmpdata = _doc.getField("DesignCompleteContent");
		if (tmpdata == "") return ws47.returnAlert("설계완료내역을 입력하여 주십시오.", false);
		tmpdata = _doc.getField("ProgramID");
		if (tmpdata == "") return ws47.returnAlert("프로그램정보를 입력하여 주시기 바랍니다.", false);
		if (tmpdata.length > 10000) return ws47.returnAlert("프로그램정보 입력 제한이 넘었습니다.\n\n※ 10KByte 미만으로 입력해주십시오.", false);
		if (confirm("입력 확인 하시겠습니까?")){
			_doc.setField("ActionFlag", "confirm");
			_doc.submit(function (xhr,data,textStatus){ _doc.close(); request.returnData(data, "설계완료") });
		}
	}
	function _load(){
		_active = GC.active(true);
		_doc = $(_active).doc(ws47.docOption).doc();
	}
	var url = new GF.CURL("/" + doc.getOption("dbpath") + "/completeDesign?openform"
	, {parentunid : doc.getOption("unid")});
	
	GF.dialog({
		content : {url : url.url}
	,	title : "설계완료", isactive : true, width : 600, height : 430, resizable : false
	,	onload : _load
	,	buttons : [
			{text: "확인", click : _confirm}
		,	{text: "취소", click : function (){$(this).dialog("close")}}
		,	{text: "임시저장", click : _draft}
		]
	});
}
/*
 * *********************************************************
 * 파트장승인
 * *********************************************************
 * */
ws47.itPartChiefApprove = function (doc){
	var _active = null, _doc = null;
	
	function _validation(){
		/* 동일 담당자 확인 */
		var selectcharge = $("select[name='ITPartCharge']", _active).val()
		, flag = true;
		$.each(ws47.docOption.itpartchargelist, function (team, partobj){
			$.each(partobj, function (idx, _o){
				if (selectcharge == _o.charge){
					return flag = ws47.returnAlert("개발자를 중복 선택하실 수 없습니다.\n\n선택 된 담당자를 확인 해 주세요.", false);
				}
			});
			return flag;
		});
		if ( !flag ) return false;
		
		if (_doc.getField("DCDate") == "") return ws47.returnAlert("설계완료예정일을 입력하여 주십시오.", false);
		if (_doc.getField("DTCDate") == "") return ws47.returnAlert("테스트완료예정일을 입력하여 주십시오.", false);
		if (_doc.getField("DTCODate") == "") return ws47.returnAlert("테스트확인예정일을 입력하여 주십시오.", false);
		
		if (_doc.getField("DCDate") > _doc.getField("DTCDate") ||
			_doc.getField("DTCDate") > _doc.getField("DTCODate") ||
			_doc.getField("DTCODate") > _doc.getOption("developdate"))
			return ws47.returnAlert("예정일을 다시 입력하여 주십시오.", false);
		
		if (_doc.getField("ITPartCharge") == "0") return ws47.returnAlert("개발자를 선택하여 주십시오.", false);
		
		if (_doc.getField("FieldAgentCheck") == "T"){
			if (_doc.getField("DisFieldAgent") == "0") return ws47.returnAlert("현장대리인을 선택하여 주십시오.", false);
			_doc.setField("FieldAgent", _doc.getField("DisFieldAgent"));
		}
		
		if (ws47.docOption.itsecurity == "1"){
			if ( !ws47.chkITSecurity(_active) ) return ws47.returnAlert("검토기준에 대해서 확인하여 주십시오.", false);
		}
		return true;
	}
	function _confirm(){
		if (_validation()){
			_doc.submit(function (xhr,data,textStatus){ _doc.close(); request.returnData(data, "승인") });
		}
	}
	function _itPartCharge(){
		$("select[name='ITPartCharge']", _active)
		.val(ws47.docOption.disitpartcharge)
		.attr("selected","selected")
		.change();	
	}
	function _itFieldAgent(){
		$("select[name='DisFieldAgent']", _active)
		.val(ws47.docOption.fieldagent)
		.attr("selected","selected");
	}
	function _Event_initialize(){
		$("select[name='ITPartCharge']", _active).off("change").on("change", function (){
			var flag = false
			, user = null;
			
			if (this.value != "0"){
				user = request.setUser(this.value);
				flag = user.empno.substr(0, 1) == "5";
			}
			
			$("#trFieldAgent", _active)[(flag ? "show" : "hide")]();
			$("input[name='FieldAgentCheck']", _active).val(flag ? "T" : "");
		}).change();
		ws47.span_open_click_event("span_itsecurity", _active);
	}
	function _load(){
		_active = GC.active(true);
		_doc = $(_active).doc(ws47.docOption).doc();

		var teamcode = ws47.docOption.teamcode
		, kicoCode = _doc.getField("kicoCode");
		
		ws47.getUserlist( { usertype : "4", user : teamcode + "^" + kicoCode, fieldname : "ITPartCharge" } , ws47.setSelectOption, _itPartCharge);
		ws47.getUserlist( { usertype : "3", user : "agent_89920002", fieldname : "DisFieldAgent" } , ws47.setSelectOption, _itFieldAgent);
		
		/* 다른 파트 개발자 */
		var _h = [];
		$.each(ws47.docOption.itpartchargelist, function (team, partobj){
			$.each(partobj, function (idx, _o){
				var len = _h.length
				, user = request.setUser(_o.charge);
				
				_h[len] = "시스템" + team.substr("team".length) + "팀 > ";
				_h[len] += (_o.part + " : " + user.korname + " " + user.post);
			});
		});
		
		if (_h.length > 0){
			$("#trChargelist", _active).show();
			$("#tdChargelist", _active).show().html(_h.join("<br>"));
		}
		
		_Event_initialize();
	}
	var url = new GF.CURL("/" + doc.getOption("dbpath") + "/itPartChiefApprove?openform"
	, {parentunid : doc.getOption("unid")});
	
	GF.dialog({
		content : {url : url.url}
	,	title : "파트장승인", isactive : true, width : 580, height : 430, resizable : false
	,	onload : _load
	,	buttons : [
			{text: "확인", click : _confirm}
		,	{text: "취소", click : function (){$(this).dialog("close")}}
		]
	});
}
/*
 * *********************************************************
 * 현장배분, 현장 배분
 * *********************************************************
 * */
ws47.fieldAgentDis = function (doc){
	var _active = null, _doc = null;
	
	function _itPartCharge(){
		$("select[name='ITPartCharge']", _active)
		.val(ws47.docOption.disitpartcharge)
		.attr("selected","selected")
		.change();	
	}
	function _validation(){
		/* 동일 담당자 확인 */
		var selectcharge = $("select[name='ITPartCharge']", _active).val()
		, flag = true;
		$.each(ws47.docOption.itpartchargelist, function (team, partobj){
			$.each(partobj, function (idx, _o){
				if (selectcharge == _o.charge){
					return flag = ws47.returnAlert("개발자를 중복 선택하실 수 없습니다.\n\n선택 된 담당자를 확인 해 주세요.", false);
				}
			});
			return flag;
		});
		if ( !flag ) return false;
		if (_doc.getField("ITPartCharge") == "0") return ws47.returnAlert("개발자를 선택하여 주십시오.", false);
		return true;
	}
	function _confirm(){
		if (_validation()){
			var param = request.getParam("");
			param.action = "fieldagentdis";
			param.json = request.toString({ITPartCharge : _doc.getField("ITPartCharge")});
			request.process(param, function (data){ _doc.close(); request.returnData(data, "현장배분") });
		}
	}
	function _load(){
		_active = GC.active(true);
		_doc = $(_active).doc(ws47.docOption).doc();
		
		var kicoCode = _doc.getField("kicoCode");
		
		ws47.getUserlist( { usertype : "4", user : kicoCode, fieldname : "ITPartCharge" } , ws47.setSelectOption, _itPartCharge);
	}
	var url = new GF.CURL("/" + doc.getOption("dbpath") + "/fieldAgentDis?openform"
	, {parentunid : doc.getOption("unid")});
	
	GF.dialog({
		content : {url : url.url}
	,	title : "현장대리인 배분", isactive : true, width : 500, height : 230, resizable : false
	,	onload : _load
	,	buttons : [
			{text: "확인", click : _confirm}
		,	{text: "취소", click : function (){$(this).dialog("close")}}
		]
	});
}
/*
 * *********************************************************
 * 현장확인
 * *********************************************************
 * */
ws47.fieldAgentConfirm = function (doc){
	ws47.callApprove(doc, {action:"fieldagentconfirm", commentflag:false}, "현장확인");
}
/*
 * *********************************************************
 * 개발접수
 * *********************************************************
 * */
ws47.developAccept = function (doc){
	if (confirm("설계내역에 대해서 개발접수를 하시겠습니까?")){
		var param = request.getParam("");
		param.action = "developaccept";
		request.process(param, function (data){ request.returnData(data, "개발접수") });
	}
}
/*
 * *********************************************************
 * BR, 개발자 변경요청
 * *********************************************************
 * */
ws47.changeRequestBR = function (doc){
	var _active = null, _doc = null;
	
	function _confirm(){
		var date = "";
		
		if (!_doc.getField("ChangeReason2")) return ws47.returnAlert("변경사유를 선택하여 주시기 바랍니다.", false);
		if (_doc.getField("ChangeReason") == "") return ws47.returnAlert("변경내역을 입력하여 주시기 바랍니다.", false);
		
		date = _doc.getField("DisDevelopDate");
		if (date < ws47.info.nowdate)
			return ws47.returnAlert("예정일 변경요청 기간이 지났습니다.\n\n" +
					"※ 완료예정일이 경과한 이후에는 변경요청이 불가능 합니다.", false);
		
		date = _doc.getField("TmpDevelopDate");
		if (date == "") return ws47.returnAlert("변경 완료예정일을 입력하여 주시기 바랍니다.", false);
		if (date < _doc.getField("DisDevelopDate"))  return ws47.returnAlert("변경 완료예정일을 다시 입력하여 주시기 바랍니다.", false);
		if (GF.isHoliday([date])[0] === "1")
			if (!confirm("입력 하신 변경 완료예정일은 공휴일 (또는 휴무일) 입니다.\n\n진행하시겠습니까?"))
				return false;
		
		date = _doc.getField("TmpAcceptDate");
		if (date == "") return ws47.returnAlert("변경 인수완료예정일을 입력하여 주시기 바랍니다.", false);
		if (date < _doc.getField("DisAcceptDate"))  return ws47.returnAlert("변경 인수완료예정일을 다시 입력하여 주시기 바랍니다.", false);
		if (GF.isHoliday([date])[0] === "1")
			if (!confirm("입력 하신 변경 인수완료예정일은 공휴일 (또는 휴무일) 입니다.\n\n진행하시겠습니까?"))
				return false;
		
		date = _doc.getField("TmpRegularDate");		
		if (date == "") return ws47.returnAlert("변경 정규반영예정일을 입력하여 주시기 바랍니다.", false);
		if (date < _doc.getField("DisRegularDate"))  return ws47.returnAlert("변경 정규반영예정일을 다시 입력하여 주시기 바랍니다.", false);
		if (GF.isHoliday([date])[0] === "1")
			if (!confirm("입력 하신 변경 정규반영예정일은 공휴일 (또는 휴무일) 입니다.\n\n진행하시겠습니까?"))
				return false;
		
		var param = request.getParam("");
		json = {
			"changereason2" : _doc.getField("ChangeReason2")
		,	"changereason" :  _doc.getField("ChangeReason")
		,	"disdevelopdate" :  _doc.getField("DisDevelopDate")
		,	"disacceptdate" :  _doc.getField("DisAcceptDate")
		,	"disregulardate" :  _doc.getField("DisRegularDate")
		,	"tmpdevelopdate" :  _doc.getField("TmpDevelopDate")
		,	"tmpacceptdate" :  _doc.getField("TmpAcceptDate")
		,	"tmpregulardate" :  _doc.getField("TmpRegularDate")
		}
		param.action = "changerequestbr";
		param.json = request.toString(json);
		
		request.process(param, function (data){
			_doc.close();
			request.returnData(data, "변경요청") 
		});
	}
	function _load(){
		_active = GC.active(true);
		_doc = $(_active).doc(ws47.docOption).doc();
	}
	var url = new GF.CURL("/" + doc.getOption("dbpath") + "/ChangeRequestBR?openform"
	, {parentunid : doc.getOption("unid")});
	
	GF.dialog({
		content : {url : url.url}
	,	title : "변경요청", isactive : true, width : 500, height : 270, resizable : false
	,	onload : _load
	,	buttons : [
			{text: "확인", click : _confirm}
		,	{text: "취소", click : function (){$(this).dialog("close")}}
		]
	});
}
/*
 * *********************************************************
 * BR, 개발자 변경요청 에 대한 현업 승인
 * *********************************************************
 * */
ws47.changeClientApprove = function (doc, bflag){
	// true : 승인, false : 반려
	var comparedate = ""
	, param = request.getParam("");
	
	if (bflag){
		if (ws47.info.requesttype == "A") comparedate = (ws47.info.changedevelopdate || ws47.info.developdate);
		else if (ws47.info.requesttype == "B") comparedate = (ws47.info.changeacceptdate || ws47.info.acceptdate);
		else if (ws47.info.requesttype == "C") comparedate = (ws47.info.changeregulardate || ws47.info.regulardate);
		if (comparedate < ws47.info.nowdate){
			return ws47.returnAlert("완료예정일 변경동의 기간이 지났습니다.\n\n※ 완료예정일이 경과한 이후에는 변경동의가 불가능 합니다.", false)
		}
		
		param.action = "chgclientapproveok";
	} else param.action = "chgclientapprovefcancel";
	
	request.process(param, function (data){
		request.returnData(data);
	});
}
/*
 * *********************************************************
 * 현업요건변경
 * *********************************************************
 * */
ws47.contentChangeReq = function (doc){
	if (ws47.info.changereqdocid != "") return ws47.returnAlert("이미 요건변경을 신청하셨습니다.", false);
	if (!confirm("신청자에게 요건 변경 신청 하시겠습니까?")) return false;
	var url = new GF.CURL("/" + ws47.info.dbpath[7] + "/crtdoc_process?openagent", {
		unid : doc.getOption("unid")
	,	empno : $("input[name='EmpNo']", ws47.active).val()
	});

	GF.ajax({
		url : url.url
	,	dataType: "html", type : "GET", async : true, cache : false
	,	success : function (data,textStatus,xhr){
			request.returnData(data);
		}
	,	error : function (xhr,textStatus) {
			GF.log("load error",textStatus);
		}
	});
}
/*
 * *********************************************************
 * 개발자 변경, 개발자변경
 * *********************************************************
 * */
ws47.changeCharge = function (doc){
	var _active = null, _doc = null;
	function _confirm(){
		var charge = _doc.getField("ITPartCharge")
		, fieldagent = _doc.getField("FieldAgent")
		, check = _doc.getField("FieldAgentCheck");
		
		if (charge == "0") return ws47.returnAlert("개발자를 선택하여 주십시오.", false);
		if (charge == ws47.docOption.disitpartcharge) return ws47.returnAlert("개발자를 변경하여 주십시오.", false);
		if ((check == "T") && (fieldagent == "0")) return ws47.returnAlert("현장대리인을 선택 하여 주십시오.", false);
		_doc.submit(function (xhr,data,textStatus){ _doc.close(); request.returnData(data, "변경") });
	}
	function _itPartCharge(){
		$("select[name='ITPartCharge']", _active)
		.val(ws47.docOption.disitpartcharge)
		.attr("selected","selected")
		.change();	
	}
	function _itFieldAgent(){
		$("select[name='FieldAgent']", _active)
		.val(ws47.docOption.disfieldagent)
		.attr("selected","selected");
	}
	function _Event_initialize(){
		$("select[name='ITPartCharge']", _active).off("change").on("change", function (){
			var flag = false
			, user = null;

			if (this.value != "0"){
				user = request.setUser(this.value);
				flag = user.empno.substr(0, 1) == "5";
			}
			
			$("#trFieldAgent", _active)[(flag ? "show" : "hide")]();
			$("input[name='FieldAgentCheck']", _active).val(flag ? "T" : "");
		}).change();
	}
	function _load(){
		_active = GC.active(true);
		_doc = $(_active).doc(ws47.docOption).doc();
		_Event_initialize();
		
		ws47.getUserlist( { usertype : "4", user : ws47.docOption.teamcode + "^" + ws47.docOption.kicoCode, fieldname : "ITPartCharge" } , ws47.setSelectOption, _itPartCharge);
		ws47.getUserlist( { usertype : "3", user : ws47.info.agentcode, fieldname : "FieldAgent" } , ws47.setSelectOption, _itFieldAgent);
	}
	var url = new GF.CURL("/" + doc.getOption("dbpath") + "/itPartChargeChange?openform"
	, {parentunid : doc.getOption("unid")});
	
	GF.dialog({
		content : {url : url.url}
	,	title : "개발자 변경", isactive : true, width : 500, height : 230, resizable : false
	,	onload : _load
	,	buttons : [
			{text: "확인", click : _confirm}
		,	{text: "취소", click : function (){$(this).dialog("close")}}
		]
	});
}
/*
 * *********************************************************
 * 완료내역 입력
 * *********************************************************
 * */
ws47.completeContent = function (doc){
	var _active = null, _doc = null;
	// changeinfluencedocid 이건 뭔지 모르겠다
	//*
	if (ws47.info.itcimdocid != "" && 
		(ws47.info.classrequest.indexOf("class10") != -1 || ws47.info.classrequest.indexOf("class40") != -1) &&
		ws47.info.cim != "Y"
		){
		return ws47.returnAlert("변경영향분석을 수행하여 주십시오.\n\n※ 호출 담당자가 있는경우 확인이 완료되어야 개발완료 가능합니다.", false);
	}
	if (ws47.info.chkcis == "YES" && ws47.info.chk5 == "Y"){
		alert("고객정보보안확인 'YES'를 클릭 후 데이터 산출파일의 암호화 적용 유형을 확인하고,\n\n" + 
			"문서 암호화(DRM) 툴을 사용하여 파일에 대한 암호화를 수행해 주시기 바랍니다.\n\n" + 
			"※ 고객정보 포함 데이터 산출파일은 반드시 암호화 한 후 현업에 제공해야 함");
	}
	// */
	function _itPartAcceptCharge(){
		$("select[name='TmpAcceptanceCharge']", _active)
		.val(ws47.docOption.disacceptancecharge)
		.attr("selected","selected");
	}
	function _itPartChief(){
		$("select[name='ITPartChief']", _active)
		.val(ws47.docOption.disitpartchief)
		.attr("selected","selected");
	}
	function _itFieldAgent(){
		$("select[name='DisFieldAgent']", _active)
		.val(ws47.docOption.fieldagent)
		.attr("selected","selected");
	}
	function _confirm(){
		var ret = true
		, sUser = ""
		, query = "input[name='ResearchItem1'],input[name='ResearchItem2']" + 
		(ws47.docOption.bDA ? ",input[name='ResearchItem3']" : "");
		
		$(query, _active).each(function (){
			if (this.value == ""){
				return ret = false;
			}
		});
		if (!ret) return ws47.returnAlert("모니터링 항목을 선택하여 주십시오.", false);
		if (_doc.getField("CompleteContent") == "") return ws47.returnAlert("처리 내역을 입력하여 주시기 바랍니다.", false);
		if (_doc.getField("ITPartChief") == "0") return ws47.returnAlert("승인자를 선택하여 주시기 바랍니다.", false);
		
		// 현장 대리인
		if (ws47.docOption.bfieldagent){
			sUser = _doc.getField("DisFieldAgent");
			if (sUser == "0") return ws47.returnAlert("현장대리인을 선택하여 주시기 바랍니다.", false);
			else _doc.setField("FieldAgent", sUser)
		}
		// 인수자
		if (ws47.docOption.bmaincharge){
			sUser = _doc.getField("TmpAcceptanceCharge");
			if (sUser == "0") return ws47.returnAlert("인수자를 선택하여 주시기 바랍니다.", false);
			else _doc.setField("AcceptanceCharge", sUser)
		}
		
		if (confirm("처리 내역을 입력 하시겠습니까?")){
			_doc.submit(function (xhr,data,textStatus){ _doc.close(); request.returnData(data) });
		}
	}
	function _Event_initialize(){
		ws47.form_Event_Research(_active);
	}
	function _load(){
		_active = GC.active(true);
		_doc = $(_active).doc(ws47.docOption).doc();

		/* 현장대리인 */
		ws47.getUserlist( { usertype : "3", user : ws47.info.agentcode, fieldname : "DisFieldAgent" } , ws47.setSelectOption, _itFieldAgent);
		/* 승인자 */
		ws47.getUserlist( { usertype : "2", user : ws47.info.teamcode, fieldname : "ITPartChief" } , ws47.setSelectOption, _itPartChief);
		/* 인수자 */
		ws47.getUserlist( { usertype : "4", user : ws47.docOption.deptcode, fieldname : "TmpAcceptanceCharge" } , ws47.setSelectOption, _itPartAcceptCharge);
		
		_Event_initialize();
	}
	var url = new GF.CURL("/" + doc.getOption("dbpath") + "/completeContent?openform"
	, {parentunid : doc.getOption("unid")});
	
	GF.dialog({
		content : {url : url.url}
	,	title : "완료내역 입력", isactive : true, width : 650, height : 450, resizable : false
	,	onload : _load
	,	buttons : [
			{text: "확인", click : _confirm}
		,	{text: "취소", click : function (){$(this).dialog("close")}}
		]
	});
}
/*
 * *********************************************************
 * 변경영향분석 입력
 * *********************************************************
 * */
ws47.itcimMgr = function (doc, flag){
	var _active = null, _doc = null;
	var opts = {			
		teampartnum : ws47.info.teampartnum
	,	parentunid : doc.getOption("unid")
	,	parentcode : doc.getOption("applcode")
	,	curfield : "ITPartCharge" + ws47.info.teampartnum
	,	docidfield : "SDC" + ws47.info.teampartnum
	,	flag : flag
	,	isundock : 1
	};
	
	var url = new GF.CURL("/" + ws47.info.dbpath[4] + "/0/" + ws47.info.itcimdocid + "?" + (flag == "edit" ? "editdocument" : "opendocument")
	, opts);
	
	//*
	var w = GF.winContent(url.url, {
		location:"0"
	,	resizable : "1"
	,	status: "1"
	,	menubar:"0"
	,	scrollbars:"0"
	,	width : "800"
	});
	// */
	/* 다른 데이터베이스의 문서 연결 */
}
/*
 * *********************************************************
 * 단위테스트
 * *********************************************************
 * */
ws47.UnitTest = function (doc){
	var _active = null, _doc = null;
	/* 다른 데이터베이스의 문서 연결 */
	function _validation(){
		var count1 = $("select[name='NCount1'] option:selected", _active).index() + 1
		, count2 = $("select[name='NCount2'] option:selected", _active).index() + 1
		, attchk = $("input[name='NCheckAttach']:checked", _active).val()
		, ing = true
		, sValue = "";

		if (!attchk) return ws47.returnAlert("단위테스트 시나리오 파일첨부 여부 체크를 해주십시오.", false);
		
		if (attchk == "NO"){
			for (var i = 1 ; i <= count1 ; i++){
				sValue = $("textarea[name='NStepTest1" + i + "']", _active).val();
				if (sValue == ""){ing = false; break}
				sValue = $("input[name='NCheck1" + i + "']", _active).is(":checked");
				if (!sValue){ing = false; break}
			}
			if (!ing) return ws47.returnAlert("단위테스트 시나리오 내용 입력 및 확인란 체크를 해주십시오.", false);
			
			for (var i = 1 ; i <= count2 ; i++){
				sValue = $("textarea[name='NStepTest2" + i + "']", _active).val();
				if (sValue == ""){ing = false; break}
				sValue = $("input[name='NCheck2" + i + "']", _active).is(":checked");
				if (!sValue){ing = false; break}
			}
			
			if (!ing) return ws47.returnAlert("단위테스트 시나리오 내용 입력 및 확인란 체크를 해주십시오.", false);
		}
		
		for (var i = 1; i <= 4; i++){
			if ($(":radio[name^='NStepTestCheck" + i + "']", _active)[1].checked){
				alert("테스트 항목에 부정항목이 있습니다. 확인하시기 바랍니다.");
				return false;
			}
		}
	
		var tcnt = 0, fldnum = _doc.getOption("itsecurity"), flag = true, u = [], rd = null, suffix = "";
		if (fldnum == "0"){
			tcnt = fldnum.length > 14 ? 15 : 14;
		} else if (fldnum == "1"){
			tcnt = fldnum.length > 5 ? 6 : 5;
		} else if (fldnum == "2"){
			tcnt = fldnum.length > 10 ? 11 : 10;
		}
		$(":radio[name^='ITSecurity"+fldnum+"']", _active).each(function (index, _o){
			if (!this.disabled) u[u.length] = this.name;
		});
		u = u.unique();
		$.each(u, function (i, _f){
			if (tcnt <= i){ return false }
			rd = $(":radio[name='"+_f+"']", _active);
			suffix = _f.substr("ITSecurity".length);

			if (!rd.is(":checked")){
				return flag = ws47.returnAlert("검토기준에 대해서 확인하여 주십시오.", false);
			} else {
				if (rd[1].checked && ($("input[name='ITSecu_Etc" + suffix + "']").val() == ""))
					return flag = ws47.returnAlert("검토기준이 비정상인 경우 비고란에 사유를 입력하여 주십시오.", false);
			}
		});
		if (!flag) return false;
	
		return true;
	}
	function _confirm(){
		if (_validation())
			if (confirm("단위테스트를 수행하시겠습니까?")){
				_doc.submit(function (xhr,data,textStatus){ _doc.close(); request.returnData(data) });
			}
	}
	function _Event_initialize(){
		var cnt1 = $("[id^=stepitem1]", _active).index()
		, cnt2 = $("[id^=stepitem2]", _active).index();
		
		$("select[name='NCount1']", _active).off("change").on("change", function (){
			var sel = $(":selected", this).index() + 1;
			$("#th_change", _active).attr("rowspan", sel+1);
			for (var i = 1 ; i <= cnt1 ; i++)
				$("#stepitem1" + i, _active)[ (i <= sel)?"show":"hide" ]();
		});
		$("select[name='NCount2']", _active).off("change").on("change", function (){
			var sel = $(":selected", this).index() + 1;
			$("#th_nochange", _active).attr("rowspan", sel+1);
			for (var i = 1 ; i <= cnt1 ; i++)
				$("#stepitem2" + i, _active)[ (i <= sel)?"show":"hide" ]();
		});
		$("input[name='NCheckAttach']", _active).off("click").on("click", function (){
			if (this.value == "YES") ws47.openIntegTestDoc({			
				teampartnum : ws47.info.teampartnum
			,	parentunid : doc.getOption("unid")
			,	curfield : "ITPartCharge" + ws47.info.teampartnum
			,	docidfield : "SDC" + ws47.info.teampartnum
			,	creq : ""
			,	flag : "edit"
			,	mainreload : "false"
			});
		});
		ws47.span_open_click_event("span_itsecurity", _active);
	}
	function _load(){
		_active = GC.active(true);
		_doc = $(_active).doc(ws47.docOption).doc();
		_Event_initialize()
	}
	var url = new GF.CURL("/" + doc.getOption("dbpath") + "/unitTest?openform"
	,	{
			parentunid : doc.getOption("unid")
		,	testexe : 1
		,	flag : (ws47.info.stepexecdocid == "")
	});
	
	GF.dialog({
		content : {url : url.url}
	,	title : "단위테스트", isactive : true, width : 750, height : 500, resizable : false
	,	onload : _load
	,	buttons : [
			{text: "확인", click : _confirm}
		,	{text: "취소", click : function (){$(this).dialog("close")}}
		]
	});
}
/*
 * *********************************************************
 * 테스트문서등록
 * *********************************************************
 * */
ws47.totalTestDocReg = function (doc){
	var opts = {			
		parentunid : doc.getOption("unid")
	,	docidfield : "TotalTestDoc"
	,	curfield : "MainITPartCharge"
	,	flag : "TotalTestDoc"
	};
	ws47.openIntegTestDoc(opts);
}
/*
 * *********************************************************
 * 통합테스트
 * *********************************************************
 * */
ws47.TotalTest = function (doc){
	var _active = null, _doc = null;
	
	if (ws47.info.totaltestdocid != "Y"){
		return ws47.returnAlert("테스트 문서를 등록하지 않았습니다. 등록하여주십시오.", false);
	}
	function _confirm(){
		var etc = flag = flag2 = true;
		$("input[name^='TotalTest']:checked", _active).each(function (idx, _o){
			if (this.value != "2") {
				flag2 = false;
				if (this.value == "1") return flag = ws47.returnAlert("테스트 항목에 부정항목이 있습니다. 확인하시기 바랍니다.", false);
			}
		});
		if (!flag) return false;
		if (flag2) return ws47.returnAlert("통합테스트 수행이 모두 비대상입니다. 다시 선택하여 주십시오.", false);
		$("input[name^='TotalTestEtc']", _active).each(function (idx, _o){
			if (this.value.trim() != "") return etc = false;
		});
		if (etc) return ws47.returnAlert("기타 통합테스트 수행내용을 입력하여 주십시오.", false);
		
		if (confirm("통합테스트를 완료하시겠습니까?")){
			_doc.submit(function (xhr,data,textStatus){ _doc.close(); request.returnData(data) });
		}
	}
	function _load(){
		_active = GC.active(true);
		_doc = $(_active).doc(ws47.docOption).doc();
	}
	var url = new GF.CURL("/" + doc.getOption("dbpath") + "/totalTest?openform"
	,	{
			parentunid : doc.getOption("unid")
		,	testexe : 1
		,	flag : (ws47.info.stepexecdocid == "")
		});
	
	GF.dialog({
		content : {url : url.url}
	,	title : "통합테스트", isactive : true, width : 620, height : 420, resizable : false
	,	onload : _load
	,	buttons : [
			{text: "확인", click : _confirm}
		,	{text: "취소", click : function (){$(this).dialog("close")}}
		]
	});
}
/*
 * *********************************************************
 * 테스트문서등록 - 시스템테스트
 * *********************************************************
 * */
ws47.systemTestDocReg = function (doc, flag){
	var _active = null, _doc = null;
	var buttons = (flag == "edit" ? 
			[{text: "등록", click : _confirm}, {text: "닫기", click : function (){ $(this).dialog("close")} }] : 
			[{text: "닫기", click : function (){ $(this).dialog("close")}}])
	
	function _confirm(){
		_doc.submit(function (xhr,data,textStatus){
			_doc.close();
			try{
				var jsonData = (typeof(data) == typeof("") ? $.parseJSON(data) : data);
				if (!jsonData.bflag){
					alert(jsonData.msg.replace(/\\n/gi,"\n"));
				} else {
					if (jsonData.msg == "") alert("등록 되었습니다.");
					else alert(jsonData.msg.replace(/\\n/gi,"\n"));
					doc.reload();
				}
			} catch(e){ alert(e); GF.log("error", _class + " error > " + e)}
		});
	}
	function _load(opts){
		_active = GC.active(true);
		_doc = $(_active).doc(ws47.docOption).doc();
	}
	
	var url = new GF.CURL("/" + ws47.info.dbpath[6] + 
		(ws47.info.systemtestdocid != "" ? 
		"/0/" + ws47.info.systemtestdocid + "?" + flag + "document"
		: "/win_systemtestdoc?openform")
	,	{ parentunid : doc.getOption("unid") });
	
	GF.dialog({
		content : {url : url.url}
	,	title : "시스템테스트 문서", isactive : true, width : 620, height : 350, resizable : false
	,	onload : _load
	,	buttons : buttons
	});
}
/*
 * *********************************************************
 * 테스트완료 - 시스템테스트
 * *********************************************************
 * */
ws47.systemTestCompletion = function (doc){
	var _active = null, _doc = null;
	if (ws47.info.systemtestdocid == ""){
		if(!confirm("테스트 문서를 등록하지 않았습니다.\n\n계속진행하시겠습니까?")){
			return false;
		}
	}
	function _confirm(){
		if ($("input[name='SystemTestDate']", _active).val() == "")
			return ws47.returnAlert("테스트일을 지정하여 주시기 바랍니다.", false);
		if ($("select[name='SystemTestChief']:selected", _active).index() == 0)
			return ws47.returnAlert("테스트 승인자를 선택하여 주시기 바랍니다.", false);
		
		if (ws47.info.systemtestdocid == ""){
			if (!confirm("테스트 문서를 등록하지 않았습니다.\n\n계속진행하시겠습니까?")) return false;
		}
		if (!confirm("시스템테스트를 완료하시겠습니까?")) return false;
		
		_doc.submit(function (xhr,data,textStatus){ _doc.close(); request.returnData(data) });
	}
	function _load(){
		_active = GC.active(true);
		_doc = $(_active).doc(ws47.docOption).doc();
		ws47.getUserlist( { usertype : "2", user : GC.user.middledeptcode, fieldname : "SystemTestChief" } , ws47.setSelectOption);
	}
	
	var url = new GF.CURL("/" + doc.getOption("dbpath") + "/systemTestComplete?openform"
	,	{ parentunid : doc.getOption("unid") });
	
	GF.dialog({
		content : {url : url.url}
	,	title : "시스템테스트 완료", isactive : true, width : 470, height : 150, resizable : false
	,	onload : _load
	,	buttons : [
			{text: "확인", click : _confirm}
		,	{text: "닫기", click : function (){ $(this).dialog("close")} }
		]
	});
}
/*
 * *********************************************************
 * 시스템테스트 승인자
 * *********************************************************
 * */
ws47.systemTestChief = function (doc){
	ws47.callApprove(doc, {action : "systemtestchief", commentflag : false}, "승인");
}
/*
 * *********************************************************
 * 설계확인문서
 * *********************************************************
 * */
ws47.designConfirmDoc = function (doc){
	var opts = {			
		teampartnum : ws47.info.teampartnum
	,	parentunid : doc.getOption("unid")
	,	curfield : "ITPartDesigner" + ws47.info.teampartnum
	,	docidfield : "SDCO" + ws47.info.teampartnum
	,	creq : (ws47.info.da == "NO" ? "steptext" : "")
	,	flag : "edit"
	};
	
	ws47.openIntegTestDoc(opts);
}
/*
 * *********************************************************
 * 설계확인
 * *********************************************************
 * */
ws47.designConfirm = function (doc){
	var _active = null, _doc = null;
	
	if (ws47.info.testconfirmdocid != "Y"){
		return ws47.returnAlert("테스트 확인문서를 등록하지 않았습니다. 등록하여주십시오.", false)
	}
	function _confirm(){
		var ret = true
		, checkItem = ws47.docOption.da == "NO" ? 
			["ResearchItem1","ResearchItem3"] : 
			["ResearchItem1", "ResearchItem2", "ResearchItem3", "ResearchItem4", "ResearchItem5", "ResearchItem6", 
			 "ResearchItem7", "ResearchItem10", "ResearchItem11", "ResearchItem12", "ResearchItem13", "ResearchItem14", 
			 "ResearchItem15"];
		
		$.each(checkItem, function (idx, _f){
			if ($("input[name='" + _f + "']", _active).val() == "") return ret = ws47.returnAlert("모니터링 항목을 선택하여 주십시오.", false);
		});
		if (!ret) return false;
		
		if (($("[id='acceptcharge']", _active).css("display") != "none") && ($("select[name='TmpAcceptanceCharge'] option:selected", _active).index() == 0))
			return ws47.returnAlert("인수자를 선택하여 주시기 바랍니다.", false);

		if ($("textarea[name='DesignContent']", _active).val() == "") return ws47.returnAlert("설계 내역을 입력하여 주시기 바랍니다.", false);
		if ($("textarea[name='ProgramID']", _active).val() == "") return ws47.returnAlert("프로그램정보를 입력하여 주시기 바랍니다.", false);
		
		if (!confirm("설계 확인내역을 입력 하시겠습니까?")) return false;
		_doc.submit(function (xhr,data,textStatus){ _doc.close(); request.returnData(data) });
	}
	function _itAcceptCharge(){
		$("select[name='TmpAcceptanceCharge']", _active)
		.val(ws47.docOption.acceptancecharge)
		.attr("selected","selected");
	}
	function _Event_initialize(){
		ws47.form_Event_Research();
	}
	function _load(){
		_active = GC.active(true);
		_doc = $(_active).doc(ws47.docOption).doc();
		_Event_initialize();
		/* 인수자 */
		ws47.getUserlist( { usertype : "4", user : ws47.docOption.deptcode, fieldname : "TmpAcceptanceCharge" } , ws47.setSelectOption, _itAcceptCharge);
	}
	
	var url = new GF.CURL("/" + doc.getOption("dbpath") + "/designConfirm?openform"
	,	{ parentunid : doc.getOption("unid") });
	
	GF.dialog({
		content : {url : url.url}
	,	title : "설계확인", isactive : true, width : 650, height : 480, resizable : false
	,	onload : _load
	,	buttons : [
			{text: "확인", click : _confirm }
		,	{text: "닫기", click : function (){ $(this).dialog("close")} }
		]
	});
}
/*
 * *********************************************************
 * 설계보완 - 설계확인 단계
 * *********************************************************
 * */
ws47.designRevise = function (doc){
	ws47.callApprove(doc, "designconfirmrevise", "설계보완");
}
/*
 * *********************************************************
 * 첨부문서 체크
 * *********************************************************
 * */
ws47.attachDocCheck = function (doc){
	ws47.openIntegTestDoc({
		creq : ""
	,	parentunid : doc.getOption("unid")
	,	flag : "ccaf"
	});
}
/*
 * *********************************************************
 * 시스템개발 확인 체크리스트 - 개발 및 테스트 완료 파트장 승인
 * *********************************************************
 * */
ws47.systemCheckList = function (doc){
	var _active = null, _doc = null;
	
	if (!(ws47.info.ccaf == "TF" || ws47.info.ccaf == "TT")){
		return ws47.returnAlert("해당 파트의 테스트 및 설계확인 문서를 체크하여 주십시오.", false)
	}
	function _confirm(){
		var ret = true, param = null;
		$("input[name^='CheckList']:checked", _active).each(function (){
			if (this.value == "1") return ret = false;
		});
		if (ret){
			if (confirm("승인 하시겠습니까?")){
				$(_active).dialog("close");
				param = request.getParam("");
				param.commentFlag = false;
				param.action = "systemchecklist";
				ws47.callApprove(doc, param, "승인");
			}
		} else {
			if (confirm("부적합 항목이 있습니다. 반려 하시겠습니까?")){
				_doc.close();
				ws47.reject(doc);
			}
		}
	}
	function _load(){
		_active = GC.active(true);
		_doc = $(_active).doc(ws47.docOption).doc();
	}
	
	var url = new GF.CURL("/" + doc.getOption("dbpath") + "/systemCheckList?openform"
	,	{ parentunid : doc.getOption("unid") });
	
	GF.dialog({
		content : {url : url.url}
	,	title : "시스템개발 확인 체크리스트", isactive : true, width : 590, height : 230, resizable : false
	,	onload : _load
	,	buttons : [
			{text: "적합확인", click : _confirm}
		,	{text: "부적합취소", click : function (){ $(this).dialog("close")} }
		]
	});
}
/*
 * *********************************************************
 * 문서보안적용첨부
 * *********************************************************
 * */
ws47.secDocReg = function (doc){
	var opts = {			
		parentunid : doc.getOption("unid")
	,	docidfield : "SecDoc"
	,	curfield : "SecITPartCharge"
	,	flag : "SecDoc"
	};
	ws47.openIntegTestDoc(opts);
}
/*
 * *********************************************************
 * 인수테스트요청 - 주개발자
 * *********************************************************
 * */
ws47.reqAcceptCharge = function (doc){
	var _active = null, _doc = null, param = null, flag = true;
	if (ws47.info.chkcis == "YES"){
		if (ws47.info.secdocid == "") return ws47.returnAlert("문서보안적용 문서를 첨부하여 주십시오.", false);
		flag = false;
	}
	if (GC.user.empno.substr(0, 1) == "5"){
		flag = false;
	}
	if (flag){
		_process(null, function (data){ request.returnData(data, "인수테스트요청") });
		return true;
	}
	
	function _process(json, _callback){
		if (!confirm("인수테스트요청 하시겠습니까?")) return false;
		param = request.getParam("");
		param.action = "reqacceptcharge";
		param.json = (json && request.toString(json)) || "";
		request.process(param, _callback);
	}
	function _itFieldAgent(){
		$("select[name='DisFieldAgent']", _active)
		.val(ws47.docOption.mainitpartfieldagent)
		.attr("selected","selected");
	}
	function _confirm(){
		var json = {};
		if (ws47.docOption.fieldagentcheck == "T"){
			if ($("select[name='DisFieldAgent'] option:selected", _active).index() == 0){
				return ws47.returnAlert("현장대리인을 선택하여 주십시오.", false);
			}
			json.disfieldagent = $("select[name='DisFieldAgent'] option:selected", _active).val();
		}
		if (ws47.docOption.chkcis == "YES"){
			if ($("select[name='DisITPartChief'] option:selected", _active).index() == 0){
				return ws47.returnAlert("승인자를 선택하여 주십시오.", false);
			}
			json.disitpartchief = $("select[name='DisITPartChief'] option:selected", _active).val();
		}
		
		_process(json, function (data){ _doc.close(); request.returnData(data, "인수테스트요청") });
	}
	function _load(){
		_active = GC.active(true);
		_doc = $(_active).doc(ws47.docOption).doc();
		/* 현장대리인 */
		ws47.getUserlist( { usertype : "3", user : ws47.info.agentcode, fieldname : "DisFieldAgent" } , ws47.setSelectOption, _itFieldAgent);
		ws47.getUserlist( { usertype : "2", user : "91028000^91036000", fieldname : "DisITPartChief" } , ws47.setSelectOption);
	}
	var url = new GF.CURL("/" + doc.getOption("dbpath") + "/reqAcceptCharge?openform"
	,	{
			parentunid : doc.getOption("unid")
		,	fieldagentcheck : (GC.user.empno.substr(0, 1) == "5") ? "T" : ""
		,	chkcis : (ws47.info.chkcis == "YES")
		}
	);
	GF.dialog({
		content : {url : url.url}
	,	title : "인수테스트요청", isactive : true, width : 450, height : 170, resizable : false
	,	onload : _load
	,	buttons : [
			{text: "확인", click : _confirm}
		,	{text: "닫기", click : function (){ $(this).dialog("close")} }
		]
	});
}
/*
 * *********************************************************
 * 인수테스트요청 - 현장대리인
 * *********************************************************
 * */
ws47.reqAcceptField = function (doc){
	var param = request.getParam("");
	if (!confirm("인수테스트요청 하시겠습니까?")) return false;
	param.action = "reqacceptfield";
	request.process(param, function (data){ request.returnData(data, "인수테스트요청") });
}
/*
 * *********************************************************
 * 보안문서확인 - 주파트장
 * *********************************************************
 * */
ws47.SecurityDocCheck = function (doc){
	//alert("주 파트장 보안문서 확인 처리 해야함");
	var opts = {
		parentunid : doc.getOption("unid")
	,	docidfield : "SecDoc"
	,	flag : "csec"
	};
	ws47.openIntegTestDoc(opts);
}
/*
 * *********************************************************
 * 인수테스트문서 등록
 * *********************************************************
 * */
ws47.AcceptTestDocReg = function (doc, _flag){
	var _active = null, _doc = null;
	var openbutton = [{text: "닫기", click : function (){ $(this).dialog("close")} }]
	, editbutton = [{text: "등록", click : _confirm}, {text: "닫기", click : function (){ $(this).dialog("close")} }];
	
	function _confirm(){
		_doc.submit(function (xhr,data,textStatus){
			try{
				_doc.close();
				var jsonData = $.parseJSON(data);
				if ( jsonData.bflag ){
					doc.reload();
				} else alert(jsonData.msg.replace(/\\n/gi,"\n"));
			} catch (e){alert(e)}
		});
	}
	function _load(){
		_active = GC.active(true);
		_doc = $(_active).doc(ws47.docOption).doc();
	}
	var url = new GF.CURL("/" + ws47.info.dbpath[6] + 
			(ws47.info.acpttestdocid == "" ? "/accepttestattach?openform"
			: "/0/" + ws47.info.acpttestdocid + "?" + _flag + "document")
	,	{ parentunid : doc.getOption("unid") });
	
	GF.dialog({
		content : {url : url.url}
	,	title : "인수테스트 문서", isactive : true, width : 620, height : 350, resizable : false
	,	onload : _load
	,	buttons : (_flag == "open" ? openbutton : editbutton)
	});
}
/*
 * *********************************************************
 * 인수확인
 * *********************************************************
 * */
ws47.AcceptTestExecution = function (doc){
	var _active = null, _doc = null;
	
	function _confirm(){
		var itsecurity = _doc.getField("ITSecurity");
		if ( itsecurity == "0" || itsecurity == "1" )
			if (!$("input[name='ITSecurity1']", _active).is(":checked"))
				return ws47.returnAlert("IT보안검토의 검토기준에 대해서 확인하여 주십시오.", false);
		if (_doc.getField("AcceptTestEtc1")=="" && 
			_doc.getField("AcceptTestEtc2")=="" && 
			_doc.getField("AcceptTestEtc3")=="" && 
			ws47.info.acpttestdocid==""){
			if(confirm("인수테스트 결과를 작성하지 않으셨습니다.\n\n작성 후 상신하시겠습니까?")){
				return false;
			}
		}
		var ret = true, notype = false;
		if (confirm("인수확인 하시겠습니까?")){
			$(":radio[name^='AcceptTest']:checked", _active).each(function (){
				if (this.value != "3"){
					notype = true;
					if (this.value == "2"){
						return ret = ws47.returnAlert("테스트 결과에 부정항목이 있습니다. 확인하시기 바랍니다.", false);
					}
				}
			});
		
			if (!ret) return false;
			if (!notype) return ws47.returnAlert("인수테스트 수행이 모두 비대상입니다. 다시 선택하여 주십시오.", false);
			
			var ddate = _doc.getField("DisuseDate");
			if (ws47.docOption.chkcis == "YES"){
				if (ws47.docOption.classrequest == "T"){
					if (ddate == "") return ws47.returnAlert("고객정보 폐기예정일을 입력하여 주시기 바랍니다.", false);
				} else {
					if (ddate < ws47.docOption.curdate) return ws47.returnAlert("고객정보 폐기예정일을 다시 입력하여 주시기 바랍니다.", false);
					else if (ddate > ws47.docOption.lastdate) return ws47.returnAlert(
							"고객정보 폐기일은 90일 이내로 지정하셔야 합니다.\n\n"+
							"90일 이상 보관이 필요한 고객정보는\n\n"+
							"폐기일 도래 이후에 별도 의뢰서로 다시 요청하여 주시기 바랍니다.", false);
				}
			}
			ddate = _doc.getField("RegularDate");

			if (ddate < ws47.docOption.curdate) return ws47.returnAlert("정규반영예정일을 다시 입력하여 주시기 바랍니다.", false);
			chk = GF.isHoliday(ddate);
			$(chk).each(function (index, data){
				if (data === "1"){
					if (confirm("입력 하신 정규반영일은 공휴일 (또는 휴무일) 입니다.\n\n진행하시겠습니까?")){
						return ret = true;
					} else { return ret = false }
				}
			});
			if (!ret) return false;
			
			if (_doc.getField("RegularCheck") == "YES"){
				if (!$(":radio[name='RegularCheck2']", _active).is(":checked")){
					return ws47.returnAlert("정규반영확인 사유를 선택하여 주시기 바랍니다.", false);
				} else {
					if (_doc.getField("RegularCheck2") == "2"){
						if (_doc.getField("RegularCheck2Etc") == ""){
							return ws47.returnAlert("기타사유를 입력하여 주시기 바랍니다.", false);
						}
					}
				}
			}
			if (_doc.getField("AcceptPostChief") == "0"){
				return ws47.returnAlert("승인자를 선택하여 주시기 바랍니다.", false);
			}
			
			ret = true;
			var researchvalue = "";
			$("input[name^='SelVal']", _active).each(function (idx, _o){
				if (_o.value == "")
					return ret = ws47.returnAlert("만족도 조사 내용을 선택 해 주십시오.", false);
				else researchvalue += _o.value;
			});
			if (!ret) return false;
			$("input[name='ResearchValue']", _active).val(researchvalue);
			
			_doc.submit(function (xhr,data,textStatus){ _doc.close(); request.returnData(data) });
		}
	}
	function _Event_Initialize(){
		$(":radio[name='RegularCheck']", _active).off("change").on("change", function (){
			$("#regularcheck", _active)[(this.value == "YES" ? "show" : "hide")]();
		});
	}
	function _load(opts){
		_active = GC.active(true);
		_doc = $(_active).doc(ws47.docOption).doc();
		
		var teamcnt = ws47.docOption.teamdata.length
		, _h = ""
		, _json = null
		, input_url = new GF.CURL("/"+ ws47.info.dbpath[3] +"/win_take_itresult_two?openform");
		
		GF.ajax({
			url : input_url.url, type : "GET", cache : false
		,	success : function (data,textStatus,xhr){ $("#research", _active).html(data) }
		,	error : function (xhr,textStatus){ GF.log("load error",textStatus) } 
		});
	
		_h += "<tr><th colspan=3>중점 테스트 요청 내역</th></tr>";
		for (var i = 0 ; i < teamcnt ; i++){
			_json = ws47.docOption.teamdata[i];
			if (_json.parts.length > 1){
				_h += "<tr>";
				_h += "<th rowspan=\"" + _json.parts.length + "\">시스템" + _json.teamnum + "팀</th>";
				_h += "<th>" + _json.parts[0].partnum + "&nbsp;파&nbsp;트</th>";
				_h += "<td class=\"first\">" + _json.parts[0].reqtest + "</td>";
				_h += "</tr>";
				for (var j = 1 ; j < _json.parts.length ; j++){
					_h += "<tr>";
					_h += "<th>" + _json.parts[j].partnum + "&nbsp;파&nbsp;트</th>";
					_h += "<td class=\"first\">" + _json.parts[j].reqtest + "</td>";
					_h += "</tr>";
				}
			} else {
				_h += "<tr>";
				_h += "<th>시스템" + _json.teamnum + "팀</th>";
				_h += "<th>" + _json.parts[0].partnum + "&nbsp;파&nbsp;트</th>";
				_h += "<td class=\"first\">" + _json.parts[0].reqtest + "</td>";
				_h += "</tr>";
			}
		}
		$("#tbodycontent", _active).html(_h);
		
		if ($("input[name='ITSecurity']", _active).val().trim() == ""){
			$("#tITSecuTable", _active).hide();
		}
		ws47.getUserlist( { usertype : "2", user : GC.user.middledeptcode, fieldname : "AcceptPostChief" } , ws47.setSelectOption);
		_Event_Initialize();		
	}
	
	var url = new GF.CURL("/" + doc.getOption("dbpath") + "/acceptTestPerform?openform"
	,	{ parentunid : doc.getOption("unid") });
	
	GF.dialog({
		content : {url : url.url}
	,	title : "인수테스트 수행", isactive : true, width : 720, height : 530, resizable : false
	,	onload : _load
	,	buttons : [
			{text: "등록", click : _confirm}
		,	{text: "닫기", click : function (){ $(this).dialog("close")} }
		]
	});
}
/*
 * *********************************************************
 * 변경요청 - 현업 인수단계
 * *********************************************************
 * */
ws47.ChangeRequestClient = function (doc){
	//alert("변경요청 - 현업 인수단계 처리 해야함");
	var _active = null, _doc = null;
	
	function _confirm(){
		var date = "";
		
		if (!_doc.getField("ChangeReason2")) return ws47.returnAlert("변경사유를 선택하여 주시기 바랍니다.", false);
		if (_doc.getField("ChangeReason") == "") return ws47.returnAlert("변경내역을 입력하여 주시기 바랍니다.", false);
		
		date = _doc.getField("TmpAcceptDate");
		if (date == "") return ws47.returnAlert("변경 인수완료예정일을 입력하여 주시기 바랍니다.", false);
		if (date == _doc.getField("DisAcceptDate"))  return ws47.returnAlert("변경 인수완료예정일을 다시 입력하여 주시기 바랍니다.", false);
		if (GF.isHoliday([date])[0] === "1")
			if (!confirm("입력 하신 변경 인수완료예정일은 공휴일 (또는 휴무일) 입니다.\n\n진행하시겠습니까?"))
				return false;
		
		date = _doc.getField("TmpRegularDate");		
		if (date == "") return ws47.returnAlert("변경 정규반영예정일을 입력하여 주시기 바랍니다.", false);
		if (date == _doc.getField("DisRegularDate"))  return ws47.returnAlert("변경 정규반영예정일을 다시 입력하여 주시기 바랍니다.", false);
		if (GF.isHoliday([date])[0] === "1")
			if (!confirm("입력 하신 변경 정규반영예정일은 공휴일 (또는 휴무일) 입니다.\n\n진행하시겠습니까?"))
				return false;
		
		var param = request.getParam("");
		json = {
			"changereason2" : _doc.getField("ChangeReason2")
		,	"changereason" :  _doc.getField("ChangeReason")
		,	"disacceptdate" :  _doc.getField("DisAcceptDate")
		,	"disregulardate" :  _doc.getField("DisRegularDate")
		,	"tmpacceptdate" :  _doc.getField("TmpAcceptDate")
		,	"tmpregulardate" :  _doc.getField("TmpRegularDate")
		}
		param.action = "changerequestclient";
		param.json = request.toString(json);
		request.process(param, function (data){
			_doc.close();
			request.returnData(data, "변경요청") 
		});
	}
	function _load(){
		_active = GC.active(true);
		_doc = $(_active).doc(ws47.docOption).doc();
	}
	var url = new GF.CURL("/" + doc.getOption("dbpath") + "/ChangeRequestClient?openform"
	, {parentunid : doc.getOption("unid")});
	
	GF.dialog({
		content : {url : url.url}
	,	title : "변경요청", isactive : true, width : 500, height : 270, resizable : false
	,	onload : _load
	,	buttons : [
			{text: "확인", click : _confirm}
		,	{text: "취소", click : function (){$(this).dialog("close")}}
		]
	});
}
/*
 * *********************************************************
 * 인수 완료 후 정규 반영
 * *********************************************************
 * */
ws47.regularApproval = function (doc){
	var _active = null, _doc = null;
	if (!confirm("승인 하시겠습니까?")){
		return false;
	}
	
	function _confirm(){
		var ret = true, param = null;
		$("input[name^='CheckList']:checked", _active).each(function (){
			if (this.value == "1") return ret = false;
		});
		if (ret){
			$(_active).dialog("close");
			param = request.getParam("");
			param.commentFlag = false;
			param.action = "regularapproval";
			ws47.callApprove(doc, param, "승인");
		} else {
			if (confirm("부적합 항목이 있습니다. 보완요청 처리 하시겠습니까?")){
				alert('보완요청 프로세스 처리 해야함');
			}
		}
	}
	function _load(){
		_active = GC.active(true);
		_doc = $(_active).doc(ws47.docOption).doc();
	}
	var url = new GF.CURL("/" + doc.getOption("dbpath") + "/acceptCheckList?openform"
	,	{ parentunid : doc.getOption("unid") });
	
	GF.dialog({
		content : {url : url.url}
	,	title : "현업인수 확인 체크리스트", isactive : true, width : 550, height : 350, resizable : false
	,	onload : _load
	,	buttons : [
			{text: "등록", click : _confirm }
		,	{text: "닫기", click : function (){ $(this).dialog("close")} }
		]
	});
}
/*
 * *********************************************************
 * BR 품질평가
 * *********************************************************
 * */
ws47.BRQuality = function (doc){
	var _active = null, _doc = null;
	
	function _qualityDateSet(){
		// 측정항목 1번
		var item1_1 = $("input:radio[name*='QVItem1']", _active).filter(function(idx){return idx < 15});
		var item1_2 = $("input:radio[name*='QVItem1']", _active).filter(function(idx){return idx > 14});
		var field1_1 = $("input[name*='QValue1']", _active).filter(function(idx){return idx < 5});
		var field1_2 = $("input[name*='QValue1']", _active).filter(function(idx){return idx > 4});
		// 측정항목 2번	
		var item2_1 = $("input:radio[name*='QVItem2']", _active).filter(function(idx){return idx < 18});
		var item2_2 = $("input:radio[name*='QVItem2']", _active).filter(function(idx){return idx > 17});
		var field2_1 = $("input[name*='QValue2']", _active).filter(function(idx){return idx < 6});
		var field2_2 = $("input[name*='QValue2']", _active).filter(function(idx){return idx > 5});
		// 측정항목 3번
		var item3_1 = $("input:radio[name*='QVItem3']", _active).filter(function(idx){return idx < 6});
		var item3_2 = $("input:radio[name*='QVItem3']", _active).filter(function(idx){return idx > 5});
		var field3_1 = $("input[name*='QValue3']", _active).filter(function(idx){return idx < 2});
		var field3_2 = $("input[name*='QValue3']", _active).filter(function(idx){return idx > 4});
		
		_qualityEventSet(item1_1, item1_2, field1_1, field1_2);
		_qualityEventSet(item2_1, item2_2, field2_1, field2_2);
		_qualityEventSet(item3_1, item3_2, field3_1, field3_2);
		_calcQualityValue();
	}
	
	function _qualityEventSet(radioObj, radioObj2, fieldObj, fieldObj2){
		var tot = 0;
		var defValObj2 = fieldObj2[0].value;
		
		fieldObj.each(function (i, v){
			tot += parseFloat(v.value);
		});
		
		radioObj.click(function (){
			var countNA = 0;
			var avgValue = 0;
			
			//* get countNA case 2
			countNA += $(radioObj.filter(function (idx){
				return (radioObj[idx].value == "NA" & radioObj[idx].checked);}
			)).length
			//*/
			
			if(countNA < radioObj.length/3){
				avgValue = _round(tot / (radioObj.length/3 - countNA), 1);
			}
			
			fieldObj.each(function (i, v){
				if (_doc.getField("QVItem"+fieldObj[i].name.right(2)) == "Y"){
					$(this).val(avgValue);
				} else {
					$(this).val(0);
				}
			});
			_calcQualityValue();
		});
		
		radioObj2.click(function (idx){
			if ($(this)[0].value == "Y"){
				_doc.setField("QValue" + $(this)[0].name.right(2), defValObj2);
			} else {
				_doc.setField("QValue" + $(this)[0].name.right(2), 0);
			}
			_calcQualityValue();
		});
	}
	
	function _calcQualityValue(){
		var tmpTotQValue1 = 0
		, tmpTotQValue2 = 0
		, tmpTotQValue3 = 0
		, tmpTotQValue4 = 0
		, tmpTotQValue = 0
		, chk_count = 0;
		
		for (var i=1; i<=3; i++){
			if (i == 1 || i == 3) chk_count = 7;
			else chk_count = 8;
			
			for (var j=1; j<=chk_count; j++){
				if (i == 1){
					if (j == 6 || j == 7){
						tmpTotQValue4 += parseFloat(_doc.getField("QValue"+i+j));
					} else {
						tmpTotQValue1 += parseFloat(_doc.getField("QValue"+i+j));
					}
				} else if (i == 2){
					if (j == 7 || j == 8){
						tmpTotQValue4 += parseFloat(_doc.getField("QValue"+i+j));
					} else {
						tmpTotQValue2 += parseFloat(_doc.getField("QValue"+i+j));
					}
				} else if (i == 3){
					if (j == 6 || j == 7){
						tmpTotQValue4 += parseFloat(_doc.getField("QValue"+i+j));
					} else {
						tmpTotQValue3 += parseFloat(_doc.getField("QValue"+i+j));
					}
				}		
			}
		}
		
		if(tmpTotQValue1 > 26){
			tmpTotQValue1 = Math.round(tmpTotQValue1);
		}
		if(tmpTotQValue2 > 27){
			tmpTotQValue2 = Math.round(tmpTotQValue2);
		}
		if(tmpTotQValue3 > 27){
			tmpTotQValue3 = Math.round(tmpTotQValue3);
		}
			
		tmpTotQValue += parseFloat(tmpTotQValue1 + tmpTotQValue2 + tmpTotQValue3 + tmpTotQValue4);
		_doc.setField("TotQValue", _round(tmpTotQValue, 0));
	}
	
	function _round(val, precision){
		val = val * Math.floor(10, precision); 
	 	val = Math.round(val); 
	  	return val / Math.floor(10, precision); 
	}
	
	function _confirm(){
		_doc.submit( function (xhr,data,textStatus){
			var jsonObj = $.parseJSON(data);
			if (jsonObj.code != 1){
				alert(jsonObj.msg);
				return;
			}
			alert(jsonObj.msg);
			_doc.close();
			doc.reload();
		});
	}
	
	function _load(){
		_active = GC.active(true);
		_doc = $(_active).doc(ws47.docOption).doc();
		_qualityDateSet();
	}
	
	var url = new GF.CURL("/" + ws47.info.dbpath[10] + (
		ws47.info.qualityvaluedocid == "" ? 
		"/qualityvalue?openform" :
		"/0/" + ws47.info.qualityvaluedocid + "?editdocument"
	) , {
		parentunid : doc.getOption("unid")
	,	docnumber : request.apprInfo.docnumber
	});
	
	GF.dialog({
		content : {url : url.url}
	,	title : "BR 품질평가", isactive : true, width : 780, height : 530, resizable : false
	,	onload : _load
	,	buttons : [
			{text: "등록", click : _confirm}
		,	{text: "닫기", click : function (){ $(this).dialog("close")} }
		]
	});
}
/*
 * *********************************************************
 * 정규반영내역입력
 * *********************************************************
 * */
ws47.inputRegContent = function (doc){
	var _active = null, _doc = null;
	
	function _confirm(){
		_doc.submit(function (xhr,data,textStatus){ _doc.close(); request.returnData(data) });
	}
	function _load(){
		_active = GC.active(true);
		_doc = $(_active).doc(ws47.docOption).doc();
	}
	var url = new GF.CURL("/" + doc.getOption("dbpath") + "/AuroraContents?openform"
	,	{ parentunid : doc.getOption("unid"), flag : "edit" });
	
	GF.dialog({
		content : {url : url.url}
	,	title : "정규반영내역입력", isactive : true, width : 550, height : 350, resizable : false
	,	onload : _load
	,	buttons : [
			{text: "등록", click : _confirm }
		,	{text: "닫기", click : function (){ $(this).dialog("close")} }
		]
	});
}
/*
 * *********************************************************
 * 정규반영내역조회
 * *********************************************************
 * */
ws47.searchRegContent = function (doc){
	var _active = null, _doc = null;
	
	function _confirm(){
		_doc.submit(function (xhr,data,textStatus){ _doc.close(); request.returnData(data) });
	}
	function _load(){
		_active = GC.active(true);
		_doc = $(_active).doc(ws47.docOption).doc();
	}
	var url = new GF.CURL("/" + doc.getOption("dbpath") + "/AuroraContents?openform"
	,	{ parentunid : doc.getOption("unid"), flag : "read" });
	
	GF.dialog({
		content : {url : url.url}
	,	title : "정규반영내역입력", isactive : true, width : 550, height : 350, resizable : false
	,	onload : _load
	,	buttons : [
			{text: "닫기", click : function (){ $(this).dialog("close")} }
		]
	});
}
/*
 * *********************************************************
 * 완료예정일사후변경
 * *********************************************************
 * */
ws47.reqChangeDate = function (doc){
	var _active = null, _doc = null;
	
	function _confirm(){
		//ws47.callFunction(_active, _doc);
		var chiefinfo = _doc.getField("ITPartChief").split("{`");
		var param = "";
		var form = "";
	
		if(_doc.getField("MainDocId") == ""){
			form = "changedate_else";
			param = {
				docregno : _doc.getField("DocNum")
			,	pdocid : _doc.getField("ParentDocId")
			,	reqkey : "ws470802"
			}
		}else{
			form = "changedate_it";
			param = {
				docregno : _doc.getField("DocNum")
			,	pdocid : _doc.getField("ParentDocId")
			,	itpartcode : _doc.getField("TeamCode")
			,	itpartmng : GF.notesName(chiefinfo[5],"ou2")
			,	sitemng : GF.notesName(_doc.getField("SiteManager"),"ou2")
			, 	reqkey : "ws470801"
			,	flag : "A"
			};
		}
	
		GF.getApplProfile("ws4708", function(data){
			if(data == "") return false;
			var objUrl = new GF.CURL("/" + data.appldir + "/" + data.applfilename + "/"+ form +"?OpenForm", param);
			_doc.close();
			GF.load("#"+GC.activeID(true),objUrl.url,"");
		});
	}
	
	function _load(){
		_active = GC.active(true);
		_doc = $(_active).doc(ws47.docOption).doc();
	}
	
	if(GC.user.empno.left(1) == "5"){
		alert("완료예정일사후변경은 내근 또는 설계자만 신청가능합니다.");
		return false;
	}
	
	var url = new GF.CURL("/" + doc.getOption("dbpath") + "/reqChangeDate?openform"
	,	{ parentunid : doc.getOption("unid") });
	
	GF.dialog({
		content : {url : url.url}
	,	title : "완료예정일사후변경", isactive : true, width : 500, height : 250, resizable : false
	,	onload : _load
	,	buttons : [
			{text: "등록", click : _confirm}
		,	{text: "닫기", click : function (){ $(this).dialog("close")} }
		]
	});
}
/*
 * *********************************************************
 * 인수테스트 요청 - BR
 * *********************************************************
 * */
ws47.regularSelect = function (doc){
	//if (ws47.info.classrequest.indexOf("class10") != -1){
		if (ws47.info.brtordocid == ""){
			return ws47.returnAlert("BR 인수확인 내용을 입력하여 주시기 바랍니다.", false);
		}
	//}
	
	function _confirm(){
		var ret = true
		, sUser = ""
		, query = "input[name='ResearchItem1'],input[name='ResearchItem2'],input[name='ResearchItem3']";
		
		$(query, _active).each(function (){
			if (this.value == ""){
				return ret = false;
			}
		});
		if (!ret) return ws47.returnAlert("모니터링 항목을 선택하여 주십시오.", false);
		
		// 인수자
		sUser = _doc.getField("TmpAcceptanceCharge");
		if (sUser == "0") return ws47.returnAlert("인수자를 선택하여 주시기 바랍니다.", false);
		else _doc.setField("AcceptanceCharge", sUser)
		
		if(confirm("인수테스트요청을 하시겠습니까?")){
			_doc.submit(function (xhr,data,textStatus){ _doc.close(); request.returnData(data) });
		}
	}
	function _itPartAcceptCharge(){
		$("select[name='TmpAcceptanceCharge']", _active)
		.val(ws47.docOption.disacceptancecharge)
		.attr("selected","selected");
	}
	function _Event_initialize(){
		ws47.form_Event_Research(_active);
	}
	function _load(){
		_active = GC.active(true);
		_doc = $(_active).doc(ws47.docOption).doc();
				
		/* 인수자 */
		ws47.getUserlist( { usertype : "4", user : ws47.docOption.deptcode, fieldname : "TmpAcceptanceCharge" } , ws47.setSelectOption, _itPartAcceptCharge);
		
		_Event_initialize();
	}
	var url = new GF.CURL("/" + doc.getOption("dbpath") + "/regularSelect?openform"
	, {parentunid : doc.getOption("unid")});
	
	GF.dialog({
		content : {url : url.url}
	,	title : "인수자 지정", isactive : true, width : 750, height : 550, resizable : false
	,	onload : _load
	,	buttons : [
			{text: "확인", click : _confirm}
		,	{text: "취소", click : function (){$(this).dialog("close")}}
		]
	});
}
/*
 * *********************************************************
 * 고객정보 보호 팝업 처리
 * *********************************************************
 * */
ws47.CIS_validation = function (){
	var __active = GC.active(true)

	if ( !$("#Chk1, #Chk2, #Chk3, #Chk4", __active).is(":checked") ) return ws47.returnAlert("보안등급을 선택하여 주십시오.", false);
	for(var i = 1 ; i < 3 ; i++){
		if ( $("#Chk"+i, __active).is(":checked") ){
			var itemchecked = false;
			for (var j = 1 ; ; j++){
				if ( $("#Chk" + i + "_" + j, __active).length == 0 ) break;
				if ( $("#Chk" + i + "_" + j, __active).is(":checked") ){
					itemchecked = true;
					if ( !$("input[name='Chk"+i+"_"+j+"_1']", __active).is(":checked") ) return ws47.returnAlert("제공방법을 선택하여 주십시오.", false);
					if ( $("#Chk"+i+"_"+j+"_2", __active).val() == "" ) return ws47.returnAlert("요청사유(근거)를 입력하여 주십시오.", false);
				}
			}
			if (!itemchecked) return ws47.returnAlert("사용항목을 선택 하여 주십시오.", false);
		}
	}
	if ( $("#Chk3", __active).is(":checked") ){
		if ( $("#Chk3_1", __active).val() == "" )  return ws47.returnAlert("사용항목을 입력하여 주십시오.", false);
		if ( $("#Chk3_1_1", __active).val() == "" ) return ws47.returnAlert("제공방법을 입력하여 주십시오.", false);
		if ( $("#Chk3_1_2", __active).val() == "" ) return ws47.returnAlert("요청사유(근거)를 입력하여 주십시오.", false);
	}
	if ( $("#Chk4", __active).is(":checked") )
		if ( $("#Chk4_1", __active).val() == "" ) return ws47.returnAlert("기타 사유를 입력하여 주십시오.", false);
	if ( $("#Chk5", __active).is(":checked") ){
		if ( $("#Chk5_1_1", __active).val() == "" ) return ws47.returnAlert("열람 대상자를 지정하여 주십시오.", false);
		if ( $("#Chk5_1_2", __active).val() == "" ) return ws47.returnAlert("요청사유를 입력하여 주십시오.", false);
		if ( $("#Chk5_2_2", __active).val() == "" ) return ws47.returnAlert("요청사유를 입력하여 주십시오.", false);
		if ( $("#Chk5_3_1:checked", __active).val() == "YES" )
			if ( $("#Chk5_3_2", __active).val() == "" ) return ws47.returnAlert("요청사유를 입력하여 주십시오.", false);
		if ( $("#Chk5_4_1:checked", __active).val() == "YES" )
			if ( $("#Chk5_4_2", __active).val() == "" ) return ws47.returnAlert("요청사유를 입력하여 주십시오.", false);
		if ( $("#Chk5_5_1:checked", __active).val() == "YES" )
			if ( $("#Chk5_5_2", __active).val() == "" ) return ws47.returnAlert("요청사유를 입력하여 주십시오.", false);
		if ( $("#Chk5_6_1:checked", __active).val() == "YES" )
			if ( $("#Chk5_6_2", __active).val() == "" ) return ws47.returnAlert("요청사유를 입력하여 주십시오.", false);
	}
	return true;
}

ws47.checkCIS = function (command){
	var doc = ws47.active.doc();
	switch(command){
	case "compose": case "view":
		/* 지역 함수 - compose와 view 일 경우가 수행이 다르기 때문에 지역 함수로 뺌 */
		function _Confirm(){
			var _active = GC.active(true);
			if (ws47.CIS_validation()){
				if (confirm("확인 하시겠습니까?")){
					if ( !confirm("데이터 산출 파일(MS Office, Text 문서 등)" +
							"제공 요청을 체크하지 않는경우\n\n관련된 입력항목 내용이 초기화 됩니다.\n\n" +
							"진행하시겠습니까?") ) return;
					
					var ret={}, tmp = [], chk5 = "N";
					$(":checkbox", _active).each(function (index, o){
						if (o.checked){
							if (o.name == "Chk5") chk5 = "Y";
							ret[o.name] = {
								type : "checkbox"
							,	value : o.checked
							}
						}
					});
					$("select", _active).each(function (index, o){
						ret[o.name] = {
							type : "select"
						,	value : o.value
						}
					});
					var reg = new RegExp(String.fromCharCode(13), "g");
					$(":text, textarea", _active).each(function (index, o){
						if (o.value != ""){
							ret[o.name] = {
								type : o.type
							,	value : o.value.replace(reg, "\\n")
							}
						}
					});
					$(":radio", _active).each(function (index, o){
						if (o.checked){
							ret[o.name] = {
								type : o.type
							,	value : o.value
							}
						}
					});
					
					doc.setField("CIS_Check", request.toString(ret));
					doc.setField("Chk5", chk5);
				}
				$(this).dialog("close");
			}
		}
		function _SetValue(_active){
			var CIS_Check = (command == "compose") ? doc.getField("CIS_Check") : $("#CIS_Check", ws47.active).text();
			try{
				if (CIS_Check != ""){
					var CIS_Check_json = $.parseJSON(CIS_Check);
					$.each(CIS_Check_json, function (tag, o){
						switch (o.type){
						case "text": case "textarea":
							$("#" + tag, _active).val(o.value);
							break;
						case "checkbox":
							$("#" + tag, _active).prop("checked", o.value);
							break;
						case "radio":
							$("input:radio[name='" + tag + "'][value='"+o.value+"']", _active).prop("checked", true);
							break;
						case "select":
							$("#" + tag, _active).val(o.value).attr("selected", "selected");
							break;
						}
					});
				}
			} catch (e){alert(e)}
		}
		function _Event_initialize(_active){
			$("#Chk5_5_1", _active).off("click").on("click", function(){
				$("#Chk5_5_3", _active)[$("#Chk5_5_1", _active)[0].checked ? "show" : "hide"]();
			});
			if (command == "compose"){
				$("#selectViewer", _active).off("click").on("click", function (){
					function _drawfunc(param, o){
						var sUser = [],
						members = o.members(),
						index = members.length;
						
						for(var i = 0 ; i < index ; i++){
							sUser[i] = (members[i].info.korname + "(" + members[i].info.empno + ")")
						}
						$("#Chk5_1_1", _active).val(sUser.join(","));
					}
					function _loadfunc(o){}
					request.openOrg(true, _drawfunc, null, false, "org_selectViewer", _loadfunc);
				}).attr("style", "cursor:pointer");
				
				$("#Chk5", _active).off("click").on("click", function (){
					/*데이터 산출 파일 클릭 하면 팝업 화면 처리*/
					var url="/" + doc.getOption("dbpath") + "/checkCIS2?readform";
					var objUrl =  new GF.CURL(url);	
					GF.dialog({
						content : { url:objUrl.url }
					,	title : "고객정보 산출 확인사항", isactive : true, width : 620, height : 300, resizable : false
					,	onload : function (){
							/*
							$("#cis_cfrm1").each(function(index){
								$(this).off("click").on("click", function(){});						
							})
							*/
						}
					,	buttons : [
			 	        	{ text: "확인", click : function (){
								if ($("#cis_cfrm1")[0].checked && $("#cis_cfrm2")[0].checked && $("#cis_cfrm3")[0].checked){
									$("#Chk5", _active)[0].checked = true;
										} else {
											alert("고객정보 산출 확인사항을 모두 동의하여 주십시오.");
											$("#Chk5", _active)[0].checked = false;
					 	        	    }
			 	        	    		$(this).dialog("close");
			 	        	    	}
			 	        	    }
		 				,	{ text: "취소", click : function() { $("#Chk5", _active)[0].checked = false; $(this).dialog("close"); }}
		 				]
					});
				});
			} else {
				$("input, textarea, select", _active).attr("disabled", true);
			}
		}
		
		/* 변수 */
		var confirm_button = { text: "확인",	click : _Confirm}
		, close_button = { text: (command == "compose") ? "취소" : "닫기", click : function (){$(this).dialog("close");}}
		, buttons = (command == "compose") ? [confirm_button, close_button] : [close_button]
		, url = new GF.CURL("/" + doc.getOption("dbpath") + "/checkCIS?readform");
		
		/* 다이얼로그 열기 */
		GF.dialog({
			content : {url : url.url}
		,	title : "고객정보 보안 확인", isactive : true, width : 540, height : 600, resizable : false
		,	onload : function (){
				var _active = GC.active(true);
				_SetValue(_active);
				_Event_initialize(_active);
			}
		,	buttons : buttons
		});
		break;
	case "initialize":
		if (doc.getField("CIS_Check") != ""){
			if (confirm("고객정보보안확인 내용이 초기화 됩니다. 변경하시겠습니까?")){
				doc.setField("CIS_Check", "");
			}
		}
		break;
	}
}
/*
 * *********************************************************
 * form Event init
 * *********************************************************
 * */
ws47.form_Event_initialize = function (){
	var doc = ws47.active.doc();
	/* EDIT - READ 공통 */
	/* section 처리 */
	$(".section_close,.section_open", ws47.active).each(function (){
		var sSelector = "#" + $(this).attr("section_id");
		$(this).off("click").on("click", function (){
			$(sSelector).toggle();
			$(this).attr("class", $(this).attr("class")=="section_close" ? "section_open" : "section_close");
		})
	});
	
	if ( doc.getOption("isedit") ) {
		/* EDIT */
		ws47.form_Event_classrequest(ws47.active);
		/* 고객정보보안확인 처리 */
		$("input[name='ChkCis']", ws47.active).off("click").on("click", function (){
			if (this.value == "YES") ws47.checkCIS("compose");
			else ws47.checkCIS("initialize");
		});
		
		$("#span_srd", ws47.active).off("click").on("click", function (){
			// NQPP-936GJG
			var url = new GF.CURL("/" + ws47.doc.getOption("dbpath") + "/open_attach/NQPP-936GJG?opendocument"
			, {isundock : 1});
		
			var w = GF.winContent(url.url, {
				location:"0", resizable : "1", status: "1", menubar:"0", scrollbars:"0", width : "550", height : "350"
			});
		});
	} else {
		/* READ */
		$("[id*='brlink']").attr("class", "btn_small_type_a").off("click").on("click", function (){
			var s = $(this).attr("key");
			switch (s){
			case "rdd":
				ws47.brCheckOpinion(doc, false);
				break;
			case "risk":
				ws47.brResearchDb(doc, "risk");
				break;
			case "security":
				ws47.brResearchDb(doc, "security");
				break;
			case "influence":
				//ws47.brOpenLine(doc, "influence");
				break;
			case "cimdoc":
				ws47.itcimMgr(doc, "read");
				break;
			case "acptconf":
				/* BR 인수확인 내용입력 */
				ws47.brAcceeptConfirmContent(doc);
				break;
			case "acptconf_read":
				/* BR 인수확인 내용열람 */
				ws47.brAcceeptConfirmContentRead(doc);
				break;
			}
		});
		/* 팀문서 연결 */
		$(ws47.info.teamdocinfo).each(function (idx, _o){
			$("<span></span>").attr("class", "btn_small_type_a").css("margin-right", "2px").html("<span>" + _o.text + "</span>").off("click")
			.on("click", function (){
				GF.load(ws47.active, (new GF.CURL("/" + _o.dbpath + "/view_by_unid/" + _o.unid + "?opendocument")).url);
			}).appendTo("#teamdoc", ws47.active);
		});
		/* 파트 문서 연결 */
		$(ws47.info.partdocinfo).each(function (idx, _o){
			$("<span></span>").attr("class", "btn_small_type_a").css("margin-right", "2px").html("<span>" + _o.text + "</span>").off("click")
			.on("click", function (){
				GF.load(ws47.active, (new GF.CURL("/" + _o.dbpath + "/view_by_unid/" + _o.unid + "?opendocument")).url);
			}).appendTo("#partdoc", ws47.active);
		});
		/* 주문서 연결 */
		if (ws47.info.maindocid){
			$("<span></span>").attr("class", "btn_small_type_a").css("margin-right", "2px").html("<span>주문서 연결</span>").off("click")
			.on("click", function (){
				GF.load(ws47.active, (new GF.CURL("/" + doc.getOption("dbpath") + "/view_by_unid/" + ws47.info.maindocid + "?opendocument")).url);
			}).appendTo("#pdoc", ws47.active);
		}
		/* 첨부 문서 연결 */
		if (ws47.info.itintegtestdocid){
			$("<span></span>").attr("class", "btn_small_type_a").css("margin-right", "2px").html("<span>테스트문서통합관리 연결문서</span>").off("click")
			.on("click", function (){
				ws47.openIntegTestDoc({
					creq : (ws47.info.da == "NO" ? "steptext" : "")
				,	flag : "read"
				});
			}).appendTo("#attachdoc", ws47.active);
		}
		/* 인수테스트 문서 연결 */
		if (ws47.info.acpttestdocid){
			$("<span></span>").attr("class", "btn_small_type_a").css("margin-right", "2px").html("<span>인수테스트 연결문서</span>").off("click")
			.on("click", function (){
				ws47.AcceptTestDocReg(doc, "open");
			}).appendTo("#accepttestdoc", ws47.active);
		}
		/* 단위테스트 문서 연결 */
		if (ws47.info.stepexecdocid){
			if ($("#steptestdoc", ws47.active).length > 0){
				$("<span></span>").attr("class", "btn_small_type_a").css("margin-right", "2px").html("<span>단위테스트통합관리 연결문서</span>").off("click")
				.on("click", function (){
					var url = new GF.CURL("/" + ws47.info.dbpath[5] + "/0/" + ws47.info.stepexecdocid + "?opendocument");
					GF.dialog({
						content : {url : url.url}
					,	title : "단위테스트", isactive : true, width : 700, height : 420, resizable : false
					,	onload : function (){}
					,	buttons : [
							{text: "닫기", click : function (){ $(this).dialog("close")}}
						]
					});
				}).appendTo("#steptestdoc", ws47.active);
			}
		}
		if (ws47.info.systemtestdocid){
			if ($("#systemtestdoc", ws47.active).length > 0){
				$("<span></span>").attr("class", "btn_small_type_a").css("margin-right", "2px").html("<span>시스템테스트 문서</span>").off("click")
				.on("click", function (){
					ws47.systemTestDocReg(doc, "open");
				}).appendTo("#systemtestdoc", ws47.active);
			}
		}
		if (ws47.info.cchangereqdocid){
			if ($("#changereqdoc", ws47.active).length > 0){
				$("<span></span>").attr("class", "btn_small_type_a").css("margin-right", "2px").html("<span>요건변경신청 연결문서</span>").off("click")
				.on("click", function (){
					var url = new GF.CURL("/" + ws47.info.dbpath[7] + "/0/" + ws47.info.cchangereqdocid + "?opendocument"
					, {isundock : 1});
					var w = GF.winContent(url.url, {
						location:"0", resizable : "1", status: "1", menubar:"0", scrollbars:"0", width : "750", height : "550"
					});
				}).appendTo("#changereqdoc", ws47.active);
			}
		}
		if (ws47.info.reqchangedatedocid){
			if ($("#reqchangedoc", ws47.active).length > 0){
				$("<span></span>").attr("class", "btn_small_type_a").css("margin-right", "2px").html("<span>예정일사후변경 연결문서</span>").off("click")
				.on("click", function (){
					var url = new GF.CURL("/" + ws47.info.dbpath[8] + "/0/" + ws47.info.reqchangedatedocid + "?opendocument"
					, {isundock : 1});
					var w = GF.winContent(url.url, {
						location:"0", resizable : "1", status: "1", menubar:"0", scrollbars:"0", width : "750", height : "550"
					});
				}).appendTo("#reqchangedoc", ws47.active);
			}
		}
		if (ws47.info.customdisusedocid){
			if ($("#customdisdoc", ws47.active).length > 0){
				$("<span></span>").attr("class", "btn_small_type_a").css("margin-right", "2px").html("<span>고객정보폐기 연결문서</span>").off("click")
				.on("click", function (){
					var url = new GF.CURL("/" + ws47.info.dbpath[9] + "/0/" + ws47.info.customdisusedocid + "?opendocument"
					, {isundock : 1});
					var w = GF.winContent(url.url, {
						location:"0", resizable : "1", status: "1", menubar:"0", scrollbars:"0", width : "750", height : "550"
					});
				}).appendTo("#customdisdoc", ws47.active);
			}
		}
		if (ws47.info.motdocid){
			if ($("#motdoc", ws47.active).length > 0){
				$("<span></span>").attr("class", "btn_small_type_a").css("margin-right", "2px").html("<span>MOT 연결문서</span>").off("click")
				.on("click", function (){
					var url = new GF.CURL("/" + ws47.info.dbpath[7] + "/0/" + ws47.info.motdocid + "?opendocument"
					, {isundock : 1});
					var w = GF.winContent(url.url, {
						location:"0", resizable : "1", status: "1", menubar:"0", scrollbars:"0", width : "750", height : "550"
					});
				}).appendTo("#motdoc", ws47.active);
			}
		}
	}
}
ws47.form_Event_classrequest = function (_active){
	/* 요청 분류 처리 */
	$("select[name='ClassRequest']", _active).off("change").on("change", function (){
		var _index = $("option:selected", this).index()
		, _robj = $("select[name='ReasonRequest']", _active)
		, _thisval = this.value
		, _vCode = _thisval.split(".")
		, _reasonRequest = ws47.reasonRequest[_vCode[2]] ? ws47.reasonRequest[_vCode[2]] : []
		, _options = "<option value=\"reason0\">[요청사유 선택]</option>";
		
		_robj.attr("disabled", _index == 0 ? true : false);
		$.each(_reasonRequest, function (index, o){
			_options += "<option value=\"" + o.fullCode + "\"" + (o.fullCode == _robj.val() ? " selected" : "") + ">" + o.text + "</option>";
		});
		_robj.html(_options).change();
	}).change();
}
ws47.form_Event_Research = function (_active){
	$("[id^='researchitem']", _active).each(function (){
		$(this).attr("style", "cursor:pointer")
		.off("click").on("click", function (){
			var vID = this.id.split("_");
			$("[id^='" + vID[0] + "_" + vID[1] + "']", _active).removeAttr("style").attr("style", "cursor:pointer");
			$("input[name='ResearchItem"+vID[1]+"']", _active).val(vID[2]);
			$(this).removeAttr("style").attr("style", "color:red; font-weight:bold");
		});
	});
}
/*
 * *********************************************************
 * auroracreate, auroradelete
 * *********************************************************
 * */
//*
ws47.auroracreate = function (doc){
	alert("/" + ws47.info.dbpath[1] + "/(ws4701_crt)?openagent");
	var url = new GF.CURL("/" + ws47.info.dbpath[1] + "/(ws4701_crt)?openagent");
		
	GF.ajax({
		url : url.url
	,	dataType: "html", type : "GET", async : true, cache : false
	,	success : function (data,textStatus,xhr){
			alert(textStatus);
		}
	,	error : function (xhr,textStatus) {
			GF.log("load error",textStatus);
		}
	});
}
ws47.auroradelete = function (doc){
	alert("/" + ws47.info.dbpath[1] + "/(ws4701_st_a2e)?openagent");
	var url = new GF.CURL("/" + ws47.info.dbpath[1] + "/(ws4701_st_a2e)?openagent");
		
	GF.ajax({
		url : url.url
	,	dataType: "html", type : "GET", async : true, cache : false
	,	success : function (data,textStatus,xhr){
			alert(textStatus);
		}
	,	error : function (xhr,textStatus) {
			GF.log("load error",textStatus);
		}
	});
}

ws47.mot = function (doc){
	var url = new GF.CURL("/" + ws47.doc.getOption("dbpath") + "/mot?openagent", {
		pid : doc.getOption("unid")
	});

	GF.ajax({
		url : url.url
	,	dataType: "html", type : "GET", async : true, cache : false
	,	success : function (data,textStatus,xhr){
			alert(textStatus);
		}
	,	error : function (xhr,textStatus) {
			GF.log("load error",textStatus);
		}
	}); 
}
/*
 * *********************************************************
 * 오로라 동기화
 * *********************************************************
 * */
ws47.syncAurora = function (doc){ 
	if (confirm("오로라동기화를 하시겠습니까?")) 
		request.approve({ action:"syncaurora", commentflag:false }); 
}
// */
/*
 * *********************************************************
 * form Buttons init
 * *********************************************************
 * */
ws47.formButtons = {
	draft : { text : "임시저장", click : ws47.draftDoc }
,	request : { text : "신청", highlight	: true, click : ws47.request }
,	rerequest : { text : "신청", highlight	: true, click : ws47.requestAgain }
,	remake : { text : "재작성", highlight	: true, click : ws47.reMake }
,	requestagain :  { text : "재신청", highlight	: true, click : ws47.requestAgain }
,	edit : { text : "편집", highlight : true, click : function (doc){ doc.edit() }}
,	del : { text : "삭제", click : ws47.removeDoc }
,	br_discuss : { text : "협의팀결정", highlight : true, click : ws47.brDiscuss }
,	br_checkopinionadd : { text : "BR검토의견추가", click : function (doc){ ws47.brCheckOpinion(doc, true) }}
,	br_beforreceive : { text : "접수중환원", click : ws47.brBeforeReceive }
,	br_checkopinion : { text : "BR검토의견", click : function (doc){ ws47.brCheckOpinion(doc, true) }}
,	br_distribute : { text : "배분", highlight : true, click : ws47.distribute }
,	discussrequest : { text : "협의요청", highlight : true, click : ws47.discussRequest }
,	designcomment : { text : "테스트내역", click : ws47.designComment }
,	itpartchargejointowner : { text : "업무공유", click : ws47.itPartChargeJointOwner }
,	consultation : { text : "협의회신", highlight : true, click : ws47.consultation }
,	reqredist : { text : "재배분요청", click : ws47.reDistribute }
,	itsecurity : { text : "IT보안검토", highlight : true, click : ws47.itSecurity }
,	designaccept : { text : "설계접수", highlight : true, click : ws47.designAccept }
,	registdesign : { text : "설계문서등록", highlight : true, click : ws47.registDesign }
,	completedesign : { text : "설계완료", highlight : true, click : ws47.completeDesign }
,	yeschangedate : { text : "예정일변경동의", highlight : true, click : function (doc){ ws47.ChangeDate(doc, "Y") } }
,	nochangedate : { text : "예정일변경거부", highlight : true, click : function (doc){ ws47.ChangeDate(doc, "N") } }
,	fieldagentdis : { text : "현장배분", highlight : true, click : ws47.fieldAgentDis }
,	fieldagentconfirm : { text : "현장확인", highlight : true, click : ws47.fieldAgentConfirm }
,	developaccept : { text : "개발접수", highlight : true, click : ws47.developAccept }
,	designrevisebefore : { text : "설계보완요청", click : ws47.revise }
,	changerequestbr : { text : "변경요청", click : ws47.changeRequestBR }
,	contentchangereq : { text : "현업요건변경", click : ws47.contentChangeReq }
,	changecharge : { text : "개발자변경", click : ws47.changeCharge }
,	datechgrequest : { text : "예정일변경요청", click : ws47.dateChgRequest }
,	completecontent : { text : "완료내역 입력", highlight : true, click : ws47.completeContent }
,	itcimmgr : { text : "변경영향분석 입력", highlight : true, click : function (doc){ ws47.itcimMgr(doc, "edit")} }
,	chgclientapprtrue : { text : "변경요청 동의", highlight : true, click : function (doc){ws47.changeClientApprove(doc, true)} }
,	chgclientapprfalse : { text : "변경요청 거부", highlight : true, click : function (doc){ws47.changeClientApprove(doc, false)} }
,	unittest : { text : "단위테스트", highlight : true, click : ws47.UnitTest }
,	totaltestdocreg : { text : "테스트문서등록", highlight : true, click : ws47.totalTestDocReg }
,	totaltest : { text : "통합테스트", highlight : true, click : ws47.TotalTest }
,	systemtestdocreg : { text : "테스트문서등록", highlight : true, click : function (doc){ ws47.systemTestDocReg(doc, "edit") } }
,	systemtestcompletion : { text : "테스트완료", highlight : true, click : ws47.systemTestCompletion }
,	designconfirmdoc : { text : "설계확인문서", highlight : true, click : ws47.designConfirmDoc }
,	designconfirm : { text : "설계확인", highlight : true, click : ws47.designConfirm }
,	designreviseafter : { text : "설계보완", click : ws47.designRevise }
,	attachdoccheck : { text : "첨부문서 체크", highlight : true, click : ws47.attachDocCheck }
,	secdocreg : { text : "문서보안적용첨부", highlight : true, click : ws47.secDocReg }
,	reqacceptcharge : { text : "인수테스트요청", highlight : true, click : ws47.reqAcceptCharge }
,	reqacceptfield : { text : "인수테스트요청", highlight : true, click : ws47.reqAcceptField }
,	regularselect : { text : "인수테스트요청", highlight : true, click : ws47.regularSelect }
,	securitydoccheck : { text : "보안문서 체크", highlight : true, click : ws47.SecurityDocCheck }
,	accepttestdocreg : { text : "인수테스트문서 등록", highlight : true, click : function (doc){ws47.AcceptTestDocReg(doc, "edit")} }
,	accepttestexecution : { text : "인수확인", highlight : true, click : ws47.AcceptTestExecution }
,	changerequestclient : { text : "변경요청", click : ws47.ChangeRequestClient }
,	brquality : { text : "품질측정", highlight : true, click : ws47.BRQuality }
,	discuss :  { text : "협의", highlight : true, click : ws47.discuss }
,	approve : { text : "승인", highlight : true, click : ws47.approve }
,	receive : { text : "접수", highlight : true, click : ws47.receive }
,	receiveback : { text : "미접수", click : ws47.receiveBack }
,	reject : { text : "반려", click : ws47.reject }
,	revise : { text : "보완요청", click : ws47.revise }
,	reqchangedate : { text : "완료예정일사후변경", click : ws47.reqChangeDate }
,	systemtestchief : { text : "결재", click : ws47.systemTestChief }
,	inputregcontent : { text : "정규반영내역입력", click : ws47.inputRegContent }
,	searchregcontent : { text : "정규반영내역조회", click : ws47.searchRegContent }
,	syncaurora : { text : "오로라동기화", click : ws47.syncAurora }
//*
,	auroracreate : { text : "오로라테스트생성", click : ws47.auroracreate }
,	auroradelete : { text : "오로라테스트삭제", click : ws47.auroradelete }
,	mot : { text : "MOT테스트", click : ws47.mot }
// */
};
/*
 * *********************************************************
 * form initialize
 * *********************************************************
 * */
ws47.form_initialize = function (opts, info){
	ws47.contentName = opts.req_subject;
	ws47.title.requestTitle = (opts.title_prefix||"") + request.profile.reqTitle + (opts.title_suffix||"");
	opts.buttons = ws47.formButtons;
	opts.htitle = ws47.title;
	
	/* 문서초기화 */
	$.extend(ws47.info, info);
	//ws47.info = info;
	ws47.active = $(GC.active(true));
	ws47.doc = $(ws47.active).doc(opts).doc();
	
	/* 요청사유 리터럴 생성 */
	ws47.makeReasonRequest();
	/* 이벤트 생성 */
	ws47.form_Event_initialize();
}

