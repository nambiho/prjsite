function ws4703() { }
ws4703.contentName = "만족도조사"; 
ws4703.title = {}
ws4703.viewtitle = {}
ws4703.formButtons = {} 

ws4703.drawTeamTable = function (doc){
	var doc = $(GC.active(true)).doc()
	, _h, txt1, txt2, txt3, txt4, txt5
	, tp = doc.getOption("reqteamprofile")
	, rbr = ""
	, type = doc.getOption("type")
	, itsec = doc.getOption("itsecurity")
	_h = txt1 = txt2 = txt3 = txt4 = txt5 = "";
		
	$.each(tp, function (idx, o){
		_h += "<div class=\"pt4\" />";
		_h += "<table border=\"0\" cellspacing=\"0\" cellpadding=\"0\" class=\"frm_edit_outline_type1\">";
		_h += "<colgroup>";
		
		if ( type == "security") {
			_h += "<col width=\"100\">";
			_h += "<col width=\"100\">";
		} else {
			_h += "<col width=\"100\">";
			_h += "<col width=\"100\">";
			_h += "<col width=\"100\">";
			_h += "<col width=\"100\">";
			_h += "<col width=\"100\">";	
		}
		_h += "<col>";
		_h += "</colgroup>";
		
		if (idx == 0 ){
			if ( type == "security") {
				_h += "<tr><th>팀</th><th>파트</th><th>담당자</th></tr>";
				_h += "<tr><th>IT전략팀</th><th>-</th><td id=\"t_secu_itsecucharge\"></td></tr>";				
			}else {
				_h += "<tr><th>팀</th><th>파트</th><th>구분</th><th>담당자</th><th>오류발생 가능성</th><th>오류발생시 영향</th></tr>";
				_h += "<tr><th>IT전략팀</th><th>-</th><th>BR</th><td id=\"td_risk_br\"></td><td id=\"td_pos_risk_br\"></td><td id=\"td_inf_risk_br\"></td></tr>";
			}			
		}
		for (var i = 0 ; i < o.partcnt ; i++){
			_h += "<tr>";
			if (i == 0) _h += "<th rowspan=\"" + o.partcnt + "\">" + o.teamname + "</th>";
			_h += "<th>파트" + (i+1) + "</th>";
						
			if ( type == "security") {
				var td_id = "";
				
				$("#docids input", GC.active(true)).each(function (y,m){
					if ( itsec == "0" ) {
						if ( ("itsecu_itpartcharge" + (idx + 1) + (i+1)) == m.name.toLowerCase() ) {
							td_id = m.name.toLowerCase();
						}
					} else {
						if ( ("itsecu_itpartchief" + (idx + 1) + (i+1)) == m.name.toLowerCase() ) {
							td_id = m.name.toLowerCase();
						}else if ( ("itsecu_itpartd" + (idx + 1) + (i+1)) == m.name.toLowerCase() ) {
							td_id = m.name.toLowerCase();
						}else{
							td_id = "itsecu_itpartchief" + (idx + 1) + (i+1);
						}
					}
				})
				_h += "<td id=\"" + td_id + "\">&nbsp;</td>";
			}else {
				_h += "<th>설계자" + (i+1) + "</th>";
				_h += "<td id=\"td_risk_itpartd" + (idx + 1) + (i+1) + "\">&nbsp;</td>";
				_h += "<td id=\"td_pos_risk_itpartd" + (idx + 1) + (i+1) + "\">&nbsp;</td>";
				_h += "<td id=\"td_inf_risk_itpartd" + (idx + 1) + (i+1) + "\">&nbsp;</td>";
			}
			_h += "</tr>";
		}
		_h += "</table>";
	});
	
	$("#div_team", GC.active(true)).html(_h);
}

ws4703.tableData = function (opts){
	var doc = $(GC.active(true)).doc();
	var ntsid="";
	var n_flag="";
	var n_charge = "";
	var pos_style = "";
	var tmp_oname = "";
	var tmp_ntsid = "";
	var inf_style = "";
	
	/* 연결문서 */
	$("#docids input", GC.active(true)).each(function (idx, o){	
		var data = o.value.split("^")
		, caldata = ws4703.calc(o.value);

		if ( opts.type == "risk" ) {
			
			if (caldata[0] == "N") {
				pos_style = inf_style = "비대상";
			} else if (isNaN(caldata[0])) {
				pos_style = inf_style = "";
			} else {
				pos_style = "<span class='font_blue font_bold' id='rtable' param='"+caldata.join(",")+"' style='cursor:pointer'>" + caldata[0] + "</span>";
				inf_style = "<span class='font_blue font_bold' id='rtable' param='"+caldata.join(",")+"' style='cursor:pointer'>" + caldata[1] + "</span>";
			}
			$("#td_" + o.name.toLowerCase(), GC.active(true)).html(GF.notesName(data[0], "cn"));
			$("#td_pos_" + o.name.toLowerCase(), GC.active(true)).html(pos_style);
			$("#td_inf_" + o.name.toLowerCase(), GC.active(true)).html(inf_style);
		} else {
			var sub_str = o.name.toLowerCase().substring( 0, (o.name.length-2) );
			var sub_num = o.name.substring( (o.name.length-2), (o.name.length+1) );
			var camp = sub_str;
			
			if ( opts.itsecurity == "0") {
				n_flag = sub_num;
				
				if ( camp == "itsecu_itpartcharge" ) {
					n_temp = GF.notesName(data[0], "cn");					
				}
				
				ntsid = n_temp;
				pos_style = "<span class='font_blue font_bold' charge='y' name='"+o.name.toLowerCase()+"' id='callitsecu' itsc='"+opts.itsecurity+"' num='"+n_flag+"' style='cursor:pointer'>"+ntsid+"</span>";				
			}else {
				n_flag = sub_num;
				
				if ( camp == "itsecu_itpartcharge" ) {
					n_charge = GF.notesName(data[0], "cn");
				}else {
					tmp_oname = o.name.toLowerCase();
					tmp_ntsid = GF.notesName(data[0], "cn");
				}
				
				//if( n_charge != "" ) {
					ntsid = tmp_ntsid + "," + n_charge;
					pos_style = "<span class='font_blue font_bold' charge='" + (n_charge==""?"n":"y") + "' name='"+tmp_oname+"' id='callitsecu' itsc='"+opts.itsecurity+"' num='"+n_flag+"' style='cursor:pointer'>"+ntsid+"</span>";
				//}				
			}
			
			if (pos_style != "") {
				$("#" + tmp_oname, GC.active(true)).html(pos_style);
			}
		}		
	});
}

ws4703.calc = function (data){
	var t_risk_split = data.split("^");
	var docregno_divide = $("input[name=DocRegNoDivide]", GC.active(true)).val();	
	var aa = 1;
	
	if(t_risk_split[1].substring(aa, (aa+1)) == "1"){ t_tr1 = t_risk_split[1].substring(aa, (aa+2)); aa = (aa+2); }else{ t_tr1 = t_risk_split[1].substring(aa, (aa+1)); aa = (aa+1); }
	if(t_risk_split[1].substring(aa, (aa+1)) == "1"){ t_tr2 = t_risk_split[1].substring(aa, (aa+2)); aa = (aa+2); }else{ t_tr2 = t_risk_split[1].substring(aa, (aa+1)); aa = (aa+1); }
	if(t_risk_split[1].substring(aa, (aa+1)) == "1"){ t_tr3 = t_risk_split[1].substring(aa, (aa+2)); aa = (aa+2); }else{ t_tr3 = t_risk_split[1].substring(aa, (aa+1)); aa = (aa+1); }
	if(t_risk_split[1].substring(aa, (aa+1)) == "1"){ t_tr4 = t_risk_split[1].substring(aa, (aa+2)); aa = (aa+2); }else{ t_tr4 = t_risk_split[1].substring(aa, (aa+1)); aa = (aa+1); }
		
	if(t_risk_split[1].substring(aa, (aa+1)) == "1"){ t_br1 = t_risk_split[1].substring(aa, (aa+2)); aa = (aa+2); }else{ t_br1 = t_risk_split[1].substring(aa, (aa+1)); aa = (aa+1); }
	if(t_risk_split[1].substring(aa, (aa+1)) == "1"){ t_br2 = t_risk_split[1].substring(aa, (aa+2)); aa = (aa+2); }else{ t_br2 = t_risk_split[1].substring(aa, (aa+1)); aa = (aa+1); }
	if(t_risk_split[1].substring(aa, (aa+1)) == "1"){ t_br3 = t_risk_split[1].substring(aa, (aa+2)); aa = (aa+2); }else{ t_br3 = t_risk_split[1].substring(aa, (aa+1)); aa = (aa+1); }
	if(t_risk_split[1].substring(aa, (aa+1)) == "1"){ t_br4 = t_risk_split[1].substring(aa, (aa+2)); aa = (aa+2); }else{ t_br4 = t_risk_split[1].substring(aa, (aa+1)); aa = (aa+1); }
	
	if(t_risk_split[1] != "N"){
		if(docregno_divide == "T"){
			t_tr_calc = parseInt(t_risk_split[1].substring(1, 2)) + parseInt(t_risk_split[1].substring(2, 3)) + (parseInt(t_risk_split[1].substring(3, 4)) * 2) + parseInt(t_risk_split[1].substring(4, 5));
			t_br_calc = parseInt(t_risk_split[1].substring(5, 6)) + parseInt(t_risk_split[1].substring(6, 7)) + parseInt(t_risk_split[1].substring(7, 8)) + parseInt(t_risk_split[1].substring(8, 9));
		}else{
			if(t_risk_split[1].length == 9){
				t_tr_calc = parseInt(t_risk_split[1].substring(1, 2)) + parseInt(t_risk_split[1].substring(2, 3)) + (parseInt(t_risk_split[1].substring(3, 4)) * 2) + parseInt(t_risk_split[1].substring(4, 5));
				t_br_calc = parseInt(t_risk_split[1].substring(5, 6)) + parseInt(t_risk_split[1].substring(6, 7)) + parseInt(t_risk_split[1].substring(7, 8)) + parseInt(t_risk_split[1].substring(8, 9));
			}else{
				t_tr_calc = parseInt(t_tr1) + parseInt(t_tr2) + (parseInt(t_tr3) * 2) + parseInt(t_tr4);
				t_br_calc = parseInt(t_br1) + parseInt(t_br2) + parseInt(t_br3) + parseInt(t_br4);
			}
		}
		return [t_tr_calc, t_br_calc];	
	} else {
		//return ['비대상', '비대상'];
		return ['N', 'N'];
	}
}

ws4703.initITSecuTable = function(doc) {
	var it_sc = doc.itsecurity;
	var flag = doc.flag;
	var _to;
	
	$("#tbITSecuTable"+it_sc, GC.active(true)).show();
	$("#docids input", GC.active(true)).each(function (idx, o){					
		if ( o.value == "") {
			alert("수행이 완료되지 않았습니다.");
			return;
		}
		
		if ( o.name.toLowerCase() == doc.ckitsecname ) {
			var data = o.value.split("^");
			var s_data = data[1].split("♣");
			
			switch(it_sc){
			case "0":
				_to = 14
				break;
			case "1":
				_to = 5
				break;
			case "2":
				_to = 10
				break;
			}
			
			for( var i=0; i<=_to; i++) {
				var t_itdata = s_data[i].split("♠");
				switch( data[1].substring(i, (i+1)) ){
				case "1":
					$("#its"+it_sc+(i+1), GC.active(true)).html("비대상");
					break;
				case "0":
					if ( t_itdata[0] == "0" ) {
						$("#its"+it_sc+(i+1), GC.active(true)).html("정상");
					} else {
						$("#its"+it_sc+(i+1), GC.active(true)).html("비정상, " + t_itdata[1]);
					}
					break;
				default:
					$("#itsc"+it_sc+(i+1), GC.active(true)).html( "○ " + data[1].substring(i, data[1].length) );
					switch(t_itdata[0]) {
					case "0":
						$("#its"+it_sc+(i+1), GC.active(true)).html("정상");
						break;
					case "1":
						$("#its"+it_sc+(i+1), GC.active(true)).html("비정상, " + t_itdata[1]);
						break;
					default:
						$("#its"+it_sc+(i+1), GC.active(true)).html("");
					}
				}
			}		
		}
	})
}

ws4703.riskItemSet = function() {

}

ws4703.formInit = function (opts){
	$(GC.active(true)).doc(opts);
	
	var buttons = [];
	buttons.push( {text: "닫기", click : function (){$(this).dialog("close")}} );
	
	switch (opts.type) {
	case "security":
		ws4703.drawTeamTable(opts);
		ws4703.tableData(opts);
		
		$(".pt10 #callitsecu", GC.active(true)).off("click").on("click", function (){
			if ($(this).attr("charge") == "n"){
				alert("수행이 완료되지 않았습니다.");
				return false;
			}
			var params = {
				itsecu : $(this).attr("itsc"),
				flag : $(this).attr("num"),
				type : "itscview",
				name : $(this).attr("name")
			}
			var url = new GF.CURL("/" + opts.dbpath + "/research_view/"+opts.unid+"?opendocument", params);
			GF.dialog({
				content : {url : url.url}
			,	title : "IT보안성검토", isactive : true, width :650, height : 450, resizable : false
			,	onload : function (){}
			,	buttons : buttons
			});
		})		
		break;
	case "risk":
		ws4703.drawTeamTable(opts);
		ws4703.tableData(opts);
		
		$("#div_team #rtable", GC.active(true)).off("click").on("click", function() {
			var _split = $(this).attr("param").split(",");
			var params = {
				docnumber : GC.active(true).doc().getOption("docnumber"), //$("#input[name=DocRegNoDivide]", GC.active(true)).val(),
				val1 : _split[0],
				val2 : _split[1]
			}
			var url = new GF.CURL("/" + opts.dbpath + "/riskgraph?openform", params);			
			GF.dialog({
				content : {url : url.url}
			,	title : "영향도분석", isactive : true, width : 480, height : 450, resizable : false
			,	onload : function (){}
			,	buttons : buttons
			});
		})		
		break;
	case "itscview":
		$(".pt10", GC.active(true)).hide();
		ws4703.initITSecuTable(opts);
		break;
	}
}

ws4703.research_forminit = function (opts){
	$(GC.active(true)).doc(opts);
	
	if (opts.isedit){
 		var row = $("[id^='row_']", GC.active(true));
 		row.css("cursor","pointer")
 			.bind("click",function(){
					 		var idx = this.id.split("_")[1];
					 		var val = this.id.split("_")[2];					 		
					 		$("[id^='row_"+idx+"_']", GC.active(true)).removeClass();
					 		$(this).addClass("font_red");
					 		$("input[name='SelVal"+idx+"']:text", GC.active(true)).val(val);
			});
	}
}

/*
ws4703.formInit = function(opts) {
	opts.buttons = ws4703.formButtons; 
	opts.htitle = ws4703.title;
	$(GC.active(true)).doc(opts);
		
 	var seldata = opts.seldata;
 	for (var i=0 ; i< 6;i++){
 		var idx = (i+1); 		
 		if (seldata["selval" + idx] != ""){
 			$("#row_"+idx+"_" + seldata["selval" + idx]).addClass("font_red");	
 		}
 	}
 	
	if (opts.isedit){
 		var row = $("[id^='row_']", GC.active(true));
 		row.css("cursor","pointer")
 			.bind("click",function(){
					 		var idx = this.id.split("_")[1];
					 		var val = this.id.split("_")[2];					 		
					 		$("[id^='row_"+idx+"_']", GC.active(true)).removeClass();
					 		$(this).addClass("font_red");
					 		$("input[name='SelVal"+idx+"']:text", GC.active(true)).val(val);
			});
	}
}
*/
ws4703.viewInit = function(opts) {
	opts.view 	= ws4703.viewHeader[opts.viewalias]; 			/* 보기 컬럼 설계 구조체 */
	opts.buttons = ws4703.viewButtons[opts.viewalias];			/* 버튼 설계 구조체 */
	opts.htitle 	= ws4703.viewtitle;									/* 보기 타이틀 구조체 */
	opts.search 	= ws4703.getViewSearch(opts.viewalias);		/* 검색 구조체 */
 	$(GC.active(false)).viewform(opts); 
}

ws4703.viewButtons = {}
ws4703.getViewSearch = function(viewname) {}
ws4703.viewHeader = {}

ws4703.OpenView = function(doc,view) {
	var id 	= doc.getOption('id');
	var path 	= doc.getOption('dbpath');
	var url 	= "/" + path + "/openview?readform&view=" + view + "&count="+GC.site.rowsperpage;
	GF.load("#"+id,url);
}