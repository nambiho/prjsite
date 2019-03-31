
function biztrip_recordsearch() {};
$ep.inheritStatic(biztrip_recordsearch,"BIZTRIP","biztrip");

biztrip_recordsearch.year_combo = function(form, selected_year){
	var menu = [];
	var searchUrl = "/" +form.mngdbpath +"/vw_DeptList?ReadViewEntries&CollapseView";
	var org_doc = new biztrip_recordsearch.XMLDOM();
	org_doc.load(searchUrl);
	YearNode = org_doc.selectNodes("/viewentries/viewentry/entrydata[@name='Year']");
	var year_combo_Info = "";
	//var LINE_SEP ="¶";
	//var FIELD_SEP ="<!sep>";
	
	if(YearNode.length>0){
		for(i=0;i<YearNode.length;i++){
			year_combo_Info += "년도" + form.FIELD_SEP + YearNode[i].textContent.replace(/(\r\n|\r|\n)/g,"") + form.FIELD_SEP+  YearNode[i].textContent.replace(/(\r\n|\r|\n)/g,"") + form.LINE_SEP;
			menu.push({id:YearNode[i].textContent.replace(/(\r\n|\r|\n)/g,""),text:YearNode[i].textContent.replace(/(\r\n|\r|\n)/g,""),data:YearNode[i].textContent.replace(/(\r\n|\r|\n)/g,"")});
			//year_combo_Info += "년도" + FIELD_SEP + YearNode[i].text + FIELD_SEP+  YearNode[i].text + LINE_SEP;
		}
		biztrip_recordsearch["yearInfo_biztrip_report_view"] = year_combo_Info;
		if( year_combo_Info.indexOf(selected_year) < 0 ){
			selected_year = YearNode[0].text.replace(/(\r\n|\r|\n)/g,"");
			biztrip_recordsearch.SelectKind = selected_year + form.FIELD_SEP + form.quarter + form.FIELD_SEP + form.divcode + form.FIELD_SEP + (form.chargecode==""?"NoSelect":form.chargecode) + form.FIELD_SEP + form.groupcode;
		}
		
	}else{
		//return "NoDeptInfo"
	}
	return menu;
};
biztrip_recordsearch.year_quarter = function(form){
	var menu = [];
	for(i=1;i<5;i++){	
		menu.push({id:"Q"+i,text:i+"분기",data:"Q"+i});
	}
	return menu;
};
biztrip_recordsearch.bizdivcode = function(form,selected_year){
	var menu = [];
	var orgInfo = biztrip_recordsearch["orgInfo_biztrip_report_view_"+selected_year];
	var aa=biztrip_recordsearch.SelectKind.split(form.FIELD_SEP)[2];
	//var orgInfo = biztrip_recordsearch.orgInfo_biztrip_report_view_+selyear;
	for(var i=0;i<orgInfo[selected_year].child.length;i++){
		var divInfo = orgInfo[selected_year].child[i]
		menu.push({id:divInfo.code,text:divInfo.name,data:divInfo.code});
	}
	return menu;
};

biztrip_recordsearch.bizchargecode = function(form,selected_year,selectedItem){
	var menu = [];
	var orgInfo = biztrip_recordsearch["orgInfo_biztrip_report_view_"+selected_year];
	var aa=biztrip_recordsearch.SelectKind.split(form.FIELD_SEP)[2];
	//var orgInfo = biztrip_recordsearch.orgInfo_biztrip_report_view_+selyear;
	var comboInfo = "사업부" + form.FIELD_SEP + "NoSelect" + form.FIELD_SEP+ "==선택==" + form.LINE_SEP;
	if(typeof(selectedItem) != "undefined" && selectedItem != "NoSelect"){
		for(var i=0;i<orgInfo[selectedItem].child.length;i++){
			var divInfo = orgInfo[selectedItem].child[i];
			menu.push({id:divInfo.code,text:divInfo.name,data:divInfo.code});
			//comboInfo +="사업부" + FIELD_SEP + divInfo.code + FIELD_SEP+ divInfo.name + LINE_SEP;
			
		}
	}
	return menu;
};

biztrip_recordsearch.bizgroupcode = function(form,selected_year,selectedItem){
	var menu = [];
	var orgInfo = biztrip_recordsearch["orgInfo_biztrip_report_view_"+selected_year];
	var aa=biztrip_recordsearch.SelectKind.split(form.FIELD_SEP)[3];
	//var orgInfo = biztrip_recordsearch.orgInfo_biztrip_report_view_+selyear;
	var comboInfo = "사업부" + form.FIELD_SEP + "NoSelect" + form.FIELD_SEP+ "==선택==" + form.LINE_SEP;
	if(typeof(selectedItem) != "undefined" && selectedItem != "NoSelect"){
		for(var i=0;i<orgInfo[selectedItem].child.length;i++){
			var divInfo = orgInfo[selectedItem].child[i];
			menu.push({id:divInfo.code,text:divInfo.name,data:divInfo.code});
			//comboInfo +="사업부" + FIELD_SEP + divInfo.code + FIELD_SEP+ divInfo.name + LINE_SEP;
			
		}
	}
	return menu;
};

biztrip_recordsearch.get_DeptOrgInfo=function(view, opt, form){
	biztrip_recordsearch.SelectKind="";
	if(biztrip_recordsearch.SelectKind == ""){
		if(form.isManager != "no"){
			biztrip_recordsearch.SelectKind = form.year + form.FIELD_SEP + form.quarter + form.FIELD_SEP + form.divcode + form.FIELD_SEP + (form.chargecode==""?"NoSelect":form.chargecode) + form.FIELD_SEP + form.groupcode;
		}else{
			biztrip_recordsearch.SelectKind = form.year + form.FIELD_SEP + form.quarter + form.FIELD_SEP + "NoSelect" + form.FIELD_SEP + "NoSelect" + form.FIELD_SEP + form.groupcode;
		}
	}
	//년도
	var selected_year = "2011";
	var selyear = biztrip_recordsearch.year_combo(form,selected_year);
	var selected_year = selyear[0].data;
	var _sel = $ep.ui.select($(".view-selection",$ep.ui.active())
			,{items:selyear
			,change:function(e, ui){
					//view.options.query.category = _sel.getSelectedValue();
					//view.redraw();
				}
			}
			,biztrip_recordsearch);
	$(".view-selection",$ep.ui.active()).css("margin-right", "1px");
	//분기
	var selquarter = biztrip_recordsearch.year_quarter(form);
	var _sel2 = $ep.ui.select($(".view-selection2",$ep.ui.active())
			,{items:selquarter
			,change:function(e, ui){
					//view.options.query.category = _sel.getSelectedValue();
					//view.redraw();
				}
			}
			,biztrip_recordsearch);
	$(".view-selection2",$ep.ui.active()).css("margin-right", "1px");
	
	//부서정보
	var sep1 = "{`"; var sep2 = "{;";
	var root = {child:new Array()};
	var dept_datas = [];

	searchUrl = "/" + form.mngdbpath + "/vw_DeptList?ReadViewEntries&RestrictToCategory="+ selected_year +"&CollapseView&count=1000";
	var org_doc = new biztrip_recordsearch.XMLDOM();
	org_doc.load(searchUrl);

	var DeptNode = org_doc.selectNodes("/viewentries/viewentry/entrydata[@name='DeptInfo']");
	if(DeptNode.length>0){
		dept_datas[selected_year] = {"code":selected_year,"name":selected_year,"pcode":"_ROOT","child":new Array()};
		for(i=0;i<DeptNode.length;i++){
			DeptInfo = DeptNode[i].textContent.split(sep2);
			p_dept_code = (DeptInfo[0].split(sep1)[0]).replace(/(\r\n|\r|\n)/g,"");		//상위부서코드
			p_dept_name = (DeptInfo[0].split(sep1)[1]).replace(/(\r\n|\r|\n)/g,"");		//상위부서명
			dept_code = (DeptInfo[1].split(sep1)[0]).replace(/(\r\n|\r|\n)/g,"");			//부서코드
			dept_name = (DeptInfo[1].split(sep1)[1]).replace(/(\r\n|\r|\n)/g,"");			//부서명

			var insert_data = {"code":dept_code,"name":dept_name,"pcode":p_dept_code,"child":new Array()};
			if(dept_datas[dept_code]){
				dept_datas[dept_name] = insert_data;
			}else{
				dept_datas[dept_code] = insert_data;
			}
		}
		
		for(idx in dept_datas){
			if(dept_datas[idx].pcode != "_ROOT"){
				var p = dept_datas[dept_datas[idx].pcode];
				if(p != null){
					dept_datas[idx].toplink = p;
					p.child.push(dept_datas[idx]);
				}
			}else{
				root.child.push(dept_datas[idx]);
			}
		}

//		eval("orgInfo_biztrip_report_view_"+selected_year+"=dept_datas");
		
		biztrip_recordsearch["orgInfo_biztrip_report_view_"+selected_year] = dept_datas;
	}else{
		return "NoDeptInfo"
	}
	
	//divcode
	
	var seldivcode = biztrip_recordsearch.bizdivcode(form,selected_year);
	biztrip_recordsearch.active = $ep.ui.active();
	var _sel3, _sel4, _sel5;
	_sel3 = $ep.ui.select($(".view-selection3",biztrip_recordsearch.active)
			,{items:seldivcode
			,selectchange:function(e, ui){
				var selchargecode = biztrip_recordsearch.bizchargecode(form,selected_year,_sel3.getSelectedValue());
				_sel4.elements.select[0].options.length = 0;
				selchargecode = (selchargecode.length == 0?[{id:"",text:""}]:selchargecode);
				_sel4.addItems(selchargecode);
				_sel4.setSelected(selchargecode[0].id);
				
				_sel5.elements.select[0].options.length = 0;
				_sel5.addItems([{id:"", "text":""}]);
				}
			}
			,biztrip_recordsearch);
	_sel3.setSelected(seldivcode[0].id);
	$(".view-selection3",$ep.ui.active()).css("margin-right", "1px");
	var selchargecode = biztrip_recordsearch.bizchargecode(form,selected_year,_sel3.getSelectedValue());
	_sel4 = $ep.ui.select($(".view-selection4",$ep.ui.active())
				,{items:selchargecode
				,selectchange:function(e, ui){
					var selgroupcode = biztrip_recordsearch.bizgroupcode(form,selected_year,_sel4.getSelectedValue());
					_sel5.elements.select[0].options.length = 0;
					selgroupcode = (selgroupcode.length == 0?[{id:"",text:""}]:selgroupcode);
					_sel5.addItems(selgroupcode);
					_sel5.setSelected(selgroupcode[0].id);
					}
				}
				,biztrip_recordsearch);
		$(".view-selection4",$ep.ui.active()).css("margin-right", "1px");
	_sel4.setSelected(selchargecode[0].id);
	var selgroupcode = biztrip_recordsearch.bizgroupcode(form,selected_year,_sel4.getSelectedValue());
	_sel5 = $ep.ui.select($(".view-selection5",$ep.ui.active())
				,{items:selgroupcode
				,change:function(e, ui){
						//view.options.query.category = _sel.getSelectedValue();
						//view.redraw();
					}
				}
				,biztrip_recordsearch);
		$(".view-selection5",$ep.ui.active()).css("margin-right", "1px");

};

biztrip_recordsearch.get_DeptOrgInfo2=function(view, opt, form){
	var _data="";
	var menu=[];
	var searchUrl = "/" +form.mngdbpath +"/vw_DeptList?ReadViewEntries&CollapseView";
	var org_doc = new biztrip_recordsearch.XMLDOM();
	org_doc.load(searchUrl);
	YearNode = org_doc.selectNodes("/viewentries/viewentry/entrydata[@name='Year']");
	var year_combo_Info = "";
	if(YearNode.length>0){
		for(i=0;i<YearNode.length;i++){
			alert(YearNode[i].textContent );
			menu.push({id:YearNode[i].textContent,text:YearNode[i].textContent,data:YearNode[i].textContent});
			//year_combo_Info += "년도" + FIELD_SEP + YearNode[i].text + FIELD_SEP+  YearNode[i].text + LINE_SEP;
		}
		/*
		eval("parent.yearInfo_"+ cviewname +"=year_combo_Info");
		if( year_combo_Info.indexOf(selected_year) < 0 ){
			selected_year = YearNode[0].text;
			SelectKind = selected_year + FIELD_SEP + parent.quarter + FIELD_SEP + parent.divcode + FIELD_SEP + (parent.chargecode==""?"NoSelect":parent.chargecode) + FIELD_SEP + parent.groupcode;
		}
		*/
		
	}else{
		return "NoDeptInfo"
	}
	//var org_doc = biztrip_recordsearch.get_xml(searchUrl);
	/*
	$ep.util.ajax({
		url : searchUrl
		, type : "get"
		, dataType : "text"
		, async : false
		, success : function(data){
			var res = data.replace(/[\n\r]/gi,"");
			_data=res;
		}
		, error : function(e){
		}
	});
	//biztrip_recordsearch.org_doc = _data;
	*/
	//var org_doc = _data;
	/*
	var YearNode = org_doc.selectNodes("/viewentries/viewentry/entrydata[@name='Year']");
	var year_combo_Info = "";
	if(YearNode.length>0){
		for(i=0;i<YearNode.length;i++){
			alert(YearNode[i].text );
			//year_combo_Info += "년도" + FIELD_SEP + YearNode[i].text + FIELD_SEP+  YearNode[i].text + LINE_SEP;
		}
		
		eval("parent.yearInfo_"+ cviewname +"=year_combo_Info");
		if( year_combo_Info.indexOf(selected_year) < 0 ){
			selected_year = YearNode[0].text;
			SelectKind = selected_year + FIELD_SEP + parent.quarter + FIELD_SEP + parent.divcode + FIELD_SEP + (parent.chargecode==""?"NoSelect":parent.chargecode) + FIELD_SEP + parent.groupcode;
		}
		
		
	}else{
		return "NoDeptInfo"
	}
	*/
	
}

biztrip_recordsearch.get_xml=function(submitUrl){
	if(window.XMLHttpRequest){
		o_xmlhttp = new XMLHttpRequest();
 	}else{
		o_xmlhttp= new ActiveXObject("Microsoft.XMLHTTP");
 	}
	o_xmlhttp.open('GET', submitUrl+ "&" + new Date().getTime() ,false);
 	o_xmlhttp.send('');
	var org_doc = o_xmlhttp.responseXML;
	o_xmlhttp = null; 
	return org_doc;
}

biztrip_recordsearch.get_xml2=function(URL){
	$ep.util.ajax({
		url : URL
		, type : "get"
		, dataType : "text"
		, async : false
		, success : function(data){
			var res = data.replace(/[\n\r]/gi,"");
			_data=res;
			return _data;
		}
		, error : function(e){
		}
	});
}

biztrip_recordsearch.XMLDOM = function(){
	this._xmlDom = null;
	this._xmlHttp = null;
	if (window.ActiveXObject){
		this._xmlHttp = new ActiveXObject("Microsoft.XMLHTTP") ;
	}else{
		this._xmlHttp = new XMLHttpRequest();
	}
};
 
biztrip_recordsearch.XMLDOM.prototype.load = function(fileName){
	this._xmlHttp.open("GET", fileName, false);
	this._xmlHttp.send("");
	var res = this._xmlHttp.responseText.replace(/[\n\r]/gi,"");
	this._xmlDom = this._xmlHttp.responseXML;
};
 
biztrip_recordsearch.XMLDOM.prototype.selectNodes = function(xpath){
	if(window.ActiveXObject){
		return this._xmlDom.selectNodes(xpath);
	}else{
		var nodes = this._xmlDom.evaluate(xpath, this._xmlDom, null, XPathResult.ANY_TYPE, null);
		var ret = new Array();
		var node = nodes.iterateNext();
		while(node){
			ret[ret.length] = node;
			node = nodes.iterateNext();
		}
		return ret;
	}
};

biztrip_recordsearch.XMLDOM.prototype.selectSingleNode = function(xpath){
	return this.selectNodes(xpath)[0];
};

biztrip_recordsearch.req_biztrip=function(me){
	var url = '/' + me.options.dbpath + '/get_link_info?OpenAgent&key='+me.options.unid + "&flag=B";
	$ep.util.ajax({
		url : url,
		type : "get",
		dataType : "text",
		async : false,
		success : function(data) {
			_data=data;
		}
		,error : function(){
			alert("Connection Error ......");
		}
	});
	
	if(_data.indexOf('isExist')>-1){
		alert("이미 출장신청이 되어 있습니다.");
		return;					
	}
	
	$("li.active", $ep.ui.activeNav()).removeClass("active");
	$ep.ui
			.loadPageLang(
					$ep.ui.active(),
						"/"
							+ me.options.aprvdbpath+'/approval?OpenForm&parentunid='
							+ me.options.aprvform4
							+ '&callfrom=biztrip' + _data, biztrip);
		

};

biztrip_recordsearch.viewList = {
	biztrip_report_view : { 
		column : {
			_startdate : {
				title : "{VIEW.COLUMNS.STARTDATE}"
				//,sortable : {descending : true}
				,css : {width: "150px"}
				//,type : "isodate"
				//,dateformat : "fullDate"
			}
			,_biztripkind : {
				title : "{VIEW.COLUMNS.BIZTRIPKIND}"
				,css : {width : "120px"}
				,hidewidth : true
			}
			,_btcountry : {
				title : "국가"
				,css : {width: "80px"}
				,type : "multilevel"
				//,sortable : {ascending:true}
			}
			,_btcity : {
				title : "{VIEW.COLUMNS.CITY}"
				,css : {width: "80px"}
				//,type : "userinfo"
				,hidewidth : true	
			}
			,_subject : {
				title : "{VIEW.COLUMNS.SUBJECT}"
				,type : "multilevel"
				//,sortable : {ascending:true}
			}
			,_biztriptotalnum : {
				title : "인원"
				,css : {width: "50px"}
				,type : "multilevel"
				//,sortable : {ascending:true}
			}
			,_biztriptotalfee : {
				title : "품의금액"
				,css : {width: "100px"}
				,type : "multilevel"
				//,sortable : {ascending:true}
			}
			,_plantype : {
				title : "구분"
				,css : {width: "80px"}
				,type : "multilevel"
				//,sortable : {ascending:true}
			}
			
		}
		,breadcrumb : "{VIEW.SIDE.MENU.VIEW06}"
	}
};

biztrip_recordsearch.test=function(me){
	debugger;
	//biztrip_recordsearch.viewInit(me.options);
	var _sel1 = $ep.ui.select($(".view-selection",biztrip_recordsearch.active));
	var _sel2 = $ep.ui.select($(".view-selection2",biztrip_recordsearch.active));
	var _sel3 = $ep.ui.select($(".view-selection3",biztrip_recordsearch.active));
	var _sel4 = $ep.ui.select($(".view-selection4",biztrip_recordsearch.active));
	var _sel5 = $ep.ui.select($(".view-selection5",biztrip_recordsearch.active));

	var list_category = "";
	var filter = "";
	var query = "";
	var isTotal = "T";
	var searchtxt = "";
	
	var searchtxt =  "([biztripYear]="+_sel1.getSelectedValue()+")";
	alert(searchtxt);
	
	var searchtxt =  "([biztripYear]=\"2014\")";
	searchtxt = searchtxt + " AND " + "([biztripQuarter]=\"Q1\")";
	
	var _uri = $.CURI("/" + me.options.dbpath + "/api/data/collections/name/biztrip_report_view?restapi",{		
		//ty : "list"
		//,IsTotal : isTotal
		page : parseInt(me.options.query.page)
		,ps : me.options.query.ps
		,entrycount : false
		,viewname : me.options.alias
		,query : query
		,search : encodeURIComponent(searchtxt)
		,tmp : new Date().getTime()
	});
	//return _uri.url;
	var _view = $ep.ui.view($(".viewpage",$ep.ui.active()));
	_view.options.query.page = "0";
	_view.options.query.search = searchtxt;
	_view.drawView();	
	
	//_view.options.query = $.extend(true, {}, _view.options.query, _query);
	//_view.drawView();
	
}
biztrip_recordsearch.actions = {
	view : {
		btnsearch : {
			text : "조회"	
			,click : function(me) {
				debugger;
				biztrip_recordsearch.test(this);
				/*
				var _sel1 = $ep.ui.select($(".view-selection",biztrip_recordsearch.active));
				var _sel2 = $ep.ui.select($(".view-selection2",biztrip_recordsearch.active));
				var _sel3 = $ep.ui.select($(".view-selection3",biztrip_recordsearch.active));
				var _sel4 = $ep.ui.select($(".view-selection4",biztrip_recordsearch.active));
				var _sel5 = $ep.ui.select($(".view-selection5",biztrip_recordsearch.active));
			
				var list_category = "";
				var filter = "";
				var query = "";
				var isTotal = "T";
				var searchtxt = "";
				
				var searchtxt =  "([biztripYear]="+_sel1.getSelectedValue()+")";
				alert(searchtxt);
				
				var searchtxt =  "([biztripYear]=\"2014\")";
				searchtxt = searchtxt + " AND " + "([biztripQuarter]=\"Q1\")";
				//searchtxt = searchtxt + " AND " + "([biztripDivCode]=\"Q1\")";
				//searchtxt = searchtxt + " AND " + "([biztripChargeCode]=\"Q1\")";
				//searchtxt = searchtxt + " AND " + "([biztripGroupCode]=\"Q1\")";
				/*
				if(opt.search_option!=undefined){
					var aa=opt.search_option.field;
					var bb=opt.search_option.query;
					searchtxt = searchtxt + " AND " + "(["+aa+"]=" + bb + ")";
				}
				
				
			//	var _uri = $.CURI("/"+form.dbpath+"/search_view_selected?openagent" ,{		
				var _uri = $.CURI("/" + me.options.dbpath + "/api/data/collections/name/biztrip_report_view?restapi",{		
					//ty : "list"
					//,IsTotal : isTotal
					page : parseInt(me.options.query.page)
					,ps : me.options.query.ps
					,entrycount : false
					,viewname : me.options.alias
					,query : query
					,search : encodeURIComponent(searchtxt)
					,tmp : new Date().getTime()
				});
				return _uri.url;
				var _view = $ep.ui.view($(".viewpage",$ep.ui.active()));
				_view.options.query = $.extend(true, {}, _view.options.query, _query);
				_view.drawView();
				*/
			}
			,show : true
		}
		,btndetailsearch : {
			text : "상세검색"	
			,click : function() {
				var _active = $ep.ui.active()
				,__uri = $ep.util.CURI("/"+this.options.dbpath+"/viewPageSearch?readform", {
					search : "[biztripGroupCode]=0000000000"
				});
				$ep.util.loadPage(_active, __uri.url, biztrip_recordsearch);
			}
			,show : true
		}
	}
	
	,form : {
		proposal_biztrip : {
			btnclose : {
				text : "닫기"
				,click : function() {
					this.close();
				}
			}
		
			,btnreqbiztrip : {
				text : "출장신청"
				,click : function(){
					biztrip_recordsearch.req_biztrip(this);
				}
			}
			
			,btnreqbudget : {
				text : "예산요청"
				,click : function(){
					biztrip_recordsearch.req_budget(this);
				}
			}
		}
	}
};

biztrip_recordsearch.search_condition = function(form){
	var sc = {};
	
	if(form.alias=="vw_unit_mng"){
		sc.Unit= "화폐단위";
		sc.Symbol="화폐기호";
		sc.ExchangeRate="환율";
	}else if(form.alias=="vw_country_mng"){
		sc.Country= "국가명";
		sc.Country_Eng="영문";
	}else if(form.alias=="vw_city_mng"){
		sc.country= "국가";
		sc.city="도시";
	}else if(form.alias=="vw_affairs_mng"){
		sc.Sector= "부문";
		sc.Division="사업부";
		sc.Team= "팀";
		sc.Affairs_Display="담당자";
	}else if(form.alias=="vw_agree_mng"){
		
	}
		
	
	return sc;
	
};
/* 
 * 보기 초기화 
 */
biztrip_recordsearch.viewInit = function(form){
	
	var search_c = biztrip_recordsearch.search_condition(form);
	debugger;
	if(form.alias=="biztrip_report_view"){
		
		var _options = $.extend(true, {},biztrip_recordsearch.viewList[form.alias], form , {
			actions : {
				action : biztrip_recordsearch.actions.view
			}
			,search : {
				select : {
					items :	{
						"biztripGroupName" : "소속팀"
						,"biztripsubject" : "해외출장명"
						,"biztripCountry" : "출장국가"
						,"biztripCity" : "출장도시"
					}
					,width : 100
				}
				/*,width:200
				,click : function() {
					debugger;
				}*/
			}
			,events : {
				viewuri : function(opt) {
					alert("event");
					//debugger;
					var list_category = "";
					var filter = "";
					var query = "";
					var isTotal = "T";
					var searchtxt = "";
					
					
					var searchtxt =  "([biztripYear]=\"2014\")";
					searchtxt = searchtxt + " AND " + "([biztripQuarter]=\"Q1\")";
					//searchtxt = searchtxt + " AND " + "([biztripDivCode]=\"Q1\")";
					//searchtxt = searchtxt + " AND " + "([biztripChargeCode]=\"Q1\")";
					//searchtxt = searchtxt + " AND " + "([biztripGroupCode]=\"Q1\")";
					if(opt.search_option!=undefined){
						var aa=opt.search_option.field;
						var bb=opt.search_option.query;
						searchtxt = searchtxt + " AND " + "(["+aa+"]=" + bb + ")";
					}
					
				//	var _uri = $.CURI("/"+form.dbpath+"/search_view_selected?openagent" ,{		
					var _uri = $.CURI("/" + form.dbpath + "/api/data/collections/name/biztrip_report_view?restapi",{		
						//ty : "list"
						//,IsTotal : isTotal
						page : parseInt(opt.query.page)
						,ps : opt.query.ps
						,entrycount : false
						,viewname : opt.alias
						,query : query
						,search : encodeURIComponent(searchtxt)
						,tmp : new Date().getTime()
					});
					return _uri.url;
				}
				,click : function(row,col,data) { this.openDocument(data["@unid"]);	return;	}		
			}
			,searchheader : "([biztripGroupCode]=\"{query.category}\")"
			
		});
		var _view = $ep.ui.view($(".viewpage",$ep.ui.active()),_options,biztrip_recordsearch);
		biztrip_recordsearch.get_DeptOrgInfo(_view, _options, form);
	}
	$ep.ui.view($(".viewpage",$ep.ui.active()),_options,biztrip_recordsearch);
}; 


biztrip_recordsearch.docInit = function(opt) {
	
	$ep.ui.doc($(".formpage",$ep.ui.active()), $.extend(true,{
		actions : {
			action : biztrip_recordsearch.actions.form[opt.form]
		}
		,validator : {
			
			"Country" : {
				message : "국가를 입력하세요.",
				//target : $(),
				validate : /[^\s]+/g
			}
			
						
		}
		,resultType : "json"
		,events : {
			afterSubmit : function(xhr,data,ui) {
				if(!$.isPlainObject(data) || data.result !== "success")  {
					ui.unblock();
					$ep.util.toast("저장중 오류가 발생 했습니다.","click");
					return false;
				}
				this.close();
			}
			,afterSubmitError : function(xhr,data,ui) {
				ui.unblock();
				$ep.util.toast("저장중 오류가 발생 했습니다.","click");
				return false;
			}
			
			//,beforeSubmit : function(xhr,data,ui) {
			//	alert('before');
			//}
			/*,initAttachment : function(ele,attopt) {
				
				//return true;
			}*/
		}
		
	},opt),biztrip);
};

