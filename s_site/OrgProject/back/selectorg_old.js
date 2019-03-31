	
;(function (realm) {
	"use strict";

	var pattern={
		userlist:"<div data-key=\"{{@key}}\">{{@input}}{{@name}}</div>",
		input:"<input type=\"{{@type}}\" name=\"{{@name}}\" value=\"{{@key}}\">",
		select:"<div id=\"{{@id}}\">{{@input}} {{@text}}</div>",
		resultdept:"<div id=\"resultdept_{{@index}}\">{{@text}}</div>"
	},
	viewurl=function (dbpath, viewname, key) {
		return "/"+dbpath+"/"+viewname+"?readviewentries&outputformat=json&count=-1"+(key?("&restricttocategory=" + key):"")
	},
	searchurl=function (dbpath, agent, query) {
		return "/"+dbpath+"/"+agent+"?openagent&query="+encodeURIComponent(query)
	},
	$ajax=function (option, done, fail) {
		$.ajax(util.copy({}, option))
		.done(function (data, status, jqxhr) {done&&done(data, status, jqxhr)})
		.fail(function(data) {(fail&&fail(data))||(util.warn(data))});
	},
	makeForm=function () {
		var _this=this;
		if (this.options.type==="all"||this.options.type==="user") {
			this.userListWrap=util.createElement({
				dom:"div",
				attr:{
					id:"userlistwrap",
					"class":"box"
				},
				event:{
					click:function (e) {
						var srcEl=e.srcElement,
						key=srcEl.getAttribute("data-key"),
						data=_this.currentUserList[key];
						data&&_this.setSelected(false, data);
					}
				},
				parent:this.wrap
			}, _this);
			this.userListInit();
		}

		if (this.options.ismulti) {
			this.selectListWrap=util.createElement({
				dom:"div",
				attr:{
					id:"userlistwrap",
					"class":"box"
				},
				parent:this.wrap,
				event:{
					click:function (e) {
						var srcEl=e.srcElement;
					}
				}
			});
			util.createElement({
				dom:"button",
				attr:{
					id:"delete"
				},
				text:"삭제",
				parent:this.wrap,
				event:{
					click:_this.deleteSelected
				}
			}, this);
			util.createElement({
				dom:"button",
				attr:{
					id:"alldelete"
				},
				event:{
					click:_this.deleteAllSelected
				},
				text:"전체삭제",
				parent:this.wrap
			}, this);
		}
	},
	drawDeptTree=function __drawDeptTree () {
		var _this=this;
		var tree=_this.fancy.tree;
		$ajax({
			url:viewurl(_this.options.deptdb, _this.options.deptview),
			dataType:"json"
		}, function (data, status, jqxhr) {
			var viewdata=util.ViewDataParse(data),
			entries=viewdata.entry,
			size=(entries.length-1),
			length=entries.length,
			entry,
			node
			;
			/*
			{
			Code: "0000",
			Company: "SK브로드밴드",
			EOrgName: "SK Broadband",
			FullDeptName: "",
			HCode: "",
			Lebel: "X",
			OrgName: "SK브로드밴드",
			position: "1",
			response: false,
			SCode: "",
			sort: "0000",
			unid: "4925816F0020D81A4925800200257F0B"
			}
	  		*/
			for (;length--;) {
				entry=entries[size - length];
				node=(tree.getNodeByKey(entry.HCode, tree.rootNode)||tree.rootNode);
				node.addChildren({
					title:(_this.options.language==="Kor"
						?entry.OrgName
						:(entry.EOrgName||entry.OrgName)),
					key:entry.Code,
					data:entry,
					folder:true
				});
			}

			_this.fancyExpandKey(_this.options.deptcode);
		});
	},
	getUserListByKey=function __getUserListByKey (key) {
		var _this=this;
		_this.currentUserList={};
		$ajax({
			url:viewurl(_this.options.userdb, _this.options.userview, key),
			dataType:"json"
		}, function (data) {
			var viewdata=util.ViewDataParse(data),
			entries=viewdata.entry,
			entry,
			html=""
			;
			/*
			{
			FDepName: "0000.SK브로드밴드^A0000.CEO",
			LGINotesID: "CN=이인찬 M152/O=HANARO",
			LGTComnum: "M152",
			LGTDep: "CEO",
			LGTDepCode: "A0000",
			LGTFax: "",
			LGTGrade: "사장",
			LGTInnum: "",
			LGTName: "이인찬",
			LGTTel: "02-6266-6000",
			position: "1",
			response: false,
			unid: "4925816F0020DC7F492580870004A44C"
			}
			*/
			for(var i=0; i < entries.length; i++) {
				entry=entries[i];
				_this.currentUserList[entry.LGTComnum]=entry;
				html += util.pattern({
					name:entry.LGTName,
					key:entry.LGTComnum,
					input:(_this.options.ismulti&&util.pattern({
						type:"checkbox",
						name:"userlist_"+i,
						value:entry.LGTName
					}, pattern.input))||""
				}, pattern.userlist);
			}
			_this.userListWrap.innerHTML=html;
		});
	}
	;


	var _options={
		ismodal:false,
		depturl:"",
		userurl:"",
		type:"dept", //dept:부서선택, user:사용자선택, all:부서,사용자 선택
		language:"Kor",
		deptcode:"",
		ismulti:false
	}
	;


	
	var treearea=function () {
		var _this=this;
		util.createElement({
			dom:"input",
			attr:{
				type:"text",
				id:"search_dept"
			},
			style:{
				width:"500px",
				height:"25px",
				marginBottom:"10px"
			},
			event:{
				keydown:function (e) {
					if (e.keyCode===13) {
						_this.search(true, this.value);
						this.value="";
					}
				}
			},
			parent:this.wrap
		});

		util.createElement({
			dom:"button",
			text:"검색",
			style:{
				height:"30px"
			},
			event:{
				click:function (e) {
					var search_dept=util.getElementById("search_dept");
					if (search_dept) {
						_this.search(true, search_dept.value);
						search_dept.value="";
						console.log(search_dept.value);
					}
				}
			},
			parent:this.wrap
		});

		util.createElement({
			dom:"div",
			attr:{
				id:"tree",
				"class":"box"
			},
			parent:this.wrap
		});


		util.createElement({
			dom:"div",
			attr:{
				id:"deptsearchresult",
				"class":"box"
			},
			parent:this.wrap
		});
	}
	;



	var _selectorg = function () {};
	_selectorg.prototype = {
		selectList:{},
		wrap:null,
		init:function () {
			this.wrap=util.getElementById(this.options.el);
			if (!this.wrap) {
				util.warn("엘리먼트가 없음 : " + this.options.el);
				return undefined
			}
			treearea.call(this);
			makeForm.call(this);
			this.fancyinit();
			this.fancyDeptTree();
			return this
		},
		search:function (isdept, query) {
			if (!query) return;
			var _this=this,
			db=_this.options[isdept?"deptdb":"userdb"],
			agent=_this.options[isdept?"deptsearchagent":"usersearchagent"]
			;
			$ajax({
				url:searchurl(db, agent, query)+"&test="+query,
				datatype:"json",
				type:"post",
				data:{
					Action:"search",
					Query:query,
					ViewName:_this.options[isdept?"deptview":"userview"]
				}
			}, function (data, status, jqxhr) {
				var resultdiv = util.getElementById(isdept?"deptsearchresult":"usersearchresult"),
				count=data.count|0
				;
				for(var i=0; i<count; i++) {
					
				}
			});
		},
		userListInit:function () {
			getUserListByKey.call(this, this.options.deptcode);
		},
		setSelected:function (isdept, data) {
			var key=isdept?data.Code:data.LGTComnum,
			text=isdept?data.OrgName:data.LGTName,
			id="sel_"+key,
			name="sel_input_"+key
			;
			if (this.selectList[key]) return;
			this.selectList[key]=data;
			if (this.options.ismulti) {
				var html=util.pattern({
					text:text,
					id:id,
					input:util.pattern({
						type:"checkbox",
						name:name,
						key:key
					}, pattern.input)
				}, pattern.select);
				this.selectListWrap.insertAdjacentHTML("beforeend", html);
			} else {this.done()}
		},
		deleteSelected:function (key) {
			if (key && typeof key === "string") {
				delete this.selectList[key];
				return;
			}
			var chk=util.queryall("input[type=\"checkbox\"]:checked"),div,key;
			for(var i=0;i<chk.length;i++){
				key=chk[i].value;
				div=chk[i].parentNode;
				this.selectListWrap.removeChild(div);
				delete this.selectList[key];
			}
		},
		deleteAllSelected:function () {
			this.selectList={};
			this.selectListWrap.innerHTML="";
		},
		fancyinit:function () {
			var _this=this;
			this.fancy=fancycustom({
				el:"#tree",
				source:[],
				click:function (event,node) {
					node.targetType!=="expander"&&_this.fancySelectNode(node);
				}
			});
			return this
		},
		fancyDeptTree:function () {
			var tree=this.fancy.tree;
			if ((this.options.type==="dept"||this.options.type==="all")&&this.options.ismulti) {
				tree.options.checkbox=true;
			}
			drawDeptTree.call(this);
		},
		fancySelectNode:function (node) {
			var data=node.node.data;

			if ((this.options.type==="dept"||this.options.type==="all")) {
				this.setSelected(true, data);
			} else {
				getUserListByKey.call(this, data.Code);
			}
			if ((this.options.type==="dept"||this.options.type==="all")&&this.options.ismulti&&node.targetType==="checkbox") {
				node.node.toggleSelected(false);
			}
		},
		fancyExpandKey:function (key) {
			if (!key) return this;
			var tree=this.fancy.tree,
			node=tree.getNodeByKey(key)
			;
			while (node&&node.parent) {
				node.toggleExpanded();
				node=node.parent;
			}
			return this
		},
		done:function () {
			var retvalue=(function (_list) {
				var r=[];
				for(var prop in _list) {
					r[r.length]=_list[prop];
				}
				return r;
			} (this.selectList));
			if (retvalue.length==0) {alert("선택된 내용이 없습니다."); return;}
			if (this.options.ismodal) {
				realm.returnValue=retvalue;
			} else {
				this.options.done(retvalue);
			}
			realm.close();
		}
	}
	;
	


	function create (options) {
		var _so=util.object(_selectorg.prototype, {
			options:{
				writable:true
				,configurable:true
				,enumerable:true
				,value:util.copy(_options, options)
			}
		});
		
		return _so.init();
	};



	realm.selectorg || 
	(
		realm.selectorg=function (options) {
			return create(options);
		}
	);
} (this));
