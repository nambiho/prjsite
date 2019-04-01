function ws4704() { }

ws4704.title = {
	changeinfluence : "변경영향분석관리"
,	registerAttachDoc: "첨부문서등록"
}

ws4704.drawTeamTable = function (doc){
	var doc = $(GC.active(true)).doc()
	, _h, txt1, txt2, txt3, txt4, txt5
	, tp = doc.getOption("reqteamprofile")
	
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
		_h += "<col width=\"100\">";
		_h += "</colgroup>";

		if (idx == 0)
			_h += "<tr><th>팀</th><th>파트</th><th>구분</th><th>담당자</th><th>연결문서</th><th>수행</th></tr>";
		
		for (var i = 0 ; i < o.partcnt ; i++){
			_h += "<tr>";
			if (i == 0) _h += "<th rowspan=\"" + o.partcnt + "\">" + o.teamname + "</th>";
			_h += "<th>파트" + (i+1) + "</th>";
			
			_h += "<th>개발자" + (i+1) + "</th>";
			_h += "<td id=\"td_itpartcharge" + (idx + 1) + (i+1) + "\">&nbsp;</td>";
			_h += "<td id=\"td_sdc" + (idx + 1) + (i+1) + "\">&nbsp;</td>";
			_h += "<td id=\"td_link_sdc" + (idx + 1) + (i+1) + "\">&nbsp;</td>";
				
			_h += "</tr>";
		}
		_h += "</table>";
	});
	$("#div_team", GC.active(true)).html(_h);
}


ws4704.openAttachEdit = function (){
	
	var active = GC.active(true);
	var doc = $(active).doc();
	
	var itcimdocid = doc.getOption("itcimdocid");
								
	GF.getApplProfile("ws4704", function(data) {
		if(data === "") return;
			var _height = 350, url = ""
				, chkfld = $("#docids input[name='" + doc.getOption("docidfield").replace("CO", "") + "']", active);
			
			if (chkfld.index() == -1) url = new GF.CURL("/"+data.appldir+"/"+data.applfilename+"/change_influence_sys?openform").url;
			else url = new GF.CURL("/"+data.appldir+"/"+data.applfilename+"/0/" + chkfld.val() + "?editdocument").url;
							
			var obj = GC.active(true);
			var param={
					base 		:  url
				,	docidfield : doc.getOption("docidfield")
				,	curfield : doc.getOption("curfield")
				,	ppdocid	: doc.getOption("pdocid")
				,	ppcode 	: doc.getOption("pcode")
				,	ParentUNID : doc.getOption("unid")
				,	flag		: doc.getOption("docidfield")
				, 	isundock	:	"1"
			}
			
			var opt ={
					location:"0"
					,resizable : "1"
					,status: "1"
					,menubar:"0"
					,scrollbars:"0"
			}
			GF.winContent(new GF.CURL(param).url, opt);
		}
	)
}

ws4704.openAttachRead = function (unid, name){
	var active = GC.active(true);
	var doc = $(active).doc();
								
	GF.getApplProfile("ws4704", function(data) {
		if(data === "") return;
			var _height = 350, attachurl = ""
				, chkfld = $("#docids input[name='" + doc.getOption("docidfield").replace("CO", "") + "']", active);
			
			var url = new GF.CURL("/" + data.appldir + "/" + data.applfilename + "/0/" + unid + "?opendocument").url;						
			var obj = GC.active(true);
			var param={
					base 		:  url
				,	docidfield : doc.getOption("docidfield")
				,	curfield : doc.getOption("curfield")
				,	ppdocid	: doc.getOption("pdocid")
				,	ppcode 	: doc.getOption("pcode")
				,	ParentUNID : doc.getOption("unid")
				,	flag		: doc.getOption("docidfield")
				, 	isundock	:	"1"
			}
			
			var opt ={
					location:"0"
					,resizable : "1"
					,status: "1"
					,menubar:"0"
					,scrollbars:"0"
			}
			GF.winContent(new GF.CURL(param).url, opt);
		}
	)
}

ws4704.tableData = function (opts){
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
		.html("<span>첨부</span>").off("click")
		.on("click", function (){
			ws4704.openAttachRead(o.value, o.name);
		}).appendTo("#td_" + o.name.toLowerCase(), active);
	});
	
	/* 수행 */
	if (opts.flag == "edit"){
		var curfield = $("#td_" + doc.getOption("curfield").toLowerCase(), active);
		if (curfield.index() > 0){
			if ( $("#users input[name='" + doc.getOption("curfield") + "']", active).index() < 0 ){
				curfield.text(GC.user.korname);
			}
			var id = doc.getOption("docidfield").toLowerCase();
			
			$("<span></span>")
			.attr("class", "btn_small_type_a")
			.html("<span>작성</span>").off("click")
			.on("click", function (){
				ws4704.openAttachEdit();
			}).appendTo("#td_link_" + id, active);
		}
	}
}

ws4704.formInit = function(opts) {
	var act = GC.active(true);
	opts.htitle = ws4704.title;
	$(act).doc(opts); 
	
	ws4704.drawTeamTable(opts);
	ws4704.tableData(opts);
}

/*===================첨부문서등록=====================*/
function ws4704_attach() {}
ws4704_attach.register = function(doc) {
	var $form = doc.Element();
	if ( $("#designate_mng",$form).length > 0 ) {
		var o = $("#designate_mng",$form).eugp();
		if(o.members().length >0){
			o.save();
		}
	}
	
	if(ws4704_attach.validate(doc,"register")){
		if(confirm("등록하시겠습니까?")){
			doc.submit(function(xhr,data,textStatus) {
				var jobj = $.parseJSON(data);
				if(jobj != null) {
					if(jobj.code!=1) {
						alert(jobj.value.replace(/\\n/gi,"\n"));
						return;
					}
				
					if (doc.getOption("flag") == "simple" || doc.getOption("flag") == "self"){
						var pdoc = opener.GC.active(true).doc();
						if ( typeof pdoc !== "undefined"){
							pdoc.reload();
						}
					}else{
						var pdoc = opener.GC.active(true).doc();
						var ppdoc = opener.opener.GC.active(true).doc();
						if ( typeof pdoc !== "undefined" && typeof ppdoc !== "undefined"){
							ppdoc.reload();
							pdoc.reload();
						}
					}			
					doc.close();
				} else {
					alert("JSON Parsing error !");
				}
			});
		}
	}	
}

ws4704_attach.designate_mng = function(doc) {
	var $form = doc.formElement();
	$("#designate_mng",$form).eugp().showOrg();
}

ws4704_attach.designate_clear = function(doc) {
	$form = doc.formElement();
	$("input[name^=ITPartDept]",$form).val("");
	$("input[name^=ITPartCharger]",$form).val("");
}

ws4704_attach.confirm_input = function(doc) {
	if(ws4704_attach.validate(doc,"confirm_input")){		
		GF.inputOpinion(function(comments){
			var _comments = comments;
			var url = new GF.CURL("/"+doc.getOption("dbpath")+"/cnfrm_npt?openagent").url;
			
			GF.ajax({
				url : url
			,	type : "POST"
			,	dataType: "text"
			,	data : {
					"unid" : doc.getOption("unid")
				,	"userid" : GC.user.notesid
				, 	"comments" : _comments
				}
			,	cache : false
			,	success : function(data,textStatus,xhr) {
					var jobj = $.parseJSON(data);
					if(jobj != null) {
						if(jobj.code!=1) {
							alert(jobj.value.replace(/\\n/gi,"\n"));
							return;
						}
						try{
							if (doc.getOption("flag") == "simple" || doc.getOption("flag") == "self"){
								var pdoc = opener.GC.active(true).doc();
								if (typeof pdoc !== "undefined"){
									pdoc.reload();
									doc.reload();
								}
							}else{
								var pdoc = opener.GC.active(true).doc();
								if (typeof pdoc != "undefined"){
									pdoc.reload();
								}
								var ppdoc = opener.opener.GC.active(true).doc();
								if (typeof ppdoc !== "undefined"){
									ppdoc.reload();
								}
								/*
								var pdoc = opener.GC.active(true).doc();
								var ppdoc = opener.opener.GC.active(true).doc();
								if ( typeof pdoc !== "undefined" && typeof ppdoc !== "undefined"){
									ppdoc.reload();
									pdoc.reload();
									doc.close();
								}
								// */
								doc.close();
							}
						} catch (e){}
						
					} else {
						alert("JSON Parsing error !");
					}
				}
			,	error : function(xhr,textStatus) {
					GF.log("error",textStatus);
					return;
				} 
			});
		});
	}
}

ws4704_attach.formButtons = {
	register 	: {	
		text 	: "등록"
	,	click	: ws4704_attach.register
	}
,	designate_mng 	: {	
		text 	: "호출 담당자 지정"
	,	click	: ws4704_attach.designate_mng
	}
,	designate_clear 	: {	
		text 	: "호출 담당자 초기화"
	,	click	: ws4704_attach.designate_clear
	}
,	confirm_input : {
		text 	: "확인내용 입력"
	,	click	: ws4704_attach.confirm_input
	}
} 

ws4704_attach.formInit = function(opts) {
	var act = GC.active(true);
	
	opts.buttons = ws4704_attach.formButtons; 
	opts.htitle = ws4704.title;
	$(act).doc(opts); 
	
	if(opts.isedit){
		$("#designate_mng", act).eugp({
			title 		:	"호출 담당자 지정"
		,	ismulti		:	true
	 	,	isedit		: 	act.doc().getOption("isedit")
	 	,	savefield	:	"ChargerInfoList"
	 	,	loaddiv	:	"ChargerLoadList"
	 	,	savekeyfield : "ChargerKeyList"
	 	,	draw		: 	function(_this){
	 							var members = _this.members();
	 							if(members.length>10){
	 								alert("담당자를 10명 이하로 선택하세요.");
	 								return;
	 							}
	 							if(members.length > 0){
	 								for(var i=0;i<members.length;i++){
	 									$("input[name='ITPartCharger"+(i+1)+"']",act).val(members[i].info.notesid);
	 									$("input[name='ITPartDept"+(i+1)+"']",act).val(members[i].info.dspgroupname);
	 									$("input[name='ITPartChargerName"+(i+1)+"']",act).val(members[i].info.korname+" "+members[i].info.dsppost);
	 								}
	 							}
	 						}
	 	,	dlgTabs	:	{tab1 : {text	: "담당자"} }
		});
		$("#designate_mng", act).eugp().load();	
	}	
	ws4704_attach.linkDocOpen(opts.ppdoc, opts.ppcode);
}

ws4704_attach.validate = function(doc){
	var $form = doc.formElement();
	if(doc.getField("CheckCIM") == undefined){
		alert("타 시스템 변경영향 여부를 선택하세요.");
		return false;
	}
	var isAtt = GF.chkIsAttachment(doc.options());
	if(isAtt==0){
		 alert("첨부파일을 첨부하여 주시기 바랍니다.");
		 return false;
	}
	return true;
}

//양식내 양식다운로드 링크
ws4704_attach.linkDocOpen = function(docid, code){	
	$("#linkdoc",GC.active(true)).click(function(){
		GF.getApplProfile(code, function(data) {
			if(data == "") return;
			var url = "/"+data.appldir+"/"+data.applfilename+"/0/"+docid+"?opendocument&isundock=1"
			var opts = "width=700, height=400, scrollbars=yes";
			var objUrl = new GF.CURL(url);
			GF.winContent(objUrl.url,opts,false);
		});
	});
}
