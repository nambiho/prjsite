var WideCalendar = {
	//��¥ Ŭ��
	clickWideCalendarItem: function (el) {
		el = $(el);
		var date = el.attr("calendar");
		WideCalendar.setCurrentDate($(el), date);			//���糯¥ ǥ��
		MeetingRoom.refreshTimeTableData()					//���� ��¥�� ������ ��������
	},
	// ���õ� ��¥ ���.
	getSelectedWideCalendarDate: function () {
		return $("#ContentMainPlaceHolder_WideCalendar_hdfTodayDT").val();
	},
	//Page �ʱ�ȭ
	pageInitialize:function() {
		WideCalendar.initWideCalendar(wideCalendarSize);
		WideCalendar.initWideCalendarItems(wideCalendarSize);
		WideCalendar.resizeWideCalendar(wideCalendarSize);
		
		//���� ��¥ ó��(WideCalendar)
		//var selectedDate = $("#ContentMainPlaceHolder_WideCalendar_hdfStartDT").val();
		var selectedDate = $("#ContentMainPlaceHolder_WideCalendar_hdfSelectedDT").val();
		WideCalendar.setYearMonthText(WideCalendar.getDateFromText(selectedDate));
		WideCalendar.setCurrentDate(null, selectedDate);				//���糯¥ ǥ��
	},
	// �ʱ�ȭ
	initWideCalendar: function (wideCalendarSize) {
		var thisWideCalendar = this;
		$(".divWideCaldendarCarouselWrapper").jCarouselLite({
			btnNext: ".wideCalendar .next",
			btnPrev: ".wideCalendar .prev",
			scroll: wideCalendarSize,
			visible: wideCalendarSize,
			beforeStart: function (a, b) {
				var today = thisWideCalendar.getDateFromText($("#ContentMainPlaceHolder_WideCalendar_hdfTodayDT").val());
				var liList = $(".divWideCaldendarCarouselWrapper li");
				var currentLiFirst = $(a[0]);
				var currentCnt = Number(currentLiFirst.attr("liCnt"));
				var currentA = $("a", currentLiFirst);
				var currentLiDate = thisWideCalendar.getDateFromText(currentA.attr("calendar"));
				// prev
				if (b == "prev") {
					var date = new Date(currentLiDate.getTime());
					date.setDate(date.getDate() - wideCalendarSize);
					// startDT ����.
					$("#ContentMainPlaceHolder_WideCalendar_hdfStartDT").val(thisWideCalendar.getDateText(date));
					if (currentCnt - wideCalendarSize > 0) {
						for (var cnt = 0; cnt < wideCalendarSize; cnt++) {
							thisWideCalendar.setWideCalendarItem(liList[currentCnt + cnt - wideCalendarSize -1], date, today);
							date.setDate(date.getDate() + 1);
						}
					} else {
						for (var cnt = 0; cnt < wideCalendarSize * 2; cnt++) {
							thisWideCalendar.setWideCalendarItem(liList[cnt], date, today);
							date.setDate(date.getDate() + 1);
						}
					}
				}
				// next
				if (b == "next") {
					var date = new Date(currentLiDate.getTime());
					if (currentCnt  < wideCalendarSize * 2) {
						date.setDate(date.getDate() + wideCalendarSize);
						for (var cnt = 0; cnt < wideCalendarSize; cnt++) {
							thisWideCalendar.setWideCalendarItem(liList[currentCnt + cnt + wideCalendarSize - 1], date, today);
							date.setDate(date.getDate() + 1);
						}
					} else {

						date.setDate(date.getDate());
						for (var cnt = 0; cnt < wideCalendarSize * 2; cnt++) {
							thisWideCalendar.setWideCalendarItem(liList[cnt + wideCalendarSize], date, today);
							date.setDate(date.getDate() + 1);
						}
					}
					// startDT ����.
					date.setDate(date.getDate() - wideCalendarSize);
					$("#ContentMainPlaceHolder_WideCalendar_hdfStartDT").val(thisWideCalendar.getDateText(date));
				}
			},
			afterEnd: function (a) {
				var currentLiFirst = $(a[0]);
				var currentA = $("a", currentLiFirst);
				var currentLiDate = thisWideCalendar.getDateFromText(currentA.attr("calendar"));
				thisWideCalendar.setYearMonthText(currentLiDate);
			}
		});
	},
	// date object ���� ��� ǥ�ÿ� �ݿ�
	setYearMonthText: function (date) {
		//$(".wideCalendarYearMonth").html("<span>" + String(date.getFullYear()) + "</span>" + String(date.getMonth() + 1));
		var sYear = String(date.getFullYear());
		var sMonth = String(date.getMonth() + 1);
		if (sMonth.length == 1) sMonth = "0" + sMonth;
		$(".calendar_month").html("<div class=\"year\">" + sYear + "</div><div class=\"month\">" + sMonth + "</div>");
	},
	// yyyy-MM-dd ���ڿ� ������ date ���
	getDateFromText: function (dateText) {
		//return new Date(dateText);
		var splitedDate = dateText.split("-");
		return new Date(Number(splitedDate[0]), Number(splitedDate[1]) - 1, Number(splitedDate[2]));
	},
	// calendar ������ ���̵� li item ���� ���� �߾Ӱ� �������� ����.
	initWideCalendarItems: function (wideCalendarSize) {
		var today = this.getDateFromText($("#ContentMainPlaceHolder_WideCalendar_hdfTodayDT").val());
		var liList = $(".divWideCaldendarCarouselWrapper li");
		var liCnt = 0;
		liList.each(function () {
			$(this).attr("liCnt", ++liCnt);
		});
		var firstLi = $(liList[wideCalendarSize + 1]);
		var firstA = $("a", firstLi);
		var firstDate = this.getDateFromText(firstA.attr("calendar"));

		var prevDate = new Date(firstDate.getTime());
		prevDate.setDate(prevDate.getDate() - wideCalendarSize);
		var nextDate = new Date(firstDate.getTime());
		nextDate.setDate(nextDate.getDate() + wideCalendarSize);
		for (var cnt = 0; cnt < wideCalendarSize; cnt++) {
			this.setWideCalendarItem(liList[cnt], prevDate, today);
			prevDate.setDate(prevDate.getDate() + 1);
		}

		for (var cnt = 0; cnt < wideCalendarSize; cnt++) {
			this.setWideCalendarItem(liList[cnt + wideCalendarSize + wideCalendarSize], nextDate, today);
			nextDate.setDate(nextDate.getDate() + 1);
		}
	},
	// calendar li element�� ���� ������ date ������ ����.
	setWideCalendarItem: function (li, date, today) {
		//<li class="selected"><a href="javascript:///" title="01��(ȭ)"><span>ȭ</span>01</a></li>
		li = $(li);
		var sToday=this.getDateText(today);
		var sDate=this.getDateText(date);
		var sDay=this.getDateTwoChar(date);
		var selectedDate = $("#ContentMainPlaceHolder_WideCalendar_hdfSelectedDT").val();
		
		li.removeClass("today");
		li.removeClass("past");
		li.removeClass("selected");
		if(selectedDate==sDate) li.addClass("selected");
		if (sToday == sDate) {
			 li.addClass("today");
		} else if (sToday > sDate) {
			li.addClass("past");
		}
		
		var dateText = this.getDateText(date);
		var a = $("a", li);
		//a.attr("title", this.getDateTwoChar(date) + dateText + "(" + this.getWeekText(date) + ")");
		a.attr("title", dateText);
		a.attr("calendar", this.getDateText(date));
		a.html("<div class=\"day\">" + this.getWeekText(date) + "</div><div class=\"date\">" + sDay + "</div>");
	},
	// ��¥ ���ڿ��� dd ������ ���
	getDateTwoChar: function (date) {
		var dateText = String(date.getDate());
		if (dateText.length == 1) {
			dateText = "0" + dateText;
		}
		return dateText;
	},
	// yyyy-MM-dd ������ ���ڿ� ���.
	getDateText: function (date) {
		var month = String(date.getMonth() + 1);
		if (month.length == 1) { month = "0" + month; }
		var dateText = String(date.getFullYear()) + "-" + month + "-" + String(this.getDateTwoChar(date));
		return dateText;
	},
	// ���� ���� ���
	getWeekText: function (date) {
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
	},
	// ���� ��¥ ǥ���ϱ�
	setCurrentDate: function (oLI, dateTxt) {
		var liList = $(".divWideCaldendarCarouselWrapper li");
		if(oLI!=null) {
			liList.removeClass("selected");
			var li = oLI.closest("li");
			li.addClass("selected");
			$("#ContentMainPlaceHolder_WideCalendar_hdfSelectedDT").val(dateTxt);
		}
		 var currentLiWeek = WideCalendar.getWeekText(WideCalendar.getDateFromText(dateTxt));
		 $(".resv_title .left_area").html("<span class=\"date\">" + dateTxt + "(" + currentLiWeek + "����)" + "</span>");
	}, 
	// Wide Calendar ���� ����
	resizeWideCalendar: function (wideCalendarSize) {
		var fullSize = $(".wideCalendar").width();							//Full Size
		var btnSize= $(".calendar_button").width();							//Prev, Next ��ư Size
		var yearmonthSize= $(".calendar_month").width();					//��, �� ǥ�� ���� Size
		var calSize = fullSize - ((btnSize*2) + 15) - yearmonthSize;		//�⺻ Fixed ������
		var liSize = calSize / wideCalendarSize;							//LI �� ������
		
		var div = $(".divWideCaldendarCarouselWrapper");	//Date(Calendar) DIV
		 var ul = $("ul", div);								//Date(Calendar) UL
		 var li = $("li", ul);								//Date(Calendar) LI
		 
		 var leftNum = searchCurrentCnt(li) ;				//UL�� left Value
		for (var cnt = 0; cnt < li.length; cnt++) {
			//LI Resize Width
			var oLi = li[cnt];
			oLi.style.width = liSize;
		}
		
		div[0].style.width = calSize;
		ul[0].style.width = liSize * (wideCalendarSize*3);
		ul[0].style.left = Number("-" + calSize) * leftNum;
		
		function searchCurrentCnt(oLi) {
			var startDate = $("#ContentMainPlaceHolder_WideCalendar_hdfStartDT").val();
			var j=0;
			for(var i=1; i<li.length; i=i+wideCalendarSize) {
				var aAttr = $("a", li[i-1]);
				var sDate = aAttr.attr("calendar");
				if (sDate==startDate) return j;
				j+=1;
			}
			return j;
		}
	}
};
