function ws4711() { }
ws4711.contentName = "공지사항"; 
ws4711.title = {
	theme: "공지사항"
	,vm_notice: "공지사항"
}

ws4711.formButtons = {
	register	: {	text 	: "등록", highlight	: true	
		,	click	: function(doc) {
			doc.setField("Action", "register");
			if(!ws4711.validation(doc)) return;
			doc.submit(
				function(xhr,data,textStatus) {
					var jobj = $.parseJSON(data);
					if(jobj != null) {
						if(jobj.code==1) {
						} else {
							alert(jobj.value);
						}
						doc.close();
					} else {
						alert("JSON Parsing error !");
					}
				}
			);
		}
	}
	,	save	: {	text 	: "저장", highlight	: true	
		,	click	: function(doc) {
			doc.setField("Action", "save");
			if(!ws4711.validation(doc)) return;
			doc.submit(
				function(xhr,data,textStatus) {
					var jobj = typeof data === "string" ? $.parseJSON(data) : data;
					if(jobj != null) {
						if(jobj.code==1) {
						} else {
							alert(jobj.value);
						}
						doc.close();
					} else {
						alert("JSON Parsing error !");
					}
				}
			);
		}
	}
	,	edit 	: {	text 	: "편집",	highlight: false
		,	click	: function(doc) {
			doc.edit();
		}
	}
	,	del		: {
		text 	: "삭제", highlight: false
		,	click	: function(doc) {
			doc.deleteDocument();
			return;
		}
	}
	,	resdoc : {	
		text : "질의", highlight : true
		, 	click : function(doc) {
			var rdoc = {"dbpath" : doc.getOption("dbpath"), "fname" : "question", "unid" : doc.getOption("unid")};			
			doc.responsedoc(rdoc, "");
		}
	}	
}

ws4711.formTabs = [
	{
		tabsid : "frm_reference_area"
		,type : "cust"
		,tabs : {
			tab3 : {
				text : "질의/응답 리스트"
				, firsttab : true
				, disid : "lay_tab_3"
				, countfunc : function(doc , _countid ) {
					doc.responseList("" , _countid);
				}
				, click : function(doc , _displayid , _tabobj) {
					doc.responseList(_displayid , _tabobj.countid);
				}
			}
		}
	}
]

ws4711.formInit = function(opts) {
	opts.buttons = ws4711.formButtons; 
	opts.htitle = ws4711.title;
	opts.tabs = ws4711.formTabs;
	$(GC.active(true)).doc(opts);
	
	$("input[name='PopupNotice']", active).bind("click", function(){
		if($(this).is(":checked")){
			$("input[name='IsChk']", active).val("1");
		}else{
			$("input[name='IsChk']", active).val("0");
		}
	});
} 

ws4711.viewInit = function(opts) {
	opts.view = typeof viewOpt === "undefined" ? ws4711.getViewHeader(opts.viewalias) : viewOpt;
	opts.buttons = ws4711.viewButtons[opts.viewalias]; /* 버튼 설계 구조체 */
	opts.htitle = ws4711.title;									/* 보기 타이틀 구조체 */
	opts.search = ws4711.viewSearch[opts.viewalias];	/* 검색 구조체 */
 	ws4711.drawCategory(opts);
 	
 	$(GC.active(false)).viewform(opts); 
}

ws4711.drawCategory = function(opts){
	opts.view.category = opts.category;
	opts.view.sortdfkey = "4";
	opts.view.sortdfkind = "des";	
	
	var fieldset = ws4711.getFieldSet(opts.categorylist.split(","));
	var selcombo = opts.category.trim();
	var queryField = "ProblemType";
	var opt = {
		width: ws4711.getComboWidth(fieldset)
		,height : ws4711.getComboHeight(fieldset.length, 18)
		,fieldset: fieldset
		,selectvalue: selcombo
		,onselected: function(data) {
			var vf = $(GC.active(false)).viewform();
			var view = vf.getView();
			var query_single = "";
			//*
			if(fieldset[1].text == undefined){
				alert("문서가 없습니다.")
				return;
			}
			if(!selcombo=="" || !selcombo=="all"){
				query_single = "[" + queryField + "]=" + data.value.trim(); 
			}
			vf.setOptions({"querysingle":query_single});		
			view.setOptions({"category": data.value.trim()});		
			view.refresh("all");
		}
	}
	$("#category", GC.active(false)).eCombo(opt);
}

//eCombo fieldset용 json 문자열 return
ws4711.getFieldSet = function (srcList) {
	var arrList = srcList;
	var objList = $.map( arrList, function(arr, i) {
		if (arr.trim() != "all") return { value : arr.trim(), text : arr };
	});
	objList.unshift({ value : "all", text : "[--전체--]"});
	return objList;
}

ws4711.getComboHeight = function (cnt, trHeight) {	
	if (cnt > 10) cnt = 10;
	return (cnt * trHeight);	
}

//eCombo용 json데이타에서 가장 긴 문자열을 기준으로 combo사이즈 계산
ws4711.getComboWidth = function(data){
	var maxlength = 0;
	
	for(var i=0;i<data.length;i++){
		var checkbyte = ws4711.byteCheck(data[i].text);

		if(checkbyte > maxlength){	
			maxlength = checkbyte;
		}
	}
	
	return (maxlength * 6 + 30) + "px"
}

//byte수 계산
ws4711.byteCheck = function(code){
	var val = code;
	// 입력받은 문자열을 escape() 를 이용하여 변환한다.
	// 변환한 문자열 중 유니코드(한글 등)는 공통적으로 %uxxxx로 변환된다.
	var temp_estr = escape(val);
	var s_index   = 0;
	var e_index   = 0;
	var temp_str  = "";
	var cnt       = 0;

	// 문자열 중에서 유니코드를 찾아 제거하면서 갯수를 센다.
	while ((e_index = temp_estr.indexOf("%u", s_index)) >= 0)  // 제거할 문자열이 존재한다면
	{
	  temp_str += temp_estr.substring(s_index, e_index);
	  s_index = e_index + 6;
	  cnt ++;
	}

	temp_str += temp_estr.substring(s_index);
	temp_str = unescape(temp_str);  // 원래 문자열로 바꾼다.

	// 유니코드는 2바이트 씩 계산하고 나머지는 1바이트씩 계산한다.
	return ((cnt * 2) + temp_str.length) ;
}

ws4711.viewButtons = {
	vm_notice:{
			create:	{	text: "작성",	highlight : true,	click: function(viewform){
						viewform.createDocument("notice");
					}
			}
	}			
}

ws4711.viewSearchDefault =	[
	       {value : "ALL", 				text : "전체" }
	       ,{value :"subject", 			text : "제목"}
	       ,{value :"Writer", 				text : "작성자" }
	       ,{value: "subject:body", 		text : "제목 + 본문"}
	]
	
ws4711.getViewHeader = function(viewname) {
	var columns = {
		vm_notice: 
			[
				{ 
			 		key : 0
			 		,type : {"type":"icon", "kind":"file"}
			 	}
			 	,{ 
			 		key : 1
			 		,title : "제&nbsp;&nbsp;목"
			 		,css : "column-subject"	 					 		
			 	}
				,{ 
					key : 2
					,title : "작성자"
					,css : "column-author"
					//,sort : { enable:true, type : "all" , vn_asc:"myproc_writer_asc" , vn_des:"myproc_writer_des" }			 							
				}
				,{ 
					key : 3
					,title : "부&nbsp;&nbsp서"
					,css : {"width":"15%"} 
					,headerrender:function(data, elem, view){
						elem.css({"text-align":"center"})
					}
					,columnrender:function(data, elem){
						elem.css({"text-align":"center"})
					}
				}
				,{ 
					key : 4
					,title : "게시일"
					,css : "column-date"
					//,sort : { enable:true, type : "all" , vn_asc:"myproc_date_asc" , vn_des:"myproc" }
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
		,simpleview : true
		,rowrender : null 			//data,emement
		,columns : null
	} 

	switch(viewname) {
	case "vm_notice": 
		viewOpt.columns = columns[viewname];
		break;
	default:
	}
	return viewOpt;
}

ws4711.viewSearch ={
	vm_notice : ws4711.viewSearchDefault
}

ws4711.OpenView = function(doc,view) {
	var id = doc.getOption('id');
	var path = doc.getOption('dbpath');
	var url = "/" + path + "/openview?readform&view=" + view + "&count="+GC.site.rowsperpage;
	GF.load("#"+id,url);	
}

ws4711.validation = function(doc){
	var act = doc.formElment;
	if($("input[name='Subject']", act).val() == ""){
		alert("제목을 입력하여 주십시오.");
		return false;
	}else {
		return true;
	}
}

function ws4711res() {}

ws4711res.title = {
		question		: "질의"
	,	answer		: "답변"
}


ws4711res.formButtons = {
	register : { text 	: "등록", highlight : true
			,	click	:	function(doc) {
								doc.setField("Action", "register");
								doc.submit( function(xhr,data,textStatus) {
									var jobj = $.parseJSON(data);
									if(jobj != null) {
										if(jobj.code!=1) {
											alert(jobj.value);
											return;
										}	
										doc.close();
									}else{
										alert("JSON Parsing error !");
									}							
								})
							}
	}
,	save : { text 	: "저장", highlight : true
			,	click	:	function(doc) {
								doc.setField("Action", "save");
								doc.submit( function(xhr,data,textStatus) {
									var jobj = $.parseJSON(data);
									if(jobj != null) {
										if(jobj.code!=1) {
											alert(jobj.value);
											return;
										}	
										doc.close();
									}else{
										alert("JSON Parsing error !");
									}							
								})
							}
	}								
,	edit 	: {	text 	: "편집", highlight : false
			,	click	:	function(doc) {
								doc.edit();
							}
	}
,	del		: {	text 	: "삭제", highlight : false
			,	click	: function(doc) {
							doc.deleteDocument();
						}
	}
,	resdoc : {	text : "답변", highlight : true
			, 	click : function(doc) {
							var rdoc = {"dbpath" : doc.getOption("dbpath"), "fname" : "answer", "unid" : doc.getOption("unid")};
							doc.responsedoc(rdoc, "");
						}
	}

} 

ws4711res.formInit = function(opts) {
	opts.buttons = ws4711res.formButtons;
	opts.htitle = ws4711res.title;
	opts.tabs = ws4711.formTabs;
	
	$(GC.active(true)).doc(opts);
}
