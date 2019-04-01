function ws4710() { }
ws4710.title = {
		qualityvalue	: "품질평가"
	,	myproc 		: "내가 신청/처리한 문서"
	,	complete 		: "처리완료"
	,	past 			: "과년도문서"
	,	excelform		: "BR품질평가 - 엑셀 다운로드"
}


ws4710.formButtons = {
		
	register 	: {	text 	: "저장", highlight : false
			,	click	:	function(doc) {
									doc.submit(
										function(xhr,data,textStatus) {
											var jsonObj = $.parseJSON(data);
											if (jsonObj.code != 1){
												alert(jsonObj.msg);
												return
											}
											alert(jsonObj.msg);
											doc.close();											
										}
									)
							}
	}		

,	edit 	: {	text 	: "편집", highlight : false
			,	click	:	function(doc) {
								doc.edit();
							}
	}
,	del		: {	text 	: "삭제", highlight : false
			,	click	: function(doc) {
							request.deleteDocument(request.getParam(), function(data){
								request.returnData(data, "삭제");
							});
						}
	}
,	test : { text	: "test", highlight : false
			,	click	: function(doc){
							var id = doc.getOption('id');
							var path = doc.getOption('dbpath');
							var url = new GF.CURL("/" + path + "/excel_down?openform");
							GF.load("#"+id,url.url);	
						}
	}
,	excel_down : { text	: "다운로드", highlight : false
			,	click	: function(doc){
							var obj = GC.active(true);
							
							var sYear = doc.getField("StartYear");
							var sMonth =  doc.getField("StartMonth");
							var eYear = doc.getField("EndYear");
							var eMonth = doc.getField("EndMonth");
							
							if(confirm(sYear + "년 " + sMonth + "월부터 ~ " + eYear + "년 " + eMonth + "월까지의 데이터를 엑셀파일로 다운로드 하시겠습니까?")){
								if(parseInt(sYear, 10) > parseInt(eYear, 10)){
									alert("기간을 잘 못 입력 하셨습니다.");
									return;
								}else if(parseInt(sYear, 10) == parseInt(eYear, 10)){
									if(sMonth > eMonth){
										alert("기간을 잘 못 입력 하셨습니다.");
										return;
									}
								}
							}else{
								return;
							}
							
							var url = new GF.CURL({
									base		: "/"+doc.getOption("dbpath")+"/(gt_xcl)?openagent"
								,	sym		: sYear+"-"+sMonth
								,	eym		: eYear+"-"+eMonth
								,	filename 	: "BRQuality"
								,	applcode : doc.getOption("applcode")
							});
						
							ws4710.excelDownload(obj,url.url);
						}
	}
,	request 	: {	text 	: "신청", highlight	: true	
				,	click	: function(doc) {
								if(!ws4710.validation(doc)) return;
								if(request.request()){
									doc.submit(
										function(xhr,data,textStatus) {
											request.returnData(data, "신청");
										}
									);
								}
							}
	}
,	approve 	: {	text 	: "승인", highlight	: true
				,	click	: function(doc) {
								ws4710.callApprove(doc, "approve", "승인");
							}
	}
,	reject : { text : "반려", highlight : false
			, click		: function(doc){
							ws4710.callApprove(doc, "reject", "반려");
						}
	}
,	complete 	: {	text 	: "처리완료", highlight	: true
				,	click	: function(doc) {
								ws4710.callApprove(doc, "complete", "처리완료");
							}
	}
,	revise : { text : "보완요청", highlight : false
			, click		: function(doc){
							ws4710.callApprove(doc, "revise", "보완요청");
						}
	}

,	request_r1 : { text : "신청", highlight : true
				,	click	: function(doc){
								//*
								var apprlist = $("input[name=ApprList]", doc.formElement);
								var sel_data = $("#reqcomboR2 option:selected", doc.formElement);
								var tmp = apprlist.val().split(";");
								tmp[2] = sel_data.val();
								if(sel_data.index() == 0){
									alert("담당부서 > 승인자 를 지정하십시오.");
									return false;
								}
								apprlist.val(tmp.join(";"));
								doc.submit(
										function(xhr,data,textStatus) {
											request.returnData(data, "승인/신청");
										}
									);
								//*/
							}
	}

,	set_r2 : { text : "편집"
			, click		: function(doc){
						//doc.edit();
						var id = doc.getOption('id');
						var path = doc.getOption('dbpath');
						var unid = doc.getOption("unid");
						var url = "/" + path + "/0/"+unid+"?editdocument";
						GF.load("#"+id,url);	
					}
	}
} 

ws4710.callApprove = function (doc, param, tag, callback){
	request.approve(
		param
	,	callback || function (data){
			request.returnData(data, tag);
		}
	);
}

ws4710.formInit = function(opts) {
	
	var act = $(GC.active(true)); 
	
	opts.buttons = ws4710.formButtons;
	opts.htitle = ws4710.title;
	
 	act.doc(opts);
 	
 	ws4710.sectionControl();
 	
 	ws4710.qualityDateSet(act);
 	
 	
}

ws4710.excelFormInit = function(opts){
	var act = $(GC.active(true)); 
	opts.buttons = ws4710.formButtons;
	opts.htitle = ws4710.title;
	act.doc(opts);
}
                  
ws4710.excelDownload = function(obj,url){
	$("#ifrmExcelDownload",obj).remove();

	var ifrm = $("<iframe>")
	.attr("id","ifrmExcelDownload")
	.attr("frameborder","0")
	.css({"width":"0px"},{"height":"0px"})
	.attr("src",url)
	.appendTo(obj);
}

ws4710.qualityDateSet = function(act){
	// 측정항목 1번
	var item1_1 = $("input:radio[name*='QVItem1']", act).filter(function(idx){return idx < 15});
	var item1_2 = $("input:radio[name*='QVItem1']", act).filter(function(idx){return idx > 14});
	var field1_1 = $("input[name*='QValue1']", act).filter(function(idx){return idx < 5});
	var field1_2 = $("input[name*='QValue1']", act).filter(function(idx){return idx > 4});
	// 측정항목 2번	
	var item2_1 = $("input:radio[name*='QVItem2']", act).filter(function(idx){return idx < 18});
	var item2_2 = $("input:radio[name*='QVItem2']", act).filter(function(idx){return idx > 17});
	var field2_1 = $("input[name*='QValue2']", act).filter(function(idx){return idx < 6});
	var field2_2 = $("input[name*='QValue2']", act).filter(function(idx){return idx > 5});
	// 측정항목 3번
	var item3_1 = $("input:radio[name*='QVItem3']", act).filter(function(idx){return idx < 6});
	var item3_2 = $("input:radio[name*='QVItem3']", act).filter(function(idx){return idx > 5});
	var field3_1 = $("input[name*='QValue3']", act).filter(function(idx){return idx < 2});
	var field3_2 = $("input[name*='QValue3']", act).filter(function(idx){return idx > 4});
	
	//EventSetting
	ws4710.qualityEventSet(act, item1_1, item1_2, field1_1, field1_2);
	ws4710.qualityEventSet(act, item2_1, item2_2, field2_1, field2_2);
	ws4710.qualityEventSet(act, item3_1, item3_2, field3_1, field3_2);
	/*
	ws4710.calcQualityValue();
	// */
}

ws4710.qualityEventSet = function(act, radioObj, radioObj2, fieldObj, fieldObj2){
	var doc = act.doc();
	var tot = 0;
	var defValObj2 = fieldObj2[0].value;
	
	fieldObj.each(function(i, v){
		tot += parseFloat(v.value);
	});
	
	radioObj.click(function(){
		var countNA = 0;
		var avgValue = 0;
		
		/* get countNA case 1
		radioObj.each(function(i, v){
			if(radioObj[i].checked == true & v.value == "NA"){
				countNA += 1;
			}
		});
		//*/
		
		//* get countNA case 2
		countNA += $(radioObj.filter(function(idx){
			return (radioObj[idx].value == "NA" & radioObj[idx].checked);}
		)).length
		//*/
		
		
		if(countNA < radioObj.length/3){
			avgValue = ws4710.round(tot / (radioObj.length/3 - countNA), 1);
		}
		
		fieldObj.each(function(i, v){
			if(doc.getField("QVItem"+fieldObj[i].name.right(2)) == "Y"){
				$(this).val(avgValue);
			} else {
				$(this).val(0);
			}
		});
		ws4710.calcQualityValue();
	});
	
	radioObj2.click(function(idx){
		if($(this)[0].value == "Y"){
			doc.setField("QValue"+$(this)[0].name.right(2), defValObj2);
		} else {
			doc.setField("QValue"+$(this)[0].name.right(2), 0);
		}
		ws4710.calcQualityValue();
	});	
	
}

ws4710.calcQualityValue = function(){
	var act = GC.active(true);
	var doc = act.doc();
	var tmpTotQValue1 = 0;
	var tmpTotQValue2 = 0;
	var tmpTotQValue3 = 0;
	var tmpTotQValue4 = 0;
	var tmpTotQValue = 0;
	var chk_count = 0;
	
	for(var i=1; i<=3; i++){
		
		if(i == 1 || i == 3) chk_count = 7;
		else chk_count = 8;
		
		for(var j=1; j<=chk_count; j++){
			if(i == 1){
				if(j == 6 || j == 7){
					tmpTotQValue4 += parseFloat(doc.getField("QValue"+i+j));
				}else{
					tmpTotQValue1 += parseFloat(doc.getField("QValue"+i+j));
				}
			}else if(i == 2){
				if(j == 7 || j == 8){
					tmpTotQValue4 += parseFloat(doc.getField("QValue"+i+j));
				}else{
					tmpTotQValue2 += parseFloat(doc.getField("QValue"+i+j));
				}
			}else if(i == 3){
				if(j == 6 || j == 7){
					tmpTotQValue4 += parseFloat(doc.getField("QValue"+i+j));
				}else{
					tmpTotQValue3 += parseFloat(doc.getField("QValue"+i+j));
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
	doc.setField("TotQValue", ws4710.round(tmpTotQValue, 0));


//	function round(val, precision) { 
//		val = val * Math.floor(10, precision); 
//	 	val = Math.round(val); 
//	  	return val / Math.floor(10, precision); 
//	} 
	
	
}

ws4710.round = function(val, precision){
	val = val * Math.floor(10, precision); 
 	val = Math.round(val); 
  	return val / Math.floor(10, precision); 
}

ws4710.reWrite = function(action, doc){
	if(!confirm( action+"된 문서를 재작성 하시겠습니까?")) return;
	var opt = {
			base 		: "/" + doc.getOption("dbpath") + "/(rwt)?openagent"
		,	docid 		: doc.getOption("unid")
		,	applcode : doc.getOption("applcode")
	}
	var url = new GF.CURL(opt);
	GF.ajax({
		url : url.url
		,dataType: "text"
		,type : "GET"
		,async : false
		,cache : false
		,success : function(data,textStatus,xhr) {
			var jobj = $.parseJSON(data);
			if(jobj.bflag == false){
				alert(jobj.msg);
				return;
			} else {
				var unid = jobj.msg;
				var objUrl = new GF.CURL({ 
						base : "/"+doc.getOption("dbpath")+"/0/"+unid+"?editDocument"
				});
				GF.load(GC.active(true),objUrl.url);
			}
		}
		,error : function(xhr,textStatus) {
			GF.log("load error",textStatus);
			return;
		} 
	});
}

ws4710.viewInit = function(opts, viewOpt) {
	opts.view = typeof viewOpt === "undefined" ? ws4710.getViewHeader(opts.viewalias) : viewOpt;
	opts.buttons = ws4710.viewButtons[opts.viewalias];		
	opts.htitle = ws4710.title;									
	opts.search = ws4710.getViewSearch(opts.viewalias);	
	
	ws4710.viewInitThis(opts);
	
 	$(GC.active(false)).viewform(opts); 
}

ws4710.viewInitThis = function(opts){
	if (opts.viewalias == "myproc") {
		opts.view.category = opts.user
		opts.view.sortdfkey = "3"
		opts.view.sortdfkind = "des"
		opts.querysingle = "[ActionUsers]Contains\""+GF.notesName(opts.user, "ou2")+"\""
	} else {
		opts.view.category = opts.year
		opts.view.sortdfkey = "3"
		opts.view.sortdfkind = "des"
		opts.querysingle = "[FYField]=\""+opts.year+"\""
	} 
}

ws4710.viewButtons = {
		complete :{
				excel : {	text 	: "엑셀 다운로드", highlight	: true	
				,	click	: function(viewform) {
								var obj = GC.active(false);
								var filename = "UniformExcelData"
								var applcode = viewform.getOption("applcode");
								var key = viewform.getOption("year")
								var url = new GF.CURL({ base : "/" + viewform.getOption("dbpath") + "/excl_dwnld?openagent"
									,	filename 	: filename
									,	applcode : applcode
									,	key		:  key })
								//*
								$("#ifrmExcelDownload",obj).remove();
								var ifrm = $("<iframe>")
								.attr("id","ifrmExcelDownload")
								.attr("frameborder","0")
								.css({"width":"0px"},{"height":"0px"})
								.attr("src",url.url)
								.appendTo(obj);
								//ifrm.remove();
								//*/
							}
						}
		}
}

ws4710.getViewSearch = function(viewname) {
	var searchcond = {
		myproc:[
		          {value : "ALL", 				text : "전체" }
		          ,{value :"Subject", 			text :"제목"}
		          ,{value :"KorName", 		text :"신청자" }
		]	
		,complete:[
		          {value : "ALL", 				text : "전체" }
		          ,{value :"Subject", 			text :"제목"}
		          ,{value :"KorName", 		text :"신청자" }
		]
	}
	switch(viewname) {
	case "myproc":
		return searchcond[viewname];
	case "complete":
		return searchcond[viewname];
	}
}

ws4710.getViewHeader = function(viewname) {
	var columns = {
		myproc: 
			[
			 	{ 
			 		key : 0
			 		,title : "제&nbsp;&nbsp;목"
			 		,css : "column-subject"
			 	}
				,{ 
					key : 1
					,title : "신청자"
					,css : "column-author"
					,sort : { enable:true, type : "all" , vn_asc:"myproc_writer_asc" , vn_des:"myproc_writer_des" }
				}
				,{ 
					key : 2
					,title : "신청부서"
					,css : {"width":"15%"} 
					,headerrender:function(data, elem, view){
						elem.css({"text-align":"center"})
					}
					,columnrender:function(data, elem){
						elem.css({"text-align":"center"})
					}
				}
				,{ 
					key : 3
					,title : "완료일"
					,css : "column-date"
					,sort : { enable:true, type : "all" , vn_asc:"myproc_date_asc" , vn_des:"myproc" }
					,headerrender: function(data,elem,view) { 
						elem.css( { "text-align":"center", "padding-right":"10px" } ) 
					}
					,columnrender: function(data, elem) { 
						elem.css( { "text-align":"center","padding-right":"10px" } ) 
					}
				}				
			]
		,complete: 
			[
			 	{ 
			 		key : 0
			 		,title : "제&nbsp;&nbsp;목"
			 		,css : "column-subject"
			 	}
				,{ 
					key : 1
					,title : "신청자"
					,css : "column-author"
					,sort : { enable:true, type : "all" , vn_asc:"complete_writer_asc" , vn_des:"complete_writer_des" }
				}
				,{ 
					key : 2
					,title : "신청부서"
					,css : {"width":"15%"} 
					,headerrender:function(data, elem, view){
						elem.css({"text-align":"center"})
					}
					,columnrender:function(data, elem){
						elem.css({"text-align":"center"})
					}
				}
				,{ 
					key : 3
					,title : "완료일"
					,css : "column-date"
					,sort : { enable:true, type : "all" , vn_asc:"complete_date_asc" , vn_des:"complete" }
					,headerrender: function(data,elem,view) { 
						elem.css( { "text-align":"center", "padding-right":"10px" } ) 
					}
					,columnrender: function(data, elem) { 
						elem.css( { "text-align":"center","padding-right":"10px" } ) 
					}
				}				
			]

	}
	
	var viewOpt = {
		onselect : 
			function(data,element,view) {  //data,element
				view.openDocument(data.unid);
			}  
		,showcheckbox : false
		,showheader : true			//default : true
		,shownavigator : true		//default : true
		,simpleview : false
		,rowrender : null 			//data,emement
		,columns : null
	} 

	switch(viewname) {
	case "myproc": 
		viewOpt.columns = columns[viewname];
		break;
	case "complete":
		viewOpt.columns = columns[viewname];
		break;
	default:
		
	}
	return viewOpt;
}


ws4710.sectionControl = function(){
	$(".section_close,.section_open", GC.active(true)).each(function(){
		$(this).click(function(){
			$(this).attr("class")=="section_close" ?
				$(this).attr("class","section_open").next("#section").show() : $(this).attr("class","section_close").next("#section").hide()
		}).attr("class")=="section_close"?$(this).next("#section").hide():""
	});
}

ws4710.validation = function(doc){
	var act = doc.formElment;
	if($("input[name='InputName']", act).val() == ""){
		alert("성명을 입력하십시오.");
		return false;
	} else if ($("input[name='InputDept']", act).val() == "") {
		alert("소속을 입력하십시오.");
		return false;
	} else if ($("input[name='InputData6']", act).val() == "") {
		alert("허리사이즈를 입력하십시오.");
		return false;
	} else if ($("input[name='InputData11']", act).val() == "") {
		alert("기성복사이즈를 입력하십시오.");
		return false;
	} else {
		return true;
	}
}

