;(function (realm) {
	"use strict";

	var setDisplay=function(){
		var userlistwrap=util.getElementById("userlistwrap");
		if (this.options.type!=="dept") {
			userlistwrap&&(userlistwrap.style.display="inline");
		}
		var wraper=util.getElementById("wraper");
		if (this.options.type==="dept") {
			wraper&&util.addClass(wraper,"type2");
		}
	}
	;

	function create (options) {
		var baseform=realm.baseorgform;
		var org=util.object(baseform,{
			options:{
				writable:true
				,configurable:true
				,enumerable:true
				,value:util.copy(baseform.options,options)
			}
		}).init({
			event:{
				init:setDisplay
			}
		});
		
		return org;
	};

	realm.selectorg||
	(
		realm.selectorg=function (options) {
			return create(options);
		}
	);
} (this));