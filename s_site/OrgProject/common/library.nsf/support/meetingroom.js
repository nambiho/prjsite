var MeetingRoomInfo = []; //회의실정보 roomInfo
/*var MeetingRoom_Selected_Place = "";
var MeetingRoom_Selected_Floor = "";*/
var MeetingRoom_StartTime = 700;		//시작시간(07:00)
var MeetingRoom_FinishTime = 1900		//종료시간(19:00)
var MeetingRoom_IntervalTime = 30;		//Interval Time(분)
var MeetingRoom_MaximumTime = 120;		//최대 예약 가능 시간(분)
var MeetingRoom_GeneralError = "작업 수행 중 오류가 발생했습니다.\n\n관리자에게 문의 하시기 바랍니다.";
var NOTES_ORG_UNIT = "HANARO";			//Notes Oragnization Unit name

/* AS-IS 문서 submit flag */
var SaveDoc 		= 1;		// 저장
var Request 		= 2;		// 승인요청
var Approval 		= 4;		// 최종확인
var Reject 			= 8;		// 반려
var ReCancle 		= 16;		// 신청취소
var SaveSurvey      = 32;       //설문등록

var MeetingRoom = {
	init: function(callBack) {
		// - MainPage 초기화
		var _this=this;
		//WideCalendar - Date 표시
		_this.drawWideCalendar();
		
		/*위치, 층 ListBox 생성*/
		var arrPlace = PlaceLists.split(";");
		$.each(arrPlace, function (index, value) {
		    $('#Select_1').append($('<option/>', { 
		        value: value,
		        text : value 
		    }));
		});
		if(DefaultPlace!="") $('#Select_1').val(DefaultPlace);
		else DefaultPlace = $('#Select_1').val();
		_this.getPlaceFloorInfo(DefaultPlace+"_ALL");	//최초1회는 전체(ALL) 층 정보 필요
		
		//지정장소 회의실 정보 취득 및 TimeTable 그리기
		var roomKeyword = DefaultPlace + "_" + DefaultPlace_Floor;
		_this.getPlaceInfo(roomKeyword, _this.drawReservationTimeTable);
		
		//버튼(ListBox) 초기화
		_this.initButton();
		
		//callBack 수행 (WideCalendar PageInitialize)
		if (typeof callBack!="undefined") callBack();
	},
	//ReturnURL 처리
	returnUrl: function(type, url) {
		var returnUrl = "";
		if (type=="get") {
			try{
				if(parent != null) returnUrl = parent.returnUrl;
			}catch(e){}
			return returnUrl;
		} else {
			if (typeof url=="undefined") returnUrl = document.location.href;
			else returnUrl = url;
			try{
				if(parent != null) parent.returnUrl = returnUrl;
			}catch(e){}
		}
	},
	//Resize view_Body
	resizingViewBody: function() {
		try{
			if (window!=window.top) parent.doResize();
		}catch(e){}
	},
	//버튼 초기화
	initButton: function() {
		//회의 장보(지역) 및 층 Change Event - MainPage
		var _this=this;
		$( "#floorPlan" ).bind( "click", function(  ) {
			_this.openFloorPlan($( "#Select_1" ).val(),$( "#Select_2" ).val());
		});
		$( "#Select_1" ).change(function() {
			_this.changePlace( $( this ).val(), "" );
		});
		$( "#Select_2" ).change(function() {
			_this.changePlace( $( "#Select_1" ).val(), $( this ).val() );
		});
	},
	//층별 도면 파일 열람
	openFloorPlan: function(_location,_floor) {
		var _url = "/"+DB_PATH+"/vwNewMeetingRoomFloorPlan?readviewentries&outputformat=json&count=-1&restricttocategory=" + _location;
		//return false;
		$.ajax({
			url : _url,
			/*type : "get",*/
			dataType : "json",
			async : false,
			cache : true,
			success: function(data) {
				var viewdata=util.ViewDataParse(data),
				entries=viewdata.entry, _count=entries.length,entry;
				var fileUrl="";
				for (var i=0;i<_count;i++){
					entry=entries[i];
					if(_floor==entry.$VFloorCode) {
						if(entry.$VAttachmentEncode!="") fileUrl = "/" + DB_PATH + "/0/" + entry.unid + "/$FILE/" + entry.$VAttachmentEncode;
						break;
					}
				}
				_openAttach(fileUrl);
			}, error : function(request,status,error){
				alert( MeetingRoom_GeneralError );
			}
		});
		function _openAttach(go_path) {
			if(go_path=="") {
				var _msg = "회의실 도면이 등록되어 있지 않습니다.\n" + "[ 지역 : " + _location + ", ";
				_msg += "층 : " + (_floor=="ALL"?"전층정보":_floor) + " ]\n\n관리자에게 문의 하시기 바랍니다.";
				alert(_msg);
				return false;
			}
			window.open(go_path);
		}
	},
	//문서 초기화
	initDocument: function(callBack) {
		//작성자,접견인 조직정보 설정 (setmakerinfo.js - 함수이용)
		var makerSetInfo;
		var makerDisplayInfo;
		if(docInfo.isNewDoc){
			makerSetInfo = {
				hasAppLine:true, 
				hasDamDang:true,
				appTitlePrefix : "AppTitle",
				appNamePrefix : "AppName",
				appDeptPrefix : "AppDept",			
				setFieldList : ["TEL","DeptName","DeptCode","JikWee"],
				setIdList : ["TEL"]
			};
			if(makerInfo != null) {
				makerinfo_setMakerInfo(makerInfo, makerSetInfo);
				makerDisplayInfo = docInfo.maker + " " + makerInfo.JikWee + " / " + makerInfo.DeptName;
			}
		}

		var _defaultList = $("#selected_user_list");
		if(_defaultList.length<1){
			//SUPEX Hall, B Square
			$("#id_writer_user").html(makerDisplayInfo);
			return true;
		}
		
		var attendeeList = ATTENDEE;
		if (attendeeList=="") attendeeList = docInfo.maker;
		var arrAtt = attendeeList.split(",");
		var orgJson = "";
		$.each(arrAtt, function(i,cn){
			var arrDetail = cn.split(" ");
			var _name = arrDetail[0];
			var _empno = (arrDetail.length>0?arrDetail[1]:"");
			
			orgJson += (orgJson==""?"":",") + "{";
			orgJson += "\"LGINotesID\":\"" + "CN=" + cn + "/O=" + NOTES_ORG_UNIT + "\", ";
			orgJson += "\"LGTComnum\":\"" + _empno + "\", ";
			orgJson += "\"LGTName\":\"" + _name + "\", ";
			orgJson += "\"FDepName\":\"\",\"LGTDep\":\"\",\"FullDeptName\":\"\",\"DeptName\":\"\",\"LGTDepCode\":\"\",\"LGTFax\":\"\",\"LGTGrade\":\"\", ";
			orgJson += "\"LGTInnum\":\"\",\"LGTDutyCode\":\"\",\"LGTGradeCode\":\"\",\"BasicDuoYn\":\"\",\"LGTTel\":\"\",\"LGHTel\":\"\",\"position\":\"\",\"response\":false, ";
			orgJson += "\"unid\":\"\"}";
		});
		if(orgJson!=""){
			var returnJson = "{\"dlg_user\":[" + orgJson + "]}";
			if (docInfo.isEditMode) $("#datavalue_user").val(returnJson);
			var _org = JSON.parse(returnJson);
			drawSelectUsersList("user", _org.dlg_user);
		}
	},
	//상단 날짜 선택 화면 그리기
	drawWideCalendar: function(){
		var div = $(".divWideCaldendarCarouselWrapper");	//Date(Calendar) DIV
		var ul = $("ul", div);								//Date(Calendar) UL

		var fullSize = $(".wideCalendar").width();							//Full Size
		var btnSize= $(".calendar_button").width();							//Prev, Next 버튼 Size
		var yearmonthSize= $(".calendar_month").width();					//년, 월 표시 영역 Size
		var calSize = fullSize - ((btnSize*2) + 15) - yearmonthSize;		//기본 Fixed 사이즈
		var liSize = calSize / wideCalendarSize;							//LI 각 사이즈
		
		var toDay = $("#ContentMainPlaceHolder_WideCalendar_hdfTodayDT").val();
		var startDay = $("#ContentMainPlaceHolder_WideCalendar_hdfStartDT").val();
		if (startDay=="") startDay = $("#ContentMainPlaceHolder_WideCalendar_hdfTodayDT").val();
		var selectedDay = this.getSelectedDate();
		
		var currDate = WideCalendar.getDateFromText( startDay );
		var LI_HTML="";
		
		for(var i=0; i<wideCalendarSize; i++) {
			var cName = "calendar_item";
			var sCurrentDay = WideCalendar.getDateText( currDate );
			var sWeekday = WideCalendar.getWeekText(currDate );
			var sDisplayDay = WideCalendar.getDateTwoChar(currDate );
			//var sDisplayDay = WideCalendar.getDateTwoChar(currDate );
			
			if ( sCurrentDay < toDay ) cName += " past";
			if ( sCurrentDay == toDay ) cName += " today";
			if ( sCurrentDay == selectedDay )cName += " selected";
			
			LI_HTML += "<li class=\"" + cName + "\" style=\"width:" + liSize + "px;\">";
			LI_HTML += "<a href=\"javascript:void(0)\" class=\"calendar_anchor\" onclick=\"WideCalendar.clickWideCalendarItem(this)\" ";
			LI_HTML += "calendar=\"" + sCurrentDay + "\" title=\"" + sCurrentDay + "\">";
			LI_HTML += "<div class=\"day\">" + sWeekday + "</div><div class=\"date\">" +  sDisplayDay + "</div></a>";
			LI_HTML += "</li>";

			currDate.setDate(currDate.getDate() + 1);
		}
		ul.html(LI_HTML);
	},
	drawReservationTimeTable: function(){
		var _this = MeetingRoom;
		var _prev="";				//이전 Looping Floor
		var _current="";			//현재 Looping Floor 
		var resourceRows="";
		var _location=$( "#Select_1" ).val();	//위치
		var _floor="",_room="";	
		//층,회의실명
		for(var i=0; i<MeetingRoomInfo.length; i++){
			_floor=MeetingRoomInfo[i].floor;
			_room=MeetingRoomInfo[i].roomname;
			_current = _floor;
			resourceRows += "<tr class=\"resv_row" + (_prev!=_current?" border":"") + "\" resourceName=\"" + _room + "\" resourceFloor=\"" + _floor + "\">";
			if (_prev!=_current) {
				var rowspanCount = _getCountRowSpan(_current);
				resourceRows += "<th class=\"resv_floor\" rowspan=\"" + rowspanCount + "\">"+_floor+"</th>";
			}
			resourceRows += "<th class=\"resv_name\">";
			resourceRows += "		<div class=\"resv_name_wrap\">";
			resourceRows += "			<div class=\"left_area\">";
			if(RESOURCE_ISADMIN){
				//관리자의 경우, 상세 작성 페이지 연결
				resourceRows += "				<A href=\"#\" title=\"" + _room + " - 상세일정작성" + "\" onClick=\"MeetingRoom.composeReserveForm(";
				resourceRows += "'" + _location + "','" + _floor + "','" + _room + "'";
				resourceRows += ");\">";
				resourceRows += "<span class=\"title notselectable\">"+_room+"</span></A>";
			} else {
				resourceRows += "				<span class=\"title\">"+_room+"</span>";	
			}
			
			if (MeetingRoomInfo[i].etc!="") {
				//비품정보
				resourceRows += "				<div class=\"tooltip_wrap\">";
				resourceRows += "					<button class=\"btn_tooltip\"><i class=\"ico_board ico_board_equip_info\"></i></button>";
				resourceRows += "					<div class=\"tooltip_layer\">";
				resourceRows += "						<div class=\"layer_txt\">" + MeetingRoomInfo[i].etc + "</div>";
				resourceRows += "					</div>";
				resourceRows += "				</div>";
			}
			resourceRows += "			</div>";
			resourceRows += "			<div class=\"right_area\"><span class=\"txt\">" + MeetingRoomInfo[i].number + "</span></div>";
			resourceRows += "		</div>";
			resourceRows += "</th>";
			
			var countStartTime = MeetingRoom_StartTime;
			while(MeetingRoom_FinishTime >= countStartTime){
				var startTime = String(countStartTime);
				if (startTime.length<4) startTime = "0" + startTime;
				var finishTime = _this.getCalDateTime(startTime, MeetingRoom_IntervalTime);
				if (Number(startTime)<MeetingRoom_FinishTime) {
					resourceRows += "<td class=\"resv_data\" resStartDT=\"" + startTime + "\" resEndDT=\"" + finishTime + "\" resourceID=\"\" resourceName=\"" + _room + "\" resourceFloor=\"" + _floor + "\"></td>";
				} else {
					//resourceRows += "<td class=\"resv_data impossible\" resStartDT=\"" + startTime + "\" resEndDT=\"" + finishTime + "\" resourceID=\"\" resourceName=\"" + MeetingRoomInfo[i].roomname + "\" resourceFloor=\"" + MeetingRoomInfo[i].floor + "\"></td>";
					resourceRows += "<td class=\"impossible\" resStartDT=\"" + startTime + "\" resEndDT=\"" + finishTime + "\" resourceID=\"\" resourceName=\"" + _room + "\" resourceFloor=\"" + _floor + "\"></td>";
				}
				countStartTime = Number(finishTime);
			}
			resourceRows += "</tr>\n";
			_prev = _floor;
		}
		$(".reservationTimeTable > tbody").html(resourceRows);
		
		//데이터 그리기 ===============================
		_this.getTimeTableData();
		
		//timetable Selectable 이벤트================
		ReservationTimeTable.init();
		
		function _getCountRowSpan(_floor){
			//요청한 층의 정보만 filtering
			var arrTargetRoom = MeetingRoomInfo.filter(function(roominfo){
			  return roominfo.floor==_floor;
			});
			return arrTargetRoom.length;
		}
	},
	//상세현황 등록 화면 호출
	composeReserveForm: function(_location, _floor, _room) {
		var _date;
		var _url = "";
		if (_room=="supexhall") {
			_url += dbpath + "/interCR?openform";
		} else if (_room=="bsquare") {
			_url += dbpath + "/happyCR?openform";
		} else {
			_date = this.getSelectedDate();
			
			_url += "/" + DB_PATH + "/DOC2?openform";
			_url += "&location=" + encodeURIComponent(_location) + "&floor=" + encodeURIComponent(_floor);
			_url += "&room=" + encodeURIComponent(_room) + "&date=" + encodeURIComponent(_date);
		}
		document.location.href = _url;
	},
	//간편예약 등록
	reserveSimpleMode: function(){
		var _this = this;
	    var reservationOption = _this.getSelectedReservationOption();
	    if (reservationOption == null) {
	        alert("예약 시간이 선택되지 않았습니다.");
	        _closeBtn();
	        return true;
	    }
	    
	    var sToDate = $("#ContentMainPlaceHolder_WideCalendar_hdfTodayDT").val();
	    var sSelectedDate = _this.getSelectedDate();
	    
	    var current_date = new Date();
	    current_date.setMonth(current_date.getMonth() + 1);
	    var sAfterOneMonth = WideCalendar.getDateText(current_date);
	    if(sToDate>sSelectedDate) {
	    	alert("오늘 이전 날짜는 선택 할 수 없습니다.");
	    	_closeBtn();
		    return true;
	    } else if(sAfterOneMonth<sSelectedDate) {
	    	alert("신청일로부터 1개월 이내 기간만 신청이 가능합니다!");
	    	_closeBtn();
		    return true;
	    }
	    
	    var arrDate = reservationOption.ReservationDT.split("-");
	    var stime = reservationOption.ResStartDT;
	    var ftime = reservationOption.ResEndDT;
	    var usedTime = 0;
	    var s_date = new Date(arrDate[0], Number(arrDate[1]) - 1, arrDate[2], stime.substring(0, 2), stime.substring(2, stime.length));
	    var f_date = new Date(arrDate[0], Number(arrDate[1]) - 1, arrDate[2], ftime.substring(0, 2), ftime.substring(2, ftime.length));
	    usedTime = _this.calculationOfTime(s_date, f_date);
	    
	    if (!RESOURCE_ISADMIN) {
	    	if (usedTime>MeetingRoom_MaximumTime) { 
		    	alert("최대 예약가능 시간(" + String(MeetingRoom_MaximumTime) + " 분)이 초과 되었습니다.")
		    	 _closeBtn();
		        return true;
		    }
	    }
	    
	    var oReservData = {
	    		action : "create_simple",
	    		unids : "",
	    		SelectedDate : reservationOption.ReservationDT,
	    		StartTime : reservationOption.ResStartDT,
	    		FinishTime : reservationOption.ResEndDT,
	    		ResourcePlace : $( "#Select_1" ).val(),
	    		ResourceFloor : reservationOption.ResourceFloor,
	    		ResourceRoom : reservationOption.ResourceName
	    }
		
	    var submitData = $.extend(true, {"__Click" : "0", "%%postcharset":"utf-8"}, oReservData);
		var url = "/" + DB_PATH + "/eventHandle?openform";
		$.ajax({
			url : url,
			type : "post",
			dataType : "json",
			cache : false,
			data : submitData,
			success : function(_returnJson) {
				if (_returnJson.result=="success") {
					//성공
					_this.refreshTimeTableData()
				} else if (_returnJson.result=="duplication") {
					//중복
					alert(_returnJson.msg.replace(/<br>/gi, "\n"));
				} else if (_returnJson.result=="error") {
					//일반적인 오류
					if(_returnJson.msg=="") {
						alert( MeetingRoom_GeneralError );
					} else {
						alert( _returnJson.msg.replace(/<br>/gi, "\n") );
					}
				}
				_closeBtn();
			}, error : function(request,status,error){
				alert( MeetingRoom_GeneralError );
				_closeBtn();
			}
		});
		
	    function _closeBtn(){
	    	ReservationTimeTable.hideReservationButtonArea();
	    }
	}, 
	// 선택된 예약 값 얻기
	getSelectedReservationOption: function() {
	    var reservationOption = ReservationTimeTable.getSelectedReservationOption();
	    return reservationOption;
	},
	//지정장소의 회의실정보 가져오기
	getPlaceInfo: function(sKey, callBack) {
		$.ajax({
			url : "/"+DB_PATH+"/vwNewMeetingRoomInfo?readviewentries&outputformat=json&count=-1&restricttocategory=" + sKey,
			/*type : "get",*/
			dataType : "json",
			async : false,
			cache : true,
			success: function(data) {
				var viewdata=util.ViewDataParse(data),
				entries=viewdata.entry, _count=entries.length,entry;
				MeetingRoomInfo=[];
				for (var i=0;i<_count;i++){
					entry=entries[i];
					MeetingRoomInfo[i] = {
							"place":entry.$VPalce,
							"floor":entry.$VFloor,
							"roomname":entry.$VRoomName,
							"number":entry.$VNum,
							"etc":entry.$VEtc
					}
				}
				//Resource - TimeTable 표시
				if (typeof callBack!="undefined") callBack();
			}, error : function(request,status,error){
				alert( MeetingRoom_GeneralError );
			}
		});
	},
	//지정 장소의 층(Floor) 정보 가져오기
	getPlaceFloorInfo: function(sKey) {
		$.ajax({
			url : "/"+DB_PATH+"/vwNewMeetingRoomInfo?readviewentries&outputformat=json&count=-1&restricttocategory=" + sKey,
			/*type : "get",*/
			dataType : "json",
			async : false,
			cache : true,
			success: function(data) {
				var arrFloor=[];
				var uniqueFloor = ["ALL"];
				
				var viewdata=util.ViewDataParse(data),
				entries=viewdata.entry, _count=entries.length,entry;
				for (var i=0;i<_count;i++){
					entry=entries[i];
					arrFloor[arrFloor.length] = entry.$VFloor;
				}
				
				$.each(arrFloor, function(i,el){
					if($.inArray(el,uniqueFloor) === -1) uniqueFloor.push(el);
				});
				
				$.each(uniqueFloor, function (index, value) {
				    $('#Select_2').append($('<option/>', {
				        value: value,
				        text : (value=="ALL"?"전체보기":value),
				        selected : (DefaultPlace_Floor==value?true:false)
				    }));
				});
			}, error : function(request,status,error){
				alert( MeetingRoom_GeneralError );
			}
		});
	},
	//회의장소(지역), 층  변경
	changePlace: function (place, floor) {
		var _this = this;
		var _isNextCombo = false;
		if(floor=="") _isNextCombo = true; DefaultPlace_Floor="ALL";
		if(_isNextCombo){
			//선택 회의 장소의 층 리스트 가져오기
			$('#Select_2').text("");
			_this.getPlaceFloorInfo(place+"_ALL");
		}
		
		var roomKeyword = place + "_" + (floor==""?"ALL":floor);
		_this.getPlaceInfo(roomKeyword, _this.drawReservationTimeTable);
				
		ReservationTimeTable.init();
		WideCalendar.resizeWideCalendar(wideCalendarSize);	//Date Resizing
	},
	//예약현황 가져오기
	getTimeTableData: function() {
		var _this = this;
		var _selectedDate = _this.getSelectedDate();
		var _category = $('#Select_1').val() + "_" + $('#Select_2').val() + "_" + _selectedDate;
		var _viewname = "vwNewRoomsDate";
		var arrReservedPlace_Floor = [];
		var arrReservedData = [];
		
		$.ajax({
			url : "/"+DB_PATH+"/" + _viewname + "?readviewentries&outputformat=json&count=-1&restricttocategory=" + _category,
			/*type : "get",*/
			dataType : "json",
			async : false,
			cache : false,
			success: function(data) {
				var viewdata=util.ViewDataParse(data),
				entries=viewdata.entry, _count=entries.length,entry;
				for (var i=0;i<_count;i++){
					entry=entries[i];
					var _roomname = entry.$VRoomName;
					var _floor = entry.$VFloor;
					
					if (! _isObjMembers(arrReservedPlace_Floor, _roomname, _floor)) {
						arrReservedPlace_Floor[arrReservedPlace_Floor.length] = {
							"roomname" : _roomname,
							"floor" : _floor
						}
					}
					
					arrReservedData[arrReservedData.length] = {
						"roomname" : _roomname,
						"floor" : _floor,
						"data" : {
							"unid" : entry.unid,
							"name" : entry.$VName,
							"start" : entry.$VStart_H + entry.$VStart_M,
							"finish" : entry.$VFinish_H + entry.$VFinish_M,
							"deptname" : entry.$VDeptName,
							"subject" : entry.$VSubject
						}
					}
				}
				
				function _isObjMembers(obj, sRoomName, sFloor) {
					    for (var i = 0, len = obj.length; i < len; i++) {
					        if (obj[i].roomname === sRoomName && obj[i].floor === sFloor) return true;
					    }
					    return false;
				}
			}, error : function(request,status,error){
				alert( MeetingRoom_GeneralError );
			}
		});
		_this.drawTimeTableData(arrReservedPlace_Floor, arrReservedData);
		
		//회의실 예약의 Time 테이블 - Return URL 설정
		var _return = "/" + DB_PATH + "/newmain?openform";
		_return += "&date=" + MeetingRoom.getSelectedDate();
		_return += "&place=" + encodeURIComponent($("#Select_1").val());
		_return += "&floor=" + encodeURIComponent($("#Select_2").val());
		MeetingRoom.returnUrl("set",_return);
		MeetingRoom.resizingViewBody();
	},
	//예약현황 그리기
	drawTimeTableData: function(arrReservedPlace_Floor, arrReservedData) {
		//arrReservedPlace_Floor : (현황이 등록이 된) 회의실 리스트, arrReservedData : 전체 회의현황 리스트
		var _this = this;
		var d = new Date();		//오늘 날짜
		for(var i=0; i<arrReservedPlace_Floor.length; i++) {
			var roomname = arrReservedPlace_Floor[i].roomname;
			var floor = arrReservedPlace_Floor[i].floor;
			var unid="", stime = "",ftime="", wuser="", wdeptname="", subject="", colspanCount=1;
			var revision_stime="", revision_ftime="";
			var s_date = d, f_date = d;
			
			var arrFilterReservedData = arrReservedData.filter(function(obj) {
			    return (obj.roomname === arrReservedPlace_Floor[i].roomname && obj.floor === arrReservedPlace_Floor[i].floor);
			});
			
			var tr = _searchTR(roomname, floor);
			var txt_val = "", txt_title = ""; 
			if (tr!=null) {
				for (var j=0; j<arrFilterReservedData.length; j++) {
					unid = arrFilterReservedData[j].data.unid;
					stime = arrFilterReservedData[j].data.start;
					ftime=arrFilterReservedData[j].data.finish;
					wuser=arrFilterReservedData[j].data.name;
					wdeptname = arrFilterReservedData[j].data.deptname;
					subject = arrFilterReservedData[j].data.subject;
					
					revision_stime = _revisionTime(stime, "start");
					revision_ftime = _revisionTime(ftime, "finish");
					s_date = new Date(d.getFullYear(), d.getMonth(), d.getDate(), revision_stime.substring(0, 2), revision_stime.substring(2, revision_stime.length));
					f_date = new Date(d.getFullYear(), d.getMonth(), d.getDate(), revision_ftime.substring(0, 2), revision_ftime.substring(2, revision_ftime.length));
					colspanCount = _this.calculationOfTime(s_date, f_date) / MeetingRoom_IntervalTime;
										
					var td = _searchTD(tr, revision_stime);
					if (td==null){
						//중복된 일정 처리에 대응 하기 위함(예. 앞의 일정이 ~ 10:34까지, 다음일정의 시작이 10:35인 경우)
						var _loopCount = _this.calculationOfTime(s_date, f_date) / MeetingRoom_IntervalTime
						for(var idx=0; idx<_loopCount; idx++){
							//revision_stime 재 보정 수행
							revision_stime = _this.getCalDateTime(revision_stime, MeetingRoom_IntervalTime);
							s_date = new Date(d.getFullYear(), d.getMonth(), d.getDate(), revision_stime.substring(0, 2), revision_stime.substring(2, revision_stime.length));
							colspanCount = _this.calculationOfTime(s_date, f_date) / MeetingRoom_IntervalTime;
							
							td = _searchTD(tr, revision_stime);
							if (td!=null)  break;
							if (revision_stime>revision_ftime) break;
						}
					} else {
						txt_val = (subject==""?wuser:subject);
						txt_title = "예약정보 - " + wuser + "&nbsp;(" + _addTimeSep(stime) + " ~ " + _addTimeSep(ftime) + ")";
						
						$(td).addClass("reserved");
						$(td).removeClass("resv_data");	// Select 처리를 막기 위함.
						var sLink = ""
						
						sLink += "<a class=\"reserved_anchor\" href=\"#\" onClick=\"MeetingRoom.openMeetingRommDocument('" + unid + "');\">";
						sLink += "<span class=\"txt notselectable\" title=\"" + txt_title + "\">" + txt_val + "</span>";
						sLink += "</a>";
						
						$(td).html(sLink);
						$(td).attr('colspan',colspanCount);
						var cnt=0;
						while($(td).next('td').length > 0){
							var $nextTD = $(td).next('td');
							if ($nextTD[0].className.indexOf("impossible") != -1){
								//기준종료시간 이후 처리
								if (colspanCount>cnt) $(td).attr('colspan',cnt+1);
								break;
							}
							if (cnt+1<=colspanCount-1){
								$nextTD.remove();
							} else {
								//console.log("LOOP 나감");
								break;
							}
							cnt++;
						}
					}
				}
			}
		}
				
		function _searchTR(_room, _floor) {
			var _rows = $(".reservationTimeTable > tbody tr");
			for(x=0; x<_rows.length; x++) {
				if (_room==$(_rows[x]).attr("resourceName") && _floor==$(_rows[x]).attr("resourceFloor")) {
					return _rows[x];
				}
			}
			return null;
		}
		
		function _searchTD(_tr, _starttime) {
			var _cell = $(_tr).find('td');
			for(x=0; x<_cell.length; x++) {
				if(_starttime==$(_cell[x]).attr("resStartDT")) {
					if ($(_cell[x]).hasClass("reserved")) {
						//예약 중복 등록
						return null;
					} else {
						return _cell[x];
					}
				}
			}
			return null;
		}
		
		//시간 보정-회의실 지정 시각이 00분, 30분 단위가 아닌 경우.
		function _revisionTime(_hhmm, _position) {
			var sChk_HH = _hhmm.substring(0, 2);
			var sChk_MM = _hhmm.substring(2, _hhmm.length);
			
			//시간 보정 - 불필요
			if (Number(sChk_MM) == 0 || Number(sChk_MM) == MeetingRoom_IntervalTime) return sChk_HH + sChk_MM;
			
			if(_position=="start") {
				if (Number(sChk_MM) > MeetingRoom_IntervalTime) {
					sChk_HH = sChk_HH;
					sChk_MM = String(MeetingRoom_IntervalTime);
				}else if (Number(sChk_MM) < MeetingRoom_IntervalTime) {
					sChk_HH = sChk_HH;
					sChk_MM = "00";
				}
			} else {
				if (Number(sChk_MM) > MeetingRoom_IntervalTime) {
					sChk_HH = String(Number(sChk_HH) + 1);
					sChk_MM = "00";
				}else if (Number(sChk_MM) < MeetingRoom_IntervalTime) {
					sChk_HH = sChk_HH;
					sChk_MM = String(MeetingRoom_IntervalTime);
				}
			}
			
			if (sChk_HH.length<2) sChk_HH = "0" + sChk_HH;
			if (sChk_MM.length<2) sChk_MM = "0" + sChk_MM;
			return sChk_HH + sChk_MM;
		}
		
		function _addTimeSep(_hhmm) {
			return _hhmm.substring(0, 2) + ":" + _hhmm.substring(2, _hhmm.length);
		}
	},
	//예약현황 초기화
	clearTimeTableData: function() {
		var _this=this;
		$(".reservationTimeTable > tbody tr").find(".reserved").each(function(cnt, td) {
			var standardTime = $(td).attr("resEndDT");
			var tr = $(td).parent('tr');
			var colspanCount = $(td).attr('colspan');
			
			if (!$(td).hasClass("resv_data")) $(td).addClass("resv_data");
			$(td).html("");
			$(td).removeClass("reserved");
			
			if (colspanCount>1) {
				$(td).attr('colspan', 1);
				var STime = standardTime;
				var FTime = standardTime;
				var prevTd = $(td);
				for (var i=1; i<colspanCount; i++) {
					var nextTd = $(td).clone();
					STime = FTime;
					FTime = _this.getCalDateTime(STime, MeetingRoom_IntervalTime);
					nextTd.attr("resStartDT", STime);
					nextTd.attr("resEndDT", FTime);
					
					prevTd.after(nextTd);
					prevTd = nextTd;
				}
			}
		});
	},
	//기준(Interval) 시간을 이용, 종료시간 리턴(0700 -> interval 30 인 경우, 0730 리턴)
	getCalDateTime: function(sTime, intervalTime) {
		var Time_Num = Number(sTime) + Number(intervalTime);
		var Time_Str = String(Time_Num);
		if (Time_Str.length<4) Time_Str = "0" + Time_Str;
		var sChk_HH = Time_Str.substring(0, 2);
		var sChk_MM = Time_Str.substring(2, sTime.length);
		if (Number(sChk_MM) >= 60) {
			sChk_HH = String(Number(sChk_HH) + 1);
			if (sChk_HH.length<2) sChk_HH = "0" + sChk_HH;
			sChk_MM = "00";
		}
		return sChk_HH + sChk_MM;
	},
	//TimeTable 초기화 후 데이터 가져오기 - Refresh
	refreshTimeTableData: function() {
		MeetingRoom.clearTimeTableData();
		MeetingRoom.getTimeTableData();
	}, 
	//현재 선택 날짜 가져오기
	getSelectedDate: function(){
		return $("#ContentMainPlaceHolder_WideCalendar_hdfSelectedDT").val();
	},
	//소요시간 계산(종료시각 - 시작시각) => 분 단위로 리턴
	calculationOfTime: function(startdatetime, finishdatetime){
		return (finishdatetime.getTime() - startdatetime.getTime()) / 1000 / 60;
	},
	//문서열람
	openMeetingRommDocument: function(unid) {
		//Dialog용 양식이 오픈 되도록 처리 - View (vwNewDialogOpen)
		var width=650;
		var height=540;

		var _url = "/" + DB_PATH + "/vwNewDialogOpen/" + unid + "?OpenDocument";
		var param = {};
		var returnVal = window.showModalDialog(_url, param, "dialogWidth:" + width + "px;dialogHeight:" + height + "px;scroll:no;status:no;");
		if(returnVal != null) {
			if(returnVal=="reload") {
				document.location.reload();
			} else if(returnVal=="calendarrefresh") {
				MeetingRoom.refreshTimeTableData();
			} else if(returnVal=="edit") {
				_url = "/" + DB_PATH + "/0/" + unid + "?EditDocument";
				document.location.href = _url;
			}
		}
	},
	editDoc: function () {
		var _flag = confirm("[문서 수정]하시겠습니까?");
		if(_flag) document.location.href = "/" + DB_PATH + "/0/" + UNID + "?editdocument";
	},
	//예약취소-문서삭제:::::deleteDocument 함수를 변경
	cancelReservation: function(act, unid, callBack) {
		var _returnMsg = "";
		var submitFlag;
		var oReservData={action:"delete", unids:""};
		if(act=="reservedcancel"){
			//일반회의실 예약취소
			_returnMsg = "회의실 예약을 취소 하였습니다.";
			var _repeateOpt = "";
			if(REPEAT_UNID!="") {
				$( "#dialog-confirm" ).dialog({
					resizable: false,height: "auto",width: 400,
					modal: true,
					buttons:[
						{
							text: "닫기",
							"class": 'btn_type_a btn_color_default ',
							click: function() {
								$( this ).dialog( "close" );
								return false;
				           	}
						},
						{
							text: "예약취소",
							"class": 'btn_type_a btn_color_primary ',
							click: function() {
								_repeateOpt = $("input:radio[name='delete_option']:checked").val();
								oReservData.option = _repeateOpt;
								oReservData.repeatunid = REPEAT_UNID;
								oReservData.unids = unid;
								
								_cancelreservation(oReservData, callBack);
								$( this ).dialog( "close" );
				           	}
						}
					]
				});
			} else {
				oReservData.unids = unid;
			}
			debugger;
			if(oReservData.unids!="") _cancelreservation(oReservData, callBack);
		    
		} else {
			submitFlag = ReCancle;
			if(act=="specialdoc_supex" || act=="specialdoc_bsquare") {
				showProcess("신청취소중입니다.");
				var returnVal = submitDocInfo({SubmitFlag: submitFlag});
				if(!returnVal.isError){
					// 최종확인 완료
					removeProcess();
					document.location.reload();
				}else{
					// 최종확인시 오류 발생
					removeProcess();
					alert(returnVal.errormsg);
					document.location.reload();
				}
			}
		}
		
		function _cancelreservation(oData, callBack) {
			var submitData = $.extend(true, {"__Click" : "0", "%%postcharset":"utf-8"}, oData);
			var url = "/" + DB_PATH + "/eventHandle?openform";
			$.ajax({
				url : url,
				type : "post",
				dataType : "json",
				cache : false,
				data : submitData,
				success : function(_returnJson) {
					if (_returnJson.result=="success"){
						alert(_returnMsg);
					} else {
						alert(_returnJson.msg.replace(/<br>/gi, "\n"));
					}
					if (typeof callBack!="undefined") callBack();
				}, error : function(request,status,error){
					var _o = {"msg":[],"result":"error"};
					if (typeof callBack!="undefined") callBack(_o);
				}
			});
		}
	},
	//빈회의실 찾기-SAMPLE
	searchAvailMeetingRoom: function(_location, _floor, _date, _starttime, _finishtime, callBack) {
		var oReservData = {
	    		action : "searchroom",
	    		unids : "",
	    		ResourcePlace : _location,
	    		ResourceFloor : _floor,
	    		SelectedDate : _date,
	    		StartTime : _starttime,
	    		FinishTime : _finishtime
	    }
		
	    var submitData = $.extend(true, {"__Click" : "0", "%%postcharset":"utf-8"}, oReservData);
		var url = "/" + DB_PATH + "/eventHandle?openform";
		$.ajax({
			url : url,
			type : "post",
			dataType : "json",
			cache : false,
			data : submitData,
			success : function(_returnJson) {
				if (typeof callBack!="undefined") callBack(_returnJson);
			}, error : function(request,status,error){
				var _o = {"msg":[],"result":"error"};
				if (typeof callBack!="undefined") callBack(_o);
			}
		});
	},
	//가용 가능한 회의실 검색 - CallBack 함수-SAMPLE
	availMeetingRoomSearchAfter:function(returnObj) {
		if (returnObj.result=="error") {
			if (returnObj.msg!="") alert( returnObj.msg );
			else alert( MeetingRoom_GeneralError );
			return false;
		}
		
		for(var i=0; i<returnObj.msg.length; i++) {
			console.log(returnObj.msg[i].floor + " : " + returnObj.msg[i].room);
		}
	},
	//상세 예약 저장
	saveDoc: function() {
		//ValidationChk Start
		var saveOption = $("input:radio[name='gubun']:checked").val();		//구분값(1:건별, 2:날짜, 3:요일)
		var startDate =  $("input:text[name='UseDate']").val();
		var startTime_HH = $("select[name='StartTime']").val();
		var startTime_MM = $("select[name='StartMin']").val();
		var startTime = (startTime_HH.length<2?"0":"") + startTime_HH + (startTime_MM.length<2?"0":"") + startTime_MM;
		var finishDate =  $("input:text[name='EndDate']").val();
		var finishTime_HH = $("select[name='EndTime']").val();
		var finishTime_MM = $("select[name='EndMin']").val();
		var finishTime = (finishTime_HH.length<2?"0":"") + finishTime_HH + (finishTime_MM.length<2?"0":"") + finishTime_MM;
		if ( startDate == "" ) {
			alert ("사용일을 선택 하시기 바랍니다.");
			return false;
		} else {
			if(startDate<CUR_DATE) {
				alert ("사용일을 오늘 이후로 지정 하시기 바랍니다.");
				return false;
			}
			if(saveOption!="1") {
				if(finishDate=="") {
					alert ("종료일을 선택 하시기 바랍니다.");
					return false;
				} else {
					if(startDate>finishDate) {
						alert("사용일이 종료일 이전으로 지정 하시기 바랍니다.");
						return false;
					}
				}
			}
		}
		
		if (Number(startTime)<700 || Number(startTime)>2000 || Number(finishTime)<700 || Number(finishTime)>2000) {
			alert ("회의실 이용 시간이 아닙니다. 다시 입력 하세요!\n\n이용 가능 시간 : 07시 ~ 20시");
			return false;
		}
		if (Number(startTime)>=Number(finishTime)) {
			alert ("시작시간이 종료시간보다 작거나 동일 할 수가 없습니다. 시간을 다시 입력하세요.");
			return false;
		}
		
		if($("input:text[name='DeptAdmin']").val()=="" && $("#datavalue_user").val()=="") {
			alert ("참석자를 반드시 선택하셔야합니다!");
			return false;
		}
		//ValidationChk Finish
		
		//최종 확인 후 저장
		if(saveOption == "2" || saveOption == "3"){
			var _weekDay = $("#id_Week").html();
			var _stime = startTime.substring(0,2) + ":" + startTime.substring(2,4);
			var _ftime = finishTime.substring(0,2) + ":" + finishTime.substring(2,4);
			var _confirmTxt = "[일괄등록]" + startDate + " ~ " + finishDate + "\n\n";
			if(saveOption == "2") {
				//날짜지정
				_confirmTxt += "기간내의  " + _stime + " ~ " +  _ftime + " 예약됩니다.\n\n계속 하시겠습니까?";
			} else {
				//요일지정
				_confirmTxt += "매주 " + _weekDay + " " + _stime + " ~ " + _ftime + " 예약됩니다.\n\n계속 하시겠습니까?";
			}
			if(!confirm( _confirmTxt )){
				alert("[일괄등록]이 취소되었습니다.");
				return false;
			}
		}
		
		showProcess("문서 저장중입니다.");
		//중복등록 확인 후 Submit()
		_eventHandleCall();
		
		
		function _eventHandleCall() {
			var oReservData = {
		    		action : "dupcheck",
		    		unids : "",
		    		SelectedDate : startDate,
		    		StartTime : startTime,
		    		FinishTime : finishTime,
		    		ResourcePlace : $("input:text[name='Location']").val(),
		    		ResourceFloor : $("input:text[name='Floor']").val(),
		    		ResourceRoom : $("input:text[name='Place']").val()
		    }
			
		    var submitData = $.extend(true, {"__Click" : "0", "%%postcharset":"utf-8"}, oReservData);
			var url = "/" + DB_PATH + "/eventHandle?openform";
			$.ajax({
				url : url,
				type : "post",
				dataType : "json",
				cache : false,
				data : submitData,
				success : function(_returnJson) {
					if (_returnJson.result=="success") {
						//성공
					} else if (_returnJson.result=="duplication") {
						//중복
						alert(_returnJson.msg.replace(/<br>/gi, "\n"));
					} else if (_returnJson.result=="error") {
						//일반적인 오류
						if(_returnJson.msg=="") {
							alert( MeetingRoom_GeneralError );
						} else {
							alert( _returnJson.msg.replace(/<br>/gi, "\n") );
						}
					}
					_doSubmit(_returnJson.result);
				}, error : function(request,status,error){
					alert( MeetingRoom_GeneralError );
					_doSubmit("error");
				}
			});
			
		    function _doSubmit(_code){
		    	if(_code=="success") {
		    		//Form Submit()
					$( "form:first" ).submit();
		    	}
		    	removeProcess();
		    }
		}
		
	},
	//임시저장,승인요청 - 특별 회의실(SUPEX, B Square)
	saveSpecialDoc: function(act,kind) {
		var arrCheckDate=[];
		var submitFlag
		var sdate,edate, _o;
		var start_h = $("select[name='StartTime']").val();
		var start_m = $("select[name='StartMin']").val();
		var end_h = $("select[name='EndTime']").val();
		var end_m = $("select[name='EndMin']").val();
		//if(kind=="supex")
		showProcess("문서 저장중입니다.");
		if(act=="draft") {
			submitFlag = SaveDoc;
			MeetingRoom.submitSpecialDoc(true, submitFlag);
		} else {
			submitFlag = Request + SaveDoc;
			if(MeetingRoom.validationSpecialDoc(kind)) {
				_o = $("input:radio[name='gubun']:checked");
				if(_o.val()=="1")  {
					_o = $("input[name='UseDate_1']");
					sdate = _o.val();
					edate = _o.val();
				} else {
					_o = $("input[name='StartDate']");
					sdate = _o.val();
					_o = $("input[name='EndDate']");
					edate = _o.val();
				}
				var dd = sdate.split("-");
				var ff = edate.split("-");
				var startdate = new Date(dd[0], dd[1] - 1, dd[2], 0, 0, 0);
				var enddate = new Date(ff[0], ff[1] - 1, ff[2], 0, 0, 0);
				//두날짜의 차이를 구하여 for문을 돌림
				var gap = enddate.getTime()-startdate.getTime();
				var sd;
				gap = gap/(1000*60*60*24);
				for(var i = 0; i < gap+1; i++){	
					var keydate = new Date(dd[0], dd[1] - 1, parseInt(dd[2], 10) + i , 0, 0, 0);
					sd = keydate.getFullYear();
					sd += "-";
					sd += ("0" + (keydate.getMonth() + 1)).length == 2 ? "0" + (keydate.getMonth() + 1) : (keydate.getMonth() + 1);
					sd += "-";
					sd += ("0" + (keydate.getDate())).length == 2 ? "0" + (keydate.getDate()) : (keydate.getDate());
					arrCheckDate[arrCheckDate.length]=sd;
				}
				
				//dulCheck(arrCheckDate);
				MeetingRoom.duplicationSpecialDoc(kind,arrCheckDate,start_h,start_m,end_h,end_m,submitFlag,MeetingRoom.submitSpecialDoc)
			} else {
				removeProcess();
			}
		}
	},
	submitSpecialDoc: function(_submit, submitFlag) {
		if(_submit) {
			if(docInfo.isEditMode){
				setField("SubmitFlag", submitFlag);
				$( "form:first" ).submit();
		    	
			} else {
				var returnVal = submitDocInfo({SubmitFlag: submitFlag});
				if(!returnVal.isError){
					// 최종확인 완료
					alert("최종확인 처리되었습니다.");
					removeProcess();
					document.location.reload();
				}else{
					// 최종확인시 오류 발생
					removeProcess();
					alert(returnVal.errormsg);
					document.location.reload();
				}
			}
		}
		removeProcess();
	},
	//SUPEX, B-Square 필드 체크
	validationSpecialDoc: function(kind){
		//if(kind=="supex") {
		var sdate,edate;
		var start_h = $("select[name='StartTime']").val();
		var start_m = $("select[name='StartMin']").val();
		var end_h = $("select[name='EndTime']").val();
		var end_m = $("select[name='EndMin']").val();
		
		var _o = $("input[name='TEL']");
		if(_o.val()=="") {
			alert ("전화번호를 입력하셔야 합니다!");
			_o.focus();
			return false;
		}
		
		_o = $("input:radio[name='gubun']:checked");
		if(typeof _o.val()=="undefined") {
			alert("[문서정보]의 구분을 선택하셔야 합니다!");
			return false;
		}
		switch(_o.val()){
			case "1":
				//건별
				_o = $("input[name='UseDate_1']");
				if(_o.val()=="") {
					alert ("[문서정보]의 사용일을 입력하셔야합니다!");
					return false;
				}
				sdate = _o.val();
				edate = _o.val();
				break;
			default:
				//날짜
				_o = $("input[name='StartDate']");
				sdate = _o.val();
				_o = $("input[name='EndDate']");
				edate = _o.val();
				if ( sdate == "" && edate == "" ) {
					alert ("[문서정보]의 사용기간을 선택하셔야 합니다!");
					return false;
				}
				break;
		}
		//사용시간 미 입력체크
		if (start_h == "" || start_m == "" || end_h == "" || end_m == "" ) {
			alert ("사용시간을 정확하게 입력하시기 바랍니다!");
			return false;
		}
		_o = $("input[name='body']");
		if(_o.val().trim()=="") {
			alert ("사용목적을 반드시 입력하셔야합니다!");
			_o.focus();
			return false;
		}
		_o = $("input[name='ChamSukBuse']");
		if(_o.val().trim()=="") {
			alert ("참석부서를 반드시 입력하셔야합니다!");
			_o.focus();
			return false;
		}
		_o = $("input[name='ChamSukSu']");
		if(_o.val().trim()=="") {
			alert ("참석인원을 반드시 입력하셔야합니다!");
			_o.focus();
			return false;
		}
		_o = $("input[name='Manager']");
		if(_o.val().trim()=="") {
			alert ("회의주관자를 반드시 입력하셔야합니다!");
			_o.focus();
			return false;
		}
		if ( docInfo.curDate > sdate ) {
			alert("[사용기간-사용시작일]을 현재일보다 이전으로 선택할 수 없습니다!");
			return false;
		}
		if (sdate > edate){
			alert("[사용기간-사용종료일]이 [사용시작일]보다 이전으로 선택할 수 없습니다!");
			return false;
		}
		if (Number(start_h) < 7 || Number(start_h) > 20) {
			alert ("이용시간이 아닙니다. 다시 입력 하세요!\n\n이용가능시간 : 07 ~ 20");
			return false;
		}
		if (Number(end_h) < 7 || Number(end_h) > 20) {
			alert ("이용시간이 아닙니다. 다시 입력 하세요!\n\n이용가능시간 : 07 ~ 20");
				return false;
		}
		
		var TotalTime = Number(end_h) - Number(start_h);
		var TotalMin = Number(end_m) - Number(start_m);
		if ( TotalTime < 0 ) {
			alert ("종료시간이 시작시간보다 작을 수가 없습니다! 시간을 다시 입력하세요!");
			return false;
		}
		if ( TotalTime == 0 && TotalMin < 0 ) {
			alert ("종료시간이 시작시간보다 작을 수가 없습니다! 시간을 다시 입력하세요!");
			return false;
		}
		if ( TotalTime == 0 && TotalMin == 0 ) {
			alert ("시작시간과 종료시간은 동일 할 수가 없습니다! 시간을 다시 입력하세요!");
			return false;
		}
		
		return true;
	},
	//SUPEX, B-Square 중복검사
	duplicationSpecialDoc: function(kind,arrDate,start_h,start_m,end_h,end_m,submitFlag,callBack){
		//if(kind=="supex") {
		var SPECIAL_ROOM_NAME,_view;
		if(kind=="supex") {
			SPECIAL_ROOM_NAME = "11F SUPEX Hall";
			_view="interCR_List_New";
		} else {
			SPECIAL_ROOM_NAME = "10F B SQUARE";
			_view="happyCR_List_New";
		}
		
		var compare_time1,compare_time2;					//중복 체크시 필요(시작시각, 종료시각)
		compare_time1 = new Date();		//시작시각(사용자 신청)
		compare_time2 = new Date();		//종료시각(사용자 신청)
		compare_time1.setHours(Number(start_h),Number(start_m),0);
		compare_time2.setHours(Number(end_h),Number(end_m),0);
		for (var i=0; i<arrDate.length; i++) {
			var _url = "/" + DB_PATH + "/" + _view + "?readviewentries&restricttocategory=" + arrDate[i] + "&outputformat=json&count=-1";
			var _stop = false;
			$.ajax({
				url : _url,
				/*type : "get",*/
				dataType : "json",
				async : false,
				cache : true,
				success: function(data) {
					var viewdata=util.ViewDataParse(data),
					entries=viewdata.entry, _count=entries.length,entry;
					for (var i=0;i<_count;i++){
						entry=entries[i];
						__lastCheck( "dup", entry);
					}
				}, error : function(request,status,error){
					alert( MeetingRoom_GeneralError );
					return __lastCheck( "error" );
				}
			});
			if(_stop) break;
			
			function __lastCheck(_str, entry){
				var _msg = "";
				if(_str=="dup") {
					if ( docInfo.unid != entry.unid ) {
						var col_usedate = entry.$VC_Date;
						var col_start_h = entry.$VC_SDate_H;
						var col_start_m = entry.$VC_SDate_M;
						var col_end_h = entry.$VC_EDate_H;
						var col_end_m = entry.$VC_EDate_M;
						var col_maker = entry.VC_Maker;
						
						var col_date1 = new Date();
						var col_date2 = new Date();
						col_date1.setHours(Number(col_start_h), Number(col_start_m),0);
						col_date2.setHours(Number(col_end_h), Number(col_end_m),0);
						if (  
							(compare_time1 >= col_date1 && compare_time1 <= col_date2) || 
							(compare_time2 >= col_date1 && compare_time2 <= col_date2) || 
							(compare_time1 <= col_date1 && compare_time2 >= col_date2)  ) {
								if(docInfo.status=="승인요청"){
									//최종확인과정
									_msg = "[편집] 하신 후 최종확인하시거나 [반려]처리 하시기 바랍니다!";
								} else {
									//사용자의 요청
									_msg = "신청하신 기간 중 [" + col_usedate + "]일자에 이미 [" + SPECIAL_ROOM_NAME + "]이 예약되어어 있습니다.\n\n";
									_msg += "[" + col_usedate + "]일자의 [" + SPECIAL_ROOM_NAME + "] 예약현황을 확인하신후 시간을 변경하여 신청하여 주시기 바랍니다.";
									
								}
								alert(_msg);
								_stop = true;
						}
					}
				} else if(_str=="error") {
					_msg = MeetingRoom_GeneralError;
					alert(_msg);
					_stop = true;
				} else {
					_stop = false;
				}
			}	
		}
		
		//callBack 수행
		if (typeof callBack!="undefined") {
			if(_stop){
				callBack(false,submitFlag);		//중복확인 - 중복문서존재
			} else {
				callBack(true,submitFlag);		//중복확인 - 없음
			}
		}
	},
	deleteDoc: function(_unid, callBack) {
		var oMeetData = {
				action : "delete",
				Unids : _unid
		}
		var submitData = $.extend(true, {"__Click" : "0", "%%postcharset":"utf-8"}, oMeetData);
		var url = "/" + DB_PATH + "/eventHandle?openform";
		$.ajax({
			url : url,
			type : "post",
			dataType : "json",
			cache : false,
			data : submitData,
			success : function(_returnJson) {
				var confirmMsg = "";
				if (_returnJson.result=="success") {
					//성공
				} else if (_returnJson.result=="error") {
					//일반적인 오류
					confirmMsg = "error";
					if(_returnJson.msg=="") {
						alert( MeetingRoom_GeneralError );
					} else {
						alert( _returnJson.msg.replace(/<br>/gi, "\n") );
					}
				}
				_closeProcess(callBack);
			}, error : function(request,status,error){
				alert( MeetingRoom_GeneralError );
				_closeProcess(callBack);
			}
		});
		
		function _closeProcess(callBack){
			//callBack 수행 (WideCalendar PageInitialize)
			if (typeof callBack!="undefined") callBack();
		}
	},
	//상세 예약화면 닫기
	closeDoc: function() {
		var _url = MeetingRoom.returnUrl("get");
		if(_url != "") document.location.href = _url;
		else history.back();
	},
	//상세작성 양식에서의 구분 변경
	changeGubun: function() {
		var _name = "gubun";
		var _gubun = $("input:radio[name='" + _name + "']:checked").val();
		var _o = $("#set_enddate");
		switch(_gubun) {
			case "1":
				_o.hide();
				break;
			case "2":
			case "3":
				_o.show();
				break;
		}
	},
	//사용날짜 변경
	changeUseDate: function(_sdate) {
		var _name = "UseDate";
		$("input:text[name='" + _name + "']").val(_sdate);
		
		var sWeekDay = _getWeekday( _getDateFromText(_sdate) );
		$("#id_Week").html(sWeekDay + "요일");
		
		function _getDateFromText(dateText){
			var splitedDate = dateText.split("-");
	        return new Date(Number(splitedDate[0]), Number(splitedDate[1]) - 1, Number(splitedDate[2]));	
		}
		
		function _getWeekday(date){
			var weekText = "";
            switch (date.getDay()) {
            	case 0: weekText = "일"; break;
            	case 1: weekText = "월"; break;
            	case 2: weekText = "화"; break;
            	case 3: weekText = "수"; break;
            	case 4: weekText = "목"; break;
            	case 5: weekText = "금"; break;
            	case 6: weekText = "토"; break;
            }
            return weekText;
		}
	},
	//관리 화면의 Popup
	popupResource: function(tagetpath, targetview, targetunid) {
		var width=600;
		var height=360;
		var _kind=targetview.replace(/vwnew/gi, "");
		var _mode=(targetunid==""?"new":"read");
		var _unid=targetunid;
		var _form="", _url="";
		var _ismodal=true;
		if(_mode=="new") {
			if(_kind == "meetingroominfo_allstatus") _form="fmLectureroom_Info";
			if(_kind == "meetingroomplan") _form="fmLectureroom_FloorPlan",_ismodal=false;
			if (_form=="") {
				alert("지정된 양식이 없습니다.\n\n관리자에게 문의하시기 바랍니다.");
				return false;
			}
			_url = tagetpath + "/" + _form + "?openform";
		} else {
			_url = tagetpath + "/" + targetview + "/" + _unid + "?opendocument";
		}
		
		var param = {};
		var returnVal = window.showModalDialog(_url, param, "dialogWidth:" + width + "px;dialogHeight:" + height + "px;scroll:no;status:no;");
		if(returnVal != null) {
			if(returnVal=="reload") document.location.reload();
		} else {
			if(_kind == "meetingroomplan") document.location.reload();
		}
	},
	initPopupResource: function() {
		//Button 처리
		var showBtn=[], hideBtn=[];
		if(IS_EDITED_DOC) {
			showBtn = ["btn_save", "btn_cancel"];
			hideBtn = ["btn_edit", "btn_delete", "btn_close"];
		} else {
			showBtn = ["btn_edit", "btn_delete", "btn_close"];
			hideBtn = ["btn_save", "btn_cancel"];
		}
		$.each(showBtn, function(i,cname){
			$("#" + cname)
				.removeClass("btn_hidden")
				.addClass("btn_show");
		});
		$.each(hideBtn, function(i,cname){
			$("#" + cname)
				.removeClass("btn_show")
				.addClass("btn_hidden");
		});
		
	}
};
/* ======================= AS-IS 공용 함수 ======================= */
function submitDocInfo(fields){
	// 편집모드에서 문서를 저장하는것이 아니라 읽기모드에서 결재상신처리등에 사용 필요한 필드만 Update한다.
	var xmlHttp, postUrl, submitData;
	postUrl = "/" + docInfo.dbPath + "/" + (docInfo.view != ""?docInfo.view:"0") + "/" + docInfo.unid + "?EditDocument&Seq=1";
	submitData = "__Click=0";
	submitData += "&SubmitType=post";
	for(var idx in fields){
		submitData += "&" + idx + "=" + encodeURIComponent(eval("fields." + idx));
	}
	submitData += "&%25%25PostCharset=UTF-8";
	xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
	xmlHttp.open("POST", postUrl, false);
	xmlHttp.send(submitData);
	if(xmlHttp.getResponseHeader("content-type").search(/text\/plain/i) != -1){
		eval("var returnVal = " + xmlHttp.responseText + ";");
		if(returnVal != null){
			return returnVal;
		}else{
			return {isError:true, errortype:"alert" ,errormsg:"오류가 발생하였습니다. 관리자에게 문의 하십시오."};
		}
	}else{
		return {isError:true, errortype:"sessionclose", errormsg:"세션종료되었습니다. 다시로그인하십시오."};
	}
}
function showProcess(str) {
	var iframeObj, content; 
	iframeObj = document.createElement("IFRAME"); 
	iframeObj.src = "about:blank"; 
	iframeObj.id = "showprocess"; 
	iframeObj.frameBorder = "0"; 
	iframeObj.style.display = "none"; 
	iframeObj.style.cssText = "position:absolute;z-index:1;top:0;right:0;width:10px;height:10px;overflow:hidden;"; 
	document.body.appendChild(iframeObj); 
	 
	content = "<html><head>"; 
	content += "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01 Transitional//EN\">"; 
	content += "<meta http-equiv=\"Content-Type\" content=\"txt/html; charset=euc-kr\">"; 
	content += "<meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">" 
	content += "<link rel=\"stylesheet\" type=\"text/css\" href=\"" + cCSSPath + "/popup.css\">"; 
	content += "<link rel=\"stylesheet\" type=\"text/css\" href=\"" + cCSSPath + "/object.css\">"; 
 
	content += "<script>"; 
	content += "function init(){var obj=parent.document.getElementById(\"showprocess\");var w=document.body.scrollWidth; var h=document.body.scrollHeight;obj.style.width=w;obj.style.height=h;obj.style.left=((parent.document.body.clientWidth - w)/2);obj.style.top=((parent.document.body.clientHeight - h)/2) + parent.document.body.scrollTop;obj.style.display=\"\";}"; 
	content += "</scr" + "ipt>"; 
	content += "</head>"; 
	content += "<body style=\"overflow:hidden;padding:0 0 0 0;margin:0 0 0 0;\" onload=\"init();\">"; 
 
	content += "<div class=\"pop_container pop_alert_fade\" style=\"width: 280px; height: 100px;\">"; 
	content += "	<div class=\"pop_alert_body\">"; 
	content += "		<div class=\"alert_wrap\">"; 
	content += "			<div class=\"left_area\">"; 
	content += "				<i class=\"ico_alert ico_alert_standby\"></i>"; 
	content += "			</div>"; 
	content += "			<div class=\"right_area\">"; 
	content += "				<div class=\"alert_title\">잠시 기다려 주십시오!</div>"; 
	content += "				<div class=\"alert_desc\">" + str + "</div>"; 
	content += "			</div>"; 
	content += "		</div>"; 
	content += "	</div>"; 
	content += "</div>"; 
	 
	content += "</body></html>"; 
	iframeObj.contentWindow.document.write(content); 
	iframeObj.contentWindow.document.close();
	disabledButton(true);	//버튼 Disabled 처리
}
function removeProcess() {
	var iframeObj = document.getElementById("showprocess"); 
	if(iframeObj != null){ 
		iframeObj.removeNode(true); 
	}
	disabledButton(false);	//버튼 Enabled 처리
}
function disabledButton(flag){
	var _o = $(".right_area");
	$( ".right_area" ).each(function( i, el ) {
		var _oBtn=$(el).find("button").each(function( j, btn ) {
			$(btn)[0].disabled = flag;
		});
	});
} 
function setIDText(idStr, valueStr){
	var idobj = document.getElementById(idStr);
	if(idobj != null) idobj.innerHTML = valueStr;
}
function setField(fieldName, fieldValue){
	var f = document.forms[0];
	var fieldObj = f.elements[fieldName];
	if(fieldValue.constructor == Number) fieldValue = fieldValue.toString(10);
	if(fieldObj != null){
		fieldObj.value = fieldValue;
	}else{
		f.insertAdjacentHTML("beforeEnd", "<input type=\"hidden\" name=\"" + fieldName + "\" value=\"" + fieldValue.replace(/"/g, "&quot;") + "\">");
	}
}