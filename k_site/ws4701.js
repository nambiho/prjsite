function ws4701 (){}
ws4701.active = null;
ws4701.doc = null;

ws4701.title = {
	req_title : ""
	,auroraif : "변경관리시스템"
	,progress : "변경관리시스템(진행중)"
	,complete : "변경관리시스템(처리완료)"
	,reject : "변경관리시스템(반려/회수)"
};
/*
 * *********************************************************
 * function set
 * *********************************************************
 * */
ws4701.callApprove = function (doc, param, tag, callback){
	request.approve(
		param
	,	callback || function (data){
			request.returnData(data, tag);
		}
	);
}
/*
 * *********************************************************
 * confirm
 * *********************************************************
 * */
ws4701.confirm = function (doc){
	if (!confirm("확인 하시겠습니까?")) return false;
	var param = request.getParam("");
	param.action = "confirm";
	request.process(param, function (data){ request.returnData(data, "확인") });
}
/*
 * *********************************************************
 * approve
 * *********************************************************
 * */
ws4701.approve = function (doc){
	if (!confirm("승인 하시겠습니까?")) return false;
	var param = request.getParam("");
	param.action = "approve";
	request.process(param, function (data){ request.returnData(data, "승인") });
}
/*
 * *********************************************************
 * reject
 * *********************************************************
 * */
ws4701.reject = function (doc){
	if (!confirm("반려 하시겠습니까?")) return false;
	var param = request.getParam("");
	param.action = "reject";
	request.process(param, function (data){ request.returnData(data, "반려") });
}
/*
 * *********************************************************
 * form Buttons
 * *********************************************************
 * */
ws4701.formButtons = {
	confirm : { text : "확인", highlight : true, click : ws4701.confirm }
,	approve : { text : "승인", highlight : true, click : ws4701.approve }
,	reject : { text : "반려", click : ws4701.reject }
};
/*
 * *********************************************************
 * form Event init
 * *********************************************************
 * */
ws4701.form_Event_initialize = function (){
	/* section 처리 */
	$(".section_close,.section_open", ws4701.active).each(function (){
		var sSelector = "#" + $(this).attr("section_id");
		$(this).off("click").on("click", function (){
			$(sSelector).toggle();
			$(this).attr("class", $(this).attr("class")=="section_close" ? "section_open" : "section_close");
		})
	});
	/* section 처리 */
	if (ws4701.doc.getOption("ezdocid") != ""){
		$("#span_itsv_link", ws4701.active).off("click").on("click", function (){
			/*
			var url = new GF.CURL("/" + ws4701.doc.getOption("itsvpath") + "/0/" + ws4701.doc.getOption("ezdocid") + "?opendocument"
			,	{isundock : 1}
			);
			// */
			GF.getApplProfile(ws4701.doc.getOption("dbcode"), function (data){
				var url = new GF.CURL("/" + data.appldir + "/" + data.applfilename + "/0/" + ws4701.doc.getOption("ezdocid") + "?opendocument"
				,	{isundock : 1}
				);
				
				var w = GF.winContent(url.url, {
					location:"0"
				,	resizable : "1"
				,	status: "1"
				,	menubar:"0"
				,	scrollbars:"0"
				,	width : "800"
				});
			});
			// */
		}).css("cursor", "pointer");
	}
}
/*
 * *********************************************************
 * setAuroraDoc
 * *********************************************************
 * */
ws4701.setAuroraDoc = function (){
	var url = new GF.CURL("/" + ws4701.doc.getOption("dbpath") + "/auroraocx?openform");
	var _h = "<iframe name='iframe_aurora' id='iframe_aurora' src='" + url.url + "' frameborder='0' width='100%' height='300' marginwidth='0' marginheight='0' topmargin='0' scrolling='no' ></iframe>";
	$("#div_iframe", ws4701.active).html(_h);
}
/*
 * *********************************************************
 * getOcx
 * *********************************************************
 * */
ws4701.getOcx = function (_callback){
	if ($.browser.msie){
		ws4701.setAuroraDoc();
		//*
		$("iframe[name='iframe_aurora']", ws4701.active).load(
			function (){
				var ocx = $(this).contents().find("#ActiveEzMoreDoc");
				if (ocx.length > 0){
					_callback && setTimeout( function (){_callback(ocx)}, 300);
				}
			}
		);
		// */
	}
}
/*
 * *********************************************************
 * initialize
 * *********************************************************
 * */
ws4701.initialize = function (){
	var notilist = [];
	$.each(ws4701.doc.getOption("notiuserlist"), function (idx, ulist){
		var user = request.setUser(ulist);
		notilist.push(user.korname + " " + user.post + (user.reqdate == "-" ? "" : "(" + user.reqdate + ")"));
	});
	$("#span_noti", ws4701.active).text(notilist.join(", "));
	
	ws4701.getOcx(
		function (ocx){
			ocx[0].setDocNo(ws4701.doc.getOption("ardocno"));
		}
	);
}
/*
 * *********************************************************
 * doc initialize
 * *********************************************************
 * */
ws4701.form_init = function (opts){
	ws4701.contentName = opts.req_subject;
	ws4701.title.requestTitle = request.profile.reqTitle;
	
	opts.buttons = ws4701.formButtons;
	opts.htitle = ws4701.title;
	
	ws4701.active = GC.active(true);
 	ws4701.doc = $(GC.active(true)).doc(opts).doc();
 	/* 문서 초기화 */
 	ws4701.initialize();
 	/* 이벤트 생성 */
	ws4701.form_Event_initialize();
}

/*==================View=================*/

ws4701.viewDefaultVal = "ALL";
ws4701.viewDefaultTxt = "전체";

ws4701.eComboTRHeight = 18;				/* eCombo tr 높이 */

/* array unique 처리 */
ws4701.unique = function(arr){
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
ws4701.getValByIdx = function (srcList, sep, idx) {
	
	if (typeof srcList[0] == "undefined")	return "";
	
	var arrList = srcList;
	var ValList = $.map ( arrList, function (arr, i) {
		var info = arr.split(sep);		
		return info[idx];
	});	
	ValList = ws4701.unique(ValList);
	//ValList.sort();		
	return ValList;	
}

/* 구분자로 연결된 텍스트값 리스트에서 key idx의 값이 일치하는 특정 idx의 값만 추출하여 return 
* ex) srcList=전체^이지모아, 가상테스트팀^신계약, 가상테스트팀^법인영업 sep=^, keyidx=0, keyval=가상테스트팀, returnidx=1 
* 하면 신계약, 법인영업 리턴 */
ws4701.getIdxValByKey = function (srcList, sep, keyidx, keyval, returnidx) {
	
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
ws4701.getComboH = function (cnt) {	
	if (cnt > 10) cnt = 10;
	return (cnt * ws4701.eComboTRHeight);	
}

//eCombo용 json데이타에서 가장 긴 문자열을 기준으로 combo사이즈 계산
ws4701.getComboWidth = function(data){
	var maxlength = 0;
	
	for(var i=0;i<data.length;i++){
		var checkbyte = ws4701.byteCheck(data[i].text);
		
		if(checkbyte > maxlength){	
			maxlength = checkbyte;
		}
	}
	
	return (maxlength * 6 + 30) + "px"
}

//byte수 계산
ws4701.byteCheck = function(code){
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
ws4701.getFieldSet = function (srcList, sep, validx, txtidx, defaultVal, defaultTxt) {
	
	if (typeof defaultVal=="undefined")	defaultVal = ws4701.viewDefaultVal;
	if (typeof defaultTxt=="undefined")	defaultTxt = ws4701.viewDefaultTxt;
	
	var arrList = srcList;
	var objList = $.map( arrList, function(arr, i) {
		if(arr != ""){
			if (sep == "" || sep == null) {
				if (arr != defaultVal) return { value : arr, text : arr };
			} else {
				var info = arr.split(sep);		
				if (info[validx] != defaultVal) return { value : info[validx], text : info[txtidx] };
			}
		}
	});
	objList.unshift({ value : defaultVal, text : defaultTxt});
	return objList;	
}

/* 보기 query_single 용 query 생성 다중값은 ,로 연결 */
ws4701.generateQuery = function(query, fieldlist, valuelist) {	
	
	if (fieldlist=="")											return query;
	if (valuelist=="" || valuelist==ws4701.viewDefaultVal)	return query;
	
	var fields = fieldlist.split(",");
	var values = valuelist.split(",");
	
	var vf = $(GC.active(false)).viewform();
	var view =vf.getView();
	var viewalias = view.getOption("viewalias");
	
	$.each (fields, function(i, field) {
		var this_query = "[" + field + "]=" + values[i];
		query += (query!=""? " AND " : "") + this_query;
	});
	return query;
}

ws4701.ComboInfo = [];
ws4701.useCombo1 = false;
ws4701.useCombo2 = false;
ws4701.SelCombo1 = "";					//선택된 콤보값 1
ws4701.queryField1 = "";					//query 구성용 필드명 1. 다중값이면 필드명은 , 로 연결. 다중category는 _로 연결

ws4701.viewInit = function(opts,viewOpt) {
	opts.view = typeof viewOpt === "undefined" ? ws4701.getViewHeader(opts.viewalias) : viewOpt;
	
	ws4701.viewSetValue(opts);
	opts.buttons = ws4701.getViewButtons(opts.viewalias); 	/* 버튼 설계 구조체 */
	opts.htitle = ws4701.title;									/* 보기 타이틀 구조체 */
	opts.search = ws4701.getViewSearch(opts.viewalias);		/* 검색 구조체 */
 	$(GC.active(false)).viewform(opts);
 
 	ws4701.viewInitThis(opts);
}

ws4701.viewSetValue = function(opts){
	opts.view.sortdfkey = "11";
	opts.view.sortdfkind = "des";
	opts.view.countkind = "agent";
}

ws4701.viewInitThis = function(opts){
	var vf = $(GC.active(false)).viewform();
	var view = vf.getView();
	var viewalias = view.getOption("viewalias"); 
	
	switch (viewalias){
	default : 
		ws4701.useCombo1 = true;
		ws4701.useCombo2 = false;
		
		ws4701.queryField1 = "RequestDate";		//query 구성용 필드명 1. 다중값이면 필드명은 , 로 연결. 다중category는 _로 연결
		ws4701.ComboInfo = opts.categorylist;

		if(opts.categorylist == "") ws4701.SelCombo1 = ws4701.viewDefaultVal;
		else ws4701.SelCombo1 = view.getOption("category");	
		
		var rCateVal = ws4701.getValByIdx(ws4701.ComboInfo, GC.site.colsep, 0);
		var fieldset = ws4701.getFieldSet(rCateVal);
		
		ws4701.drawCombo1(viewalias, fieldset);
		break; 	 	
	}	
}

/* 첫번째 콤보박스 표시 */
ws4701.drawCombo1 = function(viewalias, fieldset1) {
	var act = GC.active(false);
	
	var opt_combo = {
			width : ws4701.getComboWidth(fieldset1)
		,	height : ws4701.getComboH(fieldset1.length)
		,	fieldset : fieldset1
		,	selectvalue: ws4701.SelCombo1
		,	onselected: function(data){
				ws4701.changeCombo("combo1");
			}
	}

	$("#select_combo1", act).eCombo("destroy");
	$("#select_combo1", act).eCombo(opt_combo);	
	
	if (ws4701.useCombo2) {
		switch (viewalias) {
		default :
			var dateVal ;
			if (ws4701.SelCombo1 == ws4701.viewDefaultVal ) {
				//전체 선택한 경우 하위 콤보는 전체만 표시하려면 dateVal = "";				
				//전체 선택한 경우, 하위 콤보는 전체 파트 표시
				dateVal = ws4701.getValByIdx(ws4701.ComboInfo, GC.site.colsep, 1);				
			} else {			
				dateVal = ws4701.getIdxValByKey(ws4701.ComboInfo, GC.site.colsep, 0, ws4701.SelCombo1, 1);
			}
			var fieldset = ws4701.getFieldSet(dateVal);	
			ws4701.drawCombo2(viewalias, fieldset);
		
			break;
		}
	}
}

/* 두번째 콤보박스 표시 */
ws4701.drawCombo2 = function(viewalias, fieldset2) {
	var act = GC.active(false);
	
	var opt_combo = {
			width : ws4701.getComboWidth(fieldset2)
		,	height : ws4701.getComboH(fieldset2.length)			
		,	fieldset : fieldset2
		,	selectvalue: ws4701.SelCombo2
		,	onselected: function(data){
				ws4701.changeCombo("combo2");
			}
	}
	$("#select_combo2", act).eCombo("destroy");
	$("#select_combo2", act).eCombo(opt_combo);	
}

/* 보기에서 콤보박스 선택값 변경 시 */
ws4701.changeCombo = function (kind){
	
	var vf = $(GC.active(false)).viewform();
	var view = vf.getView();
	var viewalias = view.getOption("viewalias");

	switch (kind) {
	case "combo1" : 	//SelCombo1 변경. combo2 콤보 다시 표시.
		ws4701.SelCombo1 = $("#select_combo1", GC.active(false)).eCombo().getValue();			
		
		if (ws4701.useCombo2) {
			ws4701.SelCombo2 = ws4701.viewDefaultVal;
			switch (viewalias) {
			default : 
				var dateVal;
				if (ws4701.SelCombo1 == ws4701.viewDefaultVal ) {
					//전체 선택한 경우 하위 콤보는 전체만 표시하려면 dateVal = "";				
					//전체 선택한 경우, 하위 콤보는 전체 파트 표시
					dateVal = ws4701.getValByIdx(ws4701.ComboInfo, GC.site.colsep, 1);
				} else {
					dateVal = ws4701.getIdxValByKey(ws4701.ComboInfo, GC.site.colsep, 0, ws4701.SelCombo1, 1);
				}		
				var fieldset = ws4701.getFieldSet(dateVal);	
				ws4701.drawCombo2(viewalias, fieldset);			
				break;		
			}
		}			
		break;
	
	case "combo2" : 	//SelCombo2 변경. 보기 다시 그림
		ws4701.SelCombo2 = $("#select_combo2", GC.active(false)).eCombo().getValue();
		break;
	}

	//위에서는 콤보박스만 처리하고 여기에서 실제 보기 데이터 처리		
	var query_single=""; var catval = "";
	
	if(ws4701.useCombo1){
		var selCombo1 = ws4701.SelCombo1;
		catval += (catval==""?"":GC.site.colsep) + selCombo1;
		query_single = ws4701.generateQuery(query_single, ws4701.queryField1, selCombo1);	
	}
	if(ws4701.useCombo2){
		var selCombo2 = ws4701.SelCombo2;
		catval += (catval==""?"":GC.site.colsep) + selCombo2;
		query_single = ws4701.generateQuery(query_single, ws4701.queryField2, selCombo2);	
	}	
	
	vf.setOptions({"querysingle":query_single});
	view.setOptions({"category": catval});		
	view.refresh("all");					
}

ws4701.getViewButtons = function(viewname) {
}

ws4701.getViewSearch = function(viewname){
	var searchcond = {
		standard : [
		     {value :"Subject", 		text : "제목"}
			, {value :"KorName", 	text : "신청자"}
			, {value :"Ar_Doc_No",	text : "문서번호"}
		]
	}
	switch(viewname){
	default :
		return searchcond["standard"];
	}
}

ws4701.getViewHeader = function(viewname) {
	var columns ={
			standard : [
				{
					key : 1, title : "문서번호", css: {width : "80px"}
					,columnrender: function(data, elem) { elem.css( { "text-align":"center" } ) }
				}
			,	{
				   	key : 2, title : "제&nbsp;&nbsp;목", css: "column-subject" 
				}
			, 	{
					key : 3, title : "문서종류", css: {width : "50px"}
					,columnrender: function(data, elem) { elem.css( { "text-align":"center" } ) }
				}
			, 	{
					key : 4, title : "신청자", css:"column-author"
					,sort : { enable:true, type : "all" , vn_asc: viewname+"_writer_asc" , vn_des: viewname+"_writer_des" }
					,headerrender : function(data,elem,view) {elem.css({"width" : "50px"});}
					,columnrender: function(data, elem) { elem.css( { "width":"50px" } ); }
				}
			, 	{
					key : 5, title : "결재자1", css:"column-author"
					,headerrender : function(data,elem,view) {elem.css({"width" : "45px"});}
					,columnrender: function(data, elem) { elem.css( { "width":"45px" } ); }
				}
			, 	{
					key : 6, title : "결재자2", css:"column-author"
					,headerrender : function(data,elem,view) {elem.css({"width" : "45px"});}
					,columnrender: function(data, elem) { elem.css( { "width":"45px" } ); }
				}
			, 	{
					key : 7, title : "결재자3", css:"column-author"
					,headerrender : function(data,elem,view) {elem.css({"width" : "45px"});}
					,columnrender: function(data, elem) { elem.css( { "width":"45px" } ); }						
				}
			, 	{
					key : 8, title : "결재자4", css:"column-author"
					,headerrender : function(data,elem,view) {elem.css({"width" : "45px"});}
					,columnrender: function(data, elem) { elem.css( { "width":"45px" } ); }
				}
			, 	{
					key : 9, title : "결재자5", css:"column-author"
					,headerrender : function(data,elem,view) {elem.css({"width" : "45px"});}
					,columnrender: function(data, elem) { elem.css( { "width":"45px" } ); }
				}
			, 	{
					key : 10, title : "문서상태", css: {width : "55px"}
					,columnrender: function(data, elem) { elem.css( { "text-align":"center" } ) }
				}
			, 	{
					key :11, title : "신청일", css:"column-date" 
					,columnrender: function(data, elem) { elem.css( {"width" : "70px", "padding-right" : "10px"} ) }
					,headerrender : function(data,elem,view) {elem.css({"width" : "70px", "padding-right" : "10px"});}
					,sort : { enable:true, type : "all" , vn_asc: viewname+"_date_asc" , vn_des: viewname }
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
		default :
			viewOpt.columns = columns["standard"];
			break;
		}
		return viewOpt;
}