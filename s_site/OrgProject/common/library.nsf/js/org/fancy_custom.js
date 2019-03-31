;(function (realm) {
	"use strict";
	
	var _options={
		el:"",
		source:[],
		selectMode:1
	};

	var _fancycustom=function(options){
		this.options=util.copy(_options, options);
	};
	
	_fancycustom.prototype={
		ExpandKey:function (key) {
			if (!key) return this;
			var tree=this.$fancy.tree,
			node=tree.getNodeByKey(key)
			;
			while (node&&node.parent) {
				node.toggleExpanded();
				node=node.parent;
			}
			return this
		}
	};

	function create (options) {
		if (!options.el) return;
		var fc=new _fancycustom(options);
		var $fancy=$.ui.fancytree(
			fc.options,
			fc.options.el.charCodeAt(0)===0x23?fc.options.el:("\u0023"+fc.options.el)
		);
		fc.$fancy=$fancy;
		return fc
	}

	realm.fancycustom || 
	(
		realm.fancycustom=function (options) {
			return create(options);
		}
	);
} (this));