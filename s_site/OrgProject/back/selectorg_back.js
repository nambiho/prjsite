;(function (realm) {
	"use strict";
	var noop=function () {}
	,dept={
		path:"syslib/lgcode.nsf"
		,viewname:"jsonTreeView"
		,get url () {
			return "/"+this.path+"/"+this.viewname+"?readviewentries&count-1&outputformat=json";
		}
	}
	,user={
		path:"syslib/lgorg.nsf"
		,viewname:"jsonUserByDeptCode"
		,get url () {
			return "/"+this.path+"/"+this.viewname+"?readviewentries&count-1&outputformat=json";
		}
	}
	,pattern={
		userlist:"<div>{{@name}}</div>"
	}
	,$ajax=function (option, done, fail) {
		$.ajax(util.copy({}, option))
		.done(function (data, status, jqxhr) {done&&done(data, status, jqxhr)})
		.fail(function(data) {(fail&&fail(data))||console.log("fail", data)});
	}
	,drawDeptTree=function __drawDeptTree (_this) {
		var tree=_this.fancy.tree;
		$ajax({
			url:_this.options.dept.url
			,dataType:"json"
		}, function (data, status, jqxhr) {
			var viewdata=util.ViewDataParse(data)
			,entries=viewdata.entry
			,size=(entries.length-1)
			,length=entries.length
			,entry
			,node
			;

			for (;length--;) {
				entry=entries[size - length];
				node=(tree.getNodeByKey(entry.HCode, tree.rootNode)||tree.rootNode);
				node.addChildren({
					title:(_this.options.language==="Kor"
						? entry.OrgName 
						: (entry.EOrgName || entry.OrgName))
					,key:entry.Code
					,data:entry
					,folder:true
				});
			}

			_this.fancyExpandKey(_this.options.tree.expandkey);
		});
	}
	,getUserListByKey=function __getUserListByKey (_this, key) {
		
		$ajax({
			url:_this.options.user.url + "&restricttocategory=" + key
			,dataType:"json"
		}, function (data) {
			var viewdata=util.ViewDataParse(data)
			,entries=viewdata.entry
			,entry
			,userlist=util.getElementById(_this.options.user.el)
			,html="";
			/*
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
			*/
			for(var i=0; i < entries.length; i++) {
				entry=entries[i];
				html += util.pattern({name:entry.LGTName}, pattern.userlist);
			}
			userlist.innerHTML=html;
		});
	}
	;

	var _options={
		type:1 //1: dept tree & user list , 2 dept tree & user dept
		,selectmode:1 //1:single, 2:multi
		,user:{
			url:""
			,el:"#userlist"
		}
		,dept:{
			url:""
			,selectable:false
		}
		,tree:{
			el:"#tree"
		}
		,language:"Kor"
		,search:noop
		,callback:noop
	};

	var _selectorg=function () {};
	_selectorg.prototype={
		//fancy:$.ui.fancytree
		init:function () {
			this.fancyinit();
			if (this.options.type === 1) {
				this.fancyDeptTree();
				getUserListByKey(this, this.options.tree.expandkey);
			} else if (this.options.type === 2) {

			}
			return this
		}
		,fancyinit:function () {
			var _this=this;
			_this.fancy=fancycustom(util.copy({
				el:"#tree"
				,source:[]
				,checkbox:_this.options.dept.selectable===true
				,click:function (event, node) {
					node.targetType==="title"&&_this.fancySelectNode(node);
				}
			}, _this.options.tree));
			return this
		}
		,fancyDeptTree:function () {
			drawDeptTree (this) ;
		}
		,fancySelectNode:function (node) {
			var _this=this;
			if (_this.options.type === 1) {
				getUserListByKey(_this, node.node.key);
			} else if (_this.options.type === 2) {}
		}
		,fancyExpandKey:function (key) {
			if (!key) return this;
			var tree=this.fancy.tree
			,node=tree.getNodeByKey(key);
			while (node && node.parent) {
				node.toggleExpanded();
				node=node.parent;
			}
			return this
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