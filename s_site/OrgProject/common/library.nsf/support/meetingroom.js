var MeetingRoomInfo = []; //ȸ�ǽ����� roomInfo
/*var MeetingRoom_Selected_Place = "";
var MeetingRoom_Selected_Floor = "";*/
var MeetingRoom_StartTime = 700;		//���۽ð�(07:00)
var MeetingRoom_FinishTime = 1900		//����ð�(19:00)
var MeetingRoom_IntervalTime = 30;		//Interval Time(��)
var MeetingRoom_MaximumTime = 120;		//�ִ� ���� ���� �ð�(��)
var MeetingRoom_GeneralError = "�۾� ���� �� ������ �߻��߽��ϴ�.\n\n�����ڿ��� ���� �Ͻñ� �ٶ��ϴ�.";
var NOTES_ORG_UNIT = "HANARO";			//Notes Oragnization Unit name

/* AS-IS ���� submit flag */
var SaveDoc 		= 1;		// ����
var Request 		= 2;		// ���ο�û
var Approval 		= 4;		// ����Ȯ��
var Reject 			= 8;		// �ݷ�
var ReCancle 		= 16;		// ��û���
var SaveSurvey      = 32;       //�������

var MeetingRoom = {
	init: function(callBack) {
		// - MainPage �ʱ�ȭ
		var _this=this;
		//WideCalendar - Date ǥ��
		_this.drawWideCalendar();
		
		/*��ġ, �� ListBox ����*/
		var arrPlace = PlaceLists.split(";");
		$.each(arrPlace, function (index, value) {
		    $('#Select_1').append($('<option/>', { 
		        value: value,
		        text : value 
		    }));
		});
		if(DefaultPlace!="") $('#Select_1').val(DefaultPlace);
		else DefaultPlace = $('#Select_1').val();
		_this.getPlaceFloorInfo(DefaultPlace+"_ALL");	//����1ȸ�� ��ü(ALL) �� ���� �ʿ�
		
		//������� ȸ�ǽ� ���� ��� �� TimeTable �׸���
		var roomKeyword = DefaultPlace + "_" + DefaultPlace_Floor;
		_this.getPlaceInfo(roomKeyword, _this.drawReservationTimeTable);
		
		//��ư(ListBox) �ʱ�ȭ
		_this.initButton();
		
		//callBack ���� (WideCalendar PageInitialize)
		if (typeof callBack!="undefined") callBack();
	},
	//ReturnURL ó��
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
	//��ư �ʱ�ȭ
	initButton: function() {
		//ȸ�� �庸(����) �� �� Change Event - MainPage
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
	//���� ���� ���� ����
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
				var _msg = "ȸ�ǽ� ������ ��ϵǾ� ���� �ʽ��ϴ�.\n" + "[ ���� : " + _location + ", ";
				_msg += "�� : " + (_floor=="ALL"?"��������":_floor) + " ]\n\n�����ڿ��� ���� �Ͻñ� �ٶ��ϴ�.";
				alert(_msg);
				return false;
			}
			window.open(go_path);
		}
	},
	//���� �ʱ�ȭ
	initDocument: function(callBack) {
		//�ۼ���,������ �������� ���� (setmakerinfo.js - �Լ��̿�)
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
	//��� ��¥ ���� ȭ�� �׸���
	drawWideCalendar: function(){
		var div = $(".divWideCaldendarCarouselWrapper");	//Date(Calendar) DIV
		var ul = $("ul", div);								//Date(Calendar) UL

		var fullSize = $(".wideCalendar").width();							//Full Size
		var btnSize= $(".calendar_button").width();							//Prev, Next ��ư Size
		var yearmonthSize= $(".calendar_month").width();					//��, �� ǥ�� ���� Size
		var calSize = fullSize - ((btnSize*2) + 15) - yearmonthSize;		//�⺻ Fixed ������
		var liSize = calSize / wideCalendarSize;							//LI �� ������
		
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
		var _prev="";				//���� Looping Floor
		var _current="";			//���� Looping Floor 
		var resourceRows="";
		var _location=$( "#Select_1" ).val();	//��ġ
		var _floor="",_room="";	
		//��,ȸ�ǽǸ�
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
				//�������� ���, �� �ۼ� ������ ����
				resourceRows += "				<A href=\"#\" title=\"" + _room + " - �������ۼ�" + "\" onClick=\"MeetingRoom.composeReserveForm(";
				resourceRows += "'" + _location + "','" + _floor + "','" + _room + "'";
				resourceRows += ");\">";
				resourceRows += "<span class=\"title notselectable\">"+_room+"</span></A>";
			} else {
				resourceRows += "				<span class=\"title\">"+_room+"</span>";	
			}
			
			if (MeetingRoomInfo[i].etc!="") {
				//��ǰ����
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
		
		//������ �׸��� ===============================
		_this.getTimeTableData();
		
		//timetable Selectable �̺�Ʈ================
		ReservationTimeTable.init();
		
		function _getCountRowSpan(_floor){
			//��û�� ���� ������ filtering
			var arrTargetRoom = MeetingRoomInfo.filter(function(roominfo){
			  return roominfo.floor==_floor;
			});
			return arrTargetRoom.length;
		}
	},
	//����Ȳ ��� ȭ�� ȣ��
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
	//������ ���
	reserveSimpleMode: function(){
		var _this = this;
	    var reservationOption = _this.getSelectedReservationOption();
	    if (reservationOption == null) {
	        alert("���� �ð��� ���õ��� �ʾҽ��ϴ�.");
	        _closeBtn();
	        return true;
	    }
	    
	    var sToDate = $("#ContentMainPlaceHolder_WideCalendar_hdfTodayDT").val();
	    var sSelectedDate = _this.getSelectedDate();
	    
	    var current_date = new Date();
	    current_date.setMonth(current_date.getMonth() + 1);
	    var sAfterOneMonth = WideCalendar.getDateText(current_date);
	    if(sToDate>sSelectedDate) {
	    	alert("���� ���� ��¥�� ���� �� �� �����ϴ�.");
	    	_closeBtn();
		    return true;
	    } else if(sAfterOneMonth<sSelectedDate) {
	    	alert("��û�Ϸκ��� 1���� �̳� �Ⱓ�� ��û�� �����մϴ�!");
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
		    	alert("�ִ� ���డ�� �ð�(" + String(MeetingRoom_MaximumTime) + " ��)�� �ʰ� �Ǿ����ϴ�.")
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
					//����
					_this.refreshTimeTableData()
				} else if (_returnJson.result=="duplication") {
					//�ߺ�
					alert(_returnJson.msg.replace(/<br>/gi, "\n"));
				} else if (_returnJson.result=="error") {
					//�Ϲ����� ����
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
	// ���õ� ���� �� ���
	getSelectedReservationOption: function() {
	    var reservationOption = ReservationTimeTable.getSelectedReservationOption();
	    return reservationOption;
	},
	//��������� ȸ�ǽ����� ��������
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
				//Resource - TimeTable ǥ��
				if (typeof callBack!="undefined") callBack();
			}, error : function(request,status,error){
				alert( MeetingRoom_GeneralError );
			}
		});
	},
	//���� ����� ��(Floor) ���� ��������
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
				        text : (value=="ALL"?"��ü����":value),
				        selected : (DefaultPlace_Floor==value?true:false)
				    }));
				});
			}, error : function(request,status,error){
				alert( MeetingRoom_GeneralError );
			}
		});
	},
	//ȸ�����(����), ��  ����
	changePlace: function (place, floor) {
		var _this = this;
		var _isNextCombo = false;
		if(floor=="") _isNextCombo = true; DefaultPlace_Floor="ALL";
		if(_isNextCombo){
			//���� ȸ�� ����� �� ����Ʈ ��������
			$('#Select_2').text("");
			_this.getPlaceFloorInfo(place+"_ALL");
		}
		
		var roomKeyword = place + "_" + (floor==""?"ALL":floor);
		_this.getPlaceInfo(roomKeyword, _this.drawReservationTimeTable);
				
		ReservationTimeTable.init();
		WideCalendar.resizeWideCalendar(wideCalendarSize);	//Date Resizing
	},
	//������Ȳ ��������
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
		
		//ȸ�ǽ� ������ Time ���̺� - Return URL ����
		var _return = "/" + DB_PATH + "/newmain?openform";
		_return += "&date=" + MeetingRoom.getSelectedDate();
		_return += "&place=" + encodeURIComponent($("#Select_1").val());
		_return += "&floor=" + encodeURIComponent($("#Select_2").val());
		MeetingRoom.returnUrl("set",_return);
		MeetingRoom.resizingViewBody();
	},
	//������Ȳ �׸���
	drawTimeTableData: function(arrReservedPlace_Floor, arrReservedData) {
		//arrReservedPlace_Floor : (��Ȳ�� ����� ��) ȸ�ǽ� ����Ʈ, arrReservedData : ��ü ȸ����Ȳ ����Ʈ
		var _this = this;
		var d = new Date();		//���� ��¥
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
						//�ߺ��� ���� ó���� ���� �ϱ� ����(��. ���� ������ ~ 10:34����, ���������� ������ 10:35�� ���)
						var _loopCount = _this.calculationOfTime(s_date, f_date) / MeetingRoom_IntervalTime
						for(var idx=0; idx<_loopCount; idx++){
							//revision_stime �� ���� ����
							revision_stime = _this.getCalDateTime(revision_stime, MeetingRoom_IntervalTime);
							s_date = new Date(d.getFullYear(), d.getMonth(), d.getDate(), revision_stime.substring(0, 2), revision_stime.substring(2, revision_stime.length));
							colspanCount = _this.calculationOfTime(s_date, f_date) / MeetingRoom_IntervalTime;
							
							td = _searchTD(tr, revision_stime);
							if (td!=null)  break;
							if (revision_stime>revision_ftime) break;
						}
					} else {
						txt_val = (subject==""?wuser:subject);
						txt_title = "�������� - " + wuser + "&nbsp;(" + _addTimeSep(stime) + " ~ " + _addTimeSep(ftime) + ")";
						
						$(td).addClass("reserved");
						$(td).removeClass("resv_data");	// Select ó���� ���� ����.
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
								//��������ð� ���� ó��
								if (colspanCount>cnt) $(td).attr('colspan',cnt+1);
								break;
							}
							if (cnt+1<=colspanCount-1){
								$nextTD.remove();
							} else {
								//console.log("LOOP ����");
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
						//���� �ߺ� ���
						return null;
					} else {
						return _cell[x];
					}
				}
			}
			return null;
		}
		
		//�ð� ����-ȸ�ǽ� ���� �ð��� 00��, 30�� ������ �ƴ� ���.
		function _revisionTime(_hhmm, _position) {
			var sChk_HH = _hhmm.substring(0, 2);
			var sChk_MM = _hhmm.substring(2, _hhmm.length);
			
			//�ð� ���� - ���ʿ�
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
	//������Ȳ �ʱ�ȭ
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
	//����(Interval) �ð��� �̿�, ����ð� ����(0700 -> interval 30 �� ���, 0730 ����)
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
	//TimeTable �ʱ�ȭ �� ������ �������� - Refresh
	refreshTimeTableData: function() {
		MeetingRoom.clearTimeTableData();
		MeetingRoom.getTimeTableData();
	}, 
	//���� ���� ��¥ ��������
	getSelectedDate: function(){
		return $("#ContentMainPlaceHolder_WideCalendar_hdfSelectedDT").val();
	},
	//�ҿ�ð� ���(����ð� - ���۽ð�) => �� ������ ����
	calculationOfTime: function(startdatetime, finishdatetime){
		return (finishdatetime.getTime() - startdatetime.getTime()) / 1000 / 60;
	},
	//��������
	openMeetingRommDocument: function(unid) {
		//Dialog�� ����� ���� �ǵ��� ó�� - View (vwNewDialogOpen)
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
		var _flag = confirm("[���� ����]�Ͻðڽ��ϱ�?");
		if(_flag) document.location.href = "/" + DB_PATH + "/0/" + UNID + "?editdocument";
	},
	//�������-��������:::::deleteDocument �Լ��� ����
	cancelReservation: function(act, unid, callBack) {
		var _returnMsg = "";
		var submitFlag;
		var oReservData={action:"delete", unids:""};
		if(act=="reservedcancel"){
			//�Ϲ�ȸ�ǽ� �������
			_returnMsg = "ȸ�ǽ� ������ ��� �Ͽ����ϴ�.";
			var _repeateOpt = "";
			if(REPEAT_UNID!="") {
				$( "#dialog-confirm" ).dialog({
					resizable: false,height: "auto",width: 400,
					modal: true,
					buttons:[
						{
							text: "�ݱ�",
							"class": 'btn_type_a btn_color_default ',
							click: function() {
								$( this ).dialog( "close" );
								return false;
				           	}
						},
						{
							text: "�������",
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
				showProcess("��û������Դϴ�.");
				var returnVal = submitDocInfo({SubmitFlag: submitFlag});
				if(!returnVal.isError){
					// ����Ȯ�� �Ϸ�
					removeProcess();
					document.location.reload();
				}else{
					// ����Ȯ�ν� ���� �߻�
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
	//��ȸ�ǽ� ã��-SAMPLE
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
	//���� ������ ȸ�ǽ� �˻� - CallBack �Լ�-SAMPLE
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
	//�� ���� ����
	saveDoc: function() {
		//ValidationChk Start
		var saveOption = $("input:radio[name='gubun']:checked").val();		//���а�(1:�Ǻ�, 2:��¥, 3:����)
		var startDate =  $("input:text[name='UseDate']").val();
		var startTime_HH = $("select[name='StartTime']").val();
		var startTime_MM = $("select[name='StartMin']").val();
		var startTime = (startTime_HH.length<2?"0":"") + startTime_HH + (startTime_MM.length<2?"0":"") + startTime_MM;
		var finishDate =  $("input:text[name='EndDate']").val();
		var finishTime_HH = $("select[name='EndTime']").val();
		var finishTime_MM = $("select[name='EndMin']").val();
		var finishTime = (finishTime_HH.length<2?"0":"") + finishTime_HH + (finishTime_MM.length<2?"0":"") + finishTime_MM;
		if ( startDate == "" ) {
			alert ("������� ���� �Ͻñ� �ٶ��ϴ�.");
			return false;
		} else {
			if(startDate<CUR_DATE) {
				alert ("������� ���� ���ķ� ���� �Ͻñ� �ٶ��ϴ�.");
				return false;
			}
			if(saveOption!="1") {
				if(finishDate=="") {
					alert ("�������� ���� �Ͻñ� �ٶ��ϴ�.");
					return false;
				} else {
					if(startDate>finishDate) {
						alert("������� ������ �������� ���� �Ͻñ� �ٶ��ϴ�.");
						return false;
					}
				}
			}
		}
		
		if (Number(startTime)<700 || Number(startTime)>2000 || Number(finishTime)<700 || Number(finishTime)>2000) {
			alert ("ȸ�ǽ� �̿� �ð��� �ƴմϴ�. �ٽ� �Է� �ϼ���!\n\n�̿� ���� �ð� : 07�� ~ 20��");
			return false;
		}
		if (Number(startTime)>=Number(finishTime)) {
			alert ("���۽ð��� ����ð����� �۰ų� ���� �� ���� �����ϴ�. �ð��� �ٽ� �Է��ϼ���.");
			return false;
		}
		
		if($("input:text[name='DeptAdmin']").val()=="" && $("#datavalue_user").val()=="") {
			alert ("�����ڸ� �ݵ�� �����ϼž��մϴ�!");
			return false;
		}
		//ValidationChk Finish
		
		//���� Ȯ�� �� ����
		if(saveOption == "2" || saveOption == "3"){
			var _weekDay = $("#id_Week").html();
			var _stime = startTime.substring(0,2) + ":" + startTime.substring(2,4);
			var _ftime = finishTime.substring(0,2) + ":" + finishTime.substring(2,4);
			var _confirmTxt = "[�ϰ����]" + startDate + " ~ " + finishDate + "\n\n";
			if(saveOption == "2") {
				//��¥����
				_confirmTxt += "�Ⱓ����  " + _stime + " ~ " +  _ftime + " ����˴ϴ�.\n\n��� �Ͻðڽ��ϱ�?";
			} else {
				//��������
				_confirmTxt += "���� " + _weekDay + " " + _stime + " ~ " + _ftime + " ����˴ϴ�.\n\n��� �Ͻðڽ��ϱ�?";
			}
			if(!confirm( _confirmTxt )){
				alert("[�ϰ����]�� ��ҵǾ����ϴ�.");
				return false;
			}
		}
		
		showProcess("���� �������Դϴ�.");
		//�ߺ���� Ȯ�� �� Submit()
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
						//����
					} else if (_returnJson.result=="duplication") {
						//�ߺ�
						alert(_returnJson.msg.replace(/<br>/gi, "\n"));
					} else if (_returnJson.result=="error") {
						//�Ϲ����� ����
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
	//�ӽ�����,���ο�û - Ư�� ȸ�ǽ�(SUPEX, B Square)
	saveSpecialDoc: function(act,kind) {
		var arrCheckDate=[];
		var submitFlag
		var sdate,edate, _o;
		var start_h = $("select[name='StartTime']").val();
		var start_m = $("select[name='StartMin']").val();
		var end_h = $("select[name='EndTime']").val();
		var end_m = $("select[name='EndMin']").val();
		//if(kind=="supex")
		showProcess("���� �������Դϴ�.");
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
				//�γ�¥�� ���̸� ���Ͽ� for���� ����
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
					// ����Ȯ�� �Ϸ�
					alert("����Ȯ�� ó���Ǿ����ϴ�.");
					removeProcess();
					document.location.reload();
				}else{
					// ����Ȯ�ν� ���� �߻�
					removeProcess();
					alert(returnVal.errormsg);
					document.location.reload();
				}
			}
		}
		removeProcess();
	},
	//SUPEX, B-Square �ʵ� üũ
	validationSpecialDoc: function(kind){
		//if(kind=="supex") {
		var sdate,edate;
		var start_h = $("select[name='StartTime']").val();
		var start_m = $("select[name='StartMin']").val();
		var end_h = $("select[name='EndTime']").val();
		var end_m = $("select[name='EndMin']").val();
		
		var _o = $("input[name='TEL']");
		if(_o.val()=="") {
			alert ("��ȭ��ȣ�� �Է��ϼž� �մϴ�!");
			_o.focus();
			return false;
		}
		
		_o = $("input:radio[name='gubun']:checked");
		if(typeof _o.val()=="undefined") {
			alert("[��������]�� ������ �����ϼž� �մϴ�!");
			return false;
		}
		switch(_o.val()){
			case "1":
				//�Ǻ�
				_o = $("input[name='UseDate_1']");
				if(_o.val()=="") {
					alert ("[��������]�� ������� �Է��ϼž��մϴ�!");
					return false;
				}
				sdate = _o.val();
				edate = _o.val();
				break;
			default:
				//��¥
				_o = $("input[name='StartDate']");
				sdate = _o.val();
				_o = $("input[name='EndDate']");
				edate = _o.val();
				if ( sdate == "" && edate == "" ) {
					alert ("[��������]�� ���Ⱓ�� �����ϼž� �մϴ�!");
					return false;
				}
				break;
		}
		//���ð� �� �Է�üũ
		if (start_h == "" || start_m == "" || end_h == "" || end_m == "" ) {
			alert ("���ð��� ��Ȯ�ϰ� �Է��Ͻñ� �ٶ��ϴ�!");
			return false;
		}
		_o = $("input[name='body']");
		if(_o.val().trim()=="") {
			alert ("�������� �ݵ�� �Է��ϼž��մϴ�!");
			_o.focus();
			return false;
		}
		_o = $("input[name='ChamSukBuse']");
		if(_o.val().trim()=="") {
			alert ("�����μ��� �ݵ�� �Է��ϼž��մϴ�!");
			_o.focus();
			return false;
		}
		_o = $("input[name='ChamSukSu']");
		if(_o.val().trim()=="") {
			alert ("�����ο��� �ݵ�� �Է��ϼž��մϴ�!");
			_o.focus();
			return false;
		}
		_o = $("input[name='Manager']");
		if(_o.val().trim()=="") {
			alert ("ȸ���ְ��ڸ� �ݵ�� �Է��ϼž��մϴ�!");
			_o.focus();
			return false;
		}
		if ( docInfo.curDate > sdate ) {
			alert("[���Ⱓ-��������]�� �����Ϻ��� �������� ������ �� �����ϴ�!");
			return false;
		}
		if (sdate > edate){
			alert("[���Ⱓ-���������]�� [��������]���� �������� ������ �� �����ϴ�!");
			return false;
		}
		if (Number(start_h) < 7 || Number(start_h) > 20) {
			alert ("�̿�ð��� �ƴմϴ�. �ٽ� �Է� �ϼ���!\n\n�̿밡�ɽð� : 07 ~ 20");
			return false;
		}
		if (Number(end_h) < 7 || Number(end_h) > 20) {
			alert ("�̿�ð��� �ƴմϴ�. �ٽ� �Է� �ϼ���!\n\n�̿밡�ɽð� : 07 ~ 20");
				return false;
		}
		
		var TotalTime = Number(end_h) - Number(start_h);
		var TotalMin = Number(end_m) - Number(start_m);
		if ( TotalTime < 0 ) {
			alert ("����ð��� ���۽ð����� ���� ���� �����ϴ�! �ð��� �ٽ� �Է��ϼ���!");
			return false;
		}
		if ( TotalTime == 0 && TotalMin < 0 ) {
			alert ("����ð��� ���۽ð����� ���� ���� �����ϴ�! �ð��� �ٽ� �Է��ϼ���!");
			return false;
		}
		if ( TotalTime == 0 && TotalMin == 0 ) {
			alert ("���۽ð��� ����ð��� ���� �� ���� �����ϴ�! �ð��� �ٽ� �Է��ϼ���!");
			return false;
		}
		
		return true;
	},
	//SUPEX, B-Square �ߺ��˻�
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
		
		var compare_time1,compare_time2;					//�ߺ� üũ�� �ʿ�(���۽ð�, ����ð�)
		compare_time1 = new Date();		//���۽ð�(����� ��û)
		compare_time2 = new Date();		//����ð�(����� ��û)
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
								if(docInfo.status=="���ο�û"){
									//����Ȯ�ΰ���
									_msg = "[����] �Ͻ� �� ����Ȯ���Ͻðų� [�ݷ�]ó�� �Ͻñ� �ٶ��ϴ�!";
								} else {
									//������� ��û
									_msg = "��û�Ͻ� �Ⱓ �� [" + col_usedate + "]���ڿ� �̹� [" + SPECIAL_ROOM_NAME + "]�� ����Ǿ�� �ֽ��ϴ�.\n\n";
									_msg += "[" + col_usedate + "]������ [" + SPECIAL_ROOM_NAME + "] ������Ȳ�� Ȯ���Ͻ��� �ð��� �����Ͽ� ��û�Ͽ� �ֽñ� �ٶ��ϴ�.";
									
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
		
		//callBack ����
		if (typeof callBack!="undefined") {
			if(_stop){
				callBack(false,submitFlag);		//�ߺ�Ȯ�� - �ߺ���������
			} else {
				callBack(true,submitFlag);		//�ߺ�Ȯ�� - ����
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
					//����
				} else if (_returnJson.result=="error") {
					//�Ϲ����� ����
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
			//callBack ���� (WideCalendar PageInitialize)
			if (typeof callBack!="undefined") callBack();
		}
	},
	//�� ����ȭ�� �ݱ�
	closeDoc: function() {
		var _url = MeetingRoom.returnUrl("get");
		if(_url != "") document.location.href = _url;
		else history.back();
	},
	//���ۼ� ��Ŀ����� ���� ����
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
	//��볯¥ ����
	changeUseDate: function(_sdate) {
		var _name = "UseDate";
		$("input:text[name='" + _name + "']").val(_sdate);
		
		var sWeekDay = _getWeekday( _getDateFromText(_sdate) );
		$("#id_Week").html(sWeekDay + "����");
		
		function _getDateFromText(dateText){
			var splitedDate = dateText.split("-");
	        return new Date(Number(splitedDate[0]), Number(splitedDate[1]) - 1, Number(splitedDate[2]));	
		}
		
		function _getWeekday(date){
			var weekText = "";
            switch (date.getDay()) {
            	case 0: weekText = "��"; break;
            	case 1: weekText = "��"; break;
            	case 2: weekText = "ȭ"; break;
            	case 3: weekText = "��"; break;
            	case 4: weekText = "��"; break;
            	case 5: weekText = "��"; break;
            	case 6: weekText = "��"; break;
            }
            return weekText;
		}
	},
	//���� ȭ���� Popup
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
				alert("������ ����� �����ϴ�.\n\n�����ڿ��� �����Ͻñ� �ٶ��ϴ�.");
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
		//Button ó��
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
/* ======================= AS-IS ���� �Լ� ======================= */
function submitDocInfo(fields){
	// ������忡�� ������ �����ϴ°��� �ƴ϶� �б��忡�� ������ó��� ��� �ʿ��� �ʵ常 Update�Ѵ�.
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
			return {isError:true, errortype:"alert" ,errormsg:"������ �߻��Ͽ����ϴ�. �����ڿ��� ���� �Ͻʽÿ�."};
		}
	}else{
		return {isError:true, errortype:"sessionclose", errormsg:"��������Ǿ����ϴ�. �ٽ÷α����Ͻʽÿ�."};
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
	content += "				<div class=\"alert_title\">��� ��ٷ� �ֽʽÿ�!</div>"; 
	content += "				<div class=\"alert_desc\">" + str + "</div>"; 
	content += "			</div>"; 
	content += "		</div>"; 
	content += "	</div>"; 
	content += "</div>"; 
	 
	content += "</body></html>"; 
	iframeObj.contentWindow.document.write(content); 
	iframeObj.contentWindow.document.close();
	disabledButton(true);	//��ư Disabled ó��
}
function removeProcess() {
	var iframeObj = document.getElementById("showprocess"); 
	if(iframeObj != null){ 
		iframeObj.removeNode(true); 
	}
	disabledButton(false);	//��ư Enabled ó��
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