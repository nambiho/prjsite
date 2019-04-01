function ws4709() { }
ws4709.title = {
		custom_disuse	: "고객정보폐기"
	,	complete			: "처리완료"
	,	confirm			: "처리중/확인중"
}

ws4709.formButtons = {
	addButtons : function(btnName, obj){
		$(this).attr(btnName, obj);
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
,	disuse 	: {	text 	: "고객정보폐기", highlight	: true
				,	click	: function(doc) {
								ws4709.callApprove(doc, {action:"disuse", commentflag:true}, "승인");
							}
	}
,	confirm	: {	text	: "확인", highlight : true
				,	click	: function(doc){
								ws4709.callApprove(doc, {action : "confirm", commentflag : true }, "확인");
							}
	}
} 

ws4709.callApprove = function (doc, param, tag, callback){
	request.approve(
		param
	,	callback || function (data){
			request.returnData(data, tag);
		}
	);
}

ws4709.formInit = function(opts) {
	ws4709.contentName = opts.req_subject;
	ws4709.title.requestTitle = request.profile.reqTitle;
	
	opts.buttons = ws4709.formButtons;
	opts.htitle = ws4709.title;
	
	ws4709.formInitThis(opts);
	
 	$(GC.active(true)).doc(opts);
}

ws4709.formInitThis = function(opts){
	var act = GC.active(true);
	if ( opts.isedit == "1" ) ws4709.sectionControl(act);

	ws4709.disuseObj = GF.getValue("disuseObj", act);
	ws4709.dspReqInfo = GF.getValue("dspReqInfo", act);
	
	if ( opts.docStatus != "COMPLETE" ){
		request.apprInfo.apprList = ws4709.dspReqInfo.DspApprList;
		request.profile.linerecord = ws4709.dspReqInfo.DspLineRecord;
		request.profile.reqLineRecord = ws4709.dspReqInfo.DspLineJson;
	}
	request.drawLine();

	if ( ws4709.disuseObj.IsDuplicate == "1" ) {
		var dupInfo = ws4709.disuseObj.DupAprvInfo.split(",");
		ws4709.generateDupAction(dupInfo);
	} 
	ws4709.setDisuseObj();
}

ws4709.generateDupAction = function(dupInfo){
	for ( i = 0; i < dupInfo.length; i++ ) ws4709.formButtons.addButtons("confirm"+i, _createAction(dupInfo[i]));
	function _createAction(dupInfo){
		var _dupInfo = dupInfo.split(GC.site.fieldsep)
		var returnAction = { text : _dupInfo[0]+" 확인", highlight : true
								,	click : function(doc){
										ws4709.disuseObj.DupKey = _dupInfo[1];
										ws4709.setDisuseObj(ws4709.disuseObj);
										ws4709.callApprove(doc, {action : "confirm", commentflag : true }, "확인");
									}
								}
		return returnAction;
	}
}

ws4709.setDisuseObj = function(disuseObj){
	if ( disuseObj == null ){
		request.apprJSON = request.toString(ws4709.disuseObj);
	} else {
		request.apprJSON = request.toString(disuseObj);
	}
}

/*==================View=================*/

ws4709.viewDefaultVal = "ALL";
ws4709.viewDefaultTxt = "전체";
ws4709.eComboTRHeight = 18;				/* eCombo tr 높이 */

/* array unique 처리 */
ws4709.unique = function(arr){
	var _old = $.unique;	 
	if (!!arr[0].nodeType){
		return _old.apply(this,arguments);
	} else {
		return $.grep(arr,function(v,k){
			return $.inArray(v,arr) === k;
		});
	}
};

/* 구분자로 연결된 텍스트값 리스트에서 특정 idx의 값만 추출하여 return 
* ex) srcList=전체^전체, 전체^이지모아, 전체^신계약, sep=^, idx=0 
* 하면 전체 리턴 */
ws4709.getValByIdx = function (srcList, sep, idx) {

	if (typeof srcList[0] == "undefined")	return "";
	
	var arrList = srcList;
	var ValList = $.map ( arrList, function (arr, i) {
		var info = arr.split(sep);		
		return info[idx];
	});	
	
	ValList = ws4709.unique(ValList);	
	return ValList;	
}

/* 구분자로 연결된 텍스트값 리스트에서 key idx의 값이 일치하는 특정 idx의 값만 추출하여 return 
* ex) srcList=전체^이지모아, 가상테스트팀^신계약, 가상테스트팀^법인영업 sep=^, keyidx=0, keyval=가상테스트팀, returnidx=1 
* 하면 신계약, 법인영업 리턴 */
ws4709.getIdxValByKey = function (srcList, sep, keyidx, keyval, returnidx) {

	if (typeof srcList[0] == "undefined")	return "";
	
	var arrList = srcList;
	var ValList = $.map ( arrList, function (arr, i) {
		var info = arr.split(sep);	
		if (info[keyidx] == keyval)	return info[returnidx];
	});	
	if (ValList.length > 0 )	return ValList;	
	else						return	"";
}

//eCombo height 계산하여 return
ws4709.getComboH = function (cnt) {	
	if (cnt > 10) cnt = 10;
	return (cnt * ws4709.eComboTRHeight);	
}

//eCombo용 json데이타에서 가장 긴 문자열을 기준으로 combo사이즈 계산
ws4709.getComboWidth = function(data){
	var maxlength = 0;
	
	for(var i=0;i<data.length;i++){
		var checkbyte = ws4709.byteCheck(data[i].text);
		if(checkbyte > maxlength){	
			maxlength = checkbyte;
		}
	}
	return (maxlength * 6 + 30) + "px";
}

//byte수 계산
ws4709.byteCheck = function(code){
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

//eCombo fieldset용 json 문자열 return
ws4709.getFieldSet = function (srcList, sep, validx, txtidx, defaultVal, defaultTxt) {
	
	if (typeof defaultVal=="undefined")	defaultVal = ws4709.viewDefaultVal;
	if (typeof defaultTxt=="undefined")	defaultTxt = ws4709.viewDefaultTxt;
	
	var arrList = srcList;
	var objList = $.map( arrList, function(arr, i) {
		if (arr != "") {
			if (sep == "" || sep == null) {
				if (arr != defaultVal){
					var returnVal = arr == "ALL" ? {value : arr, text : "전체"} : { value : arr, text : arr }; 
					return returnVal;
				}
			} else {
				var info = arr.split(sep);		
				if (info[validx] != defaultVal){
					var returnVal = arr == "ALL" ? { value : info[validx], text : "전체" } : { value : info[validx], text : info[txtidx] }; 
					return returnVal;
				}
			}
		}
	});
	objList.unshift({ value : defaultVal, text : defaultTxt});
	return objList;	
}

/* 보기 query_single 용 query 생성 다중값은 ,로 연결 */
ws4709.generateQuery = function(query, fieldlist, valuelist) {
	
	if (fieldlist=="")	return query;
	if (valuelist=="" || valuelist==ws4709.viewDefaultVal)	return query;
	
	var fields = fieldlist.split(",");
	var values = valuelist.split(",");
	
	var vf = $(GC.active(false)).viewform();
	var view =vf.getView();
	var viewalias = view.getOption("viewalias");
	
	$.each (fields, function(i, field) {
		if( values[i] != "ALL" ) {
			var this_query = "[" + field + "]=" + values[i];
			query += (query!=""? " AND " : "") + this_query;
		}
	});
	return query;
}

ws4709.ComboInfo = [];
ws4709.useCombo1 = false;
ws4709.SelCombo1 = "";					//선택된 콤보값 1
ws4709.queryField1 = "";					//query 구성용 필드명 1. 다중값이면 필드명은 , 로 연결. 다중category는 _로 연결

ws4709.viewInit = function(opts, viewOpt) {
	opts.view =  typeof viewOpt === "undefined" ? ws4709.getViewHeader(opts.viewalias) : viewOpt; 		/* 보기 컬럼 설계 구조체 */
	ws4709.viewSetValue(opts);
	opts.htitle = ws4709.title;									/* 보기 타이틀 구조체 */
	opts.search = ws4709.getViewSearch(opts.viewalias);		/* 검색 구조체 */
	
 	$(GC.active(false)).viewform(opts);
 	ws4709.viewInitThis(opts);
}

ws4709.viewInitThis = function(opts) {
	var vf = $(GC.active(false)).viewform();
	var view = vf.getView();
	var viewalias = view.getOption("viewalias"); 
	
	switch (viewalias){
	case "confirm" : 
		ws4709.viewDefaultVal = "-";
		ws4709.viewDefaultTxt = "[대상선택]";
		ws4709.useCombo1 = true;
		ws4709.queryField1 = "RequestDate";		//query 구성용 필드명 1. 다중값이면 필드명은 , 로 연결. 다중category는 _로 연결
	
		var selvalue = view.getOption("category");
		ws4709.ComboInfo = opts.categorylist;
		
		if(opts.categorylist == "") ws4709.SelCombo1 = ws4709.viewDefaultVal;					
		else ws4709.SelCombo1 = selvalue;
		
		var rCateVal = ws4709.getValByIdx(ws4709.ComboInfo, GC.site.colsep, 0);
		var fieldset = ws4709.getFieldSet(rCateVal);
		ws4709.drawCombo1(viewalias, fieldset);
		break; 	
		
	case "complete" :
		ws4709.viewDefaultVal = "-";
		ws4709.viewDefaultTxt = "[대상선택]";
		ws4709.useCombo1 = true;
		ws4709.queryField1 = "RequestDate";		
		
		var selvalue = view.getOption("category");
		ws4709.ComboInfo = opts.categorylist;
		ws4709.SelCombo1 = selvalue;					
		
		var rCateVal = ws4709.getValByIdx(ws4709.ComboInfo, GC.site.colsep, 0);		
		var fieldset = ws4709.getFieldSet(rCateVal);
		ws4709.drawCombo1(viewalias, fieldset);
		break;
	}
}

ws4709.viewSetValue = function(opts){
	opts.view.sortdfkey	= "5";
	opts.view.sortdfkind	= "des";
	opts.view.countkind	= "agent";
}

/* 첫번째 콤보박스 표시 */
ws4709.drawCombo1 = function(viewalias, fieldset1) {
	var act = GC.active(false);
		
	var opt_combo = {
			width : ws4709.getComboWidth(fieldset1)
		,	height : ws4709.getComboH(fieldset1.length)
		,	fieldset : fieldset1
		,	selectvalue: ws4709.SelCombo1
		,	onselected: function(data){
				if(data.value != "-")ws4709.changeCombo("combo1");
			}
	}

	$("#select_combo1", act).eCombo("destroy");
	$("#select_combo1", act).eCombo(opt_combo);	
}

/* 보기에서 콤보박스 선택값 변경 시 */
ws4709.changeCombo = function (kind){
	
	var vf = $(GC.active(false)).viewform();
	var view = vf.getView();
	var viewalias = view.getOption("viewalias");

	switch (kind) {
	case "combo1" : 	//SelCombo1 변경. combo2 콤보 다시 표시.
		ws4709.SelCombo1 = $("#select_combo1", GC.active(false)).eCombo().getValue();
		break;
	}
	
	//위에서는 콤보박스만 처리하고 여기에서 실제 보기 데이터 처리		
	var query_single=""; var catval = "";

	if(ws4709.useCombo1){
		var selCombo1 = ws4709.SelCombo1;
		catval += (catval==""?"":GC.site.colsep) + selCombo1;
		query_single = ws4709.generateQuery(query_single, ws4709.queryField1, selCombo1);	
	}
	
	vf.setOptions({"querysingle":query_single});
	view.setOptions({"category": catval});		
	view.refresh("all");					
}

//-------------------------------------- //View 관련 함수 ------------------------ //

ws4709.getViewSearch = function(viewname) {
	var searchcond = {
		standard:[
		          {value :"Subject", 			text :"제목"}
		          ,{value :"KorName", 		text :"인수자" }
		]
	}
	switch(viewname) {
	case "complete":
	case "confirm":
		return searchcond["standard"];
	}
}

ws4709.getViewHeader = function(viewname) {
	var columns = {
		complete: 
			[
			 	{
			 		key : 0
			 		,title : "문서번호"
			 		,css : {"width":"10%"}
					,headerrender:function(data, elem, view){
						elem.css({"text-align":"center"})
					}
					,columnrender:function(data, elem){
						elem.css({"text-align":"center"})
					}
			 	}
			 	,{ 
			 		key : 1
			 		,title : "제&nbsp;&nbsp;목"
			 		,css : "column-subject"
			 	}
				,{ 
					key : 2
					,title : "인수자"
					,css : "column-author"
					,sort : { enable:true, type : "all" , vn_asc:"complete_writer_asc" , vn_des:"complete_writer_des" }
				}
				,{ 
					key : 3
					,title : "부서"
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
					,title : "문서상태"
					,css : {"width":"10%"}
					,headerrender:function(data, elem, view){
						elem.css({"text-align":"center"})
					}
					,columnrender:function(data, elem){
						elem.css({"text-align":"center"})
					}
				}
				,{
					key : 5
					,title : "폐기일"
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
			,confirm: 
				[
				 	{
				 		key : 0
				 		,title : "문서번호"
				 		,css : {"width":"10%"}
						,headerrender:function(data, elem, view){
							elem.css({"text-align":"center"})
						}
						,columnrender:function(data, elem){
							elem.css({"text-align":"center"})
						}
				 	}
				 	,{ 
				 		key : 1
				 		,title : "제&nbsp;&nbsp;목"
				 		,css : "column-subject"
				 	}
					,{ 
						key : 2
						,title : "인수자"
						,css : "column-author"
						,sort : { enable:true, type : "all" , vn_asc:"confirm_writer_asc" , vn_des:"confirm_writer_des" }
					}
					,{ 
						key : 3
						,title : "부서"
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
						,title : "문서상태"
						,css : {"width":"10%"}
						,headerrender:function(data, elem, view){
							elem.css({"text-align":"center"})
						}
						,columnrender:function(data, elem){
							elem.css({"text-align":"center"})
						}
					}
					,{
						key : 5
						,title : "폐기예정일"
						,css : "column-date"
						,sort : { enable:true, type : "all" , vn_asc:"confirm_date_asc" , vn_des:"confirm" }
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
	case "complete":
		viewOpt.columns = columns[viewname];
		break;
	case "confirm":
		viewOpt.columns = columns[viewname];
		break;
	default:
		
	}
	return viewOpt;
}


ws4709.sectionControl = function(act){
	$(".section_close,.section_open", act).each(function(){
		$(this).click(function(){
			$(this).attr("class")=="section_close" ?
				$(this).attr("class","section_open").next("#section").show() : $(this).attr("class","section_close").next("#section").hide()
		}).attr("class")=="section_close"?$(this).next("#section").hide():""
	});
}