
function biztrip() {};
$ep.inheritStatic(biztrip,"BIZTRIP","biztrip");

biztrip.showsidemenu = function(form){
	var def_groupcode="no";
	if(form.Affairs_DeptInfo!=""){
		var tmp_list = form.Affairs_DeptInfo.split(', ');
		for(var idx in tmp_list){
			var tmp_list2 = tmp_list[idx].split('<!sep>');
			if(def_groupcode=="no"){
				var def_groupcode = tmp_list2[0];
				break;
			}
		}
	}
	
	var adminmenu = biztrip.showadminmenu(form);
	
	var menu = [];
	menu.push({text:"{VIEW.SIDE.MENU.VIEW01}",href:"/"+form.dbpath+"/home?readform&alias=vw_btrequest_all&category="+form.groupcode});
	menu.push({text:"{VIEW.SIDE.MENU.VIEW02}",href:"/"+form.aprvdbpath+"/approval?OpenForm&parentunid="+form.aprvform3});
	menu.push({text:"{VIEW.SIDE.MENU.VIEW03}",href:"/"+form.dbpath+"/biztripcalendar?readform"});
	menu.push({text:"{VIEW.SIDE.MENU.MY_BTREQUEST_ALL}",href:"/"+form.dbpath+"/viewpage?readform&alias=my_btrequest_all&category="+form.groupcode});
	
	//서무담당자
	if(form.Affairs_DeptInfo!="" || form.isManager=="yes"){
		menu.push({text:"{VIEW.SIDE.MENU.VIEW05}",href:"/"+form.dbpath+"/viewpage?readform&alias=vw_btrequest_all&category="+def_groupcode});
		menu.push({text:"{VIEW.SIDE.MENU.VW_BTBUDGET_ALL}",href:"/"+form.dbpath+"/viewpage?readform&alias=vw_btbudget_all&category="+def_groupcode});
	}
	//이력조회
	menu.push({text:"{VIEW.SIDE.MENU.VIEW06}",href:"/"+form.dbpath+"/viewpage?readform&alias=biztrip_report_view"});
	//관리자메뉴
	if(form.isManager=="yes"){
		menu.push({text:"{VIEW.SIDE.MENU.VIEW04}",isopen : false, items : adminmenu});
	}
	return menu;
};
biztrip.showadminmenu = function(form){
	var adminmenu = [];
	adminmenu.push({text:"{VIEW.SIDE.MENU.VW_UNIT_MNG}",href:"/"+form.mngdbpath+"/viewpage?readform&alias=vw_unit_mng"});
	adminmenu.push({text:"{VIEW.SIDE.MENU.VW_COUNTRY_MNG}",href:"/"+form.mngdbpath+"/viewpage?readform&alias=vw_country_mng"});
	adminmenu.push({text:"{VIEW.SIDE.MENU.VW_CITY_MNG}",href:"/"+form.mngdbpath+"/viewpage?readform&alias=vw_city_mng"});
	adminmenu.push({text:"{VIEW.SIDE.MENU.VW_AFFAIRS_MNG}",href:"/"+form.mngdbpath+"/viewpage?readform&alias=vw_affairs_mng"});
	adminmenu.push({text:"{VIEW.SIDE.MENU.SUBVIEW05}",href:"/"+form.mngdbpath+"/role?openform"});
	adminmenu.push({text:"{VIEW.SIDE.MENU.VW_AGREE_MNG}",href:"/"+form.mngdbpath+"/viewpage?readform&alias=vw_agree_mng"});
	return adminmenu;
};
/* lnb 초기화 */
biztrip.sideInit = function(form){
	var def_groupcode="no";
	if(form.Affairs_DeptInfo!=""){
		var tmp_list = form.Affairs_DeptInfo.split(', ');
		for(var idx in tmp_list){
			var tmp_list2 = tmp_list[idx].split('<!sep>');
			if(def_groupcode=="no"){
				var def_groupcode = tmp_list2[0];
				break;
			}
		}
	}
	
	
	var smenu = biztrip.showsidemenu(form);
	
	$ep.ui.sidemenu($(".epSideMenu",$ep.ui.activeNav()),{
		title : "{APPTITLE}"
		,button : [
			{
				text : "품의신청"
				,show : true
				,width : 80
				,highlight : true
				,click:function(){
					biztrip.showNew(form);
				}
			}
			,{
				text : "임원출장품의"
					,show : true
					//,width : 80
					//,highlight : true
					,click:function(){
						biztrip.showNew2(form);
					}
			}
		]
		,items : smenu
		/*
		,items : [
		    {
		    	text : "{VIEW.SIDE.MENU.VIEW01}"	//홈
		    	,href : "/devaphqapp/app/biztrip/btrecord.nsf/home?readform&alias=vw_btrequest_all&category="+form.groupcode
		    }
		   ,{
			   text : "{VIEW.SIDE.MENU.VIEW02}"		//임원출장보고
			   ,href : "/devaphqapp/aprv/aprv.nsf/approval?OpenForm&parentunid="+form.aprvform3
			}
		   ,{
			   text : "{VIEW.SIDE.MENU.VIEW03}"		//임원출장확인
			   ,href : "/ngw/comm/prototype.nsf/viewpage?readform&alias=view01"
			}
		   ,{
			   text : "{VIEW.SIDE.MENU.MY_BTREQUEST_ALL}"	//출장품의문서
			   ,href : "/devaphqapp/app/biztrip/btrecord.nsf/viewpage?readform&alias=my_btrequest_all&category="+form.groupcode
			}
		   ,{
			   text : "{VIEW.SIDE.MENU.VIEW05}"		//출장신청-서무담당자
			   ,href : "/devaphqapp/app/biztrip/btrecord.nsf/viewpage?readform&alias=vw_btrequest_all&category="+def_groupcode
			}
		   ,{
			   text : "{VIEW.SIDE.MENU.VW_BTBUDGET_ALL}"	//예산요청-서무담당자
			   ,href : "/devaphqapp/app/biztrip/btrecord.nsf/viewpage?readform&alias=vw_btbudget_all&category="+form.groupcode
			}
		   ,{
		       text : "{VIEW.SIDE.MENU.VIEW04}"		//관리설정
		    	,isopen : false
		    	,items : [
		    	    {
		    	    	text : "{VIEW.SIDE.MENU.VW_UNIT_MNG}"	//화폐
		    	    	,href : "/devaphqapp/app/biztrip/btmng.nsf/viewpage?readform&alias=vw_unit_mng"
		    	    	,isactive : true
		    	    }
		    	    ,{
		    	    	text : "{VIEW.SIDE.MENU.VW_COUNTRY_MNG}"	//국가
		    	    	,href : "/devaphqapp/app/biztrip/btmng.nsf/viewpage?readform&alias=vw_country_mng"
		    	    }
		    	    ,{
		    	    	text : "{VIEW.SIDE.MENU.VW_CITY_MNG}"		//도시
		    	    	,href : "/devaphqapp/app/biztrip/btmng.nsf/viewpage?readform&alias=vw_city_mng"
		    	    }
		    	    ,{
		    	    	text : "{VIEW.SIDE.MENU.VW_AFFAIRS_MNG}"	//서무담당자
		    	    	,href : "/devaphqapp/app/biztrip/btmng.nsf/viewpage?readform&alias=vw_affairs_mng"
		    	    }
		    	    ,{
		    	    	text : "{VIEW.SIDE.MENU.SUBVIEW05}"		//권한관리
		    	    	,href : "/devaphqapp/app/biztrip/btmng.nsf/role?openform"
		    	    }
		    	    ,{
		    	    	text : "{VIEW.SIDE.MENU.VW_AGREE_MNG}"		//합의자관리
		    	    	,href : "/devaphqapp/app/biztrip/btmng.nsf/viewpage?readform&alias=vw_agree_mng"
		    	    }
		    	]
		    }
		   
		]
		*/
	},biztrip);	
} 

biztrip.showNew = function(form){
	$("li.active",$ep.ui.activeNav()).removeClass("active");
	biztrip.setReferer();
	$ep.ui.loadPageLang($ep.ui.active(), '/' + form.aprvdbpath + '/approval?OpenForm&parentunid='+form.aprvform1,biztrip);
	
};

biztrip.showNew2 = function(form){
	$("li.active",$ep.ui.activeNav()).removeClass("active");
	biztrip.setReferer();
	$ep.ui.loadPageLang($ep.ui.active(), '/' + form.aprvdbpath + '/approval?OpenForm&parentunid='+form.aprvform2,biztrip);
	
};

/**
 * 이전으로 돌아가기 위한 Referer 설정
 */
biztrip.setReferer = function(){
	var referer = $ep.ui.getPageHref();
	$ep.ui.setReferer(referer);
}
//button 예제
biztrip.affairs_dept = function(form){
	var menu = {};
	var tmp_list = form.Affairs_DeptInfo.split(', ');
	
	for(var idx in tmp_list){
		var tmp_list2 = tmp_list[idx].split('<!sep>');
		menu["btn_" + idx] = {text:tmp_list2[1], show:true, click:function(){biztrip.showNew2(form);}};
	}
	return menu;
	
};
//select
biztrip.affairs_dept2 = function(form){
	var menu = [];
	var tmp_list = form.Affairs_DeptInfo.split(', ');
	
	for(var idx in tmp_list){
		var tmp_list2 = tmp_list[idx].split('<!sep>');
		//menu["btn_" + idx] = {text:tmp_list2[1], show:true, click:function(){biztrip.showNew2(form);}};
		menu.push({id:tmp_list2[0],text:tmp_list2[1],data:tmp_list2[0]});
	}
	return menu;
	
};


biztrip.showDeptSelectBox=function(view, opt, form){
	
	var seldept = biztrip.affairs_dept2(form);
	var tmp_list = form.Affairs_DeptInfo.split(', ');
	
	var _sel = $ep.ui.select($(".view-selection",$ep.ui.active())
			,{items:seldept
			,change:function(e, ui){
					view.options.query.category = _sel.getSelectedValue();
					view.redraw();
				}
			}
			,biztrip);
	
	$(".view-selection",$ep.ui.active()).css("margin-right", "10px");
	if(opt.query.category) _sel.setSelected(opt.query.category);
};

biztrip.Delete=function(me){
	
	if(!confirm("선택하신 문서를 삭제하시겠습니까?")) return;
	
	var url = '/' + me.options.dbpath + '/DeleteDocument?OpenAgent&id='+me.options.unid;
	$ep.util.ajax({
		url : url,
		type : "get",
		dataType : "text",
		async : false,
		success : function(data) {
			_data=data;
			var strString = '<!SP>';
			htmlStr = _data.substring(_data.indexOf(strString)+strString.length, _data.indexOf("<!EP>"));
			//alert(htmlStr);
			if (htmlStr == 'OK') {
				alert('문서를 삭제하였습니다.');
				//$ep.ui.doc($(".formpage",$ep.ui.active()).close();
				me.close();
			} else {
				alert(htmlStr);
				return;
			}
		}
		,error : function(){
			alert("Connection Error ......");
		}
	});
};

biztrip.req_biztrip=function(me){
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

biztrip.req_budget=function(me){
	var url = '/' + me.options.dbpath + '/get_link_info?OpenAgent&key='+me.options.unid + "&flag=";
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
		alert("이미 예산요청이 되어 있습니다.");
		return;					
	}
	
	$("li.active", $ep.ui.activeNav()).removeClass("active");
	$ep.ui
			.loadPageLang(
					$ep.ui.active(),
						"/"
							+ me.options.aprvdbpath+'/approval?OpenForm&parentunid='
							+ me.options.aprvform5
							+ '&callfrom=biztrip' + _data, biztrip);
		

};

biztrip.open_subwin=function(url, width, height, scrollbars, win_name, resizable){
	return $.goSiteLink({
		url : url
		,type : "get"
		,feature : {width:width, heigiht:height, resizable : resizable}
	});
};

biztrip.viewList = {
	my_btrequest_all : { 
		column : {
			_attached : {
				css : {width: "20px"}
				,classes : "txtC"
				,render : function(tr,td,data,col){
					return data._attached == "1" ? '<p class="ep-icon attachment" />' : '';
				}
			}
			,_biztripgroupname : {
				title : "{VIEW.COLUMNS.BIZTRIPGROUPNAME}"
				//,sortable : {descending : true}
				,css : {width: "100px"}
				//,type : "isodate"
				//,dateformat : "fullDate"
			}
			,_biztripkind : {
				title : "{VIEW.COLUMNS.BIZTRIPKIND}"
				,css : {width : "120px"}
				,hidewidth : true
			}
			,_subject : {
				title : "{VIEW.COLUMNS.SUBJECT}"
				,type : "multilevel"
				//,sortable : {ascending:true}
			}
			,_biztripname : {
				title : "{VIEW.COLUMNS.BIZTRIPNAME}"
				,css : {width: "150px"}
				//,type : "userinfo"
				,hidewidth : true	
			}
			,_btcountry : {
				title : "{VIEW.COLUMNS.BTCOUNTRY}"
				,type : "multilevel"
				//,sortable : {ascending:true}
			}
			,_totalfee : {
				title : "{VIEW.COLUMNS.TOTALFEE}"
				,type : "multilevel"
				//,sortable : {ascending:true}
			}
			,_startdate : {
				title : "{VIEW.COLUMNS.STARTDATE}"
				,type : "multilevel"
				//,sortable : {ascending:true}
			}
			
		}
		,breadcrumb : "{VIEW.SIDE.MENU.MY_BTREQUEST_ALL}"
	}	
	,vw_btrequest_all : { 
		column : {
			selectable : "radio"
			,_attached : {
				css : {width: "20px"}
				,classes : "txtC"
				,render : function(tr,td,data,col){
					return data._attached == "1" ? '<p class="ep-icon attachment" />' : '';
				}
			}
			,_biztripgroupname : {
				title : "{VIEW.COLUMNS.BIZTRIPGROUPNAME}"
				//,sortable : {descending : true}
				,css : {width: "100px"}
				//,type : "isodate"
				//,dateformat : "fullDate"
			}
			,_biztripkind : {
				title : "{VIEW.COLUMNS.BIZTRIPKIND}"
				,css : {width : "120px"}
				,hidewidth : true
			}
			,_subject : {
				title : "{VIEW.COLUMNS.SUBJECT}"
				,type : "multilevel"
				//,sortable : {ascending:true}
			}
			,_biztripname : {
				title : "{VIEW.COLUMNS.BIZTRIPNAME}"
				,css : {width: "150px"}
				//,type : "userinfo"
				,hidewidth : true	
			}
			,_btcountry : {
				title : "{VIEW.COLUMNS.BTCOUNTRY}"
				,type : "multilevel"
				//,sortable : {ascending:true}
			}
			,_totalfee : {
				title : "{VIEW.COLUMNS.TOTALFEE}"
				,type : "multilevel"
				//,sortable : {ascending:true}
			}
			,_startdate : {
				title : "{VIEW.COLUMNS.STARTDATE}"
				,type : "multilevel"
				//,sortable : {ascending:true}
			}
			
		}
		,breadcrumb : "{VIEW.SIDE.MENU.VW_BTREQUEST_ALL}"
	}
	,vw_btbudget_all : { 
		column : {
			selectable : "radio"
			,_attached : {
				css : {width: "20px"}
				,classes : "txtC"
				,render : function(tr,td,data,col){
					return data._attached == "1" ? '<p class="ep-icon attachment" />' : '';
				}
			}
			,_biztripgroupname : {
				title : "{VIEW.COLUMNS.BIZTRIPGROUPNAME}"
				//,sortable : {descending : true}
				,css : {width: "100px"}
				//,type : "isodate"
				//,dateformat : "fullDate"
			}
			,_biztripkind : {
				title : "{VIEW.COLUMNS.BIZTRIPKIND}"
				,css : {width : "120px"}
				,hidewidth : true
			}
			,_subject : {
				title : "{VIEW.COLUMNS.SUBJECT}"
				,type : "multilevel"
				//,sortable : {ascending:true}
			}
			,_biztripname : {
				title : "{VIEW.COLUMNS.BIZTRIPNAME}"
				,css : {width: "150px"}
				//,type : "userinfo"
				,hidewidth : true	
			}
			,_btcountry : {
				title : "{VIEW.COLUMNS.BTCOUNTRY}"
				,type : "multilevel"
				//,sortable : {ascending:true}
			}
			,_totalfee : {
				title : "{VIEW.COLUMNS.TOTALFEE}"
				,type : "multilevel"
				//,sortable : {ascending:true}
			}
			,_startdate : {
				title : "{VIEW.COLUMNS.STARTDATE}"
				,type : "multilevel"
				//,sortable : {ascending:true}
			}
			
		}
		,breadcrumb : "{VIEW.SIDE.MENU.VW_BTREQUEST_ALL}"
	}
	,vw_unit_mng : {
		column : {
			selectable : "checkbox"
			,_unit : {
				title : "{VIEW.COLUMNS.UNIT}"
				,type : "multilevel"
				,sortable : true
				
			}
			,_symbol : {
				title : "{VIEW.COLUMNS.SYMBOL}"
				//,sortable : {ascending:true}
				,css : {width: "220px"}
				,hidewidth : true		
			}
			,_exchangerate : {
				title : "{VIEW.COLUMNS.EXCHANGERATE}"
				,css : {width: "150px"}
				,hidewidth : true		
			}
		}
		,breadcrumb : "{VIEW.SIDE.MENU.VW_UNIT_MNG}"
	}
	,vw_country_mng : {
		column : {
			selectable : "checkbox"
			,_country : {
				title : "{VIEW.COLUMNS.COUNTRY}"
				,type : "multilevel"
				,sortable : true
				
			}
			,_country_eng : {
				title : "{VIEW.COLUMNS.COUNTRY_ENG}"
				//,sortable : {ascending:true}
				,css : {width: "220px"}
				,hidewidth : true		
			}
		}
		,breadcrumb : "{VIEW.SIDE.MENU.VW_COUNTRY_MNG}"
	}
	,vw_city_mng : { 
		column : {
			selectable : "checkbox"
			,_country : {
				title : "{VIEW.COLUMNS.COUNTRY}"
				//,sortable : {descending : true}
				,css : {width: "100px"}
				//,type : "isodate"
				//,dateformat : "fullDate"
			}
			,_city : {
				title : "{VIEW.COLUMNS.CITY}"
				,type : "multilevel"
				,hidewidth : true
			}
			,_unit : {
				title : "{VIEW.COLUMNS.UNIT}"
				,css : {width : "120px"}
				//,sortable : {ascending:true}
			}
			,_exchangerate : {
				title : "{VIEW.COLUMNS.EXCHANGERATE}"
				,css : {width: "120px","text-align":"right"}
				//,type : "userinfo"
				,hidewidth : true	
			}
			,_perdiem : {
				title : "{VIEW.COLUMNS.PERDIEM}"
				,css : {width: "120px","text-align":"right"}
				//,sortable : {ascending:true}
			}
			,_lodgingcost : {
				title : "{VIEW.COLUMNS.LODGINGCOST}"
				,css : {width: "120px","text-align":"right"}
				//,sortable : {ascending:true}
			}
			,_airfare : {
				title : "{VIEW.COLUMNS.AIRFARE}"
				,css : {width: "120px","text-align":"right"}
				//,sortable : {ascending:true}
			}
			
		}
		,breadcrumb : "{VIEW.SIDE.MENU.VW_CITY_MNG}"
		/*,extcount : {
			url : "/{dbpath}/test?openagent"
			,expression : "{AAA}"
		}*/
		/*,viewtype : "unid"*/
	}
	,vw_affairs_mng : {
		column : {
			selectable : "checkbox"
			,_sector : {
				title : "{VIEW.COLUMNS.SECTOR}"
				//,sortable : {descending : true}
				,css : {width: "250px"}
				//,type : "isodate"
				//,dateformat : "fullDate"
			}
			,_division : {
				title : "{VIEW.COLUMNS.DIVISION}"
				,css : {width: "250px"}
				
				,hidewidth : true
			}
			,_team : {
				title : "{VIEW.COLUMNS.TEAM}"
				,css : {width : "250px"}
				//,sortable : {ascending:true}
			}
			,_affairs : {
				title : "{VIEW.COLUMNS.AFFAIRS}"
					,type : "multilevel"
				//,type : "userinfo"
				,hidewidth : true	
			}
			
		}
		,breadcrumb : "{VIEW.SIDE.MENU.VW_CITY_MNG}"
		/*,extcount : {
			url : "/{dbpath}/test?openagent"
			,expression : "{AAA}"
		}*/
		/*,viewtype : "unid"*/
	}
	,vw_agree_mng : {
		column : {
			selectable : "checkbox"
			,_sector : {
				title : "{VIEW.COLUMNS.SECTOR}"
				//,sortable : {descending : true}
				,css : {width: "350px"}
				//,type : "isodate"
				//,dateformat : "fullDate"
			}
			,_agree : {
				title : "{VIEW.COLUMNS.AFFAIRS}"
				,type : "multilevel"
				//,type : "userinfo"
				,hidewidth : true	
			}
			
		}
		,breadcrumb : "{VIEW.SIDE.MENU.VW_CITY_MNG}"
		/*,extcount : {
			url : "/{dbpath}/test?openagent"
			,expression : "{AAA}"
		}*/
		/*,viewtype : "unid"*/
	}
	,view01 : { 
		column : {
			selectable : "checkbox"
			,_attached : {
				css : {width: "20px"}
				,classes : "txtC"
				,render : function(tr,td,data,col){
					return data._attached == "1" ? '<p class="ep-icon attachment" />' : '';
				}
			}
			,_createdate : {
				title : "{VIEW.COLUMNS.CREATEDDATE}"
				,sortable : {descending : true}
				,css : {width: "100px"}
				,type : "isodate"
				,dateformat : "fullDate"
			}
			,_category : {
				title : "{VIEW.COLUMNS.CATEGORY}"
				,css : {width : "120px"}
				,hidewidth : true
			}
			,_subject : {
				title : "{VIEW.COLUMNS.SUBJECT}"
				,type : "multilevel"
				//,sortable : {ascending:true}
			}
			,_author : {
				title : "{VIEW.COLUMNS.AUTHOR}"
				,css : {width: "150px"}
				,type : "userinfo"
				,hidewidth : true	
			}
		}
		,breadcrumb : "{VIEW.SIDE.MENU.VIEW01}"
		/*,extcount : {
			url : "/{dbpath}/test?openagent"
			,expression : "{AAA}"
		}*/
		/*,viewtype : "unid"*/
	}
	
	,view02 : {
		column : {
			_createdate : {
				title : "{VIEW.COLUMNS.CREATEDDATE}"
				//,sortable : true
				,css : {width: "220px"}
				,type : "isodate"
				,dateformat : "fullDateTime"
			}
			,_subject : {
				title : "{VIEW.COLUMNS.SUBJECT}"
				,type : "multilevel"
				//,sortable : {ascending:true}
			}
			,_author : {
				title : "{VIEW.COLUMNS.AUTHOR}"
				,css : {width: "150px"}
				,hidewidth : true
				,type : "userinfo"				
			}
		}
	}
};

biztrip.actions = {
	view : {
		btnopen : {
			text : "작성"	
			,click : function() {
					if(this.options.alias=='vw_unit_mng'){
						this.openForm("unit");
					}else if(this.options.alias=='vw_city_mng'){
						this.openForm("city");	
					}else if(this.options.alias=='vw_affairs_mng'){
						this.openForm("affairs");	
					}else if(this.options.alias=='vw_agree_mng'){
						this.openForm("agree");	
					}else{
						this.openForm("country");	
					}
					
				
				//this.openForm("country");	
			}
			,show : true
		}
		,btndel : {
			text : "{VIEW.ACTION.SELECTEDREMOVE}"
			,click : function() {
				var _self = this
				,_o = this.getSelected();
				if(!_o.length) {$ep.util.toast("삭제할 문서를 선택해 주세요.");return;}
				$.when($ep.Array(_o).datafilter(function(idx,val) {
					var _u = $.CURI(_self.url())
					return $ep.util.ajax( {
						url : $.CURI(_self.url()).getNSF() + "/"+_self.options.alias + "/" + val.data["@unid"] + "?deletedocument"  
						,type : "get"
						,async : false
					});
				}))
				.done(function() {
					_self.refresh();
				});
				
				//debugger;
			}
			,show : true
		}
	}
	,biztripview : {
		btnselect :  {
			text : "선택"
			,show : false
			,bindchild : "btnshow"
			,children : {
				btnshow : {
					text : "show"
					,show : true
					,click : function() {
						
					}		
				}				
			}
		}
		,btnopen : {
			text : "출장신청"	
			,click : function() {
				var _self = this, _o = this.getSelected();
				if(!_o.length) {$ep.util.toast("출장신청할 문서를 선택하십시오");return;}
				var _data = "";
				$.when($ep.Array(_o).filter(
						function(idx, val) {
							var _u = $.CURI(_self.url())
							//alert(val.data["@unid"]);

							$ep.util.ajax({
								url : $.CURI(_self.url()).getNSF()
										+ "/get_link_info?open&key="
										+ val.data["@unid"] + "&flag=B",
								type : "get",
								async : false,
								success : function(data) {
									_data = data;
								},
								error : function() {
									alert("error");
								}
							})
							/*
							 * .done(function(data,txt,xhr) { _data = data;
							 * alert(data); });
							 */
						}));

				
				if(_data.indexOf('isExist')>-1){
					alert("이미 출장신청이 되어 있습니다.");
					return;					
				}
				$("li.active", $ep.ui.activeNav()).removeClass("active");
				/*$ep.ui
						.loadPageLang(
								$ep.ui.active(),
								'/'
										+ this.options.aprvdbpath + '/approval?OpenForm&parentunid='
										+ this.options.aprvform4
										+ '&callfrom=biztrip' + _data, biztrip);*/
				this.openDocument('/'
						+ this.options.aprvdbpath + '/approval?OpenForm&parentunid='
						+ this.options.aprvform4
						+ '&callfrom=biztrip' + _data);
					
			}
			,show : true
		}

	}
	,budgetview : {
		btnopen : {
			text : "예산요청"	
			,click : function() {
				
				var _self = this, _o = this.getSelected();
				if(!_o.length) {$ep.util.toast("예산요청할 문서를 선택하십시오");return;}
				var _data = "";
				$.when($ep.Array(_o).datafilter(
						function(idx, val) {
							var _u = $.CURI(_self.url())

							$ep.util.ajax({
								url : $.CURI(_self.url()).getNSF()
										+ "/get_link_info?open&key="
										+ val.data["@unid"] + "&flag=",
								type : "get",
								async : false,
								success : function(data) {
									_data = data;
								},
								error : function() {
									alert("error");
								}
							})
							/*
							 * .done(function(data,txt,xhr) { _data = data;
							 * alert(data); });
							 */
						}));

				// var _url =
				// '/devaphqapp/app/biztrip/btrecord.nsf/get_link_info?OpenAgent&key='+key+'&flag=B';
				// alert(_url);
				// _url = $.CURI(_url, this.options.query);
				
				if(_data.indexOf('isExist')>-1){
					alert("이미 예산요청이 되어 있습니다.");
					return;					
				}
				$("li.active", $ep.ui.activeNav()).removeClass("active");
				$ep.ui
						.loadPageLang(
								$ep.ui.active(),
								'/'
										+ this.options.aprvdbpath + '/approval?OpenForm&parentunid='
										+ this.options.aprvform5
										+ '&callfrom=biztrip'+ _data, biztrip);
				
				//$("li.active",$ep.ui.activeNav()).removeClass("active");
				//$ep.ui.loadPageLang($ep.ui.active(), '/' + 'devaphqapp/aprv/aprv.nsf/approval?OpenForm&parentunid='+this.options.aprvform5,biztrip);
					
				
					
			}
			,show : true
		}
	}
	
	,form : {
		appointment : {
			btnclose : {
				text : "닫기"
				,click : function() {
					this.close();
				}
			}
		}
		,country : {
			btnclose : {
				text : "닫기"
				,click : function() {
					this.close();
				}
			}
			,btnsave : {
				text : "저장"
				,click : function() {
					var fieldName =["Country"];
					var alertMsg = ["국가"];
					if (biztrip.validationCheck(fieldName, alertMsg)) {
						if (biztrip.checkDocument()) {
							this.submit();
						}
					}
				}
			}
			,btnedit : {
				text : "편집"
				,click : function(){
					this.editDocument();
				}
			}
			,btndel : {
				text : "삭제"
				,click : function(){
					biztrip.Delete(this);
				}
			}
			
		}
		,unit : {
			btnclose : {
				text : "닫기"
				,click : function() {
					this.close();
				}
			}
			,btnsave : {
				text : "저장"
				,click : function() {
					var fieldName =["Unit", "ExchangeRate"];
					var alertMsg = ["화폐단위", "환율"];
					if (biztrip.validationCheck(fieldName, alertMsg)) {
						if (biztrip.checkDocument()) {
							this.submit();
						}
					}
	
				}
			}
			,btnedit : {
				text : "편집"
				,click : function(){
					this.editDocument();
				}
			}
			,btndel : {
				text : "삭제"
				,click : function(){
					biztrip.Delete(this);
				}
			}
			
		}
		,city : {
			btnclose : {
				text : "닫기"
				,click : function() {
					this.close();
				}
			}
			,btnsave : {
				text : "저장"
				,click : function() {
					var fieldName =["Country", "City", "Unit", "PerDiem", "LodgingCost", "Airfare"];
					var alertMsg = ["국가", "도시", "화폐단위", "일비", "숙박비", "항공비"];
					if (biztrip.validationCheck(fieldName, alertMsg)) {
						if (biztrip.checkDocument()) {
							this.submit();
						}
					}
				}
			}
			,btnedit : {
				text : "편집"
				,click : function(){
					this.editDocument();
				}
			}
			,btndel : {
				text : "삭제"
				,click : function(){
					biztrip.Delete(this);
				}
			}
			
		}
		,affairs : {
			btnclose : {
				text : "닫기"
				,click : function() {
					this.close();
				}
			}
			,btnsave : {
				text : "저장"
				,click : function() {
					if(!biztrip.search_result_set()){
						return;
					}
					this.submit();
				}
			}
			,btnedit : {
				text : "편집"
				,click : function(){
					this.editDocument();
				}
			}
			,btndel : {
				text : "삭제"
				,click : function(){
					biztrip.Delete(this);
				}
			}
			
		}
		,agree : {
			btnclose : {
				text : "닫기"
				,click : function() {
					this.close();
				}
			}
			,btnsave : {
				text : "저장"
				,click : function() {
					if(!biztrip.search_result_set()){
						return;
					}
					this.submit();
				}
			}
			,btnedit : {
				text : "편집"
				,click : function(){
					this.editDocument();
				}
			}
			,btndel : {
				text : "삭제"
				,click : function(){
					biztrip.Delete(this);
				}
			}
			
		}
		,role : {
			btnclose : {
				text : "닫기"
				,click : function() {
					this.close();
				}
			}
			,btnsave : {
				text : "저장"
				,click : function() {
					if(!biztrip.search_result_set()){
						return;
					}
					this.submit();
				}
			}
			,btnedit : {
				text : "편집"
				,click : function(){
					this.editDocument();
				}
			}
		}
		,proposal_biztrip : {
			btnclose : {
				text : "닫기"
				,click : function() {
					this.close();
				}
			}
		
			,btnreqbiztrip : {
				text : "출장신청"
				,click : function(){
					biztrip.req_biztrip(this);
				}
			}
			
			,btnreqbudget : {
				text : "예산요청"
				,click : function(){
					biztrip.req_budget(this);
				}
			}
		}
		,form01 : {
			btnclose : {
				text : "닫기"
				,click : function() {
					this.close();
				}
			}
			,btnsave : {
				text : "저장"
				,click : function() {
					this.submit();
				}
			}
			,btntest :{
				text : "설정"
				,click : function(e) {
					$("input[name=test]",this.element)
					.val("1")
					.trigger("change");		 /*validate 반응 전달을 위해.*/
				}
				/*,children : {
					test2 : {
						text : "dddd"
						,click : function() {
							
						}
						,show : true
					}
				}*/
			}
			,btnedit : {
				text : "편집"
				,click : function(){
					this.editDocument();
				}
			}
			
		}	
	}
};

biztrip.search_condition = function(form){
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
biztrip.viewInit = function(form){
	
	var search_c = biztrip.search_condition(form);
	
	if(form.alias=="vw_btrequest_all"){
		
		//biztrip.actions.biztripview.btnselect.children = biztrip.affairs_dept(form);
		var _options = $.extend(true, {},biztrip.viewList[form.alias], form , {
			actions : {
				action : biztrip.actions.biztripview
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
				click : function(row,col,data) { this.openDocument(data["@unid"]);	return;	}			
			}
			,searchheader : "([biztripGroupCode]=\"{query.category}\")"
			//,searchheader : "([biztripGroupCode]=\"{query.category}\",[curr_consult_empno]=\"{query.category}\")"
			/*,query : {
				ps : 3
			}*/
		});
		
		var _view = $ep.ui.view($(".viewpage",$ep.ui.active()),_options,biztrip);
		biztrip.showDeptSelectBox(_view, _options, form);
		
	}else if (form.alias=="my_btrequest_all"){
		var _options = $.extend(true, {},biztrip.viewList[form.alias], form , {
			//actions : {
			//	action : biztrip.actions.budgetview
			//}
			search : {
				select : {
					items :	{
						"biztripGroupName" : "소속팀"
						,"biztripsubject" : "해외출장명"
						,"btCountry" : "출장국가"
						,"BTCity" : "출장도시"
					}
					,width : 100
				}
				/*,width:200
				,click : function() {
					debugger;
				}*/
			}
			,events : {
				click : function(row,col,data) { this.openDocument(data["@unid"]);	return;	}			
			}
			,searchheader : "([biztripGroupCode]=\"{query.category}\")"
		});
	}else if (form.alias=="vw_btbudget_all"){
		var _options = $.extend(true, {},biztrip.viewList[form.alias], form , {
			actions : {
				action : biztrip.actions.budgetview
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
				click : function(row,col,data) { this.openDocument(data["@unid"]);	return;	}			
			}
			,searchheader : "([biztripGroupCode]=\"{query.category}\")"
			
		});
		var _view = $ep.ui.view($(".viewpage",$ep.ui.active()),_options,biztrip);
		biztrip.showDeptSelectBox(_view, _options, form);
	}else if (form.alias=="biztrip_report_view"){
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
	}else{
		alert(form.alias);
		var _options = $.extend(true, {},biztrip.viewList[form.alias], form , {
			actions : {
				action : biztrip.actions.view
			}
		
			,search : {
				select : {
					items :	search_c
					/*
					items :	{
						"Unit" : "화폐단위"
						,"Symbol" : "화폐기호"
					}
					*/
					,width : 100
				}
				/*,width:200
				,click : function() {
					debugger;
				}*/
			}
			,events : {
				click : function(row,col,data) { this.openDocument(data["@unid"]);	return;	}			
			}
			/*,query : {
				ps : 3
			}*/
		});
	}
	/*
	var _options = $.extend(true, {},biztrip.viewList[form.alias], form , {
		actions : {
			action : biztrip.actions.view
		}
		,search : {
			select : {
				items :	{
					"subject" : "{SEARCH.SUBJECT}"
					,"author" : "{SEARCH.AUTHOR}"
				}
				,width : 100
			
		}
		,events : {
			click : function(row,col,data) { this.openDocument(data["@unid"]);	return;	}			
		}
		//,query : {
		//	ps : 3
	});
	*/
	
	$ep.ui.view($(".viewpage",$ep.ui.active()),_options,biztrip);
/*	
	$ep.ui.input(".view-search #search", {
		icon : "search"
		,select : { 
			items : {
				blank : "blank"
				,red : "red"
			}
		}
	},biztrip);*/
}; 


biztrip.docInit = function(opt) {
	if(opt.form=="city" && opt.isedit){
		$ep.ui.select($("select[name=Unit]")).setOptions({
			selectchange : function(e,ui) {
				biztrip.drawUnitDetail(this);
			}
		});
	}
	$ep.ui.doc($(".formpage",$ep.ui.active()), $.extend(true,{
		actions : {
			action : biztrip.actions.form[opt.form]
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

