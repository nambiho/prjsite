var ReservationTimeTable = {
    // �ʱ�ȭ
    init: function (config) {
        if (typeof config != "undefined") {
            $.extend(this.config, config);
		}
		this.initSelectable(config);
    },
    config : {},
    // �ڿ� ���� ǥ table �±��� class �̸�
    tableClassName:"reservationTimeTable",
    // ���콺 �巡�׷� �ڿ��� �ð������� ���� �����ϵ��� ��. jquery-ui selectable ���
    initSelectable: function (config) {
		var t1=new Date();
        if (typeof config != "undefined" && config.skipSelectable) { return; }
        var tableClassName = this.tableClassName;
		var thisRef = this;
var t1=new Date();
        $.each($("." + tableClassName + " tr"), function () {
		//$("." + tableClassName).each(function () {
            // ���콺 �巡�׷� �ð� �����ϱ�
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
                        // �߰��� �� �׸��� ���� ��� ���� ���� �ʿ���.
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
    // ���õ� ���� �� ���
    getSelectedReservationOption: function () {
    	var selectedEls = this.getSelectedElements();
        if (selectedEls.length == 0) { return null; }

        var reservationOption = {};
        reservationOption.ResourceID = this.getSelectValue(selectedEls.first(), "resourceID");	//this.getSelectedResourceID(selectedEls.first()); // ȸ�ǽ�ID
        reservationOption.ResourceName = this.getSelectValue(selectedEls.first(), "resourceName");	//this.getSelectedResourceName(selectedEls.first()); // ȸ�ǽ� ��
        reservationOption.ResourceFloor = this.getSelectValue(selectedEls.first(), "resourceFloor");	//this.getSelectedResourceName(selectedEls.first()); // ȸ�ǽ���
        reservationOption.ReservationDT = this.getSelectValue(selectedEls.first(), "reservedDate");	//this.getReservationDT(); // ������ yyyy-MM-dd
        reservationOption.ResStartDT = this.getSelectValue(selectedEls.first(), "resStartDT");	//this.getSelectedResourceResStartDT(selectedEls.first()); //���� ���� �ð� HH:mm
        reservationOption.ResEndDT = this.getSelectValue(selectedEls.last(), "resEndDT");	//this.getSelectedResourceResEndDT(selectedEls.last()); //���� ���� �ð� HH:mm
        return reservationOption;
    },
    // ���õ� elements �迭 ���
    getSelectedElements: function () {
        var selectedEls = $("." + this.tableClassName + " tr td.ui-selected");
        return selectedEls;
    },
    getSelectValue: function(el, attrName){
    	if (attrName=="reservedDate"){
    		//������
    		return $("#ContentMainPlaceHolder_WideCalendar_hdfSelectedDT").val();
    	} else {
    		return $(el).attr(attrName);
    	}
    }, 
    // ���̳��� ��ư(�����ϱ��ư) ���� ���̱�
    showReservationButtonArea: function (event) {
        var divReservationButtonArea = $("#divReservationButtonArea");
        if (divReservationButtonArea.length == 0) { return; }
        var selectedEls = this.getSelectedElements();
        if (selectedEls.length == 0) { return; }
        var selectedEl = selectedEls.first();
        //var selectedEl = selectedEls.last();
        var top = selectedEl.position().top + selectedEl.height() + 6;
        var left = selectedEl.position().left;
        left = event.pageX - 10;	//���콺 ��ġ
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
    // scrollX ���� ����
    hasScrollX: function ($el) {
        if ($el.length == 0) return false;
        return $el.get(0).clientWidth < $el.get(0).scrollWidth;
    },
    // ���̳��� ��ư ���� ���߱�
    hideReservationButtonArea: function () {
        var divReservationButtonArea = $("#divReservationButtonArea");
        if (divReservationButtonArea.length == 0) { return; }
        divReservationButtonArea.hide();
        $(".reservationTimeTable td.ui-selected").removeClass("ui-selected").removeClass("selected");
    },
    // selectable���õ� �� �ϴ� ��ư ����
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
