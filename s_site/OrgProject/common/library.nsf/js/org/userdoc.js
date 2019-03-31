;(function (realm) {
	"use strict";


	var option={},
	bodyarg=[],
	orgSCDlgID="shinchung",
	patterns={
		dispShinChung:"<li class=\"add_item\">"+
			"<span class=\"add_data\">{{@LGTName}} {{@LGTComnum}}</span>"+
			"<button type=\"button\" onclick=\"userdoc.scRemove({{@index}})\" style=\"vertical-align:baseline;\"><i class=\"ico_btn ico_btn_delete\"></i></button>"+
			"</li>"
	},
	$ajax=function (option,done,fail) {
		$.ajax(util.copy({},option))
		.done(function (data,status,jqxhr) {done&&done(data,status,jqxhr)})
		.fail(function (data,status,jqxhr) {(fail&&fail(data,status,jqxhr))||(util.warn(data))});
	},
	getUserBody=function (id,url,callback) {
		bodyarg=Array.prototype.slice.call(arguments);
		$ajax({url:url},function (data,status,jqXHR) {
			var reg=/<body[^>]*>([\W\d\D]+)<\/body>/;
			var body=reg.exec(data);
			body&&$("#"+id).html(body[1]);
			callback&&callback(body);
		},null,function (d) {realm.console&&console.log(d)});
	},
	docEditInit=function (opt) {
		var scInfo={},scName,scDept;
		//숫자필드 처리
		var digitReg=/\D/g;
		$(".digit").on("keypress",function (e) {
			e.stopPropagation();
			digitReg.lastIndex=0;//외부에 regexp가 있어서
			return !digitReg.test(e.key)
		});
		$(".digit").on("paste",function (e) {
			//e.stopPropagation();
			var clipboard=e.originalEvent.clipboardData||window.clipboardData,
			text=clipboard.getData("text");
			digitReg.lastIndex=0;//외부에 regexp가 있어서
			return !digitReg.test(text)
		});

		//후임자 처리
		if (option.scName !=="") {
			if (option.scInfo==="") {
				//과거 문서이므로 Info 필드 변경
				scName=option.scName.split(" ");
				scDept=option.scDept.split(" ");
				scInfo[orgSCDlgID]=[{
					"Type":"G"
					,"LGTName": scName[0]
					,"LGINotesID": "CN="+option.scName+"/O=HANARO"
					,"LGTComnum": scName[1]
					,"LGTDep": option.scDept
					,"DeptName": scDept[scDept.length]
					,"BasicDuoYn": "","LGTDutyCode": "","LGTGradeCode": "","LGTGrade": "","LGHTel": "","LGTTel": "","LGTInnum": ""
					,"LGTFax": "","unid": "","position": "","response": false,"LGTDepCode": "","FullDeptName": "","FDepName": ""
				}];
			}
		}
		var temp=OrgDialog({
			dlgID:orgSCDlgID,
			type:"user",
			ismulti:false,
			ismodal:!!realm.showModalDialog,
			saveField:"ShinChungInfo",
			dispField:"dispShinChung",
			pattern:patterns.dispShinChung,
			displaySep:" ",
			done:function (data) {
				$("input[name='ShinChungName']").val((!data||data.length==0)?"":(data[0].LGTName+" "+data[0].LGTComnum));
				$("input[name='ShinChungDeptName']").val((!data||data.length==0)?"":data[0].DeptName);
				return true;
			},
			deptcode:option.userinfo.LGTDepCode
		}).done(scInfo);

		/*
		//textarea resize
		//var resizer=$("#boxResizer"), damwork=$("#DamWork"), _height=parseInt(damwork.css("height").replace(/\D+/g, ""));
		//resizer.attr("draggable", "true");
		// resizer.draggable();
		var resizer=util.getElementById("boxResizer"),
		damwork=util.getElementById("DamWork"),
		startHeight=damwork.offsetHeight;
		// resizer&&resizer.setAttribute("draggable", "true");
		// resizer.addEventListener("drag", function (e) {
		// 	e.stopPropagation();
		// 	var _height=damwork.offsetHeight, _h=_height+e.offsetY;
		// 	if (e.screenY===0) return;
		// 	if (_h>76 && _h<250) damwork.style.height=(_height+e.offsetY+"px");
		// });
		resizer&&resizer.addEventListener("mousedown", function (e) {
			var height=damwork.offsetHeight,
			clientY=e.clientY;
			var mousemove=function (e_) {
				var _h=Math.max(startHeight, e_.clientY+height-clientY);
				_h=(_h>250?250:_h);
				damwork.style.height=(_h+"px");
			}
			var mouseup=function () {
				document.removeEventListener("mousemove", mousemove);
				document.removeEventListener("mouseup", mouseup);
				document.body.classList.remove("unselect");
			}
			document.body.classList.add("unselect");
			document.addEventListener("mousemove", mousemove);
			document.addEventListener("mouseup", mouseup);
		});
		// */
		//*
		var damwork=$("#DamWork"),startHeight=damwork.height();+
		$("#boxResizer").on("mousedown",function (e) {
			var height=damwork.height(),
			clientY=e.clientY;
			var mousemove=function (e_) {
				var _h=Math.max(startHeight,e_.clientY+height-clientY);
				_h=(_h>250?250:_h);
				damwork.height(_h);
				parent&&parent.doResize&&parent.doResize();
			}
			var mouseup=function () {
				$(document).off("mousemove mouseup");$(document.body).removeClass("unselect");
			}
			$(document).on("mousemove",mousemove).on("mouseup",mouseup);
			$(document.body).addClass("unselect");
		});
		// */
	},
	buttonInit=function () {
		var btn=util.getElementByClassName("btn_type_b");
		btn.forEach(function (b){
			var attr=b.getAttribute("on");
			attr&&userdoc[attr]&&b.addEventListener("click",function () {
				userdoc[attr]()
			});
		});
	},
	__photoReplace=function (url) {
		var imgArea=$(".profile_selector .img_area"),url;
		if (imgArea.length>0) {
			imgArea.css({
				"backgroundImage":"url('"+url+"')"
			});
		}
	};

	var userdoc={
		option:function () {return option},
		init:function (opt) {
			option=opt;
			return this;
		},
		userFormInit:function (opt) {
			option=util.copy(option,opt);
			buttonInit();
			if (option.imgname=="") {
				var url=cIMGPath+"/common/img_user.png";
				__photoReplace(url);
			}
			if (option.isEdit) {
				docEditInit();
			}
		},
		readDoc:function (opt,callback) {
			var url=util.getUrl("/"+option.lgOrgDb+"/fmSearchUserInfo?readform",util.copy({
				userid:option.userinfo.LGINotesID,
				deptname:option.userinfo.DeptName,
				saveonly:option.saveonly||"no",
				returnurl:option.returnurl||"",
				callfrom:option.callfrom||"",
				curcompany:option.company
			},opt));
			getUserBody(option.id,url,callback);
			return this
		},
		editDoc:function (opt,callback) {
			var url=util.getUrl("/"+option.lgOrgDb+"/fmSearchUserInfo?openform",util.copy({
				userid:option.userinfo.LGINotesID,
				deptname:option.userinfo.DeptName,
				saveonly:option.saveonly||"no",
				returnurl:option.returnurl||"",
				callfrom:option.callfrom||"",
				curcompany:option.company
			},opt));
			getUserBody(option.id,url,callback);
			return this
		},
		selectShinChung:function () {
			var shinchung=OrgDialog(orgSCDlgID);
			shinchung.open();
		},
		scRemove:function (n) {
			var shinchung=OrgDialog(orgSCDlgID);
			shinchung&&shinchung.remove(n);
		},
		chgPhoto:function () {
			var url=util.getUrl("/"+option.lgOrgDb+"/fmSearchChangePhoto?openform",{
				userid:option.notesid,
				imgname:option.imgname,
				docunid:option.unid
			});
			var fn;
			if (realm.showModalDialog) {
				fn=realm.showModalDialog(url,null,"dialogWidth:500px;dialogHeight:350px;scroll:no;");
				if (fn) this.photoReplace(fn);
			} else {
				realm.open(url,"photo_change","menubar=no,width=500px,height=350px,scrollbars=no")
			}
		},
		photoReplace:function (fn) {
			option.imgname=fn;
			var url=util.getUrl("/"+option.lgOrgDb+"/jsonUserByEmpno/"+option.unid+"/$FILE/"+option.imgname);
			//"/"+option.lgOrgDb+"/jsonUserByEmpno/"+option.unid+"/$FILE/"+option.imgname;
			__photoReplace(url);
		},
		print:function () {
			realm.print();
			return;
		},
		reload:function () {location.reload()},
		closeDoc:function () {
			if (option.returnurl) {
				location.href=option.returnurl;
				return
			}
			userdoc.init({});
			if (realm.searchUser) {searchUser.showList(); return}
			window.close();
		},
		cancelEdit:function () {
			this.readDoc();
		},
		saveDoc:function () {
			var form=$("#"+option.id+" form"),
			serial=form.serializeArray();
			
			//email check
			//같은 사번일 때만 체크
			if (option.notesid===option.curuser) {
				var reg=/\S+@\S+\.\S+/g,email=$("input[name='EMail_3']").val();
				if (email !=="" && !reg.test(email)) {
					alert("입력한 메일 주소 형식이 정확하지 않습니다!");
					return;
				}
			}

			$.ajax({
				url:form.attr("action"),
				type:"post",
				dataType:"json",
				data:serial,
				success:function (data) {
					if (!$.isPlainObject(data)) return;
					if (!data.status) return;
					if (data.status==="success") {
						if (realm.searchUser) {
							userdoc.cancelEdit();
							data.source&&searchUser.row(data.source);
						} else if (option.callfrom=="profile"){
							alert("저장 되었습니다.");userdoc.reload()
						} else if (option.callfrom=="CUG") userdoc.readDoc()
						//realm.searchUser?userdoc.cancelEdit():userdoc.reload();
						//userdoc.cancelDoc();
					} else if (data.status==="nodoc") {
						alert("사용자 정보를 찾을 수 없습니다.\n관리자에게 문의 하십시오.");
						return;
					} else if (data.status==="error") {
						alert("저장 중 오류가 발생 했습니다.\n관리자에게 문의 하십시오.");
						realm.console&&console.log(data);
						return;
					}
				}
			}).fail(function (data) {
				console.log("fail", data);
			});
		},
		ChangeJikWee:function () {
			var info={
				title:"사용자 정보 변경",
				subtitle:"직위/직급 및 보임권한",
				dbpath:option.lgOrgDb,
				userid:option.userinfo.LGTComnum,
				userCNid:option.userinfo.LGINotesID,
				deptname:option.userinfo.DeptName,
				jikwee:option.userinfo.LGTDuty,
				jikkub:option.userinfo.LGTGrade,
				boimYn:option.boimyn,
				company:option.company,
				checkemail:option.checkemail,
				w:window
			},
			url = util.getUrl("/" + option.lgOrgDb + "/changejikwee?openpage", {
				company:option.company
			}),
			returnVal = window.showModalDialog(url,info,"dialogWidth:500px;dialogHeight:350px;scroll:no;status:no;");
			if (returnVal.status) {
				returnVal.source&&searchUser.row(returnVal.source);
				getUserBody.apply(null, bodyarg);
			}
		}
	}

	realm.userdoc||(realm.userdoc=userdoc);
} (this));
