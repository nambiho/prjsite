function ws4705(){}
ws4705.active = null;
ws4705.doc = null;
ws4705.title = {requestTitle : "테스트문서통합관리"};

ws4705.docOption = {
	"isedit" : true
,	"isnewnote" : true
,	"unid" : ""
,	"dbpath" : ""
,	"applcode" : ""
,	"disableunload" : false
};
ws4705.setDocOption = function (opt){
	/* 팝업용 doc 옵션 */
	ws4705.docOption = opt;
}

ws4705.openAttachRead = function (unid, name){
	var _active = null, _doc = null;
	var doc = $(ws4705.active).doc();
	function _load(){
		_active = GC.active(true);
		_doc = $(_active).doc(ws4705.docOption).doc();
	}
	
	var attachurl = "/0/" + unid + "?opendocument";
	var url = new GF.CURL("/" + doc.getOption("dbpath") + attachurl, {
		parentunid :doc.getOption("unid")
	});

	GF.dialog({
		content : {url : url.url}
	,	title : "첨부문서등록", isactive : true, width : 620, height : 500, resizable : false
	,	onload : _load
	,	buttons : [{text: "닫기", click : function (){ $(this).dialog("close")}}]
	});
}

ws4705.drawTeamTable = function (){
	var doc = $(ws4705.active).doc()
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
		_h += "<col>";
		_h += "</colgroup>";
		
		if (idx == 0 )
			_h += "<tr><th>팀</th><th>파트</th><th>구분</th><th>담당자</th><th>연결문서</th></tr>";
		
		for (var i = 0 ; i < o.partcnt ; i++){
			_h += "<tr>";
			if (i == 0) _h += "<th rowspan=\"" + o.partcnt + "\">" + o.teamname + "</th>";
			_h += "<th>파트" + (i+1) + "</th>";
			_h += "<th>" + "개발자" + (i+1) + "</th>";
			_h += "<td id=\"td_"+ "itpartcharge" + (idx + 1) + i + "\">&nbsp;</td>";
			_h += "<td id=\"td_sdc" + (idx + 1) + i + "\">&nbsp;</td>";
			_h += "</tr>";
		}
		_h += "</table>";
	});
	
	$("#div_team", ws4705.active).html(_h);
}

ws4705.tableData = function (){
	var doc = $(ws4705.active).doc();
	/* 담당자 */
	$("#users input", ws4705.active).each(function (idx, o){
		$("#td_" + o.name.toLowerCase(), ws4705.active).html(GF.notesName(o.value, "cn"));
	});
	/* 연결문서 */
	$("#docids input", ws4705.active).each(function (idx, o){
		$("<span></span>")
		.attr("class", "btn_small_type_a")
		.html("<span>단위테스트 문서</span>").off("click")
		.on("click", function (){
			ws4705.openAttachRead(o.value, o.name);
		}).appendTo("#td_" + o.name.toLowerCase(), ws4705.active);
	});
}

ws4705.forminit = function (opts){
	ws4705.active = $(GC.active(true));

	ws4705.doc = $(ws4705.active).doc(opts).doc();
	ws4705.drawTeamTable();
	ws4705.tableData();
}

