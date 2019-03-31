/**
 * 출장시스템 홈
 */
function biztrip_home(){}
$ep.inheritStatic(biztrip_home,"BIZTRIP");
biztrip_home.LIST_COUNT=6;
biztrip_home.init = function(info){
	$ep.ui.doc($(".formpage",$ep.ui.active()),{
		breadcrumb:"{VIEW.SIDE.HOME}"
		,isnewdoc:true
		,appcode:"biztrip"
		,form:"home"
	},biztrip_home);
	
	var extcount_func = function(callback){
		//var _url = '/' + this.options.dbpath + '/getTotalEntryCount?open&view=' + this.options.alias +'&category=00012914';
		var _url = '/' + this.options.dbpath + '/getTotalEntryCount?open&view=' + this.options.alias +'&category='+info.groupcode;
		_url = $.CURI(_url, this.options.query);
		$ep.util.ajax(_url.decode().encode())
		.done(function(data,txt,xhr) {
			callback(data);
		});
	};
	
	var extcount2_func = function(callback){
		var _url = '/' + this.options.dbpath + '/getTotalEntryCount?open&view=' + this.options.alias;
		_url = $.CURI(_url, this.options.query);
		$ep.util.ajax(_url.decode().encode())
		.done(function(data,txt,xhr) {
			callback(data);
		});
	};
	
	/* 출장 품의 문서 */
	$ep.ui.view($(".home-view-wait",$ep.ui.active()),{
		actions : null
		,alias : "my_btrequest_all"
		,dbpath : info.dbpath
		,extcount : extcount_func
		,companycode: info.companycode
		,server: info.server
		,query : {category : info.groupcode, ps:biztrip_home.LIST_COUNT, entrycount:"false"}
		,column : {
			/*selectable : null [checkbox|radio]*/
			
			/*
			_attached : {
				css : {width: "20px"}
				,classes : "txtC"
				,render : function(tr,td,data,col){
					return data._attached == "1" ? '<p class="ep-icon attachment" />' : '';
				}
			}
			*/
			_biztripgroupname : {
				title : "{VIEW.COLUMNS.BIZTRIPGROUPNAME}"
				//,sortable : {descending : true}
				,css : {width: "100px"}
				//,type : "isodate"
				//,dateformat : "fullDate"
			}
			,_biztripkind : {
				title : "{VIEW.COLUMNS.BIZTRIPKIND}"
				,css : {width : "100px"}
				,hidewidth : true
			}
			,_subject : {
				title : "{VIEW.COLUMNS.SUBJECT}"
				,type : "multilevel"
				//,sortable : {ascending:true}
			}
			,_biztripname : {
				title : "{VIEW.COLUMNS.BIZTRIPNAME}"
				,css : {width: "100px"}
				//,type : "userinfo"
				,hidewidth : true	
			}
			,_btcountry : {
				title : "{VIEW.COLUMNS.BTCOUNTRY}"
				,type : "multilevel"
				,css : {width : "120px"}
				//,sortable : {ascending:true}
			}
			,_totalfee : {
				title : "{VIEW.COLUMNS.TOTALFEE}"
				,type : "multilevel"
				,css : {width : "100px"}
				//,sortable : {ascending:true}
			}
			,_startdate : {
				title : "{VIEW.COLUMNS.STARTDATE}"
				,type : "multilevel"
				,css : {width : "140px"}
				//,sortable : {ascending:true}
			}
			
		}
		,appcode : "biztrip"
			,events:{
				click:function(e, tr, data){
					this.openDocument(data["@unid"]);	return;
					//var url = '/' + info.dbpath + '/all/' + data.unid + "?opendocument";				
					//$ep.ui.loadPageLang($ep.ui.active(), url, aprv_home);
				}
			}
	},biztrip_home);
	/* 오늘의 임원 출장 일정 */
	$ep.ui.view($(".home-view-calendar",$ep.ui.active()),{
		actions : null
		,alias : "today_by_ownerdate"
		,dbpath : info.dbpath
		,extcount : extcount2_func
		,companycode: info.companycode
		,server: info.server
		,query : {ps:biztrip_home.LIST_COUNT, entrycount:"false"}
		,column : {
			/*selectable : null [checkbox|radio]*/
			_subject : {
				title : "{VIEW.COLUMNS.SUBJECT}"
				,type : "multilevel"
				//,css : {width: "350px"}
				//,sortable : {ascending:true}
			}
			,_biztripname : {
				title : "{VIEW.COLUMNS.BIZTRIPNAME}"
				,css : {width: "180px"}
				,type : "multilevel"
				//,hidewidth : true	
			}
			,_btcountry : {
				title : "{VIEW.COLUMNS.BTCOUNTRY}"
				//,type : "multilevel"
				,css : {width: "180px"}
				//,sortable : {ascending:true}
			}
			,_startdate : {
				title : "{VIEW.COLUMNS.STARTDATE}"
				//,type : "multilevel"
				,css : {width: "180px"}
				//,sortable : {ascending:true}
			}
		}
		,appcode : "biztrip"
			,events:{
				click:function(e, tr, data){
					this.openDocument(data["@unid"]);	return;
					//var url = '/' + info.dbpath + '/all/' + data.unid + "?opendocument";				
					//$ep.ui.loadPageLang($ep.ui.active(), url, aprv_home);
				}
			}
	},biztrip_home);
	/* 더보기 */
	$(".btn_more").click(function(){
		var url = $(this).attr("moreHref");
		$ep.ui.loadPageLang($ep.ui.active(),url,biztrip_home);
	});
};