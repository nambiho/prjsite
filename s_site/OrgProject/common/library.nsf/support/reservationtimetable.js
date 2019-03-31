var ReservationTimeTable = {
    // 초기화
    init: function (config) {
        if (typeof config != "undefined") {
            $.extend(this.config, config);
		}
		this.initSelectable(config);
    },
    config : {},
    // 자원 예약 표 table 태그의 class 이름
    tableClassName:"reservationTimeTable",
    // 마우스 드래그로 자원의 시간영역을 선택 가능하도록 함. jquery-ui selectable 사용
    initSelectable: function (config) {
		var t1=new Date();
        if (typeof config != "undefined" && config.skipSelectable) { return; }
        var tableClassName = this.tableClassName;
		var thisRef = this;
var t1=new Date();
        $.each($("." + tableClassName + " tr"), function () {
		//$("." + tableClassName).each(function () {
            // 마우스 드래그로 시간 선택하기
            var selectableOption = {
                filter: "td.resv_data",//"td.emptyTd",
                /*distance: 3,*/
                cancel: ".impossible,span.notselectable",	//"span.notselectable",
                start: function (event, ui) {
                   $("." + tableClassName + " tr td.ui-selected").removeClass("ui-selected").removeClass("selected");
                   thisRef.hideReservationButtonArea();
                },
                stop: function (event, ui) {
                    var selectedEls = $("." + tableClassName + " tr td.ui-selected");
                    if (selectedEls.length > 1) {
                        // 중간에 빈 항목이 있을 경우 제거 로직 필요함.
                        var prevEmptyCnt = 0;
                        for (var cnt = 0; cnt < selectedEls.length; cnt++) {
                            var selectedEl = $(selectedEls[cnt]);
                            var emptyCnt = Number(selectedEl.attr("emptyCnt"));
                            if (cnt > 0 && emptyCnt > prevEmptyCnt + 1) selectedEl.removeClass("ui-selected");
                            else prevEmptyCnt = emptyCnt;
                        }
                    }
                    $("." + tableClassName + " tr td.ui-selected").addClass("selected");
                    thisRef.showReservationButtonArea(event);
                } ,
                scrollElement: $(".selectableScrollElement"),
                scrollSnapX: 20, // When the selection is that pixels near to the top/bottom edges, start to scroll
                //scrollSnapY: 5, // When the selection is that pixels near to the side edges, start to scroll
                scrollAmount: 40, // In pixels
                scrollIntervalTime: 500 // In milliseconds
			};
            if (typeof config != "undefined" && config.selectableScroll) {$(this).selectableScroll(selectableOption);}
            else {$(this).selectable(selectableOption);}
            //$(this).selectable(selectableOption);
		});
var t2=new Date(); console.log(t2-t1);
        $(document).click(function (e) {
            thisRef.bindClearSelectableButton(e);
		});
		
    },
    // 선택된 예약 값 얻기
    getSelectedReservationOption: function () {
    	var selectedEls = this.getSelectedElements();
        if (selectedEls.length == 0) { return null; }

        var reservationOption = {};
        reservationOption.ResourceID = this.getSelectValue(selectedEls.first(), "resourceID");	//this.getSelectedResourceID(selectedEls.first()); // 회의실ID
        reservationOption.ResourceName = this.getSelectValue(selectedEls.first(), "resourceName");	//this.getSelectedResourceName(selectedEls.first()); // 회의실 명
        reservationOption.ResourceFloor = this.getSelectValue(selectedEls.first(), "resourceFloor");	//this.getSelectedResourceName(selectedEls.first()); // 회의실층
        reservationOption.ReservationDT = this.getSelectValue(selectedEls.first(), "reservedDate");	//this.getReservationDT(); // 예약일 yyyy-MM-dd
        reservationOption.ResStartDT = this.getSelectValue(selectedEls.first(), "resStartDT");	//this.getSelectedResourceResStartDT(selectedEls.first()); //예약 시작 시각 HH:mm
        reservationOption.ResEndDT = this.getSelectValue(selectedEls.last(), "resEndDT");	//this.getSelectedResourceResEndDT(selectedEls.last()); //예약 종료 시각 HH:mm
        return reservationOption;
    },
    // 선택된 elements 배열 얻기
    getSelectedElements: function () {
        var selectedEls = $("." + this.tableClassName + " tr td.ui-selected");
        return selectedEls;
    },
    getSelectValue: function(el, attrName){
    	if (attrName=="reservedDate"){
    		//예약일
    		return $("#ContentMainPlaceHolder_WideCalendar_hdfSelectedDT").val();
    	} else {
    		return $(el).attr(attrName);
    	}
    }, 
    // 다이나믹 버튼(예약하기버튼) 영역 보이기
    showReservationButtonArea: function (event) {
        var divReservationButtonArea = $("#divReservationButtonArea");
        if (divReservationButtonArea.length == 0) { return; }
        var selectedEls = this.getSelectedElements();
        if (selectedEls.length == 0) { return; }
        var selectedEl = selectedEls.first();
        //var selectedEl = selectedEls.last();
        var top = selectedEl.position().top + selectedEl.height() + 6;
        var left = selectedEl.position().left;
        left = event.pageX - 10;	//마우스 위치
        var scrollLeft = 0;
        
        if (this.config.selectableScroll) {
            var scrollLeft = $(".selectableScrollElement").scrollLeft();
            left += scrollLeft;
        }
        if (left + divReservationButtonArea.width() - scrollLeft >= selectedEl.offsetParent().width() - 10) {
            left = selectedEl.offsetParent().width() + scrollLeft - divReservationButtonArea.width() - 10;
        }
        
       // alert("left-" + left + "\nmouse-" + event.pageX);
        //left = event.pageX- 10;
        if (top >= (selectedEl.offsetParent().height() + (this.hasScrollX($(".selectableScrollElement")) ? -30 : 0))) {
            top = top - divReservationButtonArea.height() - selectedEl.height();
        }
        divReservationButtonArea.appendTo(selectedEl.offsetParent());
        divReservationButtonArea.css({ top: top, left: left });
        divReservationButtonArea.fadeIn();
    },
    // scrollX 소유 여부
    hasScrollX: function ($el) {
        if ($el.length == 0) return false;
        return $el.get(0).clientWidth < $el.get(0).scrollWidth;
    },
    // 다이나믹 버튼 영역 감추기
    hideReservationButtonArea: function () {
        var divReservationButtonArea = $("#divReservationButtonArea");
        if (divReservationButtonArea.length == 0) { return; }
        divReservationButtonArea.hide();
        $(".reservationTimeTable td.ui-selected").removeClass("ui-selected").removeClass("selected");
    },
    // selectable선택된 값 하단 버튼 제거
    bindClearSelectableButton: function (e) {
        var el = $(e.target);
        if (el.hasClass("notselectable") ||
                (el.closest(".reservationTimeTable").length <= 0
                && el.closest(".btn_warp").length <= 0
                && el.closest("#divReservationButtonArea").length <= 0
                && el.closest("#divSimpleReservationPopup").length <= 0
                && el.closest("#time_warp").length <= 0
                && el.closest(".ui-tooltip").length <= 0)) {
            this.hideReservationButtonArea();
            $(".reservationTimeTable td.ui-selected").removeClass("ui-selected").removeClass("selected");
        }
    }
};
