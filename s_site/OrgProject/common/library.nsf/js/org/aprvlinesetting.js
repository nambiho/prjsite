;(function (realm) {
	"use strict";
	
	var pattern={
		saveline:"<option data-key=\"{{@key}}\">{{@subject}}</option>",
		option:"<option data-key=\"{{@key}}\">{{@disp}}{{@exception}}</option>",//협조,참조,담당
		approveline:"<option value=\"{{@value}}\" {{@selected}}>{{@disp}}</option>"//결재자
	},
	insertSelectOption=function (id,pos,html) {
		var select=util.getElementById(id);
		select&&html&&select.insertAdjacentHTML(pos,html);
		return select;
	},
	getHtmlDept=function (_this,dx,id) {
		return util.pattern({
			key:dx.Code,
			disp:dx.DeptName,
			exception:dx.exception?(" [" + dx.AppName + "]"):""
		},pattern.option)
	},
	getHtmlUser=function (_this,dx,id) {
		var keytag=_this.getUserkey(dx);
		return util.pattern({
			key:keytag,
			disp:dx.LGTName+" "+dx.LGTComnum
		},pattern.option)
	},
	selectDept=function (d,id) {
		var html="",dx;
		for(var x in d) {
			dx=d[x];
			html+=getHtmlDept(this,dx,id);
		}
		var selectedlist=util.getElementById(id);
		if (this.options.ismulti) {
			selectedlist.insertAdjacentHTML("beforeend",html);
		} else {
			selectedlist.innerHTML=html;
		}
		this.setCount(id,Object.keys(this[id]).length);
		return true
	},
	selectUser=function (d,id) {
		var html="",dx,keytag="";
		for(var x in d) {
			dx=d[x];
			html+=getHtmlUser(this,dx,id);
		}
		var selectedlist=util.getElementById(id);
		if (this.options.ismulti) {
			selectedlist.insertAdjacentHTML("beforeend",html);
		} else {
			selectedlist.innerHTML=html;
		}
		this.setCount(id,Object.keys(this[id]).length);
		return true
	},
	selectAll=function (d,id) {
		var html="",dx,keytag="";
		for(var x in d) {
			dx=d[x];
			html+=(dx.Type=="G"?getHtmlDept(this,dx,id):getHtmlUser(this,dx,id));
		}
		var selectedlist=util.getElementById(id);
		if (this.options.ismulti) {
			selectedlist.insertAdjacentHTML("beforeend",html);
		} else {
			selectedlist.innerHTML=html;
		}
		this.setCount(id,Object.keys(this[id]).length);
		return true
	},
	setDisplay=function(){
		var _this=this,
		tabs=util.getElementByClassName("tabs")[0],
		tabsLI=tabs&&util.getElementByTagName.call(tabs,"li"),
		system=this.options.system,userinfo=this.options.userinfo;
		
		//탭 변경
		tabsLI.forEach(function(item,idx){
			util.addEvent(item,"click",function () {
				var id=this.getAttribute("rel"),div=null,
				tabson=util.getElementByClassName("tabs_on")[0];
				if (tabson) {
					div=util.getElementById(tabson.getAttribute("rel"));
					div&&(div.style.display="none");
					util.deleteClass(tabson,"tabs_on");
				}
				div=util.getElementById(id);
				_this.tab=id;
				util.addClass(item,"tabs_on");
				var on=this.getAttribute("data-on");
				on&&_this[on]&&_this[on](id);
				$(div).fadeIn();
			});
		});
		(function (t) {
			if(t) util.trigger(t,"click"); else util.trigger(tabsLI[0],"click");
		} (util.getElementByClassName("tabs_on")[0]));
		
		//자주 쓰는 결재선 가져오기
		var category=(this.options.formname||"")+userinfo.EmpNo;
		_this.$ajax({
			url:util.getUrl("/"+system.userprofile_path+"/wvAprvLine?readviewentries",{
				outputformat:"json",
				count:"-1",
				restricttocategory:category
			}),
			dataType:"json"
		},function __done(data,status) {
			var viewdata=util.ViewDataParse(data),
			entries=viewdata.entry,length=entries.length,html="",entry;
			for (var i=0;i<length;i++){
				entry=entries[i];
				html+=util.pattern({
					key:entry.unid,
					subject:entry.Subject
				},pattern.saveline);
			}
			insertSelectOption("savedline","beforeend",html);
		});
		
		//최종결재선 넣기, 최종 결재선 변경선택 시 결재라인 넣기
		var lastApprove=util.getElementById("lastApprove");
		if (lastApprove) {
			var baseline=this.options.initdata["baseAprvLine"],
			title=baseline&&baseline.title,dept=baseline&&baseline.dept,name=baseline&&baseline.name,
			optionhtml="";
			for(var idx in title){
				var item=title[idx];
				var arr=[item,name[idx],dept[idx]];
				optionhtml+=util.pattern({
					key:idx,
					disp:arr.slice(0,2).join("\u0020")
				},pattern.option);
			}
			lastApprove.innerHTML=optionhtml;
			util.addEvent(lastApprove,"change",function (e) {
				var approveList=util.getElementById("approveList"),
				html="",i=0,_el=e.srcElement;
				for(;i<_el.selectedIndex;i++){
					html+=util.pattern({
						value:_el.options[i].value,
						disp:_el.options[i].text
					},pattern.approveline);
				}
				_this.setCount("approveList",i);
				cooperPosition.apply(_this,[_el.selectedIndex,title,dept,name]);
				approveList.innerHTML=html;
			});
			lastApprove.selectedIndex=(this.parse_data["lastapprover"]&&(this.parse_data["lastapprover"][0]))||0;//(title.length-1);
			util.trigger(lastApprove,"change");
		}
		
		//결재선 저장 화면에서 Header 부분 바탕 클릭 시 처리
		var savelineheaderbox=util.getElementByClassName("saveline-headerbox");
		savelineheaderbox&&util.addEvent(savelineheaderbox[0],"click",function (e) {
			this==e.srcElement&&_this.savelineclose();
		},false);
	},
	cooperPosition=function (idx,title,dept,name) {
		var _this=this,
		userinfo=_this.options.userinfo,
		selbox=util.getElementById("cooperPosition"),
		html="",value="";//, selected=this.parse_data.cooperposition&&this.parse_data.cooperposition[0]+"|"+this.parse_data.cooperposition[1];
		if (!selbox) return;
		html+=util.pattern({
			value:userinfo.Fullname+" "+userinfo.EmpNo+"|기안자",
			disp:userinfo.Fullname+" "+userinfo.EmpNo+" - 기안자"
		},pattern.approveline);
		for(var i=0;i<idx;i++){
			value=name[i]+"|"+title[i];
			html+=util.pattern({
				value:value,
				disp:name[i]+" - "+title[i],
				selected:(idx==(i+1)?"selected":"")//selected?(value==selected?"selected":""):
			},pattern.approveline);
		}
		selbox.innerHTML=html;
		if (this.parse_data&&this.parse_data.cooperposition) {
			cooperPositionChange(
				this.parse_data.cooperposition[0]+"|"+this.parse_data.cooperposition[1]
			);
		}
	},
	cooperPositionDisable=function (cnt) {
		var selbox=util.getElementById("cooperPosition");
		selbox.disabled=(cnt===0);//(JSON.keys(_this.cooper).length);
	},
	cooperPositionChange=function (selected) {
		var selbox=util.getElementById("cooperPosition"),
		option=util.query.call(selbox,"option[value=\""+selected+"\"]");
		option&&(selbox.value=selected);
	},
	getherSelectList=function (list) {
		var _this=this,
		option,
		lastApprove=util.getElementById("lastApprove"),
		cooperPosition=util.getElementById("cooperPosition");
		
		if (lastApprove) {
			option=util.query.call(lastApprove,"option:checked");
			var index=option.getAttribute("data-key"),
			baseline=this.options.initdata["baseAprvLine"],
			dbpath=this.options.dbpath,
			querykey=baseline.name[index];

			_this.$ajax({
				url:util.getUrl("/"+dbpath+"/getJsonOrginfo?openagent"),
				dataType:"json",
				type:"post",
				async:false,
				data:{
					Action:"user",
					QueryKey:querykey
				}
			},function (data,status) {
				if (status!=="success") {
					alert("사용자 정보를 가져 오는 중 오류가 발생 했습니다.\nBroadNet관리자에게 문의하십시오.");
					return false;
				}
				if (data.isError) {
					alert(data.errormsg);
					return false;
				}
				list["lastapprover"]=[index,data[querykey][0].LGTTel];
			},function (data) {window.console&&console.log(data);});
		}
		if (cooperPosition) {
			option=util.query.call(cooperPosition,":checked");
			option&&(list["cooperposition"]=option.value.split("|"));
		}
	}
	;
	

	var aprvform={
		savedSelObj:null,
		tabClick:function (id) {
			var userlistwrap,div;
			if (id==="tab1") {
				userlistwrap=util.getElementById("userlistwrap");
				div=util.createElement({
					dom:"div",
					attr:{id:"userblock","class":"blur-block"},
					style:{
						width:userlistwrap.offsetWidth+"px",
						height:userlistwrap.offsetHeight+"px",
						top:userlistwrap.offsetTop+"px",
						left:userlistwrap.offsetLeft+"px",
						background: "#dddddd",
						opacity: 0.2
					},
					parent:userlistwrap
				});
			} else {
				div=util.getElementById("userblock");
				div&&div.parentNode.removeChild(div);
			}
		},
		checkIncharge:function (e,id,chk) {
			var cooper=this["cooper"],incharge=this["incharge"],key="";
			if (chk==="all") this.deletealllist(null,"incharge")
			else {
				for(var i=0;i<chk.length;i++){
					key=chk[i].getAttribute("data-key");
					for(var j in incharge) {
						if (incharge[j].LGTDepCode===cooper[key].Code) {
							//this.keyDelete("incharge",j);
							alert("해당 부서내 담당자가 지정 되어 있습니다.\n담당자를 먼저 삭제 후에 진행 해주세요.");
							return false
						}
					}
				}
			}
			return true;
		},
		checkCooper:function (data,e,id) {
			var cooper=this["cooper"];
			for (var i=0;i<data.length;i++) {
				if (!cooper[data[i].LGTDepCode]) {
					alert("수신부서내 부서원만 선택가능합니다.");
					return false
				}
			}
			return true
		},
		cooperCountOpserver:function (cnt) {
			cooperPositionDisable(cnt);
		},
		showSavedLine:function (e) {
			var el=e.srcElement,rect=el.getClientRects()[0],
			width=document.body.offsetWidth,
			div=util.getElementById("savelinebox"),
			textbox=util.getElementById("linename");
			util.createElement({
				dom:"div",
				attr:{id:"block","class":"blur-block"},
				event:{click:this.savelineclose}
			});
			util.style(div,{
				top:(rect.bottom+5)+"px",
				right:(width-Math.ceil(rect.right))+"px",
				zIndex:"999",
				display:"block"
			});
			this.savelineUNID="";
			var savedline=util.getElementById("savedline"),
			option=option=util.query.call(savedline,"option:checked");
			this.savelineUNID=(option&&option.getAttribute("data-key"))||"";
			if (this.savelineUNID) textbox.value=this.savelineText=option.text;
			textbox.focus();
		},
		removeSavedLine:function (e) {
			var system=this.options.system,
			savedline=util.getElementById("savedline"),
			option=option=util.query.call(savedline,"option:checked"),
			unid=option&&option.getAttribute("data-key");
			unid&&this.$ajax({
				url:util.getUrl("/"+system.userprofile_path+"/getAprvLineProcess?openagent",{action:"delline",unid:unid})
			},function (data,status) {
				if (status!=="success") {alert("처리 중 오류가 발생 했습니다.\nBroadNet관리자에게 문의하십시오."); return}
				if (data.error) {alert(data.error); return}
				if (data.bContinue) {
					//alert("삭제 되었습니다.");
					option.parentNode.removeChild(option);
				}
			});
		},
		savelinedo:function (e) {
			var _this=this,
			textbox=util.getElementById("linename"),
			newdocflag=(util.isFalse(this.savelineUNID)||this.savelineText!==textbox.value);

			if (util.isFalse(textbox.value)) {alert("결재선명을 입력 해주세요."); return false}
			if (textbox.value!==this.savelineText) {
				var savedline=util.getElementById("savedline"),item=null;
				for (var i=0;i<savedline.options.length;i++) {
					if (i===0) continue;
					item=savedline.options[i];
					if (item.text===textbox.value) {
						alert("같은 결재선명이 있습니다.\n변경 후 저장 해주세요.");
						return false
					}
				}
			}

			var block=util.getElementById("block"),
			line=this.getlist(),system=this.options.system,userinfo=this.options.userinfo,
			url=util.getUrl((newdocflag?"/"+system.userprofile_path+"/fmAprvLine?openform":"/"+system.userprofile_path+"/0/"+this.savelineUNID+"?editdocument"))
			;

			_this.$ajax({
				url:url,type:"post",
				data:{
					__Click:0,
					Subject:textbox.value,
					AprvLine:JSON.stringify(line),
					Empno:userinfo.EmpNo,
					Name:userinfo.Fullname,
					CN:userinfo.Fullname+" "+userinfo.EmpNo,
					Formname:this.options.formname,
					"%%PostCharset":"utf-8"
				}
			},function (data,status) {
				if (status=="success") {alert("저장 되었습니다.")}
				else {alert("저장 중 오류가 발생했습니다.\nBroadNet관리자에게 문의하십시오."); return}
				if (newdocflag) {
					var r=/<UNID>([\W\D\w\d]+)<\/UNID>/g,
					Exec=r.exec(data),html,savedline=util.getElementById("savedline");
					if (Exec) {
						var savedline=insertSelectOption("savedline","beforeend",util.pattern({
							key:Exec[1],
							subject:textbox.value
						},pattern.saveline));
						savedline&&(savedline.selectedIndex=savedline.options.length-1);
					}
				}
				_this.savelineclose();
			});
		},
		savelineclose:function (e) {
			var div=util.getElementById("savelinebox"),
			textbox=util.getElementById("linename"),
			block=util.getElementById("block");
			//div&&(div.style.display="none");
			this.savelineUNID="";
			this.savelineText="";
			div.removeAttribute("style");
			textbox&&(textbox.value="");
			block&&block.parentNode.removeChild(block);
		},
		savelinechange:function (e) {
			var _this=this,el=e.srcElement,idx=el.selectedIndex,op=el.options[idx],key,
			system=this.options.system,userinfo=this.options.userinfo;
			if(!op) return;
			key=op.getAttribute("data-key");
			if(!key) return;
			_this.$ajax({
				url:util.getUrl("/"+system.userprofile_path+"/getAprvLineProcess?openagent",{action:"getline",unid:key})
			},function (data,status) {
				var isdept,__data;
				if (status=="success") {
					if (data.error) {alert(data.error); return}
					for(var x in data) {
						if (x==="lastapprover") {
							var lastApprove=util.getElementById("lastApprove");
							if (lastApprove) {
								lastApprove.selectedIndex=data[x][0]|0;
								util.trigger(lastApprove,"change");
							}
						} else if (x==="cooperposition") {
							cooperPositionChange(
								/*data[x][0]+"|"+data[x][1]*/
								data[x].join("|")
							);
						} else {
							_this.deletealllist(null,x);
							if (data[x].length > 0) {
								__data=data[x][0];
								isdept=!!__data.Code;
								_this.add(x,data[x],isdept);
							}
						}
					}
				}
			});
		}
	};

	function create (options) {
		var baseform=realm.baseorgform,sl={unid:"",text:""};

		var retform=util.object(util.copy(aprvform,baseform),{
			options:{
				writable:false,
				configurable:true,
				enumerable:true,
				value:util.copy(baseform.options,options)
			},
			savelineUNID:{
				get:function (){return sl.unid},
				set:function (x){sl.unid=x}
			},
			savelineText:{
				get:function (){return sl.text},
				set:function (x){sl.text=x}
			}
		}).init({
			event:{
				init:setDisplay,
				GetherSelectList:getherSelectList,
				SelectUser:selectUser,
				SelectDept:selectDept,
				SelectAll:selectAll
			}
		});

		return retform;
	};

	realm.aprvLine || 
	(
		realm.aprvLine=function (options) {
			return create(options)
		}
	);
} (this));