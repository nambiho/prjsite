;(function (realm) {
	"use strict";
	
	var _options={
		system:{
			app_repdate: "15",
			app_server: "hintdev02a.skbroadband.com",
			app_server2: "CN",
			bbs_server: "hintdev02a.skbroadband.com",
			bbs_server2: "CN",
			cal_server: "hintdev02a.skbroadband.com",
			cal_server2: "CN",
			etc_server: "hintdev02a.skbroadband.com",
			etc_server2: "cn",
			help_path: "syslib/userhelp.nsf",
			host_suffix: ".skbroadband.com",
			hub_server: "hintdev02a.skbroadband.com",
			hub_server2: "CN",
			mail_domain: "@hintsmtp.skbroadband.com",
			mailattach_cnt: "10",
			mailattach_quota: "0",
			mailDBQuota1: "70",
			mailDBQuota2: "50",
			mailforward_cnt: "1",
			mailsendto_cnt: "3",
			org_path: "syslib/lgorg.nsf",
			Organization: "HANARO",
			orgcode_path: "syslib/lgcode.nsf",
			OU1: "None",
			OU2: "None",
			survey_path: "survey/survey.nsf",
			usermng_path: "syslib/usermng.nsf",
			userprofile_path: "syslib/profile.nsf"
		},
		treeel:"depttree",
		ismodal:false,
		ismulti:false,
		type:"dept",
		expandcode:"",
		initdata:{},
		singleforid:"",
		done:util.noop,
		language:"Kor",
		useallcheck:true,
		company:"",
		companyList:[],
		deptinfo:{
			view:"jsonTreeView",
			viewcom:"jsonComTreeView",
			search:"deptSearch"
		},
		userinfo:{
			view:"jsonUserByDeptCode",
			search:"userSearch"
		}
	},
	pattern={
		searchResultDept:"<div>{{@input}} <span data-key=\"{{@key}}\" class=\"deptsearchitem\">{{@text}}</span></div>",
		userlist:"<tr data-key=\"{{@key}}\">"+
			"<td>{{@input}}</td>"+
			"<td>{{@col1}}</td>"+ //jobtitle
			"<td><label style=\"cursor:pointer;\" for=\"input{{@postype}}{{@key}}\">{{@col2}}</label></td>"+ //name
			"<td>{{@col3}}</td>"+ //phone
			"<td>{{@col4}}</td>"+ //officenum
			"</tr>",
		input:"<input type=\"{{@type}}\" data-key=\"{{@key}}\" name=\"{{@postype}}\" id=\"input{{@postype}}{{@key}}\">",
		selectdept:"<div data-key=\"{{@key}}\" id=\"{{@id}}\" data-for=\"{{@forid}}\">{{@input}} {{@text}}</div>",
		selectuser:"<div data-key=\"{{@key}}\" id=\"{{@id}}\" data-for=\"{{@forid}}\">{{@input}} {{@text}}</div>"
	},
	viewurl=function (dbpath,viewname,key) {
		return util.getUrl("/"+dbpath+"/"+viewname+"?readviewentries",util.copy({
			"outputformat":"json",
			"count":-1
		},(key?{"restricttocategory":key}:{})));
		//return "/"+dbpath+"/"+viewname+"?readviewentries&outputformat=json&count=-1"+(key?("&restricttocategory="+key):"")
	},
	searchurl=function (dbpath,agent,query) {
		return util.getUrl("/"+dbpath+"/"+agent+"?openagent",{
			"query":query
		});
		//return "/"+dbpath+"/"+agent+"?openagent&query="+encodeURIComponent(query)
	},
	getHtmlDept=function (_this,dx,id) {
		return util.pattern({
			key:dx.Code,
			id:dx.Code,
			forid:id,
			input:_this.options.ismulti?util.pattern({
				type:"checkbox",
				name:"sel_input",
				key:dx.Code
			},pattern.input):"",
			text:dx.DeptName||dx.OrgName
		},pattern.selectdept)
	},
	getHtmlUser=function (_this,dx,id) {
		var keytag=_this.getUserkey(dx);
		return util.pattern({
			key:keytag,
			id:keytag,
			forid:id,
			input:_this.options.ismulti?util.pattern({
				type:"checkbox",
				name:"sel_input",
				key:keytag
			},pattern.input):"",
			text:dx.LGTName+" "+dx.LGTComnum //dx.LGTName
		},pattern.selectuser)
	},
	selectDept=function (d,id) {
		var html="",dx;
		if (!this.callEvent("SelectDept",d,id)) {
			for(var x in d) {
				dx=d[x];
				html+=getHtmlDept(this,dx,id);
			}
		}
		return html
	},
	selectUser=function (d,id) {
		var html="",dx; //,keytag="";
		if (!this.callEvent("SelectUser",d,id)) {
			for(var x in d) {
				dx=d[x];
				html+=getHtmlUser(this,dx,id);
			}
		}
		return html
	},
	selectAll=function (d,id) {
		var html="",dx;
		if (!this.callEvent("SelectAll",d,id)) {
			for(var x in d) {
				dx=d[x];
				html+=(dx.Type=="G"?getHtmlDept(this,dx,id):getHtmlUser(this,dx,id));
			}
		}
		return html
	},
	drawRootTree=function () {
		var _this=this,
		tree=_this.fancy.$fancy.tree,
		root=tree.rootNode;
		_this.options.companyList=orgexcept.addRoot(_this.options.companyList,_this.options.userinfo.LGTDepCode);
		_this.options.companyList.forEach(function (data,idx) {
			var splt=data.split("."),key="";
			if (!!_this.options.company && (splt[1]!==_this.options.company)) return;
			key=orgexcept.changeCode(splt[0]);
			root.addChildren({
				title:splt[1],
				key:key,
				hideCheckbox:true,
				data:{Code:key,OrgName:splt[1],Type:"G",Company:splt[1]},
				folder:true
			});
		});
	},
	drawDeptTree=function __drawDeptTree () {
		var _this=this;
		var tree=_this.fancy.$fancy.tree;
		var url=viewurl(
			_this.options.system.orgcode_path,
			_this.options.company?_this.options.deptinfo.viewcom:_this.options.deptinfo.view,
			_this.options.company||""
		);
		_this.$ajax({
			url:url,
			dataType:"json"
		},function (data,status,jqxhr) {
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
				title=(_this.options.language==="Eng"
					?(entry.EOrgName||entry.OrgName)
					:entry.OrgName);
				node&&node.addChildren([{
					title:title,
					key:entry.Code,
					hideCheckbox:orgexcept.hideCheckbox(entry),//entry.DeptName==="",
					data:entry,
					tooltip:title,
					folder:true
				}]);
			}
			_this.options.expandcode&&_this.fancy.ExpandKey(_this.options.expandcode);
		});
	},
	searchDeptDisplay=function(data){
		var _this=this,resultDeptArea=util.getElementById("resultDeptArea"),isdept=(this.options.type==="dept"),isall=(this.options.type==="all"),
		entry=null,html="",length=(data.count|0),datalist={};
		//(isdept||isall)?util.rx({key:entry.Code,type:_this.options.ismulti?"checkbox":"radio",postype:"searchdept"},pattern.input):""
		if (length>0){
			for (;length--;) {
				entry=data.entry[length];
				if (orgexcept.hideDept(entry.Code)) continue;
				datalist[entry.Code]=entry;
				html+=util.rx({
					key:entry.Code,
					text:entry.DeptName||entry.OrgName,
					input:_this.options.ismulti
						?(isdept||isall)?util.rx({key:entry.Code,type:"checkbox",postype:"searchdept"},pattern.input):""
						:""
				},pattern.searchResultDept);
			}
		}
		if (!html) {
			html+=util.rx({
				key:"",
				text:"검색 된 내용이 없습니다.",
				input:""
			},pattern.searchResultDept);
		}
		resultDeptArea.innerHTML=html;
		(isdept||isall)&&(_this.searchDeptList=datalist);
		//if (!isdept) {
			var spans=util.getElementByTagName(resultDeptArea,"span");
			spans.forEach(function (span,ind) {
				util.addEvent(span,"click",function () {
					var key=this.getAttribute("data-key");
					_this.SelectNode.call(_this,null,datalist[key]);
					//deptSelect.call(_this,_this.searchdeptlist[key]);
				});
			});
		//}
		var dispResultDept=util.getElementById("dispResultDept");
		dispResultDept&&(dispResultDept.style.display="block");
	},
	getUserListByKey=function (key) {
		var _this=this,datalist={}; //부서 선택 시 디스플레이 되는 사용자 리스트 데이터
		_this.$ajax({
			url:viewurl(_this.options.system.org_path,_this.options.userinfo.view,key),
			dataType:"json"
		},function (data) {
			var viewdata=util.ViewDataParse(data),
			entries=viewdata.entry;
			drawUserList(_this,entries);
		});
	},
	drawUserList=function(_this,entries) {
		var html="",datalist={},entry,keytag="";
		for(var i=0; i < entries.length; i++) {
			entry=entries[i];
			keytag=_this.getUserkey(entry);
			datalist[keytag]=entry;
			html+=util.pattern({
				postype:"userlist",
				input:_this.options.ismulti?util.pattern({
					type:_this.options.ismulti?"checkbox":"radio",
					postype:"userlist",
					key:keytag},pattern.input):"",
				col1:entry.LGTGrade,
				col2:entry.LGTName,
				col3:entry.LGTComnum,//entry.LGHTel||"-",
				col4:entry.DeptName,//entry.LGTTel||"-",
				key:keytag
			},pattern.userlist);
		}
		_this.searchUserList=datalist;
		var userListArea=util.getElementById("userListArea");
		userListArea.innerHTML=html;

		//사내전화가 있는 끝 부분이 스크롤이 생기면 열이 맞지 않아서
		//padding 으로 처리
		// var user_list_table=util.getElementById("user_list_table");
		// if (user_list_table) {
		// 	util.getElementById("UserListScrollYN").style.paddingRight=
		// 		(userListArea.offsetHeight > user_list_table.offsetHeight) ? "20px" : "6px";
		// }

		if (!_this.options.ismulti) {
			var trs=util.getElementByTagName.call(userListArea,"tr");
			trs.forEach(function (tr,ind) {
				util.addEvent(tr,"click",function (e) {
					var singleforid=_this.options.singleforid,key=this.getAttribute("data-key"),nodedata=datalist[key];
					_this.add(singleforid,[nodedata],false);
				});
			});
		}
	},
	searchUserDisplay=function(data){
		var _this=this,entry=null,html="",length=(data.count|0),datalist={};
		drawUserList(_this,data.entry);
	},
	customScrollbar=function () {
		$(".mCustomScrollbar").mCustomScrollbar({
			axis:'yx',
			setHeight:'100%',
			scrollButtons:{enable:true},
			theme:"minimal-dark"
		});
	},
	initializePage=function () {
		var _this=this,dom,length,forid,on,ev,dt,onprev;
		//initdata 처리
		var __initdata=this.options.initdata&&this.options.initdata.data,__data;
		
		dom=util.queryall("[data-load]");
		length=dom.length;
		for(;length--;) {
			ev=dom[length].getAttribute("data-load");
			ev&&this[ev]&&this[ev](dom[length]);
		}
		
		dom=util.getElementByClassName("orgreturndata");
		length=dom.length;
		for(;length--;){
			forid=dom[length].getAttribute("id");
			forid&&(_this[forid]={});
			_this.datalist.push(forid);
		}
		
		//initdata
		if (__initdata&&__initdata.splice) {console.log("is array. will make")}
		if (util.isJsonString(__initdata)) {
			this.parse_data=JSON.parse(__initdata);
		}
		
		//text 몇명 선택 등
		dom=util.getElementByClassName("orgtext");
		length=dom.length;
		for(;length--;){
			forid=dom[length].getAttribute("data-for");
			(function (__dom) {
				var countopserver=__dom.getAttribute("data-countopserver");
				Object.defineProperty(_this.TEXT,forid,{
					set : function (x) {
						countopserver&&_this[countopserver]&&_this[countopserver](x);
						__dom.innerText=x;
					}
				});
			} (dom[length]));
		}
		
		//event
		dom=util.getElementByClassName("orgeventdom");
		length=dom.length;
		for(;length--;){
			forid=dom[length].getAttribute("data-for");
			on=dom[length].getAttribute("data-on");
			ev=dom[length].getAttribute("data-event");
			onprev=dom[length].getAttribute("data-on-prev");
			dt=dom[length].getAttribute("data-type")||_this.options.type;
			on&&ev&&util.addEvent(dom[length],ev,(function (_id,_on,_dt,_onprev) {
				var reton=(typeof (_on&&_this[_on])==="function")?_this[_on]:util.noop,
				__onpre=(typeof (_onprev&&_this[_onprev])==="function")?_this[_onprev]:null;
				return function (e) {reton.apply(_this,[e,_id,_dt,__onpre])}
			}(forid,on,dt,onprev)));
			if (forid&&on.indexOf("add")>-1) {
				__data=this.parse_data[forid];
				this.deletealllist(null,forid);
				__data&&(__data.length > 0)&&this.add(forid,__data,!!__data[0].Code,dt==="all");
			}
		}
		
		//사용자 테이블의 첫번째열 크기
		dom=util.getElementByClassName("tablecol");
		dom&&dom.forEach(function (el) {
			util.style(el,{
				width:_this.options.ismulti?"32px":"5px"
			});
		});
		
		//전체선택 체크박스 만들기
		if (this.options.type!=="dept" && this.options.ismulti && this.options.useallcheck) {
			dom=util.createElement({
				dom:"input",
				attr:{type:"checkbox",id:"allselectbox"},
				event:{
					"change":function () {
						var userListArea=util.getElementById("userListArea"),
						chkselectdata=util.queryall.call(userListArea,"[type=\"checkbox\"]");
						for (var i=0;i<chkselectdata.length;i++){
							chkselectdata[i].checked=this.checked;
						}
					}
				},
				parent:util.getElementById("allSelectCheckbox")
			});
		}
	};
	
	var baseorgform={
		fancy:null,
		datalist:[],
		parse_data:{},
		searchUserList:{},
		searchDeptList:{},
		checkbox:{},
		TEXT:{},
		options:_options,
		$ajax:function (option,done,fail) {
			$.ajax(util.copy({},option))
			.done(function (data,status,jqxhr) {done&&done(data,status,jqxhr)})
			.fail(function (data,status,jqxhr) {(fail&&fail(data,status,jqxhr))||(util.warn(data))});
		},
		singleHide:function (d) {
			if (!this.options.ismulti) {
				d.style.display="none";
			}
		},
		setCount:function (id,val) {
			this.TEXT[id]=val;
		},
		setEvent:function (ev,func) {
			this["on"+ev.toLowerCase()]=func;
		},
		setAllEvents:function (events) {
			if (!events) return;
			for (var x in events) {
				this.setEvent(x,events[x]);
			}
		},
		callEvent:function (ev) {
			var argv=Array.prototype.slice.call(arguments,1),
			event=this["on"+ev.toLowerCase()];
			if (event) {
				return event.apply(this,argv);
			}
		},
		init:function(loading){
			this.setAllEvents(loading.event);
			initializePage.call(this);
			this.callEvent("init");
			this.fancyinit();
			if (this.options.type==="user"||this.options.type==="all") {
				this.options.expandcode&&getUserListByKey.call(this,this.options.expandcode);
			}
			//scrollbar
			customScrollbar();
			var except,splitData;
			if (this.options.initExcept) {
				splitData=this.options.initExcept.split("\u007C");
				for (var i=0;i<splitData.length;i++){
					except=orgexcept["init_"+splitData[i].toLowerCase()];
					except&&except.call(this);
				}
			}
			return this;
		},
		fancyinit:function(){
			var _this=this,
			selectmode=this.options.ismulti?2:1,
			isdept=this.options.type==="dept",
			check=(isdept||this.options.type==="all")&&this.options.ismulti;

			function __click (event,node) {
				//if (node.node.data.DeptName==="") return;
				if (node.node.data.Lebel==="X") return;
				node.targetType==="title"&&_this.SelectNode(node,node.node.data)
			}
			this.fancy=fancycustom({
				el:this.options.treeel,
				checkbox:check,
				selectMode:this.options.ismulti?2:1,
				click:this.options.clickNode||__click
			});
			drawRootTree.call(this);
			drawDeptTree.call(this);
			return this
		},
		searchInputDept:function (e) {
			if (e.which===13) {
				this.searchDept(e);
			}
		},
		searchInputUser:function (e) {
			if (e.which===13) {
				this.searchUser(e);
			}
		},

		//검색 후 전체선택/해제 시작
		searchDeptSelectAll:function (e,id,dt,pre) {
			var resultDeptArea=util.getElementById("resultDeptArea"),
			boxes=util.queryall.call(resultDeptArea, "input[type=\"checkbox\"]");
			for(var i=0;i<boxes.length;i++) boxes[i].checked=true
		},
		searchDeptDeselectAll:function (e,id,dt,pre) {
			var resultDeptArea=util.getElementById("resultDeptArea"),
			boxes=util.queryall.call(resultDeptArea, "input[type=\"checkbox\"]:checked");
			for(var i=0;i<boxes.length;i++) boxes[i].checked=false
		},
		searchSelectAllbtnLoad:function (e,id) {
			if (!this.options.ismulti||this.options.type==="user") e.style.display="none"
		},
		//검색 후 전체선택/해제 끝

		SelectNode:function (node,nodedata) {
			var singleforid=this.options.singleforid,singlevalue={};
			if (this.options.type==="user"||this.options.type==="all") {
				getUserListByKey.call(this,nodedata.Code);
				return;
			}
			if (!this.options.ismulti) {
				if (singleforid&&this[singleforid]) {
					singlevalue[nodedata.Code]=nodedata;
					this[singleforid]=singlevalue;
					this.add(singleforid,[nodedata],true,false);
				}
			}
		},
		searchDept:function (e) {
			var _this=this,
			srcElement=util.getElementById("DeptSearch"),
			query=srcElement&&srcElement.value,
			db=_this.options.system.orgcode_path,
			view=_this.options.deptinfo.view,
			agent=_this.options.deptinfo.search;
			if (!util.trim(query)) return;
			srcElement.value="";
			this.search(query,db,agent,view,searchDeptDisplay);
		},
		searchUser:function (e) {
			var _this=this,
			srcElement=util.getElementById("UserSearch"),
			query=srcElement&&srcElement.value,
			db=_this.options.system.org_path,
			view=_this.options.userinfo.view,
			agent=_this.options.userinfo.search;
			if (!util.trim(query)) return;
			srcElement.value="";
			this.search(query,db,agent,view,searchUserDisplay);
		},
		search:function (query,db,agent,view,display) {
			var _this=this;
			_this.$ajax({
				url:searchurl(db,agent,query)+"&test="+query,
				datatype:"json",
				type:"post",
				data:{
					Action:"search",
					Query:query,
					ViewName:view,
					Company:_this.options.company||""
				}
			},function (data,status,jqxhr) {
				display&&display.call(_this,data);
			});
		},
		closeDeptSearch:function (e) {
			var resultDeptArea=util.getElementById("resultDeptArea"),
			dispResultDept=util.getElementById("dispResultDept");
			resultDeptArea&&(resultDeptArea.innerHTML="");
			dispResultDept&&(dispResultDept.style.display="none");
			this.searchDeptList={};
		},
		getSelectedNodes:function (id,isdept,isall) {
			var _this=this;
			//var tree=this.fancy.$fancy.tree,fancytreenodes,chkselectdata,data=[],dispResult,key;
			function __getDept() {
				var tree=_this.fancy.$fancy.tree,fancytreenodes,chkselectdata,data=[],dispResult,key;
				dispResult=util.getElementById("dispResultDept");
				
				if (dispResult.style.display=="none") {
					fancytreenodes=tree.getSelectedNodes();
					data=fancytreenodes.map(function (_node) {_node.setSelected(false);return _node.data});
				} else {
					chkselectdata=util.queryall("#resultDeptArea input:checked");
					for (var i=0;i<chkselectdata.length;i++){
						key=chkselectdata[i].getAttribute("data-key");
						chkselectdata[i].checked=false;
						data.push(_this.searchDeptList[key]);
					}
				}
				return data
			}
			function __getUser() {
				var chkselectdata,data=[],dispResult,key;
				dispResult=util.getElementById("userListArea");
				chkselectdata=util.queryall.call(dispResult,"input:checked");
				for (var i=0;i<chkselectdata.length;i++){
					key=chkselectdata[i].getAttribute("data-key");
					chkselectdata[i].checked=false;
					data.push(_this.searchUserList[key]);
				}
				chkselectdata=util.getElementById("allselectbox");
				chkselectdata&&(chkselectdata.checked=false);
				return data
			}

			var retdata=[];
			if (isall) retdata=(__getDept().concat(__getUser()));
			else if (isdept) retdata=__getDept();
			else retdata=__getUser();
			return retdata
		},
		getUserkey:function (d) {
			var retvalue=d&&d["LGTComnum"]; //+d["BasicDuoYn"];
			return retvalue||"";
		},
		add:function (id,data,isdept,isall) {
			var insertdom=util.getElementById(id),
			length=data.length,
			keydata,checkitem,html="",selectedlist;
			isdept=(typeof isdept==="undefined")?this.options.type==="dept":isdept;
			if (!insertdom) return;
			if (data.length==0) {return false};
			if (this.options.ismulti){
				for(;length--;){
					keydata=data[length]["Code"]||this.getUserkey(data[length]);
					checkitem=this[id][keydata];
					if (checkitem){
						data.splice(length,1);
					} else keydata&&(this[id][keydata]=data[length]);
				}
			} else {
				keydata=data[0]["Code"]||this.getUserkey(data[0]);
				this[id]={};
				keydata&&(this[id][keydata]=data[0]);
			}
			html=(isall
			?selectAll.call(this,data,id)
			:(isdept?selectDept.call(this,data,id):selectUser.call(this,data,id)));
			
			if (html) {
				selectedlist=util.getElementById(id);
				if (this.options.ismulti) {
					selectedlist.insertAdjacentHTML("beforeend",html);
				} else {
					selectedlist.innerHTML=html;
				}
				this.setCount(id,Object.keys(this[id]).length);
			}
			return true
		},
		addlist:function (e,id,dt,pre) {
			var isdept=dt==="undefined"||dt===null?this.options.type==="dept":dt==="dept",
			isall=(dt==="all"),
			data=this.getSelectedNodes(id,isdept,isall);
			if (pre) if (!pre.apply(this,[data,e,id,dt,pre])) return
			if (!this.add(id,data,isdept,isall)) {
				util.tooltip(e.srcElement,id,(isdept?"부서를":"사용자를")+" 선택해 주세요");
			}
		},
		keyDelete:function (id, key) {
			var selectedlist=util.getElementById(id),isselect=selectedlist.tagName==="SELECT",
			length=selectedlist.children.length,datakey="";
			for(;length--;){
				datakey=selectedlist.children[length].getAttribute("data-key");
				if (datakey===key) {
					selectedlist.removeChild(selectedlist.children[length]);
					delete this[id][datakey];
				}
			}
			this.setCount(id,Object.keys(this[id]).length);
		},
		deletelist:function (e,id,dt,pre) {
			if (!this.options.ismulti) {this.deletealllist(e,id); return}
			var selectedlist=util.getElementById(id),isselect=selectedlist.tagName==="SELECT",
			querystring=isselect?"option:checked":"input[type=\"checkbox\"]:checked",
			chk=util.queryall.call(selectedlist,querystring),div,key;
			if (pre) if (!pre.apply(this,[e,id,chk])) return
			for(var i=0;i<chk.length;i++){
				key=chk[i].getAttribute("data-key");
				isselect?selectedlist.removeChild(chk[i]):selectedlist.removeChild(chk[i].parentNode);
				delete this[id][key];
			}
			this.setCount(id,Object.keys(this[id]).length);
		},
		deletealllist:function (e,id,dt,pre) {
			var listarea=util.getElementById(id);
			if (pre) if (!pre.apply(this,[e,id,"all"])) return
			listarea&&(listarea.innerHTML="");
			this[id]&&(this[id]={});
			this.setCount(id,0);
		},
		getlist:function () {
			var forid,list={};
			var elem,isselect,querystring,items,datakey;

			for (var i=0;i<this.datalist.length;i++){
				forid=this.datalist[i];
				list[forid]=[];

				elem=util.getElementById(forid);
				isselect=elem.tagName==="SELECT";
				querystring=isselect?"option":"[data-for=\""+forid+"\"]";
				items=util.queryall.call(elem,querystring);
				for (var j=0;j<items.length;j++){
					datakey=items[j].getAttribute("data-key");
					list[forid].push(this[forid][datakey]);
				}
			}
			this.callEvent("GetherSelectList",list);
			return list
		},
		done:function (e) {
			this.callEvent("done");
			var returnvalue=this.getlist(),length=0,thistype=this.options.type;
			for(var x in returnvalue) {
				if (util.isJSON(returnvalue[x])) {
					length+=Object.keys(returnvalue[x]).length;
				} else {
					length+=returnvalue[x].length;
				}
			}
			if (util.isFalse(length)) {alert("선택된 "+(thistype==="dept"?"부서가":thistype==="user"?"사용자가":"리스트가")+" 없습니다."); return}
			if (this.options.ismodal) {
				realm.returnValue=returnvalue;
			} else {
				this.options.done&&this.options.done(returnvalue);
			}
			this.cancel()
		},
		cancel:function (e) {realm.close()}
	};

	realm.baseorgform || (realm.baseorgform=baseorgform);

} (this));