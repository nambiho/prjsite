function ws4706(){}
ws4706.active = null;
ws4706.doc = null;
ws4706.title = {requestTitle : "테스트문서통합관리"};

ws4706.docOption = {
	"isedit" : true
,	"isnewnote" : true
,	"unid" : ""
,	"dbpath" : ""
,	"applcode" : ""
,	"disableunload" : false
};
ws4706.setDocOption = function (opt){
	/* 팝업용 doc 옵션 */
	ws4706.docOption = opt;
}
ws4706.setAuroraUtil = function (){
	var _h = "<OBJECT " +
		"ID='ActiveRunAuroraUtil' " +
		"width='0' " +
		"height='0' " +
		"CLASSID='CLSID:443A4FDC-31E1-40D5-BD83-0ED3FB4D3694' " +
		"CodeBase='" + (new GF.CURL(GC.site.jsdir + "/app/ws47/attach/ActiveRunAuroraUtil_20121205.cab#Version=4,0,0,0")).url + "'> " +
		"</OBJECT>";
	
	$("#div_auroracab", ws4706.active).html(_h);
}
ws4706.getOcx = function (_callback){
	if ($.browser.msie){
		var ocx = $("#ActiveRunAuroraUtil", ws4706.active);
		if (ocx.length == 0){
			ws4706.setAuroraUtil();
			ocx = $("#ActiveRunAuroraUtil", ws4706.active);
		}
		_callback && setTimeout( function (){_callback(ocx)}, 200);
	} else {
		alert("Internet Explorer에서 실행 가능 합니다.");
		return false;
	}
}
ws4706.viewAurora = function (doc){
	ws4706.getOcx(
		function (ocx){
			try{
				ocx[0].EXEC_DOCUMENT_MANAGER(
					opener.GC.eztoken.id
				,	opener.GC.eztoken.time
				,	ws4706.doc.getOption("docnumber")
				,	"000"
				);
			} catch (e){alert("[PC환경오류]관리자에게 문의 하시기 바랍니다.")}
		}
	);
}
ws4706.regAurora = function (doc){
	ws4706.getOcx(
		function (ocx){
			try{
				ocx[0].EXEC_DOCUMENT_MANAGER(
					opener.GC.eztoken.id
				,	opener.GC.eztoken.time
				,	ws4706.doc.getOption("docnumber")
				,	"999"
				);
			} catch (e){alert("[PC환경오류]관리자에게 문의 하시기 바랍니다.")}
			/*
			(ocx[0].tagName == "OBJECT") ?
				ocx.EXEC_DOCUMENT_MANAGER(
					opener.GC.eztoken.id
				,	opener.GC.eztoken.time
				,	ws4706.docnumber
				,	"999"
				)
			:	alert("[PC환경오류]관리자에게 문의 하시기 바랍니다.");
			// */
		}
	);
}
ws4706.formButtons = {
	viewaurora : { text : "(공통)프로그램사양서 조회", click : ws4706.viewAurora }
,	regaurora :  { text : "(공통)프로그램사양서 등록", click : ws4706.regAurora }
,	aclose : { text : "아래 리로드", click : function (){
		opener.ws47.reload();
	}}
};

ws4706.openAttachEdit = function (){
	var _active = null, _doc = null;
	function _confirm(o){
		_doc.submit(function (xhr,data,textStatus){
			//*
			try{
				o.dialog("close");
				//$(_active).dialog("close");
				var jsonData = $.parseJSON(data);
				if ( jsonData.bflag ){
					ws4706.doc.reload();
					if (ws4706.doc.getOption("mainreload")){
						opener.ws47.reload();
					}
				} else alert(jsonData.msg.replace(/\\n/gi,"\n"));
			} catch (e){alert(e)}
			// */
		});
	}
	function _load(){
		_active = GC.active(true);
		_doc = $(_active).doc(ws4706.docOption).doc();
	}
	
	var _height = 350, attachurl = ""
	, chkfld = $("#docids input[name='" + ws4706.doc.getOption("docidfield").replace("CO", "") + "']", ws4706.active);

	if (chkfld.index() == -1) attachurl = "/IntegTestDocMgrF01?openform";
	else attachurl = "/0/" + chkfld.val() + "?editdocument";
	
	var url = new GF.CURL("/" + ws4706.doc.getOption("dbpath") + attachurl, {
		parentunid : ws4706.doc.getOption("unid")
	,	creq : ws4706.doc.getOption("creq")
	,	docidfield : ws4706.doc.getOption("docidfield")
	,	curfield : ws4706.doc.getOption("curfield")
	,	punid : ws4706.doc.getOption("punid")
	});
	
	if (ws4706.doc.getOption("creq") == "steptext" && ws4706.doc.getOption("checkcreq") == "D") _height = 500
	
	GF.dialog({
		content : {url : url.url}
	,	title : "첨부문서등록", isactive : true, width : 620, height : _height, resizable : false
	,	onload : _load
	,	buttons : [{text: "등록", click : function (){_confirm($(this))}}, {text: "닫기", click : function (){ $(this).dialog("close")}}]
	});
}

ws4706.openAttachRead = function (unid, name){
	var _active = null, _doc = null;
	
	function _load(){
		_active = GC.active(true);
		_doc = $(_active).doc(ws4706.docOption).doc();
		
		if (ws4706.doc.getOption("flag") == "ccaf" || ws4706.doc.getOption("flag") == "csec"){
			var url = new GF.CURL("/" + ws4706.doc.getOption("dbpath") + "/ccaf_process?openagent",{
				punid : ws4706.doc.getOption("punid")
			,	flag : name||""
			});
			
			GF.ajax({
				url : url.url
			,	type : "GET", cache : false
			,	success : function (data,textStatus,xhr){
					try{
						var jsonData = $.parseJSON(data);
						if ( jsonData.bflag ){
							opener.ws47.reload();
						} else alert(jsonData.msg.replace(/\\n/gi,"\n"));
					} catch (e){alert(e)}
				}
			,	error : function (xhr,textStatus){
					alert("textStatus : " + textStatus);
					GF.log("load error",textStatus);
					ret = false;
				} 
			});
		}
	}
	
	var attachurl = "/0/" + unid + "?opendocument";
	var url = new GF.CURL("/" + ws4706.doc.getOption("dbpath") + attachurl, {
		parentunid : ws4706.doc.getOption("unid")
	,	creq : ws4706.doc.getOption("creq")
	,	docidfield : ws4706.doc.getOption("docidfield")
	,	curfield : ws4706.doc.getOption("curfield")
	,	punid : ws4706.doc.getOption("punid")
	,	flag : ws4706.doc.getOption("flag")
	});
	
	GF.dialog({
		content : {url : url.url}
	,	title : "첨부문서등록", isactive : true, width : 620, height : 500, resizable : false
	,	onload : _load
	,	buttons : [{text: "닫기", click : function (){ $(this).dialog("close")}}]
	});
}

ws4706.drawTeamTable = function (){
	var doc = $(ws4706.active).doc()
	, _h, txt1, txt2, txt3, txt4, txt5
	, tp = doc.getOption("reqteamprofile");
	
	_h = txt1 = txt2 = txt3 = txt4 = txt5 = "";
	
	$.each(tp, function (idx, o){
		_h += "<div class=\"pt4\" />";
		_h += "<table border=\"0\" cellspacing=\"0\" cellpadding=\"0\" class=\"frm_edit_outline_type1\">";
		_h += "<colgroup>";
		_h += "<col width=\"100\">";
		_h += "<col width=\"100\">";
		_h += "<col width=\"100\">";
		_h += "<col width=\"100\">";
		_h += "<col width=\"100\">";
		_h += "<col>";
		_h += "<col width=\"60\">";
		_h += "</colgroup>";
		
		if (idx == 0 )
			_h += "<tr><th>팀</th><th>파트</th><th>구분</th><th>담당자</th><th>구분</th><th>연결문서</th><th>수행</th></tr>";
		
		for (var i = 0, j = 0 ; i < (o.partcnt * 2) ; i++){
			((i%2) == 0 ? j++ : null);
			
			txt1 = ((i%2) == 0 ? "설계자" : "개발자") + j;
			txt2 = ((i%2) == 0 ? "td_itpartdesigner" : "td_itpartcharge") + (idx + 1) + j;
			txt3 = ((i%2) == 0 ? "설계문서" : "테스트문서");
			txt4 = ((i%2) == 0 ? "td_sd" : "td_sdc") + (idx + 1) + j;
			txt5 = ((i%2) == 0 ? "td_link_sd" : "td_link_sdc") + (idx + 1) + j; //"td_link" + (idx + 1) + j; //((i%2) == 0 ? "td_sdc" : "") + (idx + 1) + j;
			
			_h += "<tr>";
			
			if (i == 0) _h += "<th rowspan=\"" + (o.partcnt * 2) + "\">" + o.teamname + "</th>";
			if ((i%2) == 0) _h += "<th rowspan=\"2\">파트" + ((i / 2) + 1) + "</th>";
			
			_h += "<th>" + txt1 + "</th>";
			_h += "<td id=\""+ txt2 + "\">&nbsp;</td>";
			_h += "<th>" + txt3 + "</th>";
			_h += "<td id=\"" + txt4 + "\">&nbsp;</td>";
			_h += "<td id=\"" + txt5 + "\">&nbsp;</td>";
			
			_h += "</tr>";
		}
		_h += "</table>";
	});
	
	$("#div_team", ws4706.active).html(_h);
}

ws4706.tableData = function (){
	var doc = $(ws4706.active).doc();
	/* 담당자 */
	$("#users input", ws4706.active).each(function (idx, o){
		$("#td_" + o.name.toLowerCase(), ws4706.active).html(GF.notesName(o.value, "cn"));
	});
	/* 연결문서 */
	$("#docids input", ws4706.active).each(function (idx, o){
		$("<span></span>")
		.attr("class", "btn_small_type_a")
		.html("<span>첨부</span>").off("click")
		.on("click", function (){
			ws4706.openAttachRead(o.value, o.name);
		}).appendTo("#td_" + o.name.toLowerCase(), ws4706.active);
	});
	/* 수행 */
	var curfield = $("#td_" + doc.getOption("curfield").toLowerCase(), ws4706.active);
	
	if (curfield.index() > 0){
		if ( $("#users input[name='" + doc.getOption("curfield") + "']", ws4706.active).index() < 0 ){
			curfield.text(GC.user.korname);
		}
		
		//var id = (doc.getOption("flag") == "TotalTestDoc" ? doc.getOption("docidfield") : doc.getOption("teampartnum")).toLowerCase();
		var chkfld = $("#docids input[name='" + ws4706.doc.getOption("docidfield").replace("CO", "") + "']", ws4706.active);
		var id = (doc.getOption("docidfield").substr(0,4) == "SDCO" ? doc.getOption("docidfield").replace("CO", "") : doc.getOption("docidfield")).toLowerCase();
		$("<span></span>")
		.attr("class", "btn_small_type_a")
		.html("<span>" + (chkfld.val() == "" ? "작성" : "추가") + "</span>").off("click")
		.on("click", function (){
			ws4706.openAttachEdit();
		}).appendTo("#td_link_" + id, ws4706.active);
	}
}

ws4706.forminit = function (opts){
	opts.htitle = ws4706.title;
	opts.buttons = ws4706.formButtons;
	ws4706.active = $(GC.active(true));

	ws4706.doc = $(ws4706.active).doc(opts).doc();
	ws4706.drawTeamTable();
	ws4706.tableData();
	
	// 오로라 화면 ActiveX
	//ws4706.setAuroraUtil();
}
