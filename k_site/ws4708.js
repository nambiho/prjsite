function ws4708() { }

ws4708.title = {
		reqestTitle : ""
	,   changedate :"완료예정일 사후 변경"
	,	writing : "완료예정일 사후 변경(작성중)"
	,	ingreject : "완료예정일 사후 변경(결재중/반려중)"
	,	complete : "완료예정일 사후 변경(처리완료)"
}
 
ws4708.formButtons = {
	draft 	: {	
		text 	: "임시저장"
	,	click	: function(doc) {
			if(request.draftDocument()){
				doc.submit(
					function(xhr,data,textStatus) {
						request.returnData(data);
					}
				)
			}
		}
	}
,	request 	: {	
		text 	: "신청", highlight	: true	
	,	click	: function(doc) {
			if(request.request()){
				if (ws4708.validation(doc)) {
					if ( confirm("신청하시겠습니까?")) {
						doc.submit( function(xhr,data,textStatus) {
							request.returnData(data);
						});
					}
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
						alert(jobj.msg.replace(/\\n/gi,"\n"));
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
			ws4708.callApprove(doc, "approve", "승인");
		}
	}
,	reject 	: {	
		text 	: "반려"
	,	click	: function(doc) {
			if(!confirm("반려하시겠습니까?")) return;
			ws4708.callApprove(doc, "reject", "반려");
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

ws4708.callApprove = function (doc, param, tag, callback){
	request.approve(
		param
	,	callback || function (data){
			request.returnData(data, tag);
		}
	);
}

ws4708.formInit = function(opts) {
	var act = GC.active(true);
	
	ws4708.contentName = opts.req_subject;
	ws4708.title.requestTitle = request.profile.reqTitle;
	
	opts.buttons = ws4708.formButtons; 
	opts.htitle = ws4708.title;
	$(act).doc(opts); 
	
	if(opts.formname == "changedate_it" && opts.isnewnote == "1"){
		ws4708.setReqLine(opts.sitemng, act);
	}
 	ws4708.sectionControl();
 	ws4708.changeField();
}

ws4708.setReqLine = function(sitemng, act){
	var tmpmng = sitemng.split("{`");
	//현업담당자
	$("#reqinputH1", act)
	.val(tmpmng[0] + " " + tmpmng[2] + " " + tmpmng[3])
	.attr("userinfo",sitemng);
}

ws4708.sectionControl = function(){
	$(".section_close,.section_open", GC.active(true)).each(function(){
		$(this).click(function(){
			$(this).attr("class")=="section_close" ?
				$(this).attr("class","section_open").next("#section").show() : $(this).attr("class","section_close").next("#section").hide()
		}).attr("class")=="section_close"?$(this).next("#section").hide():""
	});
}

ws4708.validation = function(doc){
	var $form = doc.formElement();
	
	if(doc.getField("Subject").trim() == ""){
		alert("제목을 입력하세요.");
		$("input[name='Subject']", $form).focus();
		return;
	}
	if(doc.getField("Content").trim() == ""){
		alert("본문을 입력하세요.");
		$("textarea[name='Content']", $form).focus();
		return;
	}
	return true;
}

ws4708.changeField = function(){	
	var act = GC.active(true);
	var obj = $("input[name^=ChangeCheck]",act); 
	
	obj.click(function(){
		$("#chg"+$(this)[0].name.right(1) , act).toggle();
	});
}

/*==================View=================*/

ws4708.viewDefaultVal = "ALL";
ws4708.viewDefaultTxt = "전체";

ws4708.eComboTRHeight = 18;				/* eCombo tr 높이 */

/* array unique 처리 */
ws4708.unique = function(arr){
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
ws4708.getValByIdx = function (srcList, sep, idx) {
	
	if (typeof srcList[0] == "undefined")	return "";
	
	var arrList = srcList;
	var ValList = $.map ( arrList, function (arr, i) {
		var info = arr.split(sep);		
		return info[idx];
	});	
	ValList = ws4708.unique(ValList);
	ValList.sort();		
	return ValList;	
}

/* 구분자로 연결된 텍스트값 리스트에서 key idx의 값이 일치하는 특정 idx의 값만 추출하여 return 
* ex) srcList=전체^이지모아, 가상테스트팀^신계약, 가상테스트팀^법인영업 sep=^, keyidx=0, keyval=가상테스트팀, returnidx=1 
* 하면 신계약, 법인영업 리턴 */
ws4708.getIdxValByKey = function (srcList, sep, keyidx, keyval, returnidx) {
	
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
ws4708.getComboH = function (cnt) {	
	if (cnt > 10) cnt = 10;
	return (cnt * ws4708.eComboTRHeight);	
}

//eCombo용 json데이타에서 가장 긴 문자열을 기준으로 combo사이즈 계산
ws4708.getComboWidth = function(data){
	var maxlength = 0;
	
	for(var i=0;i<data.length;i++){
		var checkbyte = ws4708.byteCheck(data[i].text);
		
		if(checkbyte > maxlength){	
			maxlength = checkbyte;
		}
	}
	
	return (maxlength * 6 + 30) + "px"
}

//byte수 계산
ws4708.byteCheck = function(code){
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
ws4708.getFieldSet = function (srcList, sep, validx, txtidx, defaultVal, defaultTxt) {
	
	if (typeof defaultVal=="undefined")	defaultVal = ws4708.viewDefaultVal;
	if (typeof defaultTxt=="undefined")	defaultTxt = ws4708.viewDefaultTxt;
	
	var arrList = srcList;
	var objList = $.map( arrList, function(arr, i) {
		if (sep == "" || sep == null) {
			if (arr != defaultVal) return { value : arr, text : arr };
		} else {
			var info = arr.split(sep);		
			if (info[validx] != defaultVal) return { value : info[validx], text : info[txtidx] };
		}

	});
	objList.unshift({ value : defaultVal, text : defaultTxt});
	return objList;	
}

/* 보기 query_single 용 query 생성 다중값은 ,로 연결 */
ws4708.generateQuery = function(query, fieldlist, valuelist) {	
	
	if (fieldlist=="")											return query;
	if (valuelist=="" || valuelist==ws4708.viewDefaultVal)	return query;
	
	var fields = fieldlist.split(",");
	var values = valuelist.split(",");
	
	var vf = $(GC.active(false)).viewform();
	var view =vf.getView();
	var viewalias = view.getOption("viewalias");
	
	$.each (fields, function(i, field) {
		if( ( viewalias == "ingreject" || viewalias == "complete" ) && fieldlist == "RequestDate"){
			var startDate = values[i]+"-01";
			var y= parseInt(startDate.substring(0,4),10);
			var m;
			if(startDate.substring(5,6) == "0")m = parseInt(startDate.substring(6,7),10);
			else m = parseInt(startDate.substring(5,7),10);	
						
			var d = new Date(y,m,1);
			var endDate = d.getFullYear() +"-"+(d.getMonth()>=10?"":"0")+ (d.getMonth()+1) +"-"+(d.getDate()>=10?"":"0")+ d.getDate();

			var this_query = "";
			if(values[i] == "" | values[i] ==ws4708.viewDefaultVal) this_query = "ALL";
			else this_query = "["+field+"]>="+startDate+" AND ["+field+"]<" +endDate;
			query += (query!=""? " AND " : "")+this_query;
		}
		else{
			var this_query = "[" + field + "]=" + values[i];
			query += (query!=""? " AND " : "") + this_query;
		}
	});
	return query;
}

ws4708.ComboInfo = [];
ws4708.useCombo1 = false;
ws4708.useCombo2 = false;
ws4708.SelCombo1 = "";					//선택된 콤보값 1
ws4708.queryField1 = "";					//query 구성용 필드명 1. 다중값이면 필드명은 , 로 연결. 다중category는 _로 연결

ws4708.viewInit = function(opts,viewOpt) {
	opts.view = typeof viewOpt === "undefined" ? ws4708.getViewHeader(opts.viewalias) : viewOpt;
	
	ws4708.viewSetValue(opts);
	opts.buttons = ws4708.getViewButtons(opts.viewalias); 	/* 버튼 설계 구조체 */
	opts.htitle = ws4708.title;									/* 보기 타이틀 구조체 */
	opts.search = ws4708.getViewSearch(opts.viewalias);		/* 검색 구조체 */
 	$(GC.active(false)).viewform(opts);
 
 	ws4708.viewInitThis(opts);
}

ws4708.viewSetValue = function(opts){
	if(opts.viewalias == "writing"){
		opts.view.sortdfkey = "5";
		opts.view.sortdfkind = "des";
		opts.view.countkind = "agent"
	}else if(opts.viewalias == "ingreject" || opts.viewalias == "complete"){
		opts.view.sortdfkey = "5";
		opts.view.sortdfkind = "des";
		opts.view.countkind = "agent"
	}
}

ws4708.viewInitThis = function(opts){
	var vf = $(GC.active(false)).viewform();
	var view = vf.getView();
	var viewalias = view.getOption("viewalias"); 
	
	switch (viewalias){
	case "ingreject" : 
		ws4708.useCombo1 = true;
		ws4708.useCombo2 = false;
		
		ws4708.queryField1 = "RequestDate";		//query 구성용 필드명 1. 다중값이면 필드명은 , 로 연결. 다중category는 _로 연결
		ws4708.ComboInfo = opts.categorylist;
		ws4708.SelCombo1 = view.getOption("category");
		
		var rCateVal = ws4708.getValByIdx(ws4708.ComboInfo, GC.site.colsep, 0);
		var fieldset = ws4708.getFieldSet(rCateVal);
		
		ws4708.drawCombo1(viewalias, fieldset);
		break; 	
	case "complete" : 
		ws4708.useCombo1 = true;
		ws4708.useCombo2 = false;
		
		ws4708.queryField1 = "RequestDate";		//query 구성용 필드명 1. 다중값이면 필드명은 , 로 연결. 다중category는 _로 연결
		ws4708.ComboInfo = opts.categorylist; 
		ws4708.SelCombo1 = view.getOption("category");
				
		var rCateVal = ws4708.getValByIdx(ws4708.ComboInfo, GC.site.colsep, 0);
		var fieldset = ws4708.getFieldSet(rCateVal);
		
		ws4708.drawCombo1(viewalias, fieldset);
		break; 	
	}	
}

/* 첫번째 콤보박스 표시 */
ws4708.drawCombo1 = function(viewalias, fieldset1) {
	var act = GC.active(false);
	
	var opt_combo = {
			width : ws4708.getComboWidth(fieldset1)
		,	height : ws4708.getComboH(fieldset1.length)
		,	fieldset : fieldset1
		,	selectvalue: ws4708.SelCombo1
		,	onselected: function(data){
				ws4708.changeCombo("combo1");
			}
	}

	$("#select_combo1", act).eCombo("destroy");
	$("#select_combo1", act).eCombo(opt_combo);	
	
	if (ws4708.useCombo2) {
		switch (viewalias) {
		case "ingreject" :
		case "complete" :	
			var dateVal ;
			if (ws4708.SelCombo1 == ws4708.viewDefaultVal ) {
				//전체 선택한 경우 하위 콤보는 전체만 표시하려면 dateVal = "";				
				//전체 선택한 경우, 하위 콤보는 전체 파트 표시
				dateVal = ws4708.getValByIdx(ws4708.ComboInfo, GC.site.colsep, 1);				
			} else {			
				dateVal = ws4708.getIdxValByKey(ws4708.ComboInfo, GC.site.colsep, 0, ws4708.SelCombo1, 1);
			}
			var fieldset = ws4708.getFieldSet(dateVal);	
			ws4708.drawCombo2(viewalias, fieldset);
		
			break;
		}
	}
}

/* 두번째 콤보박스 표시 */
ws4708.drawCombo2 = function(viewalias, fieldset2) {
	var act = GC.active(false);
	
	var opt_combo = {
			width : ws4708.getComboWidth(fieldset2)
		,	height : ws4708.getComboH(fieldset2.length)			
		,	fieldset : fieldset2
		,	selectvalue: ws4708.SelCombo2
		,	onselected: function(data){
				ws4708.changeCombo("combo2");
			}
	}
	$("#select_combo2", act).eCombo("destroy");
	$("#select_combo2", act).eCombo(opt_combo);	
}

/* 보기에서 콤보박스 선택값 변경 시 */
ws4708.changeCombo = function (kind){
	
	var vf = $(GC.active(false)).viewform();
	var view = vf.getView();
	var viewalias = view.getOption("viewalias");

	switch (kind) {
	case "combo1" : 	//SelCombo1 변경. combo2 콤보 다시 표시.
		ws4708.SelCombo1 = $("#select_combo1", GC.active(false)).eCombo().getValue();			
		
		if (ws4708.useCombo2) {
			ws4708.SelCombo2 = ws4708.viewDefaultVal;
			switch (viewalias) {
			case "ingreject" :
			case "complete" :
				var dateVal;
				if (ws4708.SelCombo1 == ws4708.viewDefaultVal ) {
					//전체 선택한 경우 하위 콤보는 전체만 표시하려면 dateVal = "";				
					//전체 선택한 경우, 하위 콤보는 전체 파트 표시
					dateVal = ws4708.getValByIdx(ws4708.ComboInfo, GC.site.colsep, 1);
				} else {
					dateVal = ws4708.getIdxValByKey(ws4708.ComboInfo, GC.site.colsep, 0, ws4708.SelCombo1, 1);
				}		
				var fieldset = ws4708.getFieldSet(dateVal);	
				ws4708.drawCombo2(viewalias, fieldset);			
				break;		
			}
		}			
		break;
	
	case "combo2" : 	//SelCombo2 변경. 보기 다시 그림
		ws4708.SelCombo2 = $("#select_combo2", GC.active(false)).eCombo().getValue();
		break;
	}

	//위에서는 콤보박스만 처리하고 여기에서 실제 보기 데이터 처리		
	var query_single=""; var catval = "";
	
	if(ws4708.useCombo1){
		var selCombo1 = ws4708.SelCombo1;
		catval += (catval==""?"":GC.site.colsep) + selCombo1;
		query_single = ws4708.generateQuery(query_single, ws4708.queryField1, selCombo1);	
	}
	if(ws4708.useCombo2){
		var selCombo2 = ws4708.SelCombo2;
		catval += (catval==""?"":GC.site.colsep) + selCombo2;
		query_single = ws4708.generateQuery(query_single, ws4708.queryField2, selCombo2);	
	}	
	
	vf.setOptions({"querysingle":query_single});
	view.setOptions({"category": catval});		
	view.refresh("all");					
}

ws4708.getViewButtons = function(viewname) {
}

ws4708.getViewSearch = function(viewname){
	var searchcond = {
		standard : [
		     {value :"Subject", 			text : "제목"}
			, {value :"KorName", 		text : "신청자" }
		]
	}
	switch(viewname){
	case "writing" :
	case "ingreject" :
	case "complete" :
		return searchcond["standard"];
	}
}

ws4708.getViewHeader = function(viewname) {
	var columns ={
			standard : [
				{
				   	key : 1, title : "제&nbsp;&nbsp;목", css: "column-subject" 
				}
			, 	{
					key : 2, title : "신청자", css:"column-author"
					,headerrender : function(data,elem,view) { 
				   		if(viewname == "ingreject"){
							view.columnsExt( data, {sort : {enable : true, type : "all", vn_asc : "ingreject_writer_asc", vn_des : "ingreject_writer_des" } });
						}else if(viewname == "complete"){
							view.columnsExt( data, {sort : {enable : true, type : "all", vn_asc : "complete_writer_asc", vn_des : "complete_writer_des" } });
						}
					}
				}
			, 	{
					key : 3, title : "신청부서", css: {width : "100px"}
					,columnrender: function(data, elem) { elem.css( { "text-align":"center" } ) }
				}
			, 	{
					key : 4, title : "문서상태", css: {width : "60px"}
					,columnrender: function(data, elem) { elem.css( { "text-align":"center" } ) }
				}
			, 	{
					key : 5, title : "신청일", css:"column-date" 
					,columnrender: function(data, elem) { elem.css( {"padding-right" : "10px"} ) }
					,headerrender : function(data,elem,view) {elem.css({"padding-right" : "10px"}); 
				   		if(viewname == "ingreject"){
							view.columnsExt( data, {sort : {enable : true, type : "all", vn_asc : "ingreject_date_asc", vn_des : "ingreject" } });
						}else if(viewname == "complete"){
							view.columnsExt( data, {sort : {enable : true, type : "all", vn_asc : "complete_date_asc", vn_des : "complete" } });
						}
					}
				}
			]
		,	writing : [
				{
				   	key : 1, title : "제&nbsp;&nbsp;목", css: "column-subject" 
				}
			, 	{
					key : 2, title : "신청자", css:"column-author"
					,sort : {enable : true, type : "all"}	
				}
			, 	{
					key : 3, title : "신청부서", css: {width : "100px"}
					,columnrender: function(data, elem) { elem.css( { "text-align":"center" } ) }
				}
			, 	{
					key : 4, title : "문서상태", css: {width : "60px"}
					,columnrender: function(data, elem) { elem.css( { "text-align":"center" } ) }
				}
			, 	{
					key : 5, title : "신청일", css:"column-date" 
					,columnrender: function(data, elem) { elem.css( {"padding-right" : "10px"} ) }
					,headerrender : function(data,elem,view) {elem.css({"padding-right" : "10px"} ) }
				}
			]
		}
		
		var viewOpt = {
				onselect : function(data,element,view) {  //data,element
					view.openDocument(data.unid);
				}  
				, showcheckbox : false
				, showheader : true			//default : true
				, shownavigator : true		//default : true
				, simpleview : true
				, rowrender : null 			//data,emement
				, columns : null
		}
	
		switch(viewname){
		case "ingreject" :
		case "complete":
			viewOpt.columns = columns["standard"];
			break;
		case "writing" :
			viewOpt.columns = columns["writing"];
			break;
		}
		return viewOpt;
}