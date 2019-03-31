;(function (realm) {
	"use strict";
	function getField (nm) {
		if (!nm) return;
		var field=document.getElementById(nm);
		if (!field) field=document.forms[0][nm];
		return field
	}
	function getValue (field) {
		return (field&&field["inputtextarea".indexOf(field.tagName.toLowerCase())>-1?"value":"innerHTML"])||""
	}
	function setField (nm,value) {
		if (!nm) return;
		var field=getField(nm);
		field&&(field["inputtextarea".indexOf(field.tagName.toLowerCase()) > -1?"value":"innerHTML"]=value);
	}
	function defineProperty (obj,nm) {
		if (!obj) return;
		if (!nm) return;
		Object.defineProperty(obj,nm,{
			value:"",
			set:function (newval) {value=newval; setField(nm,value[nm])},
			get:function () {return getValue(getField(nm))}
		});
	}
	function fieldProperty (nm) {
		if (!nm) return {writable:true,configurable:true,value:""};
		var value={};value[nm]="";
		return {
			configurable:true,
			set:function (newval) {value[nm]=newval; setField(nm,value[nm])},
			get:function () {
				var val=getValue(getField(nm));
				if (val!==value[nm]) this.saveField=val;
				return /*getValue(getField(nm))*/ value[nm]
			}
		}
	}
	function insert (returnvalue) {
		var value=returnvalue[this.dlgID]||[];
		if (this.options.done) {if (!this.options.done.call(this,value)) return}
		this.saveField=JSON.stringify(returnvalue||"");
		this.dispField=getDispVal.call(this,value);//disp.join(this.options.displaySep||",");
	}
	function getDispVal (value) {
		var disp=[];
		for (var x=0;x<value.length;x++) {
			disp.push(
				this.options.pattern
				? this.options.pattern.replace(/\{\{@([a-zA-Z0-9_@\. \*\^\$\#-]*)\}\}/g,function (a,b) {
					if (a==="{{@index}}") return x;
					return value[x][b]||""
				})
				: value[x].OrgName||value[x].LGTName||value[x]
			);
		}
		return disp.join(this.options.displaySep||", ")
	}
	function createDialogObject (opt) {
		var ret;
		function __open (lst) {
			var url=this.options.url,windowsize=this.options.windowSize,type=this.options.type,width,height;

			width=(windowsize[type]||windowsize["user"]).width;
			height=(windowsize[type]||windowsize["user"]).height;
			
			if (this.options.ismodal) {
				var selectinfo=realm.showModalDialog(url,{
					window:realm,type:type
					,deptcode:this.options.deptcode,ismulti:this.options.ismulti
					,initdata:this.getData(),company:(this.options.company||"")
				},"dialogWidth:"+width+"px; dialogHeight:"+height+"px; scroll:no;");
				this.done(selectinfo);
			} else {
				url+=(
					"&deptcode="+this.options.deptcode+
					"&type="+type+
					"&ismulti="+this.options.ismulti.toString()+
					"&company="+(encodeURIComponent(this.options.company||""))+
					"&initdata=getData&done=done");
				realm.open(url,
					this.options.dlgID,
					"menubar=no,width="+width+"px,height="+height+"px,scrollbars=no");
			}
		}
		function __remove (n,returnvalue) {
			var value=returnvalue[this.dlgID]||[];
			this.saveField=JSON.stringify(returnvalue||"");
			this.dispField=getDispVal.call(this,value);
			if (this.options.remove) this.options.remove(n,value)
			else insert.call(this,returnvalue);
		}
		return ret=Object.create({
			done:function (returnvalue) {
				if (!returnvalue) return;
				insert.call(this,returnvalue);
			},
			remove:function (n) {
				var returnvalue=JSON.parse(this.saveField),
				value=returnvalue[this.dlgID],disp=[];
				value.splice(n,1);
				if (value.length==0) this.removeAll();
				else {
					__remove.apply(this,[n,returnvalue]);
				}
			},
			removeAll:function () {
				this.saveField="";
				this.dispField="";
				this.options.done&&this.options.done.call(this,[]);
			},
			getData:function () {
				//var data=this.userData?this.userData:this.saveField;
				var data=this.saveField;
				return {data:data||""}
			},
			add:function (src) {
				var json={},_this=this;
				if (Object.prototype.toString.call(src)!=="[object Array]") return;
				if (this.saveField) {
					json=JSON.parse(this.saveField);
				} else {
					json[this.dlgID]=[];
				}
				src.forEach(function (d) {
					json[_this.dlgID].push(d);
				});
				this.done(json);
			},
			open:function () {__open.call(this); return this}
		},{
			dlgID:{writable:false,value:opt.dlgID},
			//userDone:{writable:true,value:opt.done},
			//pattern:{writable:true,value:opt.pattern},
			saveField:fieldProperty(opt.saveField),
			dispField:fieldProperty(opt.dispField),
			options:{writable:true,value:opt}
		}),opt.data&&ret.done(JSON.parse(opt.data)),ret;
	}
	function OrgDialog (opt) {
		if (typeof opt==="string") return realm[opt]
		if (!opt.dlgID) return {error:"dlgID is nothing",open:function () {}};
		
		var dlgID=opt.dlgID;

		opt.ismodal=("ismodal" in opt)?opt.ismodal:(!!realm.showModalDialog);
		opt.ismulti=!!opt.ismulti;
		opt.type=opt.type||"dept";
		opt.deptcode=opt.deptcode||"";
		// opt.url="/"+(realm.cLibPath||"common/library.nsf")+"/orgSelect?readform&forid="+opt.dlgID+
		// 	"&title="+(opt.dlgTitle&&encodeURIComponent(opt.dlgTitle))||"";
		opt.url="/"+(realm.cStandardPath||"common/standard.nsf")+"/orgSelect?readform&forid="+opt.dlgID+
			"&title="+((opt.dlgTitle&&encodeURIComponent(opt.dlgTitle))||"");

		opt.windowSize={user:{width:"878",height:"635"},dept:{width:"493",height:"635"}};
		
		opt.dispField=opt.dispField||"__ORG_DISP_FIELD__";
		opt.saveField=opt.saveField||"__ORG_SAVE_FIELD__";
		
		opt.data=(function (d) {
			function isJSONString (_str) {try {return JSON.parse(_str)&&!!_str} catch(e) {return false}}
			if (!d) return ""
			if (typeof d==="string") return isJSONString(d)?d:""
			else if (JSON.constructor===d.constructor) return JSON.stringify(d)
			else return ""
		} (opt.data));

		return realm[dlgID]?(realm[dlgID].options=opt):(realm[dlgID]=createDialogObject(opt)),realm[dlgID]
	}
	
	realm.OrgDialog||(realm.OrgDialog=OrgDialog);
} (this));