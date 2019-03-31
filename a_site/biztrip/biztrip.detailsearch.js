/**
 * 해외출장이력 상세검색
 */
function biztrip_detailsearch(){}
$ep.inheritStatic(biztrip_detailsearch,"BIZTRIP", "biztrip");
biztrip_detailsearch.sep1 = "{`";
biztrip_detailsearch.sep2 = "{;";

biztrip_detailsearch.init = function(info){
	var sep1 = "{`";
	var sep2 = "{;";
	var city_info = ""; 
	var country_info = "";
	var country_list;
	var city_doc = new biztrip_detailsearch.XMLDOM();
	var fNode;
	var htmlStr = "";
	
	city_doc.load("/" + info.mngdbpath + "/vw_city_mng?ReadViewEntries&CollapseView&count=99999");
	country_Node = city_doc.selectNodes("/viewentries/viewentry/entrydata[@name='_country']");
	city_Node = city_doc.selectNodes("/viewentries/viewentry/entrydata[@name='_city']");

	if (country_Node.length > 0){
		for (var i = 0; i < country_Node.length; i++){
			country_info += (country_info==""?"":sep2) + country_Node[i].textContent;
			city_info += (city_info==""?"":sep2) + country_Node[i].textContent + sep1 + city_Node[i].textContent;
		}
	}

	country_list = country_info.split(sep2).unique();
	city_list = city_info.split(sep2).unique();

	for (var i = 0; i < country_list.length; i++) {
		htmlStr += '<label><input type="checkbox" name="Country" value="'+country_list[i]+'" onclick="biztrip_detailsearch.setCity(this)">' + country_list[i] + "</label>\n";
	}
	$("#_country_layer").html(htmlStr);
	
	var _options = biztrip_detailsearch.viewList[info.vtype];
	if(_options == null) return;
	if(_options.alias == "") _options.alias = info.alias;
	var _ext_opt = info.ext_opt||{};
	if(_options.dbpath) _ext_opt.dbpath = _options.dbpath;
	
	_options = $.extend(true, {}, _options, _ext_opt, {
		events:{
			click:function(e, tr, data){
				var url = '/' + _ext_opt.dbpath + '/all/' + data._unid + "?opendocument";
				this.openDocument(url);
			}
		}
	});
	if(_options.restricttocategory){
		if(!_options.query) _options.query = {};
		_options.query.category = _options.restricttocategory();
	}

	if(!_options.query) _options.query = {};
	//if(!_options.query.entrycount) _options.query.entrycount = "false";

	$(".btn-action-down").epbutton({
		text : "엑셀다운"
		,id : "excel"
		,show : true
		,click : function() {
			var addquery = "";
			var addcountry = "";
			var addcity = "";
			var sep = "{`";

			addquery += $("input[name=DeptCode]").val() + sep;
			addquery += $("input[name=User]").val() + sep;
			addquery += $("input[name=Category]").val() + sep;
			addquery += $("input[name=StartYear]").val() + sep;
			addquery += $("input[name=StartMonth]").val() + sep;
			addquery += $("input[name=EndYear]").val() + sep;
			addquery += $("input[name=EndMonth]").val() + sep;
			$(":checkbox[name='Country']:checked").each(function(pi,po){
				if (pi == 0){
					addcountry += po.value;
				}else{
					addcountry += "," + po.value;
				}
			});
			addquery += addcountry + sep;
			$(":checkbox[name='City']:checked").each(function(pi,po){
				if (pi == 0){
					addcity += po.value;
				}else{
					addcity += "," + po.value;
				}
			});
			addquery += addcity + sep;
			addquery += $("input[name=StartUsers]").val() + sep;
			addquery += $("input[name=EndUsers]").val() + sep;
			addquery += $("input[name=StartCost]").val() + sep;
			addquery += $("input[name=EndCost]").val() + sep;
			addquery += $("input[name=Subject]").val();
			
			var _uri = $.CURI(
				"/" + _options.dbpath + "/excel_view_detail?OpenAgent"
				, {allquery : addquery}
			).encode();
			
			$('#excelframe').attr('src', _uri.url);
		}
	});
	
	$(".btn-action-search").epbutton({
		text : "검색하기"
		,id : "search"
		,show : true
		,click : function() {
			var addquery = "";
			var addcountry = "";
			var addcity = "";

			if ($("input[name=DeptCode]").val() != ""){
				addquery += "[biztripGroupCode] = " + $("input[name=DeptCode]").val();
				addquery += " AND ([biztripDivCode] = " + $("input[name=DeptCode]").val();
				addquery += " OR [biztripChargeCode] = " + $("input[name=DeptCode]").val() + ")"

			}
			if ($("input[name=User]").val() != ""){
				addquery += " AND [biztripName] Contains " + $("input[name=User]").val();
				addquery += " AND [TOTAL_MEMBER_INFO] Contains " + $("input[name=User]").val();
			}
			if ($("input[name=Category]").val() != ""){
				addquery += " AND [biztripKind] Contains " + $("input[name=biztripKind]").val();
			}
			if ($("input[name=StartYear]").val() != ""){
				addquery += " AND [StartDate1] >= " + $("input[name=StartYear]").val() + "-01-01";
			}
			if ($("input[name=StartMonth]").val() != ""){
				var start_month = "0" + $("input[name=StartMonth]").val(); 
				addquery += " AND [StartDate1] >= " + $("input[name=StartYear]").val() + "-" + start_month.substring(start_month.length - 2) + "-01";
			}
			if ($("input[name=EndtYear]").val() != ""){
				addquery += " AND [EndDate1] <= " + $("input[name=EndYear]").val() + "-12-31";
			}
			if ($("input[name=EndMonth]").val() != ""){
				var end_month = "0" + $("input[name=EndMonth]").val();
				var lastDay = ( new Date($("input[name=EndYear]").val(), end_month, 0) ).getDate();
				addquery += " AND [EndDate1] <= " + $("input[name=EndYear]").val() + "-" + end_month.substring(end_month.length - 2) + "-" + lastDay;
			}
			$(":checkbox[name='Country']:checked").each(function(pi,po){
				if (pi == 0){
					addcountry += "[btCountry] Contains " + po.value;
				}else{
					addcountry += " OR [btCountry] Contains " + po.value;
				}
			});
			if (addcountry != ""){
				addquery += " AND (" + addcountry + ")"
			}
			$(":checkbox[name='City']:checked").each(function(pi,po){
				if (pi == 0){
					addcity += "[btCity] Contains " + po.value;
				}else{
					addcity += " OR [btCity] Contains " + po.value;
				}
			});
			if (addcity != ""){
				addquery += " AND (" + addcity + ")"
			}
			if ($("input[name=StartUsers]").val() != ""){
				addquery += " AND [biztripTotalNum] >= " + $("input[name=StartUsers]").val();
			}
			if ($("input[name=EndUsers]").val() != ""){
				addquery += " AND [biztripTotalNum] <= " + $("input[name=EndUsers]").val();
			}
			if ($("input[name=StartCost]").val() != ""){
				addquery += " AND [biztripTotalFee] >= " + $("input[name=StartCost]").val();
			}
			if ($("input[name=EndCost]").val() != ""){
				addquery += " AND [biztripTotalFee] <= " + $("input[name=EndCost]").val();
			}
			if ($("input[name=Subject]").val() != ""){
				addquery += " AND [biztripSubject] Contains " + $("input[name=Subject]").val();
			}
			
			var _view = $ep.ui.view($(".viewpage",$ep.ui.active()));
			_view.options.query.page = "0";
			_view.options.query.search = addquery;
			_view.drawView();	
		}
	});	
	
	biztrip_detailsearch.active = $ep.ui.view($(".viewpage",$ep.ui.active()),_options,biztrip_detailsearch);
};

biztrip_detailsearch.viewList = {
	biztrip_report_view : {
		actions : {}
		,alias : "biztrip_report_view"
		/*,restricttocategory : function(){return aprv_comm.CurEmpNo;}*/
		,column : {
			/*selectable : "checkbox"*/
			_startdate : {
				title : "출장일시"
				,hidewidth:true
				,css : {width: "150px"}
			}
			,_biztripkind : {
				title : "유형"
				,css : {width: "100px"}
			}
			,_btcountry : {
				title : "국가"
				,css : {width: "80px"}
			}
			,_btcity : {
				title : "도시"
				,css : {width: "80px"}
			}
			,_subject : {
				title : "해외출장명"
				,hidewidth:true
			}
			,_biztriptotalnum : {
				title : "인원"
				,css : {width: "50px"}
			}
			,_biztriptotalfee : {
				title : "품의금액"
				,css : {width: "80px"}
			}
			,_plantype : {
				title : "상태"
				,css : {width: "50px"}
			}
		}
		,breadcrumb : "상세검색"
		,appcode : "biztrip"
		,search : {}
		,searchheader : ""
	}
};

biztrip_detailsearch.setCity = function(me) {
	var country_info = "";
	var htmlStr = "";
	var country_list;
	var citys;
	var _Country = $("input[name=Country]");
	
	for (var i = 0; i < _Country.length; i++) {
		if (_Country[i].checked) {
			country_info += (country_info==""?"":biztrip_detailsearch.sep2) + _Country[i].value;
		}
	}

	country_list = country_info.split(biztrip_detailsearch.sep2).unique();
	for (var i = 0; i < country_list.length; i++) {
		for(var j = 0; j < city_list.length; j++) {
			if (city_list[j] != undefined) {
				citys = city_list[j].split(biztrip_detailsearch.sep1);
				if (citys[0] == country_list[i]) {
					htmlStr += '<label><input type="checkbox" name="City" value="'+citys[1]+'">' + citys[1] + "</label>";			
				}
			}
		}
	}
	$("#_city_layer").html(htmlStr);
};

biztrip_detailsearch.XMLDOM = function(){
	this._xmlDom = null;
	this._xmlHttp = null;
	if (window.ActiveXObject){
		this._xmlHttp = new ActiveXObject("Microsoft.XMLHTTP") ;
	}else{
		this._xmlHttp = new XMLHttpRequest();
	}
};
 
biztrip_detailsearch.XMLDOM.prototype.load = function(fileName){
	this._xmlHttp.open("GET", fileName, false);
	this._xmlHttp.send("");
	var res = this._xmlHttp.responseText.replace(/[\n\r]/gi,"");
	this._xmlDom = this._xmlHttp.responseXML;
};
 
biztrip_detailsearch.XMLDOM.prototype.selectNodes = function(xpath){
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
 
biztrip_detailsearch.XMLDOM.prototype.selectSingleNode = function(xpath){
	return this.selectNodes(xpath)[0];
};
 
Array.prototype.unique = function() {
	var a = [];
	var l = this.length;
	for(var i=0; i<l; i++) {
		for(var j=i+1; j<l; j++) {
			if (this[i] === this[j])
				j = ++i;
		}
		a.push(this[i]);
	}
	return a;
};
