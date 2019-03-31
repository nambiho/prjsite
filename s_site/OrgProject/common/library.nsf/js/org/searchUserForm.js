;(function (realm) {
	"use strict";

	var classNavi={
		length:0,
		totalPage:0,
		totalArea:0,
		cPage:1,
		cArea:1,
		aSize:10, //테이블 숫자
		pSize:10, //열 숫자
		div:null,
		evt:util.noop,
		pageArea:{},
		init:function (s,f) {
			var _this=this,tag="",ac=0;
			_this.length=s;_this.evt=f;
			_this.totalPage=Math.ceil(_this.length/_this.pSize);
			_this.totalArea=Math.ceil(_this.totalPage/_this.aSize);
			_this.pageArea={};
			_this.div=$(".paginate_list").html(_this.length==0?"":patterns.navi);

			for(var i=1;i<=_this.totalPage;i++){
				ac=Math.ceil(i/_this.aSize);
				tag="area"+ac;
				if (!(tag in _this.pageArea)) _this.pageArea[tag]=[];

				_this.pageArea[tag].push(util.pattern({
					idx:(i)
				},patterns.naviPage));
			}

			_this.drawPage();
			$(".paginate_btn_prev",_this.div).on("click",function () {_this.prev();});
			$(".paginate_btn_next",_this.div).on("click",function () {_this.next();});
			$(".paginate_btn_fst",_this.div).on("click",function () {_this.first();});
			$(".paginate_btn_lst",_this.div).on("click",function () {_this.last();});
		},
		drawPage:function () {
			var _this=this;
			if (_this.length==0) return;
			$("#pageNaviArea",this.div).html(this.pageArea["area"+this.cArea].join(""));
			$(".paginate_num",this.div).each(function (idx,navATag) {
				$(navATag).on("click",function () {
					_this.numClick($(this).attr("data-index")|0,$(this));
				});
			});
		},
		numClick:function (idx,obj) {
			this.cPage=idx;
			this.evt(idx,obj);
			$(".active",this.div).removeClass("active");
			$(obj).addClass("active");
		},
		prev:function () {if(this.page==1) return;this.page--;},
		next:function () {if(this.page==this.totalPage) return; this.page++;},
		first:function () {this.page=1},
		last:function () {this.page=this.totalPage},
		goPage:function (pg) {this.page=pg},
		onEvent:function (idx) {
			this.div.find("a[data-index="+idx+"]").trigger("click");
		}
	};


	var
	fancy=null,
	option=null,
	datalist={},
	viewComCode=[],
	navi=null,
	tagPrefix="page",
	orgSCDlgID="shinchung",
	current={pagenum:"",row:1,tag:""},
	$ajax=function (option,done,fail) {
		$.ajax(util.copy({},option))
		.done(function (data,status,jqxhr) {done&&done(data,status,jqxhr)})
		.fail(function (data,status,jqxhr) {(fail&&fail(data,status,jqxhr))||(util.warn(data))});
	},
	patterns={
		listTR:"<tr class=\"tbl_row\" id=\"tr{{@pagenum}}{{@row}}\">"+
			"<td class=\"tbl_data\" onclick=\"searchUser.showUserInfo('{{@pagenum}}','{{@row}}');\" style=\"cursor:pointer;\">"+
			"<span class=\"txt_name\">{{@name}}</span><span class=\"txt_ein\">{{@empno}}</span></td>"+
			"<td class=\"tbl_data\">{{@jobtitle}}</td>"+
			"<td class=\"tbl_data\"><div class=\"txt_company\">{{@com}}</div><div class=\"txt_belong\"{{@search}}>{{@dept}}</div></td>"+
			"<td class=\"tbl_data\">{{@job}}</td>"+
			"<td class=\"tbl_data\"><div class=\"txt_hp\">{{@col5_1}}</div><div class=\"txt_tel\">{{@col5_2}}</div></td>"+
			"</tr>",
		navi:"<a href=\"#\" class=\"paginate_btn paginate_btn_fst\"><span class=\"blind\">처음으로</span></a>"+
			"<a href=\"#\" class=\"paginate_btn paginate_btn_prev\"><span class=\"blind\">이전으로</span></a>"+
			"<span id=\"pageNaviArea\"></span>"+
			"<a href=\"#\" class=\"paginate_btn paginate_btn_next\"><span class=\"blind\">다음으로</span></a>"+
			"<a href=\"#\" class=\"paginate_btn paginate_btn_lst\"><span class=\"blind\">마지막으로</span></a>",
		naviPage:"<a href=\"#\" class=\"paginate_num\" data-index=\"{{@idx}}\">{{@idx}}</a>",
		emptyUser:"<tr><td colspan=\"5\" class=\"tbl_data\">사용자가 없습니다.</td></tr>",
		querytitle:"[검색어 : <span id=\"QueryText\">{{@query}}</span>]"
	},
	createNavi=function () {
		var ret=Object.create(classNavi,{
			page:{
				configurable:true,
				set:function (idx) {
					var area=Math.ceil(idx/this.aSize);
					if (area!=this.cArea) {
						this.cArea=area;
						this.drawPage();
					}
					this.onEvent(idx);
				},
				get:function () {return this.cPage}
			}
		});
		return ret
	},
	deptinfo={
		view:"jsonTreeView",
		viewcom:"jsonComTreeView",
		search:"deptSearch"
	},
	userinfo={
		view:"jsonUserByDeptCode",
		search:"userSearch"
	},
	viewurl=function (dbpath,viewname,key) {
		return util.getUrl("/"+dbpath+"/"+viewname+"?readviewentries",util.copy({
			outputformat:"json",
			count:"-1"
		},(key?{restricttocategory:key}:{})));
	},
	searchurl=function (dbpath,agent,query) {
		return util.getUrl("/"+dbpath+"/"+agent+"?openagent",{
			query:query
		});
	},
	eventInit=function () {
		$(document).on("contextmenu",function () {return false});
	},
	fancyinit=function () {
		fancy=fancycustom({
			el:"fancyDeptTree",
			selectMode:2,
			click:function (e,n) {
				if (n.targetType=="title") {
					searchUser.getUserList(n.node.key);
				}
			}
		});
	},
	drawRootTree=function () {
		var tree=fancy.$fancy.tree,root=tree.rootNode;
		option.companyList=orgexcept.addRoot(option.companyList,option.userinfo.LGTDepCode);
		$(option.companyList).each(function (idx,data) {
			var splt=data.split(".");
			if (!!option.company && (splt[1]!==option.company)) return;
			root.addChildren({
				title:splt[1],
				key:orgexcept.changeCode(splt[0]),
				hideCheckbox:true,
				data:data,
				folder:true
			});
		});
	},
	drawDeptList=function () {
		var tree=fancy.$fancy.tree;
		$ajax({
			url:viewurl(option.lgCodeDb,option.company?deptinfo.viewcom:deptinfo.view,option.company),
			dataType:"json"
		},function (data) {
			var viewdata=util.ViewDataParse(data),
			entries=viewdata.entry,
			size=(entries.length-1),
			i=entries.length,
			entry,title,
			node
			;
			for (;i--;) {
				entry=entries[size - i];
				node=tree.getNodeByKey(entry.HCode,tree.rootNode);
				if (!node) continue;
				title=(option.language==="Eng"
					?(entry.EOrgName||entry.OrgName)
					:entry.OrgName);
				node.addChildren([{
					title:title,
					key:entry.Code,
					hideCheckbox:entry.Lebel==="X", //entry.DeptName==="",
					data:entry,
					tooltip:title,
					folder:true
				}]);
			}
			if (option.userinfo.LGTDepCode){
				fancy.ExpandKey(option.userinfo.LGTDepCode);
				searchUser.getUserList(option.userinfo.LGTDepCode);
			}
		});
	},
	makeRowHtml=function (s,q,pn,r) {
		var html="",
		fdep=s.FDepName.split("^"),
		splt=fdep[0].split(".");
		html=util.pattern({
			pagenum:pn,
			row:r,
			name:s.LGTName+" "+s.LGTComnum,
			//jobtitle:s.LGTGrade,
			jobtitle:s.LGTDuty,
			search:(q?" onclick=\"searchUser.getUserList('"+s.LGTDepCode+"')\" style=\"cursor:pointer\"":""),
			dept:s.DeptName,
			job:s.ChakWork,
			com:splt[1],
			col5_1:s.LGHTel||"-",
			col5_2:s.LGTTel||"-"
		},patterns.listTR);
		return html
	},
	deptUserList=function (data) {
		var viewdata=util.ViewDataParse(data),entries=viewdata.entry;
		initUserList(entries);
	},
	initUserList=function (entries,query) {
		var length=entries.length,entry;
		datalist={};
		var nNum,tag;

		//Navigation init
		navi=createNavi();
		navi.init(length,function (nNum) {
			var tag=tagPrefix+nNum,html="";
			if (!datalist[tag]) return;
			$(datalist[tag]).each(function (idx,data) {
				html+=data.html;
			});
			$("#UserListBody").html(html);
		});
		
		//배열만들기
		var html;
		for (var i=0;i<length;i++) {
			nNum=Math.ceil((i+1)/navi.pSize);
			tag=tagPrefix+nNum;
			if (!(tag in datalist)) datalist[tag]=[];
			entry=entries[i];
			html=makeRowHtml(entry,query,nNum,datalist[tag].length);
			datalist[tag].push({html:html,data:entry});
		}
		
		navi.goPage(1);
		$("#querytitle").html(query?util.pattern({query:query},patterns.querytitle):"");
		if (length==0) $("#UserListBody").html(patterns.emptyUser); else navi.first()
		$("#usercnt").text(length);
	},
	searchInit=function () {
		var box=$(".input_box"),input=$("input",box),button=$("button",box);
		input&&input.on("keypress",function (e) {
			if (e.which==13) {
				searchUser.search(input.val(),input);
			}
		});
		button&&button.on("click",function () {
			searchUser.search(input.val(),input);
		});
	},
	search=function (query) {
		$ajax({
			url:searchurl(option.lgOrgDb,userinfo.search,query),
			dataType:"json",
			data:{
				Action:"search",
				Query:query,
				ViewName:userinfo.view,
				callsearch:1
			}
		},function (data) {
			initUserList(data.entry,query);
		});
	},
	userFrameToggle=function (bShow) {
		var lstfrmDisplay=$("#list_frame").css("display");
		if (bShow) {
			if (lstfrmDisplay=="block") $("#list_frame").css("display","none");
			$("#info_frame").show();
		} else {
			if (lstfrmDisplay=="none") $("#list_frame").css("display","block");
			$("#info_frame").hide();
			$("#info_frame").html("");
		}
	}
	;
	

	var searchUser={
		init:function (opt) {
			option=opt;
			eventInit();
			
			fancyinit();
			searchInit();

			drawRootTree();
			drawDeptList();
			
			//Close
			$(".btn_close").on("click",function () {
				realm.close();
			});
		},
		getUserList:function (deptCode) {
			var _this=this; //부서 선택 시 디스플레이 되는 사용자 리스트 데이터
			if ($("#list_frame").css("display")!=="inline") {userdoc.init({});userFrameToggle(false)}
			$ajax({
				url:viewurl(option.lgOrgDb,userinfo.view,deptCode),
				dataType:"json"
			},function (data) {
				deptUserList(data);
			});
		},
		showUserInfo:function (pagenum,row) {
			var tag=tagPrefix+pagenum,
			userdata=datalist[tag][row].data;
			current.pagenum=pagenum; current.row=row; current.tag=tag;
			userdoc.init({
				id:"info_frame",
				lgOrgDb:cOrgPath,
				company:option.userinfo.Company,
				userinfo:userdata
			}).readDoc(null,function () {userFrameToggle(true)});
		},
		row:function (source) {
			var usersource=datalist[current.tag][current.row];
			usersource.data=source;
			usersource.html=makeRowHtml(source,$("#QueryText").text(),current.pagenum,current.row);
			navi.goPage(current.pagenum)
		},	
		search:function (query,input) {
			if (query.length < 2) {alert("검색어는 두자 이상 사용 하십시오."); return}
			search(query);
			input.val("");
		},
		showList:function () {
			userFrameToggle(false);
		}
	};
	realm.searchUer||(realm.searchUser=searchUser);
} (this));
