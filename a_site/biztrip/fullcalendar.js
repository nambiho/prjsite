/**
 * 
 */
(function () {
	"use strict";
	
	var
	$cal = function (selector, options) {return (new $cal.prototype.init(selector, options));}
	
	// calendar selector
	,_daytime = 1000*24*60*60
	,_getOption = function () {
		// options
		return {
			// 오늘 버튼
			isTodayButton : true
			// 요일 약자
			,isSimpleWeekday : true
			// 첫번째가 일요일인지 월요일인지
			,firstweekday : 0
			// lunar 모두 표시 // "none" 없음,  "sunday" : 일요일,  "all" : 모두, 숫자 : 해당월의 1일 부터 이후 숫자 만큼
			,idxLunar : "sunday"
			// 한 부분의 보이는 최대 갯수
			,maxCount : 3
			// 일 클릭 이벤트
			,dateClick : null
		};
	}
	;
	
	
	
	function __RX__(X_, json){
		var tmp = X_ || ""
		,s
		;
		for (s in json)
			tmp = tmp.replace(new RegExp("#\\{" + s + "\\}", "g"), json[s]);
		return tmp.replace(/\#\{[a-zA-Z0-9]*\}/g, "");
	}
	
	
	
	// method
	$cal.prototype = $cal.method = {
		selector : null
		,inner : null
		,toparea : null
		,calarea : null
		,options : {}
		,setting : {}
		,init : function ( selector, options ) { _initFunction.call (this, selector, options); return this; }
		,create : function () { _createCalendar.call( this ); return this; }
		,draw : function (istop) {
			// top area
			istop ? _drawTop.call(this) : _drawTopDateString.call(this);
			// body
			_drawBody.call(this);
			// data
			_drawData.call(this);
		}
		,dayClick : function () {}
	};
	$cal.method.init.prototype = $cal.prototype;
	
	
	
	
	
	function _initFunction (sel,opt) {
		var __today = opt.querydate ? opt.querydate.isoToDate() : new Date()
		,__todate = new Date(__today.getFullYear(), __today.getMonth(), __today.getDate())
		;
		this.selector = sel instanceof $ ? $(sel) : null;
		if (!this.selector || (this.selector.size()===0)) return null;
		this.selector.children() && this.selector.empty();
		
		// language
		$ep.inheritStatic(this, "CALENDAR", "calendar");
		
		// _options
		this.options = $.extend({}, _getOption(), opt);
		this.setting = _calendarSetting.call ( this, __todate );
	}
	
	
	
	
	
	// 날짜 계산 등
	function _calendarSetting (__date) {
		var _setting = {}
		,__todate = new Date(__date.getFullYear(), __date.getMonth(), __date.getDate())
		,__diff = 0
		;
		
		_setting = {
			// 언어
			lang : $ep.lang()
			// date Format
			,dateFormat : this.LangString("DATEFORMAT.YEARMONTH") || "yyyy-mm"
			// 요일
			,weekday : this.LangString( this.options.isSimpleWeekday ? "SIMPLEWEEKDAY" : "FULLWEEKDAY") || ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
			// 오늘 날짜
			,todate : __todate
			// 달력의 처음 날짜
			,firstdate : (function (d) {d.setDate(1); d.getDay()!==0&&d.setDate(-(d.getDay()-1)); return d;})(new Date(__todate))
			// 끝 날짜
			,enddate : (function (d) { d.setDate(d.getDate() + (6-d.getDay())); return d; })(new Date(__todate.getFullYear(), __todate.getMonth()+1, 0))
		};
		
		_setting.diff = parseInt((_setting.enddate-_setting.firstdate) / _daytime)+1;
		__diff = _setting.diff/7;
		_setting.week = (5 > __diff) ? 5 : __diff;
		
		return _setting;
	}
	
	
	
	
	// 상단 날짜 넣기
	function _drawTopDateString (_date) {
		var __sel = $(".date", this.toparea)
		,__date = _date ? typeof _date === "string" ? new Date(_date) : _date : this.setting.todate
		;
		var __todate = __date;
		__sel.text ( __date.format(this.setting.dateFormat) );
	}
	
	
	
	// drawing top area
	// "today" button, prev, next button, year-month display
	function _drawTop () {
		var __self = this
		,__datearea = "<div class=\"date-area\"><p class=\"date\"></p><span class=\"date-prev\"></span><span class=\"date-next\"></span></div>"
		;
		__self.inner.append(__self.toparea.append($(__datearea)));
		
		// 오늘 가기
		__self.options.isTodayButton &&
			$("<p class=\"bt-area\"><span class=\"btn-today\"></span></p>").appendTo(__self.toparea).find(".btn-today").epbutton({
				text : "Today"
				,show : true
				,click : function () { __self.setting = _calendarSetting.call (__self, new Date()); __self.draw(false); }
			});
		
		// 이전
		$(".date-prev", __self.toparea).on("click", function () {
			var __todate = __self.setting.todate
			;
			__todate.setMonth(__todate.getMonth() - 1);
			__self.setting = _calendarSetting.call( __self, __todate );
			__self.draw(false);
		});
		
		// 다음
		$(".date-next", __self.toparea).on("click", function () {
			var __todate = __self.setting.todate
			;
			
			__todate.setMonth(__todate.getMonth() + 1);
			__self.setting = _calendarSetting.call ( __self, __todate );
			__self.draw(false);
		});

		
		// 오늘 년-월
		_drawTopDateString.call(__self);
	}
	
	
	
	function _getLunar(_this, _date) {
		var __bLunarNumeric = /^\d+$/g.test(_this.options.idxLunar)
		,__sunday = (_date.getDay ? _date.getDay() === 0 : _date.isoToDate().getDay() === 0)
		,__ret = ""
		;
		
		if ( __bLunarNumeric ) {
			if (_date.getFullYear()===__self.setting.todate.getFullYear() && _date.getMonth()===__self.setting.todate.getMonth())
				__ret = ( _date.getDate() % _this.options.idxLunar )===1 ? "<span class=\"lunar\">" + "(" + _this.LangString("LUNAR") + " " + Lunar(_date).getMonthDate() + ")" + "</span>" : "";
			else __ret = "";
		} else {
			switch(_this.options.idxLunar) {
			/*case "none"
				__lunar = ""
				break;*/
			case "sunday": __ret = (__sunday ? "<span class=\"lunar\">" + "(" + _this.LangString("LUNAR") + " " + Lunar(_date).getMonthDate() + ")" + "</span>":""); break;
			case "all": __ret = "<span class=\"lunar\">" + "(" + _this.LangString("LUNAR") + " " + Lunar(_date).getMonthDate() + ")" + "</span>"; break;
			}
		}
		
		return __ret;
	}
	
	
	
	// calendar table
	function _drawBody () {
		var __self = this
		,__width = "width:14.1%;"
		,__body = ""
		,__TDCLASS = " class=\"#{sunday}#{other}\""
		;
		
		__body = "<table class=\"tbl-cal\">"
		// colgroup
		+"<colgroup><col style=\""+__width+"\" /><col style=\""+__width+"\" /><col style=\""+__width+"\" />"
		+"<col style=\""+__width+"\" /><col style=\""+__width+"\" /><col style=\""+__width+"\" /><col /></colgroup>"
		
		// thead
		+"<thead><tr>"
		+$(this.setting.weekday).map(function (_,day) {return "<th>"+day+"</th>";}).get().join("")
		+"</tr></thead>"
		
		// tbody
		+"<tbody>"
		+(function () {
			var __ret = []
			,__day = ""
			,__date = new Date(__self.setting.firstdate)
			,__tdclass = ""
			,__today = new Date()
			,__istoday = false
			,__lunar = ""
			,__tdId = ""
			;
			
			for (var i = 0 ; i < __self.setting.week ; i++) {
				__day = "";
				for (var j = 0 ; j < 7 ; j++) {
					// 일요일, 평일 css 클래스 선택
					__tdclass = (j===0 || __self.setting.todate.getMonth()!==__date.getMonth() ? __RX__(__TDCLASS, {
						sunday : j===0 ? "sunday" : ""
						,other : (__self.setting.todate.getMonth()!==__date.getMonth() ? " other-month" : "")
					}) : "");
					
					// 음력 표시
					__lunar = _getLunar(__self, __date);
					
					// 오늘날짜 엑티브
					__istoday = (__date.getFullYear()===__today.getFullYear() && __date.getMonth()===__today.getMonth() && __date.getDate()===__today.getDate());
					
					// id
					__tdId = "td" + __date.getFullYear() + ("00"+__date.getMonth()+1).substr(-2) + ("00" + __date.getDate()).substr(-2);
					
					// 만들기
					__day += "<td" + __tdclass + " id=\"" + __tdId + "\"><span class=\"state"+(__istoday?" active":"")+"\">" + __date.getDate() + "</span> "+__lunar+"</td>";
					
					__date.setDate(__date.getDate()+1);
				}
				__ret[i] = "<tr>" + __day + "</tr>";
			}
			return __ret.join("");
		})()
		+"</tbody>"
		+"</table>"
		;
		
		this.calarea.children() && this.calarea.empty();
		this.inner.append( this.calarea.append( $(__body) ));
		
		$(".state", this.inner).on("click", function (e) {
			__self.options.dateClick && __self.options.dateClick(e, $(this).text(), $(this));
		});
	}

	
	function _qtipContent (__self, _data, _type) {
		var _text = ""
		,_title = ""
		,_ret = {}
		;
		function __openDocument (unid) {
			$ep.ui.dialog({
				title : "{TRIPINFO}", width : 500, height : 440
				,content : {
					url : $ep.util.CURI("/" + __self.options.dbpath + "/" + __self.options.viewname + "/" + unid + "?opendocument", {
						isdialog : "1"
					}).url
				}
				,buttons : [ {text : "닫기", highlight : true, click : function () { $($ep.ui.active()).epdialog("close");}} ]
			}, __self);
		}
		// TODO
		switch (_type) {
		case "simple_info":	//이름 클릭시 간편 조회
			_text = "<div><table><colgroup><col style=\"width:50px;\"><col></colgroup><tbody>"
				+"<tr><td>"+__self.LangString("USERNAME") + "</td><td>" + _data.name + "</td></tr>"
				+"<tr><td>"+__self.LangString("LOCATION") + "</td><td>" + _data.location + "</td></tr>"
				+"<tr><td>"+__self.LangString("OBJECT") + "</td><td>" + _data.subject + "</td></tr>"
				+"</tbody></table></div>"
			;
			
			_ret["text"] = $(_text).css("cursor", "pointer").on("click", function () {
				__openDocument( _data.unid );
			});
			_ret["title"] = _data.startdate + "~" + _data.enddate;	
			
			break;
			
		case "all_list":
			var _sel = $("<div></div>");
			_text = $("<ul></ul>").appendTo(_sel);
			$.each(_data, function (_,_d) {
				$(_d.lidata).attr("unid", _d.unid).bind("click", function () {
					__openDocument( _d.unid );
				}).appendTo(_text);
			});
			_ret["text"] = $(_sel);
			_ret["title"] = __self.LangString("USERTRIPINFO");
			
			break;
		}
		return _ret;
	}
	
	
	
	function _createQtip (__self, ___ele, _type) {
		var _json = _qtipContent(__self, $(___ele).data(), _type);
		
		$(___ele).qtip({
			overwrite : true
			,content : {
				text : _json.text
				,title : _json.title
				,button : true
			}
			,events : {
				show : _json.show
				,render : _json.render
			}
			,position : {
				at : "bottom left", my : "top left", adjust : { method: "shift flip" , x : 15 , y : 0, screen:true }, viewport: true
			}
			,show : {
				event : "click", target : $(___ele)
			}
			,hide : {
				delay : 200, target : $(___ele), fixed : true, event : "unfocus click mouseleave"
				,effect : function (_evt) {
					$(this).slideUp("fast", function () {});
				}
			}
			,style : {
				width : "280px"
				,classes : "qtip-shadow qtip-rounded ssiba"
				,tip : { classes : "ui-icon ui-icon-closethick ", corner: true , width : 12 , height : 12 , offset : 10	}
			}
		}).on("remove", function () { $(___ele).qtip("destroy",true); });
	}
	
	
	
	
	function _drawData () {
		var __self = this
		;
		function __draw (__list) {
			var __datajson = {}
			;
			// __datajson 에 배열 만들기
			$.each(__list, function (idx, data) {
				var __startdate = typeof data.startdate === "string" && data.startdate ? data.startdate.isoToDate() : new Date(data.startdate)
				,__enddate = typeof data.enddate === "string" && data.enddate ? data.enddate.isoToDate() : new Date(data.enddate)
				,__date = new Date(__startdate)
				,__diff = __startdate.diffday(__enddate)+1
				,__tdid = ""
				;
				for ( var i = 0 ; i < __diff ; i++ ) {
					// 날짜 td id
					__tdid = "td" + __date.getFullYear() + ("00"+__date.getMonth()+1).substr(-2) + ("00" + __date.getDate()).substr(-2);
					// 날짜 json에 데이터 넣기
					!__datajson[__tdid] && (__datajson[__tdid] = {
						tdid : __tdid
						,array : []
					});
					// li 문자열 저장
					__datajson[__tdid].array[__datajson[__tdid].array.length] = ($.extend({
						lidata : "<li class=\"name\"><span>" + data.name + "</span></li>"	//출장자정보
					}, data));
					// 다음 날짜
					__date.adjust(0,0,1,0,0,0);
				}
			});
			
			// _datajson의 데이터로 그리기
			$.each(__datajson, function (_,entry) {
				var __tdsel = $("#" + entry.tdid, $ep.ui.active())
				,__ulsel = null
				,__entryarraydata
				,__bOver = entry.array.length > __self.options.maxCount
				,__length = __bOver ? __self.options.maxCount : entry.array.length
				,__ele
				;
				
				$("<span class=\"post-num\">("+entry.array.length+")</span>").appendTo(__tdsel);
				__ulsel = $("<ul class=\"post-list\" />").appendTo(__tdsel);
				
				for ( var i = 0 ; i < __length ; i++ ) {
					__entryarraydata = entry.array[i];
					//debugger;
					//__ele = $(entry.array[i].lidata).data(__entryarraydata).appendTo(__ulsel);
					(function (element) {
						(element.size()!=0) && _createQtip(__self, element, "simple_info");
					})($(entry.array[i].lidata).data(__entryarraydata).appendTo(__ulsel));
				}
				if ( __bOver ) {
					//__ele = $("<div class=\"list-more\"><p><em class=\"lst-num\">+ "+entry.array.length+"</em></p></div>")
					//.appendTo(__ulsel);
					(function (element) {
						(element.size()!=0) && _createQtip(__self, element, "all_list");
					})($("<div class=\"list-more\"><p><em class=\"lst-num\">+ "+entry.array.length+"</em></p></div>").data(entry.array).appendTo(__ulsel));
				}
			});
		}
		(
			this.options.data 
			&& (
				($.isFunction(this.options.data) && __draw(this.options.data()))
				|| ($.isPlainObject(this.options.data) && ("url" in this.options.data ) && 
					$ep.util.ajax({
						url: $ep.util.CURI(this.options.data.url, {startkey : this.setting.firstdate.format("yyyy-mm-dd") , untilkey : this.setting.enddate.format("yyyy-mm-dd")}).url
						,success : function (d,t,x) {
							if (d["@rangeentries"] === "0") return;
							var __source = []
							,__viewentries = d.viewentry
							;
							
							$.each(__viewentries, function (__,entry) {
								var ed = entry.entrydata
								;
								__source.push({
									name : ed[1].text[0]
									,location : ed[2].text[0]
									,subject : ed[3].text[0]
									,time : ed[4].text[0]
									,startdate : ed[5].text[0]
									,enddate : ed[6].text[0]
									,unid : entry["@unid"]
								});
							});
							__draw(__source);
						}
					})
				)
				|| ($.isArray(this.options.data) && __draw( this.options.data ))
			)
		);
	}
	
	
	
	
	// First run when creating
	function _createCalendar () {
		if (!this.selector) return;
		
		// create inner div
		this.inner = $("<div class=\"inner\" />").appendTo(this.selector);
		this.toparea = $("<div class=\"top-area\" />");
		this.calarea = $("<div class=\"cal-area\" />");

		this.draw(true);
	}
	
	
	// regist window object
	if (!window.fullcalendar)
		window.fullcalendar = $cal;
	
	
	
	
	// test object : will delete
	function prototype (obj) {
		$cal.prototype.ao = obj;
	}
	
	
	
	
	// log function : will delete
	function L() {
		if (window.console == undefined) { window.console = {log : function(){}};}
		var _argv = arguments
		,_l = _argv.length
		,_0 = _argv[0]
		,_A = Array.prototype.slice.call(_argv, (_l>1?1:0))
		;
		if (typeof console.log === "function") {console.log.apply(console, ( _l>1 ? [_0 + " = "].concat( _A ): _A) );}
		else {console.log( (_l>1 ? _0 + " = " : ""), _A.join(" ") );}
		return;
	}
	
	
	
	
	
	
	
	
	
	

	/////////////////////////////////////////////////////////////////////////////////////////////////////
	//	양/음력 만년달력에 관한 소스입니다.
	//							by Albeniz
	//1881-2050년까지의 음력 데이터
	var LunarTable = new Array(
	"1212122322121", "1212121221220", "1121121222120", "2112132122122", "2112112121220", 
	"2121211212120", "2212321121212", "2122121121210", "2122121212120", "1232122121212", 
	"1212121221220", "1121123221222", "1121121212220", "1212112121220", "2121231212121", 
	"2221211212120", "1221212121210", "2123221212121", "2121212212120", "1211212232212", 
	"1211212122210", "2121121212220", "1212132112212", "2212112112210", "2212211212120", 
	"1221412121212", "1212122121210", "2112212122120", "1231212122212", "1211212122210", 
	"2121123122122", "2121121122120", "2212112112120", "2212231212112", "2122121212120", 
	"1212122121210", "2132122122121", "2112121222120", "1211212322122", "1211211221220", 
	"2121121121220", "2122132112122", "1221212121120", "2121221212110", "2122321221212", 
	"1121212212210", "2112121221220", "1231211221222", "1211211212220", "1221123121221", 
	"2221121121210", "2221212112120", "1221241212112", "1212212212120", "1121212212210", 
	"2114121212221", "2112112122210", "2211211412212", "2211211212120", "2212121121210", 
	"2212214112121", "2122122121120", "1212122122120", "1121412122122", "1121121222120", 
	"2112112122120", "2231211212122", "2121211212120", "2212121321212", "2122121121210", 
	"2122121212120", "1212142121212", "1211221221220", "1121121221220", "2114112121222", 
	"1212112121220", "2121211232122", "1221211212120", "1221212121210", "2121223212121", 
	"2121212212120", "1211212212210", "2121321212221", "2121121212220", "1212112112210", 
	"2223211211221", "2212211212120", "1221212321212", "1212122121210", "2112212122120", 
	"1211232122212", "1211212122210", "2121121122210", "2212312112212", "2212112112120", 
	"2212121232112", "2122121212110", "2212122121210", "2112124122121", "2112121221220", 
	"1211211221220", "2121321122122", "2121121121220", "2122112112322", "1221212112120", 
	"1221221212110", "2122123221212", "1121212212210", "2112121221220", "1211231212222", 
	"1211211212220", "1221121121220", "1223212112121", "2221212112120", "1221221232112", 
	"1212212122120", "1121212212210", "2112132212221", "2112112122210", "2211211212210", 
	//"2221321121212", "2212121121210", "2212212112120", "1232212122112", "1212122122120", 
	"2221321121212", "2212121121210", "2212212112120", "1232212121212", "1212122122110",	//2005.12.31 합삭(태양,지구,달 일직선)시간 1/29 23:14:30 문제해결.
	"1121212322122", "1121121222120", "2112112122120", "2211231212122", "2121211212120", 
	"2122121121210", "2124212112121", "2122121212120", "1212121223212", "1211212221220", 
	"1121121221220", "2112132121222", "1212112121220", "2121211212120", "2122321121212", 
	"1221212121210", "2121221212120", "1232121221212", "1211212212210", "2121123212221", 
	"2121121212220", "1212112112220", "1221231211221", "2212211211220", "1212212121210", 
	"2123212212121", "2112122122120", "1211212322212", "1211212122210", "2121121122120", 
	"2212114112122", "2212112112120", "2212121211210", "2212232121211", "2122122121210", 
	"2112122122120", "1231212122212", "1211211221220", "2121121321222", "2121121121220", 
	"2122112112120", "2122141211212", "1221221212110", "2121221221210", "2114121221221"
	);
	
	//양력 각달의 일수를 저장한 배열
	var MonthTable = new Array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31)
	//현재 페이지에 Display될 날짜에 관한 변수
	,currentDate = new Date()
	;
	
	//음력 날짜 형식 객체 선언. JavaScript기본 날짜형식에서 윤달이라는 속성을 추가.
	function LunarDate() {
		this.year = 1;
		this.month = 0;
		this.day = 1;
		this.isYunMonth = false;
		this.getMonthDate = function () {
			return this.month + "/" + this.day;
		}
	}
	
	//해당 음력년도의 전체 날짜를 반환하는 함수
	function nDaysYear(year) {
		var i, sum;
		
		sum = 0;
		for (i=0;i<13;i++) {
			if (LunarTable[year-1881] && parseInt(LunarTable[year-1881].charAt(i))) {
				sum += 29 + (parseInt(LunarTable[year - 1881].charAt(i)) + 1) % 2;
			}
		}
		
		return sum;
	}
	
	//해당 음력 월의 날짜수를 반환하는 함수
	function nDaysMonth(lunar_date) {
		var nDays,yun;
		
		if (lunar_date.month <= YunMonth(lunar_date.year) && !lunar_date.isYunMonth) yun = 0;
		else yun = 1;
		
		nDays = 29 + (parseInt(LunarTable[lunar_date.year - 1881].charAt(lunar_date.month + yun)) + 1) % 2;
		
		return nDays;
	}
	
	//해당 음력년도의 윤달넘버를 반환. 윤달이 없으면 12를 반환
	function YunMonth(year) {
		var yun;
		
		yun = 0;
		do {
			if (LunarTable[year-1881].charAt(yun) > 2) {
				break;
			}
			yun++;
		} while (yun <= 12);
		
		return yun - 1;
	}
	
	//서기 1년 1월 1일 이후 지난 날짜수를 반환
	function totalDays(solar_date) {
		var i, sum, tdays, nYears366;
		
		if (((solar_date.year % 4 == 0) && (solar_date.year % 100 != 0)) || (solar_date.year % 400 == 0)) MonthTable[1] = 29;
		else MonthTable[1] = 28;
		
		sum = 0;
		for (i=0;i<solar_date.month;i++) {
			sum = sum + MonthTable[i];
		}
		
		nYears366 = parseInt((solar_date.year - 1) / 4) - parseInt((solar_date.year - 1) / 100) + parseInt((solar_date.year - 1) / 400);
		
		tdays = (solar_date.year - 1) * 365 + sum + nYears366 + solar_date.day - 1;
		
		return tdays;
	}
	
	//양력날짜를 음력데이터형식의 날짜로 반환
	function Lunar(_date) {
		var solar_date = new LunarDate();
		solar_date.year = _date.getFullYear();
		solar_date.month = _date.getMonth();
		solar_date.day = _date.getDate();
		
		var i, nDays, tmp;
		var FIRST_DAY;					// 서기 1년 1월 1일부터 음력 1881년 1월 1일까지 총 지난 날짜에 관한 변수
		
		FIRST_DAY = 686685;
		nDays = totalDays(solar_date) - FIRST_DAY;	//음력 1881년 1월 1일 이후 지난 날짜
		
		var lunar_date = new LunarDate();			// 반환할 음력 날짜를 선언. 음력 첫날로 초기화
		lunar_date.year = 1881;
		lunar_date.month = 0;
		lunar_date.day = 1;
		lunar_date.isYunMonth = false;
		
		// nDays가 0보다 작아질때 까지, 각년도의 총 날짜수를 빼는 걸 반복해 그 루프횟수로서 현재 년도를 계산.
		// 이 루프가 종료됨과 동시에 음력데이터의 year속성은 현재 년도가 저장되게 된다.
		do {
			tmp = nDays;
			nDays -= nDaysYear(lunar_date.year);
			if (nDays < 0) {
				nDays = tmp;
				break;
			}
			lunar_date.year++;
		} while (true);
		
		// 1년총날짜 이하로 작아지 nDays를 마찬가지로 월 단위로 빼는걸 반복해 현재 월을 계산.
		// 만약에 다음루프에서 윤달이면 월을 증가시키는게 아니라 윤달 속성만 true로 설정.
		do {
			tmp = nDays;
			nDays -= nDaysMonth(lunar_date);
			if (nDays < 0) {
				nDays = tmp;
				break;
			}
			
			if (lunar_date.month == YunMonth(lunar_date.year)&&!lunar_date.isYunMonth) {
				lunar_date.isYunMonth = true;
			}
			else {
				lunar_date.month++;
				lunar_date.isYunMonth = false;
			}
		} while (true);
		
		// 마지막으로 월단위 날짜수 이하로 작아진 nDays를 이용해 날짜를 계산
		lunar_date.day = nDays;
		lunar_date.month++;
		
		return lunar_date;
	}
	
})();