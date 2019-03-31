;(function (realm) {
	var ssoprefix = "";
	var iv_jct = document.cookie.match(/iv_jct=([^;]*)(;)?/i);
	var isSSO = false;

	iv_jct = (iv_jct!=null?iv_jct[1]:"");
	ssoprefix = (document.location.host.search(/sso/i) != -1?decodeURIComponent(iv_jct):"");
	if(realm.location.host.indexOf("sso") != -1){
		isSSO = true;
	}


	var
	option = null,
	docinfo = {},
	orgSCDlgID = "shinchung",
	patterns = {
		dispShinChung : "<li class=\"add_item\">"+
			"<span class=\"add_data\">{{@LGTName}} {{@LGTComnum}}</span>"+
			"<button type=\"button\" onclick=\"searchUser.scRemove({{@index}})\"><i class=\"ico_btn ico_btn_delete\"></i></button>"+
			"</li>"
	},
	$ajax = function (option, done, fail) {
		$.ajax(util.copy({}, option))
		.done(function (data, status, jqxhr) {done&&done(data, status, jqxhr)})
		.fail(function (data, status, jqxhr) {(fail&&fail(data, status, jqxhr))||(util.warn(data))});
	},
	getUrl=function (url, param) {
		return (ssoprefix||"") + url + (function (p) {
			var ret=[];
			for(var x in p) {
				ret[ret.length]=(x+"="+encodeURIComponent(p[x]));
			}
			return (ret.length>0)?"&"+ret.join("&"):"";
		} (param))
	},
	getUserBody = function (url, callback) {
		$ajax({url : url}, function (data, status, jqXHR) {
			var reg=/<body[^>]*>([\W\d\D]+)<\/body>/;
			var body = reg.exec(data);
			body&&$("#info_frame").html(body[1]);
			callback&&callback(body);
		});
	},
	docEditInit = function (opt) {
		var scInfo={}, scName, scDept;
		//숫자필드 처리
		var digitReg=/\D/g;
		$(".digit").on("keypress", function (e) {
			e.stopPropagation();
			digitReg.lastIndex=0;//외부에 regexp가 있어서
			return !digitReg.test(e.key)
		});
		$(".digit").on("paste", function (e) {
			e.stopPropagation();
			var clipboard=e.originalEvent.clipboardData||window.clipboardData,
			text=clipboard.getData("text");
			digitReg.lastIndex=0;//외부에 regexp가 있어서
			return !digitReg.test(text)
		});

		//후임자 처리
		if (docinfo.scName !== "") {
			if (docinfo.scInfo === "") {
				//과거 문서이므로 Info 필드 변경
				scName = docinfo.scName.split(" ");
				scDept = docinfo.scDept.split(" ");
				scInfo[orgSCDlgID] = [{
					"Type":"G"
					, "LGTName": scName[0]
					, "LGINotesID": "CN="+docinfo.scName+"/O=HANARO"
					, "LGTComnum": scName[1]
					, "LGTDep": docinfo.scDept
					, "DeptName": scDept[scDept.length]
					, "BasicDuoYn": "", "LGTDutyCode": "", "LGTGradeCode": "", "LGTGrade": "", "LGHTel": "", "LGTTel": "", "LGTInnum": ""
					, "LGTFax": "", "unid": "", "position": "", "response": false, "LGTDepCode": "", "FullDeptName": "", "FDepName": ""
				}];
			}
		}
		var temp=OrgDialog({
			dlgID:orgSCDlgID,
			type : "user",
			ismulti : false,
			ismodal : !!realm.showModalDialog,
			saveField : "ShinChungInfo",
			dispField : "dispShinChung",
			pattern : patterns.dispShinChung,
			displaySep : " ",
			done : function (data) {
				$("input[name='ShinChungName']").val((!data||data.length==0)?"":(data[0].LGTName + " " + data[0].LGTComnum));
				$("input[name='ShinChungDeptName']").val((!data||data.length==0)?"":data[0].DeptName);
				return true;
			},
			deptcode : option.userinfo.LGTDepCode
		}).done(scInfo);
	},
	__photoReplace = function (url) {
		var imgArea=$(".profile_selector .img_area"), url;
		if (imgArea.length>0) {
			imgArea.css({
				"backgroundImage": "url('" + url + "')"
			});
		}
	};


	var searchUser = {
		init : function (opt) {
			option=opt;
			var url=getUrl("/"+option.lgOrgDb+"/fmSearchUserInfo?openform", {
				userid : option.userinfo.LGINotesID,
				saveonly : "yes"
			});
			getUserBody(url)
		},
		selectShinChung : function () {
			var shinchung = OrgDialog(orgSCDlgID);
			shinchung.open();
		},
		scRemove : function (n) {
			var shinchung = OrgDialog(orgSCDlgID);
			shinchung&&shinchung.remove(n);
		},
		chgPhoto : function () {
			var url=getUrl("/"+option.lgOrgDb+"/fmSearchChangePhoto?openform&userid="+docinfo.notesid+"&imgname="+docinfo.imgname+"&docunid="+docinfo.unid);
			var fn;
			if (realm.showModalDialog) {
				fn=realm.showModalDialog(url, null, "dialogWidth:500px;dialogHeight:350px;scroll:no;");
				if (fn) this.photoReplace(fn);
			} else {
				realm.open(url, "photo_change", "menubar=no,width=500px,height=350px,scrollbars=no")
			}
		},
		userFormInit : function (opt) {
			docinfo=opt;
			if (docinfo.imgname == "") {
				var url=cIMGPath+"/common/img_user.png";
				__photoReplace(url);
			}
			if (opt.isEdit) {
				docEditInit();
			}
		},
		saveDoc : function () {
			var form=$("#info_frame form"),
			serial=form.serializeArray();
			
			//email check
			var reg = /\S+@\S+\.\S+/g, email=$("input[name='EMail_3']").val();
			if (email !== "" && !reg.test(email)) {
				alert("입력한 메일 주소 형식이 정확하지 않습니다!");
				return;
			}

			//form.submit(function (e) {
				$.ajax({
					url : form.attr("action"),
					type : "post",
					dataType : "json",
					data : serial,
					success : function (data) {
						if (!$.isPlainObject(data)) return;
						if (!data.status) return;
						if (data.status === "success") {
							searchUser.cancelDoc();
						} else if (data.status === "nodoc") {
							alert("사용자 정보를 찾을 수 없습니다.\n관리자에게 문의 하십시오.");
							return;
						} else if (data.status === "error") {
							alert("저장 중 오류가 발생 했습니다.\n관리자에게 문의 하십시오.");
							realm.console&&console.log(data);
							return;
						}
					}
				});
			// 	e.preventDefault();
			// }).submit();
		},
		cancelDoc : function () {
			if (option.isPopup) {
				window.close();
			} else location.reload();
		},
		photoReplace : function (fn) {
			docinfo.imgname=fn;
			var url="/"+option.lgOrgDb+"/jsonUserByEmpno/"+docinfo.unid+"/$FILE/"+docinfo.imgname;
			__photoReplace(url);
		}
	};
	realm.searchUser||(realm.searchUser=searchUser);
} (this));
