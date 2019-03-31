;(function (realm) {
	"use strict";
	var __options={},
	mandateObj={},
	saveCount=0,
	patterns={
		table:"<table id=\"config{{@index}}\" class=\"configbox tbl_horiz\" style=\"margin-bottom:10px;\">"+
			"<colgroup><col width=\"145\"><col width=\"\"></colgroup>"+
			"<tr class=\"tbl_row\"><th class=\"tbl_head\">부서명 "+
			"<button type=\"button\" class=\"btn_type_e btn_color_primary\" onclick=\"clearUserSelect('{{@dlgid}}');\">"+
			"<span class=\"btn_txt\">해제</span></button>"+
			"</th><td class=\"tbl_data\">{{@title}}</td></tr>"+
			"<tr class=\"tbl_row\"><th class=\"tbl_head\">기간</th><td class=\"tbl_data\"><div class=\"input_date\">"+
			"<input name=\"from{{@index}}\" value=\"\" type=\"text\" placeholder=\"from\"></div>"+
			"<span class=\"input_txt\">~</span><div class=\"input_date\"><input name=\"to{{@index}}\" value=\"\" type=\"text\" placeholder=\"to\">"+
			"<button type=\"button\" class=\"btn_date\" onclick=\"openCalendar(this, '{{@index}}')\">"+
			"<span class=\"ico_btn ico_btn_date\"></span></button></div><span id=\"dispExpired{{@index}}\" style=\"display:none;color:red;\">기간이 만료된 설정입니다.</span></td></tr>"+
			"<tr class=\"tbl_row\"><th class=\"tbl_head\">대상 "+
			"<button type=\"button\" class=\"btn_type_e btn_color_minor\" onclick=\"openUserSelect('{{@dlgid}}');\">"+
			"<span class=\"btn_txt\">선택</span></button></th>"+
			"<td class=\"tbl_data\"><span id=\"selectdText{{@index}}\">{{@displaymandate}}</span>"+
			"<span style=\"display:none\" id=\"selectedInfo{{@index}}\">{{@data}}</span></td>"+
			"</tr></table>",
		displaymandate:"{{@LGTDep}} {{@LGTName}} {{@LGTComnum}}"
	};
	//btn_type_e btn_color_essential
	function _RX(d,c){
		if (typeof d === "string") {c=d; d=this||{}}
		var a=/\{\{@([a-zA-Z0-9_@\. \*\^\$\#-]*)\}\}/g,
		b=c.replace(a,function(e,f){return d[f]||""});
		return b
	}
	function RX (d,c) {
		return d.replace(/\{\{@([a-zA-Z0-9_@\. \*\^\$\#-]*)\}\}/g,function (a,b) {return c[b]||""})
	}
	function dateFieldDefineProperty (target,dlgid,fromto,defaulValue) {
		Object.defineProperty(target,"value",{
			get:function () {return this.getAttribute("value")},
			set:function (newval) {
				mandateObj[dlgid][fromto]=newval;
				this.setAttribute("value",newval)
			}
		});
		defaulValue&&(target.value=defaulValue);
	}
	var functions={
		openCalendar:function (obj,index) {
			var __form=document.forms[0];
			ViewCalendar(obj,__form["from"+index],__form["to"+index],'yyyy-mm-dd','ClickLeft','I',0,0);
			parent.doResize("body");
		},
		openUserSelect:function (dlgid,index) {
			mandateObj[dlgid].org.open();
		},
		clearUserSelect:function (dlgid) {
			mandateObj[dlgid].clear();
		},
		initializePage:function (options) {
			__options=options||{};
			__options.userinfo=(function (source) {
				var info={},dep="|";
				if (!source) return info;
				source.split(dep).forEach(function (data,idx) {
					if(data.indexOf("=")>0){
						var sd=data.split("=");
						info[sd[0]]=sd[1];
					}
				});
				return info
			} (options.userinfo));
			
			$.ajax({
				url:"/" + __options.dbpath + "/agGetMandateList?openagent&empno=" + __options.userinfo.EmpNo,
				dataType:"json",async:false
			}).always(function (data,status,jqXHR) {
				saveCount=data.count;
				$.each(__options.makerInfo,function (idx,entry) {
					var dlgid="KEY_" + entry.LGTDepCode + "_" + entry.BasicDuoYn,
					info=(data[dlgid] && data[dlgid].info),
					dispExpired;

					var table=$(_RX.call({
						title:entry.DeptName + " (" + entry.LGTDepCode + ")",//JSON.stringify(entry),//
						key:entry.LGTDepCode,
						index:idx.toString(),
						dlgid:dlgid
					},patterns.table))
					.appendTo("#table_list");

					mandateObj[dlgid]={
						org:OrgDialog({
							dlgID:dlgid,
							dlgTitle:"대결자 선택",
							type:"user",
							deptcode:entry.LGTDepCode||"",
							dispField:"selectdText"+idx,
							saveField:"selectedInfo"+idx,
							data:info&&JSON.stringify(info),
							pattern:patterns.displaymandate,
							company:entry.Company,
							done:function (ret) {return true}
						}),
						fromdate:"",
						todate:"",
						index:idx,
						entry:entry,
						clear:function () {
							this.org.saveField="";
							this.org.dispField="";
							$("[name=from"+this.index+"]").val("");
							$("[name=to"+this.index+"]").val("");
						}
					};
					dateFieldDefineProperty($("[name=from"+idx+"]")[0],dlgid,"fromdate",(data[dlgid]&&data[dlgid].fromdate)||"");
					dateFieldDefineProperty($("[name=to"+idx+"]")[0],dlgid,"todate",(data[dlgid]&&data[dlgid].todate)||"");

					var temp=new Date();
					var toDay=new Date(temp.getFullYear()+"-"+("0"+(temp.getMonth()+1)).substr(1)+"-"+("0"+temp.getDate()).substr(1));
					if (data[dlgid]&&data[dlgid].todate) {
						var to=new Date(data[dlgid].todate);

						dispExpired=document.getElementById("dispExpired"+idx);
						if (toDay>to) dispExpired.style.display="inline"
					}
				});
			}).fail(function (data,status) {
				realm.console&&console.log("fail",status,data);
			});
		},
		pageSave:function () {
			var __form=document.forms[0];
			var mandate,bSubmit=false;
			var from,to,fromdate,todate,saveField,i=0;
			for (var x in mandateObj) {
				mandate=mandateObj[x];
				from=mandate.fromdate;
				to=mandate.todate;
				saveField=mandate.org.saveField;
				
				if (!from && !to && !saveField) {continue}
				if ((!from && to) || (from && !to)) {alert("기간을 설정해주세요."); return false}
				if (saveField && (!from || !to)) {alert("기간을 설정해주세요."); return false}
				if ((from && to) && !saveField) {alert("대결 대상을 선택해주세요"); return false}
				fromdate=new Date(from);
				todate=new Date(to);
				//if (((todate-fromdate)/864e5) > 14) {alert("기간은 2주 이내로 설정 가능합니다"); return false}

				//keyid,fromdate,todate,Empno,DeptName,LGTDepCode,JikWee,BasicDuoYn
				//mandateid,LGTComnum,deptname,deptcode
				var parse=JSON.parse(saveField),
				parse0=parse[x][0];
				if (!parse0) {alert("대결 대상을 선택 해 주세요"); return false}
				var sInfo=x+","+
					from+","+
					to+","+
					__options.userinfo.EmpNo+","+
					mandateObj[x].entry.DeptName+","+
					mandateObj[x].entry.LGTDepCode+","+
					mandateObj[x].entry.MyDuty+","+
					mandateObj[x].entry.BasicDuoYn+","+
					parse0.LGINotesID+","+
					parse0.LGTComnum+","+
					parse0.LGTName+","+
					parse0.LGTDepCode+","+
					parse0.LGTGrade+","+
					parse0.DeptName+","+
					parse0.FullDeptName+","+
					(parse0.LGTTel||"-");

				__form["docinfo"+i].value=sInfo;
				__form["info"+i].value=saveField;
				i++;bSubmit=true;
			}

			if (bSubmit) __form.submit();
			else {
				if (saveCount==0)
					alert("사용자와 기간이 지정 되지 않았습니다.");
				else {
					if (confirm("지정 된 사용자가 없습니다.\n이전 대결 정보를 삭제 하시겠습니까?")) {
						__form.submit();
					}
				}
			}
			// else if (confirm("지정 된 사용자가 없습니다.\n저장 하시겠습니까?")) {
			// 	__form.submit();
			// }
		},
		pageCancel:function () {}
	};
	for(var x in functions) realm[x]=functions[x];
} (this));